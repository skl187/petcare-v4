const logger = require('../utils/logger');

const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

const sendPush = async ({ token, title, body }) => {
  if (!token) throw new Error('token required');

  if (!FCM_SERVER_KEY) {
    logger.debug('[push] dev send', { token, title, body });
    return { name: 'dev-' + Date.now() };
  }

  try {
    const res = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        Authorization: `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ to: token, notification: { title, body } })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`FCM request failed (${res.status}): ${errorText}`);
    }

    return await res.json();
  } catch (err) {
    logger.error('FCM push notification failed', err);
    throw err;
  }
};

module.exports = { sendPush };
