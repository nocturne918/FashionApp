import { Resend } from 'resend';
import { env } from '../env';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(to: string, code: string) {
  const subject = 'Your FashionApp Verification Code';
  const html = `<p>Your verification code is: <strong>${code}</strong></p>`;
  try {
    const result = await resend.emails.send({
      from: 'no-reply@notifications.fitted.com',
      to,
      subject,
      html,
    });
    console.log('Resend email result:', result);
    if (result.error) {
      console.error('Resend email error:', result.error);
      throw new Error('Failed to send verification email: ' + result.error.message);
    }
  } catch (err) {
    console.error('Error sending verification email:', err);
    throw err;
  }
}