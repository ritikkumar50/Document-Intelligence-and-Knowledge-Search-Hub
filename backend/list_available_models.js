const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

async function getModels() {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        console.log(`Querying: ${url}`);
        const response = await axios.get(url);
        const models = response.data.models;

        console.log("--- Available Models ---");
        models.forEach(m => {
            if (m.name.includes('gemini')) {
                console.log(`VALID_GEMINI: ${m.name}`);
            }
        });
    } catch (error) {
        console.error("Error fetching models:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, error.response.data);
        } else {
            console.error(error.message);
        }
    }
}

getModels();
