const logger = require('../utils/logger');

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_TOKEN = process.env.TWILIO_TOKEN;
const TWILIO_FROM = process.env.TWILIO_FROM;

let client = null;
try {
  if (TWILIO_SID && TWILIO_TOKEN) client = require('twilio')(TWILIO_SID, TWILIO_TOKEN);
} catch (err) {
  logger.warn('Twilio SDK not installed, SMS will be logged to console');
}

const sendSms = async ({ to, body }) => {
  if (!to) throw new Error('to is required');

  if (client) {
    try {
      const msg = await client.messages.create({ to, from: TWILIO_FROM, body });
      return msg;
    } catch (err) {
      logger.error('Twilio SMS send failed', err);
      throw err;
    }
  }

  logger.debug('[sms] dev send', { to, body });
  return { sid: 'dev-' + Date.now() };
};

module.exports = { sendSms };
