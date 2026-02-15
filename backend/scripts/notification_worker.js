/* Simple notification worker
   Usage: NODE_ENV=production node scripts/notification_worker.js
   This polls the notifications table and sends pending items.
*/

const { query } = require('../src/core/db/pool');
const notificationService = require('../backend/src/core/notifications/notification.service');

const POLL_LIMIT = 50;
const POLL_INTERVAL = process.env.NOTIFICATION_POLL_INTERVAL_MS ? Number(process.env.NOTIFICATION_POLL_INTERVAL_MS) : 30 * 1000;

const runBatch = async () => {
  try {
    const pending = await query(`SELECT * FROM notifications WHERE scheduled_at <= now() AND status = 'pending' ORDER BY scheduled_at ASC LIMIT $1`, [POLL_LIMIT]);
    for (const n of pending.rows) {
      try {
        const result = await notificationService.sendNotification(n);

        // Update notification as sent
        await query(`UPDATE notifications SET status = 'sent', sent_at = now(), updated_at = now() WHERE id = $1`, [n.id]);
        await query(
          `INSERT INTO notification_logs (notification_id, channel, provider, provider_message_id, status, response, created_at)
           VALUES ($1,$2,$3,$4,$5,$6,now())`,
          [n.id, n.channel, result.provider || null, result.provider_message_id || null, 'sent', JSON.stringify(result || {})]
        );
      } catch (err) {
        console.error('[worker] send failed', err.message || err);
        await query(
          `UPDATE notifications SET status = 'failed', error = $2, retry_count = retry_count + 1, updated_at = now() WHERE id = $1`,
          [n.id, err.message]
        );
        await query(`INSERT INTO notification_logs (notification_id, channel, provider, status, response, created_at) VALUES ($1,$2,$3,$4,$5,now())`, [n.id, n.channel, null, 'failed', JSON.stringify({ error: err.message })]);
      }
    }
  } catch (err) {
    console.error('[worker] batch failed', err.message || err);
  }
};

const tick = async () => {
  await runBatch();
  setTimeout(tick, POLL_INTERVAL);
};

if (require.main === module) {
  console.log('[worker] starting notification worker');
  tick();
}

module.exports = { runBatch };
