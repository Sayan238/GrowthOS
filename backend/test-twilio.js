require('dotenv').config();
const twilio = require('twilio');

if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_AUTH_TOKEN === 'paste_your_auth_token_here') {
  console.log("❌ ERROR: You still need to paste your Twilio Auth Token in the .env file!");
  process.exit(1);
}

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

console.log("Sending test message...");

client.messages.create({
    body: '🚀 GrowthOS LIVE DEMO: You have successfully connected the AI Coach to WhatsApp! Time to enter Beast Mode. 💪',
    from: process.env.TWILIO_PHONE_NUMBER,
    to: process.env.YOUR_PERSONAL_NUMBER
})
.then(message => {
  console.log('✅ SUCCESS! Message sent.');
  console.log(`📡 Message SID: ${message.sid}`);
})
.catch(err => {
  console.log('❌ FAILED to send message. Check the error below:');
  console.error(err);
});
