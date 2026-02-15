const { query } = require('../db/pool');
const emailService = require('../email/email.service');
const twilioService = require('./twilio.service');
const fcmService = require('./fcm.service');

const renderTemplate = (template, payload) => {
  // Very simple mustache-like replacement: {{key}}
  if (!template || !payload) return template;
  return String(template).replace(/{{\s*([^}\s]+)\s*}}/g, (m, key) => (payload[key] !== undefined ? payload[key] : m));
};

const sendEmailNotification = async (notification, template) => {
  const subject = renderTemplate(template.subject, notification.payload || {});
  const body = renderTemplate(template.body, notification.payload || {});
  const body_html = renderTemplate(template.body_html, notification.payload || {});

  const to = notification.target && notification.target.email ? notification.target.email : null;

  if (!to) throw new Error('No email target');

  const result = await emailService.sendEmail({ to, subject, html: body_html, text: body });
  return { provider: 'sendgrid/smtp', provider_message_id: result && result.messageId ? result.messageId : null };
};

const sendSmsNotification = async (notification, template) => {
  const body = renderTemplate(template.body, notification.payload || {});
  const to = notification.target && notification.target.phone ? notification.target.phone : null;
  if (!to) throw new Error('No phone target');
  const result = await twilioService.sendSms({ to, body });
  return { provider: 'twilio', provider_message_id: result && result.sid ? result.sid : null };
};

const sendPushNotification = async (notification, template) => {
  const body = renderTemplate(template.body, notification.payload || {});
  const token = notification.target && notification.target.push_token ? notification.target.push_token : null;
  if (!token) throw new Error('No push token');
  const result = await fcmService.sendPush({ token, body, title: template.subject || '' });
  return { provider: 'fcm', provider_message_id: result && result.name ? result.name : null };
};

const getTemplate = async (template_key, locale) => {
  if (!template_key) return null;
  const r = await query(`SELECT * FROM get_notification_template($1, $2)`, [template_key, locale || 'en']);
  return r.rows[0];
};

const sendNotification = async (notification) => {
  const template = await getTemplate(notification.template_key, notification.locale || 'en');
  if (!template) throw new Error('Template not found');

  if (notification.channel === 'email') return sendEmailNotification(notification, template);
  if (notification.channel === 'sms') return sendSmsNotification(notification, template);
  if (notification.channel === 'push') return sendPushNotification(notification, template);

  throw new Error(`Unsupported channel: ${notification.channel}`);
};

module.exports = { sendNotification, renderTemplate };
