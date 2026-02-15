const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;

let client = null;
try {
  if (TWILIO_SID && TWILIO_TOKEN) client = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
} catch (err) {
  // twilio not installed, we'll fallback to console logging
}

const sendSms = async ({ to, body }) => {
  if (!to) throw new Error('to is required');
  if (client) {
    const msg = await client.messages.create({ to, from: TWILIO_FROM, body });
    return msg;
  }

  console.log('[sms] dev send', { to, body });
  return { sid: 'dev-' + Date.now() };
};

module.exports = { sendSms };
