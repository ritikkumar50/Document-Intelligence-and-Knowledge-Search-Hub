const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

// User might have put the Gemini key in OPENAI_API_KEY or a new variable.
const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey);

const generateAnswer = async (question, context) => {
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];

    for (const modelName of modelsToTry) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = `
      Role: You are a helpful AI assistant.
      Constraint: Answer the question strictly using ONLY the provided Context below. If the answer is not in the context, state "I cannot find this information in the uploaded documents." Do not use outside knowledge.
      
      Context:
      ${context}
      
      Question: ${question}
      `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.log(`Model ${modelName} failed: ${error.message}`);
            // Continue to next model
        }
    }

    return "Error: No available Gemini models found active on this API key. Please enable 'Generative Language API' in Google Cloud Console.";
};

module.exports = { generateAnswer };
