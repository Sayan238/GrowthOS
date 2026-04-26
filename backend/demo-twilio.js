const cron = require('node-cron');

console.log('⏳ Starting GrowthOS Reminder Engine (Demo Mode)...');
console.log('⚙️ Initializing Twilio Integration...\n');

// Mocking the Twilio Client for the demo
const mockTwilioClient = {
  messages: {
    create: async (data) => {
      console.log('\n=============================================');
      console.log('📲 INCOMING WHATSAPP / SMS REMINDER TRIGGERED');
      console.log('=============================================');
      console.log(`From : ${data.from || 'Twilio Sandbox'}`);
      console.log(`To   : ${data.to || 'Your Personal Number'}`);
      console.log('---------------------------------------------');
      console.log(`💬 Message:`);
      console.log(`   ${data.body}`);
      console.log('=============================================');
      return { sid: `SM_${Math.random().toString(36).substring(2, 10).toUpperCase()}` };
    }
  }
};

const tasksToRemind = [
  "💪 GrowthOS Reminder: Morning Gym Session starts in 15 mins! No excuses.",
  "💻 GrowthOS Reminder: Time for DSA Practice! Let's conquer those algorithms.",
  "📚 GrowthOS Reminder: Focus time! Stop scrolling reels and start building."
];

let counter = 0;

// Creating a cron job that runs every 5 seconds (just for the demo!)
// In reality, this would be '0 * * * *' (every hour)
cron.schedule('*/5 * * * * *', () => {
  if (counter >= tasksToRemind.length) {
    console.log('\n🛑 Demo completed. Shutting down reminder engine.');
    process.exit(0);
  }

  const reminderText = tasksToRemind[counter];
  
  mockTwilioClient.messages.create({
      body: reminderText,
      from: '+1234567890 (Twilio)',
      to: '+91 9876543210 (You)'
  })
  .then(message => console.log(`✅ [Backend Log]: Twilio Message Sent Successfully with ID: ${message.sid}\n`));
  
  counter++;
});
