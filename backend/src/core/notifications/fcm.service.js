const FCM_SERVER_KEY = process.env.FCM_SERVER_KEY;

const sendPush = async ({ token, title, body }) => {
  // Use node's global fetch (Node 18+) or fetch polyfill if available.
  if (!token) throw new Error('token required');

  if (!FCM_SERVER_KEY) {
    console.log('[push] dev send', { token, title, body });
    return { name: 'dev-' + Date.now() };
  }

  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      Authorization: `key=${FCM_SERVER_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ to: token, notification: { title, body } })
  });

  const json = await res.json();
  return json;
};

module.exports = { sendPush };
