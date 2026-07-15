import express from 'express';

const router = express.Router();

const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
const defaultModel = process.env.DEFAULT_AI_MODEL || "glm4.7";
const defaultBaseUrl = process.env.DEFAULT_AI_BASE_URL || "https://api.hcnsec.cn/v1";

router.post('/', async (req, res) => {
    try {
        const { message, history } = req.body;
        if (!message) return res.status(400).json({ error: 'message is required' });

        if (API_KEY) {
            try {
                // Formatting history for OpenAI-compatible completions format
                const messages = (history || []).map(h => ({
                    role: h.role === 'user' ? 'user' : 'assistant',
                    content: h.text || h.content || ''
                }));
                messages.push({ role: 'user', content: message });

                const response = await fetch(`${defaultBaseUrl}/chat/completions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${API_KEY}`
                    },
                    body: JSON.stringify({
                        model: defaultModel,
                        messages: messages
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    return res.json({ text: data.choices[0].message.content });
                } else {
                    console.error("AI Chat failed with status:", response.status);
                }
            } catch (e) {
                console.error("AI Chat failed:", e);
            }
        }

        res.json({ text: `[Simulated Analyst] Thank you for asking. Regarding "${message}", our data reveals steady market growth, high trial density, and manageable patent exposure for next-generation assets.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
