const puter = require('@heyputer/puter.js').default;

async function testPuter() {
    puter.authToken = 'TEST_TOKEN';
    try {
        console.log("Sending request to Puter.ai...");
        const response = await puter.ai.chat("Hello, are you working in Node.js?");
        console.log("Response:", response);
    } catch (error) {
        console.error("Puter Error:", error);
    }
}

testPuter();
