import "dotenv/config";

const SARVAM_BASE_URL = "https://api.sarvam.ai";

/**
 * Clean markdown/formatting characters from text meant for speech synthesis
 * and truncate it to stay within Sarvam's character limits.
 * @param {string} text
 * @returns {string}
 */
export function cleanTextForSpeech(text) {
  if (!text) return "";
  let cleanText = String(text)
    .replace(/[*#_`>]/g, "")
    .trim();
  if (cleanText.length > 490) {
    const truncated = cleanText.substring(0, 490);
    const lastPeriod = truncated.lastIndexOf(".");
    cleanText =
      lastPeriod > 0
        ? truncated.substring(0, lastPeriod + 1)
        : truncated + "...";
  }
  return cleanText;
}

/**
 * Convert text to natural speech using the Sarvam AI Text-to-Speech API.
 * @param {string} text - Text to synthesize.
 * @param {string} [language] - Target language code, e.g. "en-IN".
 * @param {string} [speaker] - Sarvam speaker voice, e.g. "kavya".
 * @returns {Promise<{ audio: string|null, error?: string }>} base64 wav audio.
 */
export async function textToSpeech(
  text,
  language = "en-IN",
  speaker = "kavya",
) {
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey || apiKey === "your_sarvam_api_key_here") {
    return {
      audio: null,
      error:
        "Sarvam AI is not configured. Set SARVAM_API_KEY in the backend .env file.",
    };
  }

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) {
    return { audio: null, error: "No text provided for speech synthesis." };
  }

  try {
    const sarvamRes = await fetch(`${SARVAM_BASE_URL}/text-to-speech`, {
      method: "POST",
      headers: {
        "api-subscription-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: [cleanText],
        target_language_code: language,
        speaker,
        speech_sample_rate: 16000,
        enable_preprocessing: true,
        model: "bulbul:v3",
      }),
    });

    if (!sarvamRes.ok) {
      const errText = await sarvamRes.text();
      console.error("Sarvam TTS API error:", sarvamRes.status, errText);
      return {
        audio: null,
        error: `Sarvam TTS failed (${sarvamRes.status}).`,
      };
    }

    const sarvamData = await sarvamRes.json();
    if (sarvamData.audios && sarvamData.audios.length > 0) {
      return { audio: sarvamData.audios[0] };
    }

    return { audio: null, error: "Sarvam returned no audio." };
  } catch (error) {
    console.error("Sarvam TTS connection error:", error);
    return {
      audio: null,
      error: error.message || "Failed to connect to Sarvam TTS.",
    };
  }
}

export default { textToSpeech, cleanTextForSpeech };
