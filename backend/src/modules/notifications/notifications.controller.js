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

const listTemplates = async (req, res) => {
  try {
    const { page = 1, limit = 100, locale = 'en' } = req.query;
    const offset = (page - 1) * limit;
    const result = await query(
      `SELECT t.id, t.template_key, t.name, t.channel, t.description, t.is_active, t.created_at, t.updated_at,
              COALESCE(tt.subject, t.default_subject) as subject,
              COALESCE(tt.body, t.default_body) as body,
              COALESCE(tt.body_html, t.default_body_html) as body_html
       FROM notification_templates t
       LEFT JOIN LATERAL (
         SELECT tr.subject, tr.body, tr.body_html
         FROM notification_template_translations tr
         WHERE tr.template_id = t.id
           AND tr.locale IN ($1, split_part($1, '-', 1))
         ORDER BY (tr.locale = $1) DESC, tr.is_default DESC
         LIMIT 1
       ) tt ON true
       ORDER BY t.created_at DESC LIMIT $2 OFFSET $3`,
      [locale, limit, offset]
    );

    res.json(successResponse({ data: result.rows, page: Number(page), limit: Number(limit) }));
  } catch (err) {
    console.error('listTemplates failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to list templates' });
  }
};

const getTemplateByKey = async (req, res) => {
  try {
    const key = req.params.key;
    const { locale = 'en' } = req.query;
    const result = await query(
      `SELECT * FROM get_notification_template($1, $2)`,
      [key, locale]
    );
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(result.rows[0]));
  } catch (err) {
    console.error('getTemplateByKey failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to fetch template' });
  }
};

const createTemplate = async (req, res) => {
  try {
    const { template_key, name, channel = 'email', description, default_subject, default_body, default_body_html, locale = 'en', is_active = true } = req.body;
    if (!template_key || !channel) return res.status(400).json({ status: 'error', message: 'template_key and channel are required' });

    const exists = await query(`SELECT id FROM notification_templates WHERE lower(template_key) = lower($1)`, [template_key]);
    if (exists.rows.length > 0) return res.status(409).json({ status: 'error', message: 'Template already exists' });

    const tplResult = await query(
      `INSERT INTO notification_templates (template_key, name, channel, description, default_subject, default_body, default_body_html, is_active, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, template_key, name, channel, description, is_active, created_at, updated_at`,
      [template_key, name || null, channel, description || null, default_subject || null, default_body || null, default_body_html || null, is_active, (req.user && req.user.id) || null]
    );

    const template = tplResult.rows[0];

    // Add translation for the given locale
    if (default_subject || default_body || default_body_html) {
      await query(
        `INSERT INTO notification_template_translations (template_id, locale, subject, body, body_html, is_default)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [template.id, locale, default_subject || null, default_body || null, default_body_html || null, locale === 'en']
      );
    }

    res.status(201).json(successResponse(template, 'Created', 201));
  } catch (err) {
    console.error('createTemplate failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to create template' });
  }
};

const updateTemplate = async (req, res) => {
  try {
    const key = req.params.key;
    const { name, description, default_subject, default_body, default_body_html, locale = 'en', is_active } = req.body;

    const result = await query(
      `SELECT id, template_key, name, channel, description, default_subject, default_body, default_body_html, is_active, created_at, updated_at FROM notification_templates WHERE lower(template_key) = lower($1)`,
      [key]
    );
    if (result.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });

    const template = result.rows[0];
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name); }
    if (description !== undefined) { updates.push(`description = $${paramCount++}`); values.push(description); }
    if (default_subject !== undefined) { updates.push(`default_subject = $${paramCount++}`); values.push(default_subject); }
    if (default_body !== undefined) { updates.push(`default_body = $${paramCount++}`); values.push(default_body); }
    if (default_body_html !== undefined) { updates.push(`default_body_html = $${paramCount++}`); values.push(default_body_html); }
    if (is_active !== undefined) { updates.push(`is_active = $${paramCount++}`); values.push(is_active); }

    if (updates.length > 0) {
      updates.push(`updated_at = now()`);
      values.push(template.id);
      await query(
        `UPDATE notification_templates SET ${updates.join(', ')} WHERE id = $${paramCount}`,
        values
      );
    }

    // Update or create translation
    if (default_subject !== undefined || default_body !== undefined || default_body_html !== undefined) {
      const transResult = await query(
        `SELECT id FROM notification_template_translations WHERE template_id = $1 AND locale = $2`,
        [template.id, locale]
      );

      if (transResult.rows.length > 0) {
        await query(
          `UPDATE notification_template_translations SET subject = COALESCE($1, subject), body = COALESCE($2, body), body_html = COALESCE($3, body_html), updated_at = now() WHERE template_id = $4 AND locale = $5`,
          [default_subject, default_body, default_body_html, template.id, locale]
        );
      } else {
        await query(
          `INSERT INTO notification_template_translations (template_id, locale, subject, body, body_html, is_default) VALUES ($1,$2,$3,$4,$5,$6)`,
          [template.id, locale, default_subject, default_body, default_body_html, locale === 'en']
        );
      }
    }

    const updated = await query(`SELECT * FROM get_notification_template($1, $2)`, [key, locale]);
    res.json(successResponse(updated.rows[0], 'Updated'));
  } catch (err) {
    console.error('updateTemplate failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to update template' });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    const key = req.params.key;
    const del = await query(`DELETE FROM notification_templates WHERE lower(template_key) = lower($1) RETURNING id`, [key]);
    if (del.rows.length === 0) return res.status(404).json({ status: 'error', message: 'Not found' });
    res.json(successResponse(null, 'Deleted'));
  } catch (err) {
    console.error('deleteTemplate failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Failed to delete template' });
  }
};

module.exports = { listPending, getById, resend, create, preview, listTemplates, getTemplateByKey, createTemplate, updateTemplate, deleteTemplate };
