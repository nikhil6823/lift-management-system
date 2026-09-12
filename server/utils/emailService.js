import { Resend } from 'resend';

const hasResend = Boolean(process.env.RESEND_API_KEY);

const resend = hasResend
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendSecurityCode({ email, name, purpose, code }) {
  const subject =
    purpose === 'email-verification'
      ? 'Verify your PV Tech Elevators account'
      : 'Your PV Tech Elevators sign-in code';

  const message =
    purpose === 'email-verification'
      ? `
        <h2>Verify your PV Tech Elevators account</h2>
        <p>Hello ${name},</p>
        <p>Your account verification code is:</p>
        <h1>${code}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not create this account, you can ignore this email.</p>
      `
      : `
        <h2>PV Tech Elevators Sign-in Verification</h2>
        <p>Hello ${name},</p>
        <p>Your sign-in verification code is:</p>
        <h1>${code}</h1>
        <p>This code expires in 10 minutes.</p>
        <p>If you did not try to sign in, change your password and contact an administrator.</p>
      `;

  if (!resend) {
    console.warn(
      '[security] RESEND_API_KEY is not configured; security email was not sent.'
    );

    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PV Tech Elevators <onboarding@resend.dev>',
      to: [email],
      subject,
      html: message,
    });

    if (error) {
      console.error('[security] Resend error:', error);
      throw new Error(error.message);
    }

    console.log(
      `[security] Email successfully sent to ${email}. ID: ${data?.id}`
    );

    return true;
  } catch (error) {
    console.error('[security] Failed to send email:', error);
    throw error;
  }
}

export function isEmailDeliveryConfigured() {
  return Boolean(resend);
}