require('dotenv').config();
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    tools: [{
      functionDeclarations: [{
        name: "scheduleReminder",
        description: "Schedule a reminder to be sent via WhatsApp.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            taskDesc: { type: SchemaType.STRING, description: "The task to remind about." },
            delayMinutes: { type: SchemaType.INTEGER, description: "Minutes from now." }
          },
          required: ["taskDesc", "delayMinutes"]
        }
      }]
    }]
  });
  
  const chat = model.startChat({});
  const result = await chat.sendMessage("Remind me to do gym in 2 minutes");
  const response = result.response;
  
  const calls = response.functionCalls ? response.functionCalls() : [];
  if (calls.length > 0) {
    console.log("TOOL CALLED:", JSON.stringify(calls[0]));
  } else {
    console.log("TEXT:", response.text());
  }
}

test();
