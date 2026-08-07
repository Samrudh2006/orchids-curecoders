/**
 * Voice Pipeline Profiler
 * -----------------------
 * Measures the END-TO-END latency of each stage of the CureCoders voice
 * assistant pipeline by calling the real backend endpoints directly:
 *
 *   1. Recording  (simulated - reads the provided WAV file)
 *   2. Upload     (client -> /api/voice/stt)
 *   3. STT        (Sarvam STT request time)
 *   4. LLM        (AI model request time)
 *   5. TTS        (Sarvam TTS request time)
 *   6. Playback   (simulated - audio received)
 *   7. TOTAL      (end-to-end)
 *
 * Run:  node profile_voice_pipeline.js [--mode legacy|stream] [--iterations N] [--synthetic]
 *
 *   --synthetic  skips real STT (test WAVs may have no detectable speech) and
 *                uses a fixed transcript so LLM + TTS can still be measured.
 *
 * The backend must be running (npm run server) and .env must have the keys.
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---- Config ----------------------------------------------------------------
const BACKEND_URL = process.env.PROFILE_BACKEND_URL || "http://localhost:3001";
const AUDIO_FILE =
  process.env.PROFILE_AUDIO || path.join(__dirname, "test_real.wav");
const LANGUAGE = "en-IN";
const args = process.argv.slice(2);
const mode = args.includes("--mode")
  ? args[args.indexOf("--mode") + 1]
  : "stream";
const iters = args.includes("--iterations")
  ? parseInt(args[args.indexOf("--iterations") + 1], 10)
  : 3;
const synthetic = args.includes("--synthetic");

const audio = fs.readFileSync(AUDIO_FILE);
// Fallback used when audio has no detectable speech so we can still profile
// the LLM + TTS stages end-to-end.
const SYNTHETIC_TRANSCRIPT =
  "What is the market size for diabetes drugs in India?";
console.log(`Audio: ${AUDIO_FILE} (${audio.length} bytes)`);
console.log(
  "Mode: " +
    mode.toUpperCase() +
    " | Iterations: " +
    iters +
    " | Synthetic: " +
    synthetic +
    "\n",
);

// ---- Helpers ---------------------------------------------------------------
const now = () => performance.now();
const round = (n) => Math.round(n);

function fmtTable(label, rows) {
  console.log("\n---- " + label + " ----");
  console.log("Stage".padEnd(16) + "ms".padStart(8));
  console.log("-".repeat(24));
  for (const [k, v] of Object.entries(rows)) {
    if (typeof v === "number")
      console.log(k.padEnd(16) + String(round(v)).padStart(8));
  }
}

async function timeStt() {
  const form = new FormData();
  form.append(
    "audio",
    new Blob([audio], { type: "audio/wav" }),
    "recording.wav",
  );
  form.append("language", LANGUAGE);
  const t0 = now();
  const res = await fetch(BACKEND_URL + "/api/voice/stt", {
    method: "POST",
    body: form,
  });
  const ms = now() - t0;
  const data = await res.json();
  if (!res.ok) throw new Error("STT failed " + res.status + ": " + data.error);
  return { text: data.text, ms, serverSttMs: data.timings?.sttMs };
}

async function timeLlmJson(text) {
  const t0 = now();
  const res = await fetch(BACKEND_URL + "/api/voice/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      language: LANGUAGE,
      stream: false,
      include_audio: false,
    }),
  });
  const ms = now() - t0;
  const data = await res.json();
  if (!res.ok) throw new Error("LLM failed " + res.status + ": " + data.error);
  return { text: data.text, ms, serverLlmMs: data.timings?.llmMs };
}

async function timeLlmStream(text) {
  const t0 = now();
  const res = await fetch(BACKEND_URL + "/api/voice/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language: LANGUAGE, stream: true }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error("Stream LLM failed " + res.status + ": " + d.error);
  }
  if (!res.body) throw new Error("No stream body");
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  let full = "";
  let serverLlmMs;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const frames = buf.split("\n\n");
    buf = frames.pop() || "";
    for (const f of frames) {
      const dl = f.split("\n").find((l) => l.startsWith("data:"));
      if (!dl) continue;
      const ev = f
        .split("\n")
        .find((l) => l.startsWith("event:"))
        ?.slice(6)
        .trim();
      try {
        const p = JSON.parse(dl.slice(5).trim());
        if (ev === "delta" && p.text) full += p.text;
        if (ev === "done") {
          if (p.text) full = p.text;
          serverLlmMs = p.llmMs;
        }
      } catch {}
    }
  }
  return { text: full, ms: now() - t0, serverLlmMs };
}

async function timeTts(text) {
  const t0 = now();
  const res = await fetch(BACKEND_URL + "/api/voice/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language: LANGUAGE }),
  });
  const ms = now() - t0;
  const data = await res.json();
  if (!res.ok) throw new Error("TTS failed " + res.status + ": " + data.error);
  return { audio: data.audio, ms, serverTtsMs: data.timings?.ttsMs };
}

// ---- Run iterations --------------------------------------------------------
const results = [];
for (let i = 0; i < iters; i++) {
  console.log(`\n>>> Iteration ${i + 1} (${mode.toUpperCase()}) <<<`);
  const step = {};

  // 1. Recording (simulated: reading the already-captured WAV)
  const recT0 = now();
  fs.readFileSync(AUDIO_FILE); // simulate "audio ready"
  step.Recording = now() - recT0;
  console.log("Recording: " + round(step.Recording) + " ms");

  // 2 + 3. Upload + STT (single round trip)
  let sttText;
  if (synthetic) {
    sttText = SYNTHETIC_TRANSCRIPT;
    step["Upload+STT"] = 0;
    console.log(
      'Upload+STT: 0 ms (synthetic) | transcript: "' +
        sttText.slice(0, 40) +
        '"',
    );
  } else {
    const stt = await timeStt();
    sttText = stt.text;
    step.STT = stt.ms; // includes upload
    step["Upload+STT"] = stt.ms;
    console.log(
      "Upload+STT: " +
        round(step["Upload+STT"]) +
        " ms | server STT: " +
        round(stt.serverSttMs || 0) +
        ' ms | "' +
        sttText.slice(0, 40) +
        '"',
    );
  }

  // 4. LLM
  let llm;
  if (mode === "stream") {
    llm = await timeLlmStream(sttText);
    console.log(
      "LLM (stream): " +
        round(llm.ms) +
        " ms | server LLM: " +
        round(llm.serverLlmMs || 0) +
        " ms",
    );
  } else {
    llm = await timeLlmJson(sttText);
    console.log(
      "LLM (json): " +
        round(llm.ms) +
        " ms | server LLM: " +
        round(llm.serverLlmMs || 0) +
        " ms",
    );
  }
  step.LLM = llm.ms;

  // 5. TTS
  const tts = await timeTts(llm.text);
  step.TTS = tts.ms;
  console.log(
    "TTS: " +
      round(tts.ms) +
      " ms | server TTS: " +
      round(tts.serverTtsMs || 0) +
      " ms | audio: " +
      (tts.audio ? tts.audio.length + " chars b64" : "none"),
  );

  // 6. Playback start (simulated - audio received implies playback can start)
  step.Playback = 0; // negligible once audio is in hand
  console.log("Playback: " + round(step.Playback) + " ms");

  // 7. Total end-to-end
  step["TOTAL (text)"] = step.Recording + step["Upload+STT"] + step.LLM;
  step["TOTAL (audio)"] =
    step.Recording + step["Upload+STT"] + step.LLM + step.TTS;
  console.log("TOTAL (audio ready): " + round(step["TOTAL (audio)"]) + " ms");

  results.push(step);
}

// ---- Summary ---------------------------------------------------------------
console.log("\n\n════════════════════════ SUMMARY ════════════════════════");
const avg = (k) =>
  results.reduce((a, r) => a + (r[k] || 0), 0) / results.length;
const rows = {
  Recording: avg("Recording"),
  "Upload+STT": avg("Upload+STT"),
  LLM: avg("LLM"),
  TTS: avg("TTS"),
  Playback: avg("Playback"),
  "TOTAL (text)": avg("TOTAL (text)"),
  "TOTAL (audio)": avg("TOTAL (audio)"),
};
fmtTable("Average latencies (" + mode + ", " + iters + " iters)", rows);

// Identify slowest stage
const stageNames = ["Upload+STT", "LLM", "TTS"];
let slowest = stageNames[0];
for (const s of stageNames) if (rows[s] > rows[slowest]) slowest = s;
console.log(
  "\n>>> Slowest stage: " + slowest + " (" + round(rows[slowest]) + " ms)",
);
