import { Resend } from 'resend';
import { env } from './env';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendVerificationEmail(to: string, code: string) {
  if (!resend) {
    console.warn('⚠️ RESEND_API_KEY is missing. Verification email was NOT sent.');
    console.log(`To: ${to}, Code: ${code}`);
    return;
  }

  const subject = `${code} is your verification code`;
  const html = `<p>Your verification code is: <strong>${code}</strong></p>`;
  try {
    const result = await resend.emails.send({
      from: 'no-reply@updates.andrewchuang.com',
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

/**
 * Helper to get the best available image URL for a StockX product.
 * StockX images are typically hosted on images.stockx.com.
 * We can try to use the 360 view images if available, or the standard media URL.
 */
export function getStockXImage(url: string | null, width: number = 800): string | null {
  if (!url) return null;

  if (url.includes('/360/')) {
    return url;
  }

  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'images.stockx.com') {
      urlObj.searchParams.set('fit', 'clip');
      urlObj.searchParams.set('w', width.toString());
      urlObj.searchParams.set('auto', 'compress');
      urlObj.searchParams.set('q', '90');
      return urlObj.toString();
    }
  } catch (e) {
    // Invalid URL, return original
  }

  return url;
}
