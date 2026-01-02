const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
const fs = require('fs');
dotenv.config();

async function testHelp() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
    console.log("Key starting with:", apiKey ? apiKey.substring(0, 5) : "None");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    try {
        console.log("Sending request...");
        const result = await model.generateContent("Explain Quantum Physics in 5 words.");
        const response = await result.response;
        console.log("Success:", response.text());
        fs.writeFileSync('gemini_test_success.txt', response.text());
    } catch (error) {
        console.error("Error:", error);
        fs.writeFileSync('gemini_test_error.txt', JSON.stringify({
            message: error.message,
            stack: error.stack,
            details: error
        }, null, 2));
    }
}

testHelp();
