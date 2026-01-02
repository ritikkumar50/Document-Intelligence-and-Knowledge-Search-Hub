const pdf = require('pdf-parse');

const extractText = async (buffer, mimetype) => {
    try {
        if (mimetype === 'application/pdf') {
            const data = await pdf(buffer);
            return data.text;
        } else {
            // transform buffer to string
            return buffer.toString('utf-8');
        }
    } catch (error) {
        console.error("Text extraction error:", error);
        throw new Error(`Text extraction failed: ${error.message}`);
    }
};

const chunkText = (text, chunkSize = 1000, overlap = 100) => {
    const chunks = [];
    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + chunkSize, text.length);
        chunks.push(text.slice(start, end));
        start += chunkSize - overlap;
    }
    return chunks;
};

module.exports = { extractText, chunkText };
