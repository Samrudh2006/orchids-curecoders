import express from "express";

/**
 * Chat router for the follow-up / drug-analysis chat.
 *
 * It uses the shared multi-LLM provider service (Phase 3) injected from
 * server.js via the `getAi` callback. This keeps a SINGLE shared AIService
 * instance (no duplicated provider initialization) and lets the chat route
 * automatically benefit from the provider selection + fallback chain.
 */
export default function createChatRouter(getAi) {
  const router = express.Router();

  router.post("/", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message)
        return res.status(400).json({ error: "message is required" });

      const ai = getAi ? getAi() : null;

      // Build a conversational prompt from the history (if any).
      const historyText = (history || [])
        .map(
          (h) =>
            `${h.role === "user" ? "User" : "Assistant"}: ${h.text || h.content || ""}`,
        )
        .join("\n");
      const prompt = historyText ? `${historyText}\nUser: ${message}` : message;

      if (ai) {
        try {
          const result = await ai.generateResponse(prompt);
          return res.json({ text: result.text, provider: result.provider });
        } catch (e) {
          console.error("AI Chat failed:", e);
        }
      }

      res.json({
        text: `[Simulated Analyst] Thank you for asking. Regarding "${message}", our data reveals steady market growth, high trial density, and manageable patent exposure for next-generation assets.`,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
}
