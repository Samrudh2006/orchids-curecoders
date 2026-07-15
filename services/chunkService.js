export const chunkText = (text, maxTokens = 500, overlapTokens = 75) => {
    // Approximate 1 token = 4 characters
    const maxChars = maxTokens * 4;
    const overlapChars = overlapTokens * 4;

    const chunks = [];
    let i = 0;

    while (i < text.length) {
        let end = i + maxChars;
        
        // Try to find a natural break (sentence end) near the chunk limit
        if (end < text.length) {
            const nextPeriod = text.indexOf('. ', end - 100);
            if (nextPeriod !== -1 && nextPeriod < end + 100) {
                end = nextPeriod + 1;
            } else {
                const nextSpace = text.indexOf(' ', end);
                if (nextSpace !== -1 && nextSpace < end + 50) {
                    end = nextSpace;
                }
            }
        }

        chunks.push(text.substring(i, end).trim());
        
        // Move forward, subtracting overlap
        i = end - overlapChars;
        
        // Prevent infinite loops if overlap is somehow larger than the chunk advancement
        if (i <= chunks[chunks.length - 1].length - maxChars) {
            i = end; 
        }
    }

    return chunks.filter(c => c.length > 20);
};
