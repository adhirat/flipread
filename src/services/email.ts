
import { Env } from '../lib/types';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

export async function sendEmail(env: Env, options: EmailOptions): Promise<boolean> {
  const { to, subject, html, from = 'FlipRead <noreply@adhirat.com>', text } = options;

  // 1. Try Cloudflare Email Routing (send_email binding) if available
  // Note: This requires the binding to be set in wrangler.toml and the domain verified
  // @ts-ignore - The binding might not be typed in Env yet
  if (env.EMAIL && typeof env.EMAIL.send === 'function') {
    try {
      // @ts-ignore
      await env.EMAIL.send({
        to,
        from,
        subject,
        content: [
          { type: 'text/plain', value: text || html.replace(/<[^>]*>/g, '') },
          { type: 'text/html', value: html }
        ]
      });
      return true;
    } catch (e) {
      console.error('Cloudflare Email Routing failed:', e);
      // Fallthrough to other methods
    }
  }

  // 2. Try MailChannels (Cloudflare Native Integration)
  // This works without an API key for domains on Cloudflare with correct SPF
  try {
    const mcRes = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to, name: to }] }],
        from: { email: from.match(/<(.+)>/)?.[1] || from, name: from.match(/(.*)</)?.[1]?.trim() || 'FlipRead' },
        subject,
        content: [
          { type: 'text/plain', value: text || html.replace(/<[^>]*>/g, '') },
          { type: 'text/html', value: html }
        ]
      })
    });

    if (mcRes.ok) return true;
    const errorText = await mcRes.text();
    // MailChannels might fail if SPF is not set up perfectly or for unverified domains
    console.warn('MailChannels failed:', errorText);
  } catch (e) {
    console.warn('MailChannels error:', e);
  }

  // 3. Fallback to Resend if API Key is present
  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          text
        })
      });
      return res.ok;
    } catch (e) {
      console.error('Resend error:', e);
    }
  }

  return false;
}
