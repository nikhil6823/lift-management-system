import nodemailer from 'nodemailer';

const hasSmtp = Boolean(
  process.env.SMTP_HOST &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASSWORD
);

const transporter = hasSmtp
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),

      // Port 587 uses STARTTLS
      secure: false,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },

      // Force IPv4 instead of IPv6
      family: 4,

      connectionTimeout: 20000,
      greetingTimeout: 20000,
      socketTimeout: 30000,
    })
  : null;

export async function sendSecurityCode({ email, name, purpose, code }) {
  const subject =
    purpose === 'email-verification'
      ? 'Verify your PV Tech Elevators account'
      : 'Your PV Tech Elevators sign-in code';

  const message =
    purpose === 'email-verification'
      ? `Hello ${name},

Your account verification code is ${code}. It expires in 10 minutes.

If you did not create this account, you can ignore this email.`
      : `Hello ${name},

Your sign-in verification code is ${code}. It expires in 10 minutes.

If you did not try to sign in, change your password and contact an administrator.`;

  if (!transporter) {
    console.warn(
      '[security] SMTP is not configured; security email was not sent.'
    );
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject,
      text: message,
    });

    console.log(`[security] Email successfully sent to ${email}`);

    return true;
  } catch (error) {
    console.error('[security] Failed to send email:', error);
    throw error;
  }
}

export function isEmailDeliveryConfigured() {
  return Boolean(transporter);
}
