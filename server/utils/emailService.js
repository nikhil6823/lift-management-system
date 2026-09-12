import nodemailer from 'nodemailer';

const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
const transporter = hasSmtp ? nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
}) : null;

export async function sendSecurityCode({ email, name, purpose, code }) {
  const subject = purpose === 'email-verification' ? 'Verify your PV Tech Elevators account' : 'Your PV Tech Elevators sign-in code';
  const message = purpose === 'email-verification'
    ? `Hello ${name},\n\nYour account verification code is ${code}. It expires in 10 minutes.\n\nIf you did not create this account, you can ignore this email.`
    : `Hello ${name},\n\nYour sign-in verification code is ${code}. It expires in 10 minutes.\n\nIf you did not try to sign in, change your password and contact an administrator.`;
  if (!transporter) {
    console.warn('[security] SMTP is not configured; security email was not sent.');
    return false;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: email,
    subject,
    text: message,
  });
  return true;
}

export function isEmailDeliveryConfigured() {
  return Boolean(transporter);
}
