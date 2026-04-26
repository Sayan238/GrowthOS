const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

async function test() {
  console.log('Testing Key:', process.env.GEMINI_API_KEY ? 'FOUND' : 'MISSING');
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say 'API IS WORKING'");
    const response = await result.response;
    console.log('RESULT:', response.text());
  } catch (error) {
    console.error('API ERROR:', error.message);
  }
}
test();
