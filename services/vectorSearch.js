export const cosineSimilarity = (vecA, vecB) => {
    if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

export const searchSimilarChunks = (queryEmbedding, allChunks, topK = 10) => {
    const scoredChunks = allChunks.map(chunk => {
        let chunkEmbedding;
        try {
            chunkEmbedding = JSON.parse(chunk.embedding);
        } catch (e) {
            return { chunk, score: -1 };
        }
        const score = cosineSimilarity(queryEmbedding, chunkEmbedding);
        return { chunk, score };
    });

    scoredChunks.sort((a, b) => b.score - a.score);
    return scoredChunks.slice(0, topK).map(sc => sc.chunk);
};
