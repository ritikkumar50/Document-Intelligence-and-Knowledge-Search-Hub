const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const modelsToTry = [
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest"
];

async function check() {
    console.log("Checking models with key starting:", apiKey.substring(0, 5));
    for (const m of modelsToTry) {
        try {
            console.log(`Trying model: ${m}...`);
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            console.log(`SUCCESS: ${m} worked! Response: ${result.response.text()}`);
            return; // Exit on first success
        } catch (e) {
            console.log(`FAILED: ${m} -> ${e.message.split('\n')[0]}`); // Log only first line of error
        }
    }
}

check();
