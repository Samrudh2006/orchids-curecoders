import getApiUrl from "./apiConfig";

const BACKEND_URL = getApiUrl();

/**
 * Voice service for the CureCoders AI Voice Assistant.
 *
 * Provides:
 *  - recordAudio(): capture microphone audio via MediaRecorder
 *  - transcribeAudio(): send audio to backend → Sarvam STT → text
 *  - chat(text): send text to backend → AI → text + Sarvam TTS audio
 *  - textToSpeech(text): convert text to Sarvam audio (base64)
 *  - chatStream(): stream the AI response via SSE (token-by-token)
 *
 * All Sarvam API key handling happens on the backend — no keys are ever
 * exposed to the browser.
 */

export const VOICE_STATES = {
  IDLE: "idle",
  RECORDING: "recording",
  CONVERTING: "converting",
  RESPONDING: "responding",
  SPEAKING: "speaking",
  ERROR: "error",
} as const;

export type VoiceState = (typeof VOICE_STATES)[keyof typeof VOICE_STATES];

export interface ChatResult {
  text: string;
  audio?: string | null;
  audio_error?: string | null;
}

/**
 * Encode raw 16-bit PCM samples into a WAV Blob.
 *
 * Sarvam's STT API requires WAV (mono, 16-bit PCM). Browsers record via
 * MediaRecorder as WebM/Opus, which Sarvam does NOT support — that is what
 * caused the HTTP 400. We therefore capture raw PCM via the Web Audio API
 * and encode it to WAV ourselves.
 */
export function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(view, 8, "WAVE");
  // fmt chunk
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true); // fmt chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // bits per sample
  // data chunk
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * 2, true);

  // Write PCM samples (clamp to 16-bit range)
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }

  return new Blob([buffer], { type: "audio/wav" });
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * Capture microphone audio and encode it as a 16kHz mono WAV blob.
 *
 * Uses the Web Audio API (AudioContext) to gather raw PCM samples directly,
 * then encodes them to WAV — the exact format Sarvam's STT API expects.
 *
 * @param maxDurationMs Optional auto-stop after a max duration.
 * @param targetSampleRate Sarvam expects 16kHz (default 16000).
 */
export interface AudioRecorder {
  /** Stop capturing and finalize the WAV blob. */
  stop: () => void;
  /** True while the recorder is actively capturing. */
  isRecording: () => boolean;
  /** Resolves with the final WAV blob once `stop()` has been called. */
  result: Promise<{ blob: Blob; mimeType: string }>;
}

export async function recordAudio(
  maxDurationMs = 15000,
  targetSampleRate = 16000,
): Promise<AudioRecorder> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Microphone access is not supported in this browser.");
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  // Use the target sample rate for the AudioContext so we get 16kHz PCM.
  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;

  const ctx = new AudioContextCtor({ sampleRate: targetSampleRate });
  const source = ctx.createMediaStreamSource(stream);
  const processor = ctx.createScriptProcessor(4096, 1, 1);

  const pcmChunks: Float32Array[] = [];
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | null = null;

  processor.onaudioprocess = (e) => {
    if (stopped) return;
    const channel = e.inputBuffer.getChannelData(0);
    // Copy to avoid Float32Array being reused by the AudioContext.
    pcmChunks.push(new Float32Array(channel));
  };

  source.connect(processor);
  processor.connect(ctx.destination);

  // Deferred resolver so `result` resolves once `stop()` finalizes the blob.
  let resolveResult: (value: {
    blob: Blob;
    mimeType: string;
  }) => void = () => {};

  const stop = () => {
    if (stopped) return;
    stopped = true;
    if (timer) clearTimeout(timer);
    try {
      source.disconnect();
      processor.disconnect();
    } catch {
      /* ignore */
    }
    stream.getTracks().forEach((t) => t.stop());
    void ctx.close().catch(() => {});

    // Concatenate all captured channels into one Float32Array.
    const totalLength = pcmChunks.reduce((n, c) => n + c.length, 0);
    const samples = new Float32Array(totalLength);
    let offset = 0;
    for (const chunk of pcmChunks) {
      samples.set(chunk, offset);
      offset += chunk.length;
    }

    const blob = encodeWav(samples, targetSampleRate);
    resolveResult({ blob, mimeType: "audio/wav" });
  };

  // Auto-stop after the max duration.
  timer = setTimeout(stop, maxDurationMs);

  const result = new Promise<{ blob: Blob; mimeType: string }>((resolve) => {
    resolveResult = resolve;
  });

  return {
    stop,
    isRecording: () => !stopped,
    result,
  };
}

