import express from "express";
import multer from "multer";

import { transcribeAudio, validateAudioFile } from "../services/sarvamStt.js";
import { textToSpeech, cleanTextForSpeech } from "../services/sarvamTts.js";

// Minimal, dependency-free SSE event serializer.
function sse(event, data) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

// In-memory audio storage (no disk needed for short voice clips).
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Sarvam STT speaks English (India) by default.
const DEFAULT_LANGUAGE = "en-IN";
const DEFAULT_SPEAKER = "kavya";

/**
 * Create a voice router. The `getAiClient` callback provides access to the
 * CureCoders AI client (used for the conversational brain) so this router can
 * stay decoupled from server.js internals.
 * @param {() => any} getAiClient
 */
export default function createVoiceRouter(getAiClient) {
  const router = express.Router();

  // ── Speech-to-Text ────────────────────────────────────────────────────────
  // Upload audio → Sarvam STT → transcript text
  router.post("/stt", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file || !req.file.buffer || req.file.buffer.length === 0) {
        return res.status(400).json({ error: "No audio file provided." });
      }

      // ── Log every multipart detail received from the frontend ────────────
      console.log("[Voice STT] Incoming audio upload:");
      console.log("  Field name:", "audio");
      console.log("  MIME type:", req.file.mimetype);
      console.log("  Original filename:", req.file.originalname);
      console.log("  File size (bytes):", req.file.size);
      console.log("  Buffer length (bytes):", req.file.buffer.length);
      console.log("  Language param:", req.body.language || DEFAULT_LANGUAGE);

      const validation = validateAudioFile(req.file);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      const sttStart = Date.now();
      const { text, error, status } = await transcribeAudio(
        req.file.buffer,
        req.file.mimetype || "audio/wav",
        req.body.language || DEFAULT_LANGUAGE,
        req.file.originalname || "",
      );
      const sttMs = Date.now() - sttStart;
      console.log(
        `[Voice STT] Duration: ${sttMs}ms | transcript length: ${(text || "").length}`,
      );

      if (error) {
        // Preserve the upstream Sarvam status code (e.g. 400) so debugging is
        // easy. Only fall back to 400 for local validation errors and 500 for
        // unexpected failures.
        const code = status || 400;
        return res.status(code).json({ error, status });
      }

      return res.json({ text, timings: { sttMs } });
    } catch (error) {
      console.error("STT route error:", error);
      if (error && error.stack) {
        console.error("STT route stack:", error.stack);
      }
      return res.status(500).json({ error: error.message || "STT failed." });
    }
  });

  // ── Text-to-Speech ────────────────────────────────────────────────────────
  // Text → Sarvam TTS → base64 audio
  router.post("/tts", async (req, res) => {
    try {
      const {
        text,
        language = DEFAULT_LANGUAGE,
        speaker = DEFAULT_SPEAKER,
      } = req.body;
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const cleaned = cleanTextForSpeech(text);
      if (!cleaned) {
        return res.status(400).json({ error: "Text is required" });
      }

      const ttsStart = Date.now();
      const { audio, error } = await textToSpeech(cleaned, language, speaker);
      const ttsMs = Date.now() - ttsStart;
      console.log(
        `[Voice TTS] Duration: ${ttsMs}ms | text length: ${cleaned.length}`,
      );

      if (error && !audio) {
        return res.status(500).json({ error });
      }

      return res.json({ audio, timings: { ttsMs } });
    } catch (error) {
      console.error("TTS route error:", error);
      return res.status(500).json({ error: error.message || "TTS failed." });
    }
  });

  // ── Full Voice Chat ───────────────────────────────────────────────────────
  // User text → AI model → optional Sarvam TTS audio.
  //
  // Two modes:
  //  1. SSE streaming (when `stream=true`): the LLM text is streamed back
  //     token-by-token so the UI can render "Thinking…" text immediately and
  //     then call /tts asynchronously AFTER the text is displayed. This
  //     removes TTS latency from the critical path.
  //  2. JSON (stream=false): returns { text } first (with timings). Pass
  //     `include_audio: true` to synth TTS in the same call (legacy behavior).
  router.post("/chat", async (req, res) => {
    try {
      const {
        text,
        language = DEFAULT_LANGUAGE,
        speaker = DEFAULT_SPEAKER,
        stream = false,
        include_audio = false,
      } = req.body;

      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      const ai = getAiClient ? getAiClient() : null;
      const systemPrompt =
        "You are ARIA, a highly intelligent AI pharmaceutical research assistant for CureCoders. Keep your answers extremely brief and conversational. DO NOT use markdown. YOUR RESPONSE MUST BE UNDER 400 CHARACTERS. THIS IS A HARD SYSTEM LIMIT FOR VOICE SYNTHESIS.";
      const prompt = `${systemPrompt}\n\nUser asks: ${text}`;

      // Helper to truncate the final response to stay within Sarvam's limit.
      const truncate = (s) => {
        if (s.length <= 490) return s;
        const truncated = s.substring(0, 490);
        const lastPeriod = truncated.lastIndexOf(".");
        return lastPeriod > 0
          ? truncated.substring(0, lastPeriod + 1)
          : truncated + "...";
      };

      // No AI client → stream/return a graceful fallback.
      if (!ai) {
        const fallback = `You said: "${text}". I'm ARIA, your pharmaceutical research assistant, ready to help you analyze markets, patents, and clinical data.`;
        if (stream) {
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });
          res.write(sse("delta", { text: fallback }));
          res.write(sse("done", { text: fallback }));
          res.end();
          return;
        }
        return res.json({ text: fallback, audio: null, audio_error: null });
      }

      const llmStart = Date.now();

      // ── Streaming mode ────────────────────────────────────────────────────
      if (stream && ai.models.streamGenerateContent) {
        try {
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
          });

          let fullText = "";
          res.write(sse("start", {}));
          await ai.models.streamGenerateContent(prompt, (delta) => {
            fullText += delta;
            res.write(sse("delta", { text: delta }));
          });
          fullText = truncate(fullText || "I didn't quite catch that.");
          const llmMs = Date.now() - llmStart;
          console.log(
            `[Voice LLM] Duration: ${llmMs}ms | chars: ${fullText.length}`,
          );
          res.write(sse("done", { text: fullText, llmMs }));
          res.end();
          return;
        } catch (e) {
          console.error("AI chat streaming failed:", e);
          // Fall through to the non-streaming JSON path below so the user
          // still gets an answer (connection is reused / keep-alive).
        }
      }

      // ── Non-streaming JSON mode (also used as streaming fallback) ────────
      let aiResponseText = "I'm sorry, I couldn't process that.";
      try {
        const response = await ai.models.generateContent({ contents: prompt });
        aiResponseText = truncate(
          response.text || "I didn't quite catch that.",
        );
      } catch (e) {
        console.error("AI chat generation failed:", e);
        aiResponseText = "I'm having trouble connecting to my brain right now.";
      }
      const llmMs = Date.now() - llmStart;
      console.log(
        `[Voice LLM] Duration: ${llmMs}ms | chars: ${aiResponseText.length}`,
      );

      // If the caller wanted a stream but streaming itself failed, emit the
      // single completed text as a stream so the client sees the same shape.
      if (stream) {
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        });
        res.write(sse("delta", { text: aiResponseText }));
        res.write(sse("done", { text: aiResponseText, llmMs }));
        res.end();
        return;
      }

      // Legacy JSON mode: optionally synthesize TTS in the same request.
      let audio = null;
      let audio_error = null;
      let ttsMs = null;
      if (include_audio) {
        const ttsStart = Date.now();
        const tts = await textToSpeech(
          cleanTextForSpeech(aiResponseText),
          language,
          speaker,
        );
        ttsMs = Date.now() - ttsStart;
        console.log(
          `[Voice TTS] Duration: ${ttsMs}ms | text length: ${cleanTextForSpeech(aiResponseText).length}`,
        );
        audio = tts.error ? null : tts.audio;
        audio_error = tts.error || null;
      }

      return res.json({
        text: aiResponseText,
        audio,
        audio_error,
        timings: { llmMs, ttsMs },
      });
    } catch (error) {
      console.error("Voice chat route error:", error);
      return res
        .status(500)
        .json({ error: error.message || "Voice chat failed." });
    }
  });

  return router;
}
