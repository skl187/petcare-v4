// src/core/email/email.service.js
const nodemailer = require('nodemailer');
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, CLIENT_URL, NODE_ENV } = require('../../config/env');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    // In development without SMTP config, skip transporter
    if (NODE_ENV !== 'production' && !SMTP_HOST) {
      console.log('[email] No SMTP configured, emails will be logged to console');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
  }
  return transporter;
};

const sendEmail = async ({ to, subject, html, text }) => {
  const transport = getTransporter();

  if (!transport) {
    // Log email for development
    console.log('[email] Would send email:', { to, subject, text: text?.substring(0, 200) });
    return { messageId: 'dev-mode-' + Date.now() };
  }

  return transport.sendMail({
    from: SMTP_FROM,
    to,
    subject,
    html,
    text
  });
};

const sendVerificationEmail = async (email, token, firstName) => {
  const verifyUrl = `${CLIENT_URL}/verify-email?token=${token}`;

  const subject = 'Verify your email address - PetCare';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to PetCare!</h2>
      <p>Hi ${firstName || 'there'},</p>
      <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="${verifyUrl}"
           style="background-color: #6366f1; color: white; padding: 12px 24px;
                  text-decoration: none; border-radius: 6px; display: inline-block;">
          Verify Email Address
        </a>
      </p>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #6366f1;">${verifyUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not create an account, please ignore this email.</p>
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
      <p style="color: #666; font-size: 12px;">PetCare Team</p>
    </div>
  `;
  const text = `Welcome to PetCare!\n\nHi ${firstName || 'there'},\n\nPlease verify your email by visiting: ${verifyUrl}\n\nThis link expires in 24 hours.\n\nPetCare Team`;

  return sendEmail({ to: email, subject, html, text });
};

module.exports = {
  sendEmail,
  sendVerificationEmail
};
