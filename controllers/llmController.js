
const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory  } = require('@google/generative-ai');
const fetch = require("node-fetch");
require ("dotnet").config();
globalThis.fetch = fetch

async function uploadFile(img) {
    try {

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest'})

        const prompt = 'give me the value info in the image only the first line and the numbers with comma'; 
        const image = {
            headers: GoogleGenerativeAI.headers,
            inlineData:{
                data: Buffer.from(img).toString("base64"),
                mimeType: "image/webp",
            }
        }
        const answer = await model.generateContent([prompt, image]);
        const result = answer.response.text();

        let value = '';
        result.split(" ").forEach(values => {
            if (values.trim().length > value.length) {
                value = values.trim(); 
            }
        });
        value = value.split(',')[0]

        return Number(value);
    } catch (error) {
        console.error("Error uploading file:", error);
    }
}

module.exports = {uploadFile};