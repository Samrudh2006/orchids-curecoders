import "dotenv/config";

const SARVAM_BASE_URL = "https://api.sarvam.ai";
// Sarvam's current ASR models. The API validates the model field and returns
// HTTP 400 with this exact enum if the model is invalid:
//   'saarika:v2.5', 'saaras:v3', 'saaras:v3-realtime', 'saaras:v4',
//   'saaras:v4-multispk', 'saarika:v1', 'saarika:v2', 'saarika:flash'
// We use 'saaras:v4' (the current general-purpose ASR model).
const SARVAM_STT_MODEL = "saaras:v4";

// Sarvam STT accepts WAV (mono, 16-bit PCM) at 8kHz/16kHz; it does NOT accept
// WebM/Opus. Only allow formats Sarvam actually supports here so we surface a
// clear error instead of a confusing upstream 400.
const ALLOWED_MIME_TYPES = [
  "audio/wav",
  "audio/wave",
  "audio/x-wav",
  "audio/mpeg",
  "audio/mp3",
];
// Sarvam STT accepts up to 10MB of audio.
const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

/**
 * Validate an uploaded audio file before sending it to Sarvam AI.
 * @param {{ buffer: Buffer, mimetype?: string, size?: number, originalname?: string }} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAudioFile(file) {
  if (!file || !file.buffer || file.buffer.length === 0) {
    return { valid: false, error: "No audio file provided." };
  }

  if (file.size !== undefined && file.size > MAX_AUDIO_BYTES) {
    return {
      valid: false,
      error: `Audio file exceeds the ${MAX_AUDIO_BYTES / (1024 * 1024)}MB limit.`,
    };
  }

  if (file.buffer.length > MAX_AUDIO_BYTES) {
    return {
      valid: false,
      error: `Audio file exceeds the ${MAX_AUDIO_BYTES / (1024 * 1024)}MB limit.`,
    };
  }

  // Validate mime type to catch WebM/Opus early (Sarvam rejects it with 400).
  if (file.mimetype && !ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return {
      valid: false,
      error: `Unsupported audio format: ${file.mimetype}. Sarvam STT requires WAV (or MP3). Please record in WAV format.`,
    };
  }

  return { valid: true };
}

/**
 * Derive a file extension from the MIME type / original filename.
 */
function getExtension(mimetype, originalname) {
  if (originalname && originalname.includes(".")) {
    const ext = originalname.split(".").pop().toLowerCase();
    if (ext) return ext;
  }
  const map = {
    "audio/wav": "wav",
    "audio/wave": "wav",
    "audio/x-wav": "wav",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
  };
  return map[mimetype] || "wav";
}

/**
 * Transcribe audio using the Sarvam AI Speech-to-Text API.
 * @param {Buffer} audioBuffer - Raw audio bytes (WAV/MP3).
 * @param {string} mimetype - Audio MIME type.
 * @param {string} [language] - Language code, e.g. "en-IN".
 * @param {string} [originalname] - The uploaded file's original name.
 * @returns {Promise<{ text: string, error?: string, status?: number }>}
 */
export async function transcribeAudio(
  audioBuffer,
  mimetype = "audio/wav",
  language = "en-IN",
  originalname = "",
) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey || apiKey === "your_sarvam_api_key_here") {
    return {
      text: "",
      error:
        "Sarvam AI is not configured. Set SARVAM_API_KEY in the backend .env file.",
    };
  }

  const validation = validateAudioFile({ buffer: audioBuffer, mimetype });
  if (!validation.valid) {
    return { text: "", error: validation.error };
  }

  // ── Log the exact request details so 400s are instantly debuggable ──────
  console.log("[Sarvam STT] Sending request:");
  console.log("  HTTP method: POST");
  console.log("  URL:", `${SARVAM_BASE_URL}/speech-to-text`);
  console.log("  Model:", SARVAM_STT_MODEL);
  console.log("  Language:", language);
  console.log("  MIME type:", mimetype);
  console.log("  Filename:", originalname || "(none)");
  console.log("  File size (bytes):", audioBuffer.length);
  console.log("  API key present:", Boolean(apiKey && apiKey.length > 5));
  console.log("  Auth header:", "api-subscription-key (set)");

  try {
    // Native FormData/Blob (Node 18+), no extra dependency.
    const form = new FormData();

    // Sarvam's documented multipart fields:
    //   - file          : the audio file (WAV/MP3)
    //   - model         : "saaras:v1" | "saaras:v2"
    //   - language_code : e.g. "en-IN"
    //   - with_diarization  (optional)
    //   - with_timestamps   (optional)
    const ext = getExtension(mimetype, originalname);
    form.append(
      "file",
      new Blob([audioBuffer], { type: mimetype }),
      `recording.${ext}`,
    );
    form.append("model", SARVAM_STT_MODEL);
    form.append("language_code", language);
    form.append("with_diarization", "false");
    form.append("with_timestamps", "false");

    // Log multipart field names (no API key, no file contents).
    console.log(
      "[Sarvam STT] Multipart fields: file, model, language_code, with_diarization, with_timestamps",
    );

    // Sarvam's official authentication header is `api-subscription-key`.
    // We do NOT send an Authorization Bearer header — undocumented headers
    // can cause an HTTP 400.
    const response = await fetch(`${SARVAM_BASE_URL}/speech-to-text`, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
      },
      body: form,
    });

    if (!response.ok) {
      // ── Log the COMPLETE response body, not just the status ──
      const errText = await response.text();
      console.error(`[Sarvam STT] HTTP ${response.status} - body:`, errText);
      return {
        text: "",
        status: response.status,
        error: `Sarvam STT failed (${response.status}). Body: ${errText}`,
      };
    }

    const data = await response.json();
    // Saaras:v2 returns { transcript: "..." }.
    const transcript = data.transcript || data.text || "";
    console.log("[Sarvam STT] Success. Transcript:", transcript);

    if (!transcript) {
      return { text: "", error: "No speech detected in the audio." };
    }

    return { text: transcript.trim() };
  } catch (error) {
    console.error("Sarvam STT connection error:", error);
    if (error && error.stack) {
      console.error("Sarvam STT stack:", error.stack);
    }
    return {
      text: "",
      error: error.message || "Failed to connect to Sarvam STT.",
    };
  }
}

export default { transcribeAudio, validateAudioFile };
