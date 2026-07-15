import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
const BASE_URL = process.env.DEFAULT_AI_BASE_URL || "https://api.hcnsec.cn/v1";

export const generateEmbedding = async (text) => {
    try {
        const response = await fetch(`${BASE_URL}/embeddings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: 'text-embedding-3-small',
                input: text
            })
        });

        if (!response.ok) {
            // Fallback to simple simulated vector if the proxy doesn't support embeddings
            console.warn(`Embeddings API failed: ${response.status}. Using simulated embeddings.`);
            return simulateEmbedding(text);
        }

        const data = await response.json();
        return data.data[0].embedding;
    } catch (error) {
        console.error("Error generating embedding:", error);
        return simulateEmbedding(text);
    }
};

// Simple pseudo-random vector generator for fallback (Length: 1536 like OpenAI)
function simulateEmbedding(text) {
    const vector = new Array(1536).fill(0);
    for(let i = 0; i < text.length; i++) {
        vector[i % 1536] += text.charCodeAt(i) / 1000;
    }
    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    return vector.map(val => val / (magnitude || 1));
}