/**
 * Send recorded audio to the backend where it is transcribed by Sarvam STT.
 * Audio is sent securely as multipart/form-data.
 */
export async function transcribeAudio(
  blob: Blob,
  language = "en-IN",
): Promise<string> {
  const form = new FormData();
  form.append("audio", blob, "recording.wav");
  form.append("language", language);

  const res = await fetch(`${BACKEND_URL}/api/voice/stt`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    let message = `Transcription failed (${res.status}).`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = await res.json();
  if (!data.text) {
    throw new Error("No speech detected in the audio.");
  }
  return data.text;
}

/**
 * Performance logging helper. Logs a stage + duration (ms) to console.
 * Keeping this tiny and dependency-free so it can be used anywhere.
 */
export function perfLog(stage: string, startMs: number, extra = "") {
  const ms = Date.now() - startMs;
  console.log(`[Voice Perf] ${stage}: ${ms}ms${extra ? ` | ${extra}` : ""}`);
  return ms;
}

/**
 * Send transcribed text to the backend AI chat. Returns just the text (LLM)
 * — TTS is invoked separately via textToSpeech() so TTS latency never blocks
 * the chat UI. The backend logs LLM timing; we log end-to-end here.
 */
export async function chat(
  text: string,
  language = "en-IN",
): Promise<ChatResult> {
  if (!text.trim()) {
    throw new Error("No message to send.");
  }

  const start = Date.now();
  // Reuses the same keep-alive connection to the backend (browser HTTP/1.1
  // connection pooling is on by default for same-origin requests).
  const res = await fetch(`${BACKEND_URL}/api/voice/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, include_audio: false }),
  });

  if (!res.ok) {
    let message = `Voice chat failed (${res.status}).`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const data = (await res.json()) as ChatResult & {
    timings?: { llmMs?: number; ttsMs?: number };
  };
  perfLog("LLM (chat)", start, `llmMs=${data.timings?.llmMs ?? "n/a"}`);
  return data;
}

/**
 * Stream the AI response from /api/voice/chat via SSE. Calls onDelta(delta)
 * for each token as it arrives so the UI can render text live, and resolves
 * with the final full text.
 *
 * The backend emits SSE frames with `event:` and `data:` lines:
 *   event: delta
 *   data: {"text":"Hello"}
 *
 *   event: done
 *   data: {"text":"Hello ...", "llmMs": 850}
 */
export async function chatStream(
  text: string,
  language: string,
  onDelta: (delta: string) => void,
): Promise<{ text: string; llmMs?: number }> {
  const start = Date.now();
  const res = await fetch(`${BACKEND_URL}/api/voice/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, stream: true }),
  });

  if (!res.ok) {
    let message = `Voice chat failed (${res.status}).`;
    try {
      const data = await res.json();
      if (data.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  if (!res.body) {
    // Fallback: read as JSON.
    const data = (await res.json()) as ChatResult;
    onDelta(data.text);
    perfLog("LLM (stream fallback)", start);
    return { text: data.text };
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let fullText = "";
  let llmMs: number | undefined;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split("\n\n");
      buffer = frames.pop() || "";
      for (const frame of frames) {
        const lines = frame.split("\n");
        const eventLine = lines.find((l) => l.startsWith("event:"));
        const dataLine = lines.find((l) => l.startsWith("data:"));
        if (!dataLine) continue;
        const event = eventLine ? eventLine.slice(6).trim() : "message";
        try {
          const payload = JSON.parse(dataLine.slice(5).trim());
          if (event === "delta" && payload.text) {
            fullText += payload.text;
            onDelta(payload.text);
          } else if (event === "done") {
            if (payload.text) fullText = payload.text;
            llmMs = payload.llmMs;
          }
        } catch {
          /* ignore malformed frames */
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  perfLog("LLM (stream)", start, `llmMs=${llmMs ?? "n/a"}`);
  return { text: fullText, llmMs };
}

/**
 * Convert arbitrary text to Sarvam TTS audio (base64 wav).
 */
export async function textToSpeech(
  text: string,
  language = "en-IN",
): Promise<string | null> {
  if (!text.trim()) return null;

  const start = Date.now();
  const res = await fetch(`${BACKEND_URL}/api/voice/tts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  perfLog("TTS", start);
  return data.audio || null;
}

/**
 * Build a playable audio source URL from base64 Sarvam audio.
 */
export function audioSrcFromBase64(base64: string): string {
  return `data:audio/wav;base64,${base64}`;
}

export default {
  recordAudio,
  transcribeAudio,
  chat,
  chatStream,
  textToSpeech,
  audioSrcFromBase64,
  perfLog,
  VOICE_STATES,
};
