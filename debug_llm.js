import fs from "fs";
import path from "path";

// Parse .env (mirror of server logic)
const envPath = path.join(process.cwd(), ".env");
const envFile = fs.readFileSync(envPath, "utf8");
const env = {};
envFile.split("\n").forEach((line) => {
  if (line.trim() && !line.startsWith("#")) {
    const i = line.indexOf("=");
    if (i > 0) {
      let k = line.slice(0, i).trim();
      let v = line.slice(i + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      )
        v = v.slice(1, -1);
      env[k] = v;
    }
  }
});

// ============================================================
// CONFIGURATION — MUST match server.js exactly.
//
// server.js hardcodes Kimi-K2.6 as the PRIMARY model because it
// is the only one verified to work with the PATENTS_API_KEY on
// the configured base URL. No DeepSeek-V4-Flash references are
// needed here — it is intentionally not used.
// ============================================================
const AI_MODEL = "Kimi-K2.6";
const AI_API_KEY =
  env.DEFAULT_AI_API_KEY ||
  env.PATENTS_API_KEY ||
  env.GROQ_API_KEY ||
  env.MARKET_DATA_API_KEY ||
  env.VITE_GEMINI_API_KEY;
const AI_BASE_URL =
  process.env.DEFAULT_AI_BASE_URL ||
  env.DEFAULT_AI_BASE_URL ||
  "https://api.hcnsec.cn/v1";

const keySource = env.DEFAULT_AI_API_KEY
  ? "DEFAULT_AI_API_KEY"
  : env.PATENTS_API_KEY
    ? "PATENTS_API_KEY"
    : env.GROQ_API_KEY
      ? "GROQ_API_KEY"
      : env.MARKET_DATA_API_KEY
        ? "MARKET_DATA_API_KEY"
        : env.VITE_GEMINI_API_KEY
          ? "VITE_GEMINI_API_KEY"
          : "none";

async function chat(model, promptText) {
  const url = AI_BASE_URL + "/chat/completions";
  const body = { model, messages: [{ role: "user", content: promptText }] };
  console.log(
    `\n[LLM] Request | URL: ${url} | Model: ${model} | Base URL: ${AI_BASE_URL} | API key source: ${keySource}`,
  );
  const startedAt = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + AI_API_KEY,
    },
    body: JSON.stringify(body),
  });
  const elapsedMs = Date.now() - startedAt;
  console.log(
    `[LLM] HTTP status: ${res.status} | Response time: ${elapsedMs}ms`,
  );
  const text = await res.text();
  if (!res.ok) {
    console.error(`[LLM] Full response body: ${text}`);
    const err = new Error(
      `AI API error: HTTP ${res.status} for model "${model}" at ${url}`,
    );
    err.status = res.status;
    err.responseBody = text;
    err.elapsedMs = elapsedMs;
    throw err;
  }
  console.log(`[LLM] Full response body: ${text}`);
  const data = JSON.parse(text);
  return { text: data.choices[0].message.content, elapsedMs };
}

async function generateContent(promptText) {
  return chat(AI_MODEL, promptText);
}

console.log("=== Testing configured model with 'Hello' ===");
console.log(`Configured model: ${AI_MODEL}`);
console.log(`Base URL: ${AI_BASE_URL}`);
console.log(`API key source: ${keySource}`);
console.log(`API key present: ${Boolean(AI_API_KEY)}`);

const totalStart = Date.now();
try {
  const result = await generateContent("Hello");
  const totalMs = Date.now() - totalStart;
  console.log(`\n✅ RESPONSE: ${result.text}`);
  console.log("\n--- SUMMARY ---");
  console.log(`Model used: ${AI_MODEL}`);
  console.log(`Request succeeded: true`);
  console.log(`Response time (request only): ${result.elapsedMs}ms`);
  console.log(`Total script time: ${totalMs}ms`);
  console.log(`First 100 chars: ${result.text.slice(0, 100)}`);

  if (result.elapsedMs > 5000) {
    console.log(
      "\n⚠️  Response took > 5s. The delay is most likely at the API provider or network layer (the configured model is reachable and returned 200, so the model itself is not hanging). Check latency to the base URL / provider.",
    );
  }
} catch (e) {
  const totalMs = Date.now() - totalStart;
  console.error(`\n❌ FAILED entirely: ${e.message}`);
  console.error(`Total script time: ${totalMs}ms`);
  console.error("Final response body:", e.responseBody);
}
