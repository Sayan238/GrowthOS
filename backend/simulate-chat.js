const axios = require('axios');

async function simulate() {
  console.log("🤖 Sending prompt to AI Chatbot Endpoint...");
  try {
    const response = await axios.post('http://localhost:5000/api/chat', {
      message: "Hey Aurora, please remind me to do some jumping jacks in 1 minute!"
    });
    console.log("\n💬 AI Chatbot Replied:");
    console.log(response.data.response);
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
  }
}

simulate();
