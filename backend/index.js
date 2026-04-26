const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const twilio = require('twilio');
const cron = require('node-cron');
const { GoogleGenerativeAI, SchemaType } = require('@google/generative-ai');
const Groq = require('groq-sdk');
// Load .env from default path, then override with Render's secret file location
dotenv.config();
dotenv.config({ path: '/etc/secrets/.env', override: true });

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize AI Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const groq = new Groq({ apiKey: process.env.GEMINI_API_KEY || '' }); // Uses same var if it starts with gsk_

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('GrowthOS Backend Running');
});

// Health check endpoint for debugging
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiKeyPresent: !!process.env.GEMINI_API_KEY,
    geminiKeyLength: (process.env.GEMINI_API_KEY || '').length,
    twilioConfigured: !!process.env.TWILIO_ACCOUNT_SID,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

// AI Chat Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || '';
    
    if (!apiKey) {
      const response = generateLocalResponse(message);
      return res.json({ response });
    }

    // IF GROQ KEY DETECTED
    if (apiKey.startsWith('gsk_')) {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are Coach Aurora, a friendly AI self-development coach for GrowthOS. You help users track habits, stay motivated, and build discipline. Keep responses concise and encouraging." },
          ...(history || []).map(h => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts[0].text
          })),
          { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
      });
      return res.json({ response: completion.choices[0].message.content });
    }

    // GEMINI LOGIC (Keep as fallback)
    const tools = [{
      functionDeclarations: [{
        name: "scheduleReminder",
        description: "Schedule a reminder to be sent via WhatsApp. Call this when the user explicitly asks for a reminder.",
        parameters: {
          type: SchemaType.OBJECT,
          properties: {
            taskDesc: { type: SchemaType.STRING, description: "The specific task to remind about." },
            delayMinutes: { type: SchemaType.INTEGER, description: "Minutes from now until reminder fires." }
          },
          required: ["taskDesc", "delayMinutes"]
        }
      }]
    }];

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash-latest",
      tools: tools,
      systemInstruction: "You are Coach Aurora, a friendly AI self-development coach for GrowthOS. You help users track habits, stay motivated, and build discipline. Keep responses concise and encouraging. When a user asks for a reminder, use the scheduleReminder tool."
    });
    
    // Filter history: must start with 'user' and alternate roles
    let filteredHistory = (history || []).filter(h => h.parts && h.parts.length > 0);
    // Remove leading 'model' messages (like the greeting)
    while (filteredHistory.length > 0 && filteredHistory[0].role === 'model') {
      filteredHistory.shift();
    }

    const chat = model.startChat({
      history: filteredHistory,
      generationConfig: { maxOutputTokens: 500 }
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    let text = "";
    
    // Check if the AI decided to call the Reminder Tool
    const functionCalls = response.functionCalls ? response.functionCalls() : [];
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === "scheduleReminder") {
        const { taskDesc, delayMinutes } = call.args;
        console.log(`[AI Tool Triggered] Scheduling reminder: "${taskDesc}" in ${delayMinutes}m`);
        
        // Execute the scheduled reminder directly with Twilio
        setTimeout(() => {
          if (twilioClient) {
            console.log(`Executing reminder for ${taskDesc}`);
            twilioClient.messages.create({
              body: `🚀 GrowthOS Reminder: It is time to ${taskDesc}!`,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: process.env.YOUR_PERSONAL_NUMBER
            }).catch(e => console.log('Delay Twilio Error:', e.message));
          }
        }, delayMinutes * 60 * 1000);
        
        // Provide the function result back to the AI
        const followUp = await chat.sendMessage([{
          functionResponse: {
            name: "scheduleReminder",
            response: { status: "success", scheduledInMinutes: delayMinutes }
          }
        }]);
        text = followUp.response.text();
      }
    } else {
      text = response.text();
    }
    
    res.json({ response: text });
  } catch (error) {
    console.error('AI Error:', error.message || error);
    console.error('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
    console.error('GEMINI_API_KEY length:', (process.env.GEMINI_API_KEY || '').length);
    
    // Fallback to local intelligence
    await new Promise(resolve => setTimeout(resolve, 800));
    const response = generateLocalResponse(message);
    res.json({ response });
  }
});

// Helper for local responses (re-defined outside for scope)
function generateLocalResponse(msg) {
  const lowerMsg = msg.toLowerCase();
  const defaults = [
     "I'm locked in! What's our next objective?",
     "Consistency is key. How's your habit streak looking today?",
     "I'm tracking your progress. Let's make today count!",
     "Focus on the process, and the results will follow. What's next?",
     "Beast mode is a mindset. Are you ready to level up?"
  ];
  
  if (lowerMsg.match(/\b(hi|hello|hey|yo)\b/)) return "Hello! Coach Aurora here. Ready to dominate the day?";
  if (lowerMsg.includes('sayan')) return "Hey Sayan! Your GrowthOS stats are looking strong. What's the plan?";
  if (lowerMsg.includes('gym') || lowerMsg.includes('workout')) return "Sweat is just weakness leaving the body! Keep that physical discipline high. 💪";
  if (lowerMsg.includes('code') || lowerMsg.includes('dsa')) return "Algorithm mastery is a marathon, not a sprint. Keep solving! 💻";
  if (lowerMsg.includes('waste') || lowerMsg.includes('reels')) return "Awareness is the first step. Reset your focus and get back to deep work. You've got this.";
  if (lowerMsg.includes('thank')) return "You're welcome! Now let's keep that momentum going.";
  
  return defaults[Math.floor(Math.random() * defaults.length)];
}


