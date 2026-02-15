const { query } = require('../../core/db/pool');
const { successResponse } = require('../../core/utils/response');
const notificationService = require('../../core/notifications/notification.service');

const listPending = async (req, res) => {
  try {
    const result = await query(
      `SELECT n.*, u.email, u.phone FROM notifications n LEFT JOIN users u ON n.user_id = u.id WHERE n.status = 'pending' ORDER BY scheduled_at ASC LIMIT 200`
    );
    res.json(successResponse(result.rows));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const getById = async (req, res) => {
  try {
    const result = await query(`SELECT * FROM notifications WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(result.rows[0]));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch' });
  }
};

const resend = async (req, res) => {
  try {
    // Mark notification as pending again and reset error/retry
    const result = await query(
      `UPDATE notifications SET status = 'pending', error = NULL, retry_count = 0 WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(null, 'Scheduled for resend'));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to resend' });
  }
};

// Create + optionally send immediately using a template
const create = async (req, res) => {
  try {
    const {
      template_key,
      channel,
      user_id,
      notification_key,
      target,
      payload = {},
      scheduled_at,
      locale
    } = req.body;

    if (!template_key || !channel) {
      return res.status(400).json({ status: 'error', message: 'template_key and channel are required' });
    }

    // fetch template (uses DB fn get_notification_template)
    const tplRes = await query(`SELECT * FROM get_notification_template($1, $2)`, [template_key, locale || 'en']);
    const tpl = tplRes.rows[0];
    if (!tpl) return res.status(400).json({ status: 'error', message: 'Template not found' });

    // If user_id provided and no explicit target, resolve contact info
    let resolvedTarget = target || {};
    if (user_id && (!resolvedTarget.email && !resolvedTarget.phone && !resolvedTarget.push_token)) {
      const u = await query('SELECT email, phone FROM users WHERE id = $1', [user_id]);
      if (u.rows.length > 0) {
        const uu = u.rows[0];
        if (uu.email) resolvedTarget.email = uu.email;
        if (uu.phone) resolvedTarget.phone = uu.phone;
      }
    }

    const scheduledAt = scheduled_at ? new Date(scheduled_at) : new Date();

    // Insert notification record (scheduled_at is NOT NULL in schema)
    const insertRes = await query(
      `INSERT INTO notifications (user_id, notification_key, channel, target, template_key, locale, payload, scheduled_at, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        user_id || null,
        notification_key || template_key,
        channel,
        resolvedTarget && Object.keys(resolvedTarget).length > 0 ? JSON.stringify(resolvedTarget) : null,
        template_key,
        locale || 'en',
        JSON.stringify(payload || {}),
        scheduledAt,
        'pending'
      ]
    );

    const notification = insertRes.rows[0];

    // If scheduled for now (or past), attempt immediate send
    if (scheduledAt <= new Date()) {
      try {
        const sendResult = await notificationService.sendNotification({
          template_key: template_key,
          locale: locale || 'en',
          channel,
          target: resolvedTarget,
          payload
        });

        // mark as sent and insert log
        await query(`UPDATE notifications SET status = 'sent', sent_at = now(), updated_at = now() WHERE id = $1`, [notification.id]);
        await query(
          `INSERT INTO notification_logs (notification_id, channel, provider, provider_message_id, status, response)
           VALUES ($1,$2,$3,$4,$5,$6)`,
          [notification.id, channel, sendResult.provider || null, sendResult.provider_message_id || null, 'sent', JSON.stringify(sendResult || {})]
        );

        const updated = await query('SELECT * FROM notifications WHERE id = $1', [notification.id]);
        return res.status(201).json(successResponse(updated.rows[0], 'Notification sent'));
      } catch (err) {
        // mark as failed and log error
        await query(`UPDATE notifications SET status = 'failed', error = $2, retry_count = retry_count + 1, updated_at = now() WHERE id = $1`, [notification.id, err.message]);
        await query(
          `INSERT INTO notification_logs (notification_id, channel, status, response)
           VALUES ($1,$2,$3,$4)`,
          [notification.id, channel, 'failed', JSON.stringify({ error: err.message })]
        );

        const updated = await query('SELECT * FROM notifications WHERE id = $1', [notification.id]);
        return res.status(201).json(successResponse(updated.rows[0], `Scheduled but send failed: ${err.message}`));
      }
    }

    // Scheduled for future — return created
    res.status(201).json(successResponse(notification, 'Notification scheduled', 201));
  } catch (err) {
    console.error('Create notification failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to create notification' });
  }
};

// Preview a template rendered with payload
const preview = async (req, res) => {
  try {
    const { template_key, locale, payload = {} } = req.body;
    if (!template_key) return res.status(400).json({ status: 'error', message: 'template_key is required' });

    const tplRes = await query(`SELECT * FROM get_notification_template($1, $2)`, [template_key, locale || 'en']);
    const tpl = tplRes.rows[0];
    if (!tpl) return res.status(404).json({ status: 'error', message: 'Template not found' });

    const rendered = {
      subject: notificationService.renderTemplate(tpl.subject, payload || {}),
      body: notificationService.renderTemplate(tpl.body, payload || {}),
      body_html: notificationService.renderTemplate(tpl.body_html, payload || {})
    };

    res.json(successResponse({ template: tpl, rendered }));
  } catch (err) {
    res.status(500).json({ status: 'error', message: 'Failed to preview template' });
  }
};

module.exports = { listPending, getById, resend, create, preview };
