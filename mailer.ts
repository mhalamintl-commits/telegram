import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { loadDb } from './server-db';
dotenv.config();

export const sendMail = async (to: string, subject: string, html: string) => {
  const db = loadDb();
  let smtpHost = db.settings?.smtpHost;
  let smtpPort = db.settings?.smtpPort;
  let smtpSecure = db.settings?.smtpSecure;
  let smtpUser = db.settings?.smtpUser;
  let smtpPass = db.settings?.smtpPass;
  let smtpFrom = db.settings?.smtpFrom;

  if (!smtpHost) {
    smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    smtpPort = Number(process.env.SMTP_PORT) || 587;
    smtpSecure = process.env.SMTP_SECURE === 'true' || false;
    smtpUser = process.env.SMTP_USER || '';
    smtpPass = process.env.SMTP_PASS || '';
    smtpFrom = process.env.SMTP_FROM || 'support@dorjigroup.org';
  }

  if (!smtpUser || !smtpPass) {
    console.warn(`[Mailer] SMTP credentials not set in Admin Panel nor .env. Simulated email to ${to}: ${subject}`);
    return;
  }
  
  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: Number(smtpPort),
    secure: smtpSecure, // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: smtpFrom || 'support@dorjigroup.org',
      to,
      subject,
      html,
    });
    console.log(`[Mailer] Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[Mailer] Error sending email to ${to}:`, error);
  }
};

export const sendWelcomeEmail = async (to: string, activationLink?: string) => {
  const content = `
    <h2>Welcome to TeleFlow!</h2>
    <p>Your account has been created successfully.</p>
    ${activationLink ? `<p>Please click the link below to activate your account:</p><p><a href="${activationLink}">Activate Account</a></p>` : ''}
    <p>Thank you for choosing us.</p>
  `;
  return sendMail(to, 'Welcome to TeleFlow - Account Created', content);
};

export const sendResetPasswordEmail = async (to: string, tempPassword: string) => {
  const content = `
    <h2>Password Reset</h2>
    <p>We received a request to reset your password. We have generated a temporary password for you.</p>
    <p><strong>Temporary Password:</strong> <span style="font-family: monospace; background: #eee; padding: 2px 6px;">${tempPassword}</span></p>
    <p>Please log in using this temporary password.</p>
  `;
  return sendMail(to, 'Your Temporary Password', content);
};

export const sendInvoiceEmail = async (to: string, planName: string, amount: number, invoiceId: string) => {
  const content = `
    <h2>Invoice Paid Successfully</h2>
    <p>Thank you for your purchase.</p>
    <p><strong>Plan:</strong> ${planName}</p>
    <p><strong>Amount:</strong> $${amount}</p>
    <p><strong>Invoice ID:</strong> ${invoiceId}</p>
    <p>Your account has been upgraded.</p>
  `;
  return sendMail(to, `Invoice Paid - ${invoiceId}`, content);
};