// Growth Score Update Logic (Mock)
app.post('/api/score', (req, res) => {
  const { tasks } = req.body;
  let score = 0;
  tasks.forEach(task => {
    if (task.completed) score += (task.points || 10);
    else score -= 5;
  });
  res.json({ newScore: score });
});

// Twilio Notifications Setup
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_AUTH_TOKEN !== 'paste_your_auth_token_here') {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log("Twilio Notification service is initialized.");
} else {
  console.log("Twilio credentials not fully set. Reminders are disabled.");
}

// In-memory store for active schedule timers
const activeTimers = {};

// Helper: Parse "07:00 AM" into a Date object for today
function parseTimeToToday(timeStr) {
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  
  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
  return target;
}

// Schedule Reminder Endpoint — called from the Planner frontend
app.post('/api/schedule-reminder', (req, res) => {
  try {
    const { title, time, id } = req.body;
    
    if (!title || !time) {
      return res.status(400).json({ error: 'title and time are required' });
    }

    // Extract start time from "07:00 AM - 08:30 AM" format
    const startTimeStr = time.split('-')[0].trim();
    const targetDate = parseTimeToToday(startTimeStr);
    
    if (!targetDate) {
      return res.json({ scheduled: false, reason: 'Could not parse time' });
    }

    const now = new Date();
    const delayMs = targetDate.getTime() - now.getTime();
    
    // If time already passed today, skip
    if (delayMs <= 0) {
      console.log(`⏭️ Skipping "${title}" — time ${startTimeStr} already passed today.`);
      return res.json({ scheduled: false, reason: 'Time already passed today' });
    }

    // Cancel any existing timer for this task id
    if (id && activeTimers[id]) {
      clearTimeout(activeTimers[id]);
      delete activeTimers[id];
    }

    const delayMinutes = Math.round(delayMs / 60000);
    console.log(`⏰ Scheduling WhatsApp reminder: "${title}" at ${startTimeStr} (in ${delayMinutes} min)`);

    const timerId = setTimeout(() => {
      if (twilioClient) {
        twilioClient.messages.create({
          body: `🚀 GrowthOS Reminder: It's time for ${title}! Let's go! 💪`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.YOUR_PERSONAL_NUMBER
        })
        .then(msg => console.log(`✅ Reminder sent for "${title}":`, msg.sid))
        .catch(err => console.error(`❌ Twilio Error for "${title}":`, err.message));
      } else {
        console.log(`📲 [MOCK] WhatsApp Reminder: It's time for ${title}!`);
      }
      if (id) delete activeTimers[id];
    }, delayMs);

    if (id) activeTimers[id] = timerId;

    res.json({ 
      scheduled: true, 
      task: title, 
      scheduledFor: startTimeStr, 
      inMinutes: delayMinutes 
    });
  } catch (error) {
    console.error('Schedule Error:', error.message);
    res.status(500).json({ error: 'Failed to schedule reminder' });
  }
});

// Bulk sync: schedule all tasks at once
app.post('/api/sync-schedule', (req, res) => {
  const { tasks } = req.body;
  if (!tasks || !Array.isArray(tasks)) {
    return res.status(400).json({ error: 'tasks array is required' });
  }
  
  let scheduled = 0;
  tasks.forEach(task => {
    const startTimeStr = task.time.split('-')[0].trim();
    const targetDate = parseTimeToToday(startTimeStr);
    if (!targetDate) return;
    
    const delayMs = targetDate.getTime() - new Date().getTime();
    if (delayMs <= 0) return;

    // Clear existing timer
    if (activeTimers[task.id]) {
      clearTimeout(activeTimers[task.id]);
    }

    activeTimers[task.id] = setTimeout(() => {
      if (twilioClient) {
        twilioClient.messages.create({
          body: `🚀 GrowthOS Reminder: It's time for ${task.title}! Let's go! 💪`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.YOUR_PERSONAL_NUMBER
        })
        .then(msg => console.log(`✅ Reminder sent for "${task.title}":`, msg.sid))
        .catch(err => console.error(`❌ Twilio Error:`, err.message));
      } else {
        console.log(`📲 [MOCK] WhatsApp Reminder: It's time for ${task.title}!`);
      }
      delete activeTimers[task.id];
    }, delayMs);

    scheduled++;
    console.log(`⏰ Synced: "${task.title}" at ${startTimeStr}`);
  });

  res.json({ synced: scheduled, total: tasks.length });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
