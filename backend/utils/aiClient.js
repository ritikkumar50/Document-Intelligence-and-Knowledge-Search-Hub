const dotenv = require('dotenv');
dotenv.config();

const puterKey = process.env.PUTER_API_KEY;

const generateAnswer = async (question, context) => {
    // If no key is configured, return a specific message so frontend knows to try client-side
    if (!puterKey || puterKey === 'your_puter_token_here') {
        return "BACKEND_NO_KEY";
    }

    try {
        const { default: puter } = await import('@heyputer/puter.js');
        puter.authToken = puterKey;
        const prompt = `
      Role: You are a helpful AI assistant.
      Constraint: Answer the question strictly using ONLY the provided Context below. If the answer is not in the context, state "I cannot find this information in the uploaded documents." Do not use outside knowledge.
      
      Context:
      ${context}
      
      Question: ${question}
      `;

        const response = await puter.ai.chat(prompt);

        if (typeof response === 'object' && response.message?.content) {
            return response.message.content;
        } else if (typeof response === 'string') {
            return response;
        } else {
            return JSON.stringify(response);
        }
    } catch (error) {
        console.error("Puter AI Error:", error);
        return `Puter AI Error: ${error.message || 'Unknown error'}`;
    }
};

module.exports = { generateAnswer };
