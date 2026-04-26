const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function list() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // There isn't a direct listModels in the client lib, usually it's via the REST API or discovery
    // Let's try the most common models one by one
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro"];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent("hi");
        console.log(`Model ${m}: WORKING`);
        return;
      } catch (e) {
        console.log(`Model ${m}: FAILED (${e.message.split('\n')[0]})`);
      }
    }
  } catch (error) {
    console.error('ERROR:', error);
  }
}
list();
