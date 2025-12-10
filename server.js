import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;
const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("WARNING: VITE_GEMINI_API_KEY is not set in environment variables!");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// Endpoint for content generation
app.post('/api/generate', async (req, res) => {
    if (!ai) {
        return res.status(500).json({ error: "Server misconfigured: No API Key" });
    }

    try {
        const { contents, config } = req.body;

        // Forward request to Gemini
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash", // Updated to latest model
            contents,
            config
        });

        res.json(response);
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: error.message || "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
