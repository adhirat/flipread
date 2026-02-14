// Billing routes — Stripe checkout, webhooks, and portal

import { Hono } from 'hono';
import type { Env, User } from '../lib/types';
import { authMiddleware } from '../middleware/auth';
import { generateId } from '../lib/utils';

// Stripe webhook signature verification using Web Crypto API
async function verifyStripeSignature(payload: string, header: string, secret: string): Promise<boolean> {
  try {
    const pairs = header.split(',').reduce((acc: Record<string, string>, pair: string) => {
      const [key, value] = pair.split('=');
      acc[key.trim()] = value;
      return acc;
    }, {});

    const timestamp = pairs['t'];
    const signature = pairs['v1'];
    if (!timestamp || !signature) return false;

    // Reject if timestamp is older than 5 minutes
    const age = Math.floor(Date.now() / 1000) - parseInt(timestamp);
    if (age > 300) return false;

    const signedPayload = `${timestamp}.${payload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload));
    const computed = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
    return computed === signature;
  } catch {
    return false;
  }
}

// Price lookup: plan + interval → Stripe price ID (configured via env vars)
function getPriceId(env: any, plan: string, interval: string): string | null {
  const map: Record<string, string> = {
    'basic_monthly':     env.STRIPE_PRICE_BASIC_MONTHLY      || '',
    'basic_yearly':      env.STRIPE_PRICE_BASIC_YEARLY       || '',
    'pro_monthly':       env.STRIPE_PRICE_PRO_MONTHLY        || '',
    'pro_yearly':        env.STRIPE_PRICE_PRO_YEARLY         || '',
    'business_monthly':  env.STRIPE_PRICE_BUSINESS_MONTHLY   || '',
    'business_yearly':   env.STRIPE_PRICE_BUSINESS_YEARLY    || '',
  };
  return map[`${plan}_${interval}`] || null;
}

type Variables = { user: User };

const billing = new Hono<{ Bindings: Env; Variables: Variables }>();

// Create Stripe checkout session — requires auth
billing.post('/checkout', authMiddleware(), async (c) => {
  const user = c.get('user');
  const { plan, interval } = await c.req.json<{
    plan: 'basic' | 'pro' | 'business';
    interval?: 'monthly' | 'yearly';
  }>();

  if (!plan || !['basic', 'pro', 'business'].includes(plan)) {
    return c.json({ error: 'Invalid plan' }, 400);
  }

  const billingInterval = interval || 'monthly';
  if (!['monthly', 'yearly'].includes(billingInterval)) {
    return c.json({ error: 'Invalid billing interval' }, 400);
  }

  const priceId = getPriceId(c.env, plan, billingInterval);
  if (!priceId) {
    return c.json({ error: 'Price not configured for this plan/interval' }, 400);
  }

  // Get existing subscription if any
  let sub = await c.env.DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ?'
  ).bind(user.id).first<{ stripe_customer_id: string }>();

  // Build checkout params
  const params: Record<string, string> = {
    'mode': 'subscription',
    'success_url': `${c.env.APP_URL}/dashboard?upgraded=true`,
    'cancel_url': `${c.env.APP_URL}/dashboard?cancelled=true`,
    'line_items[0][price]': priceId,
    'line_items[0][quantity]': '1',
    'customer_email': user.email,
    'client_reference_id': user.id,
    'metadata[user_id]': user.id,
    'metadata[plan]': plan,
    'metadata[interval]': billingInterval,
    // Enable automatic tax (GST) — requires Stripe Tax to be enabled in dashboard
    'automatic_tax[enabled]': 'true',
    'tax_id_collection[enabled]': 'true',
  };

  // Use existing Stripe customer if available
  if (sub?.stripe_customer_id) {
    params['customer'] = sub.stripe_customer_id;
    delete params['customer_email'];
  }

  // Allow promotion codes
  params['allow_promotion_codes'] = 'true';

  const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  });

  const session = await stripeRes.json() as { url: string; id: string; error?: any };
  if (session.error) {
    return c.json({ error: session.error.message || 'Stripe error' }, 500);
  }
  return c.json({ url: session.url, sessionId: session.id });
});

// Stripe webhook handler — verifies signature in production
billing.post('/webhook', async (c) => {
  const body = await c.req.text();
  const sig = c.req.header('stripe-signature');

  // Verify webhook signature if secret is configured
  if (c.env.STRIPE_WEBHOOK_SECRET) {
    if (!sig) return c.json({ error: 'Missing signature' }, 400);

    const verified = await verifyStripeSignature(body, sig, c.env.STRIPE_WEBHOOK_SECRET);
    if (!verified) return c.json({ error: 'Invalid signature' }, 400);
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return c.json({ error: 'Invalid payload' }, 400);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata?.user_id || session.client_reference_id;
      const plan = session.metadata?.plan || 'pro';
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      if (userId) {
        // Update user plan
        await c.env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?')
          .bind(plan, userId).run();

        // Upsert subscription record
        const existing = await c.env.DB.prepare(
          'SELECT id FROM subscriptions WHERE user_id = ?'
        ).bind(userId).first();

        if (existing) {
          await c.env.DB.prepare(
            `UPDATE subscriptions SET stripe_customer_id = ?, stripe_subscription_id = ?,
             plan = ?, status = 'active' WHERE user_id = ?`
          ).bind(customerId, subscriptionId, plan, userId).run();
        } else {
          await c.env.DB.prepare(
            `INSERT INTO subscriptions (id, user_id, stripe_customer_id, stripe_subscription_id, plan, status)
             VALUES (?, ?, ?, ?, ?, 'active')`
          ).bind(generateId(), userId, customerId, subscriptionId, plan).run();
        }

        // Update max_views for existing books based on new plan
        const maxViews = plan === 'business' ? -1 : (plan === 'pro' ? 50000 : (plan === 'basic' ? 2000 : 500));
        await c.env.DB.prepare(
          'UPDATE books SET max_views = ? WHERE user_id = ?'
        ).bind(maxViews, userId).run();
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const customerId = sub.customer;

      // Downgrade to free
      const subscription = await c.env.DB.prepare(
        'SELECT user_id FROM subscriptions WHERE stripe_customer_id = ?'
      ).bind(customerId).first<{ user_id: string }>();

      if (subscription) {
        await c.env.DB.batch([
          c.env.DB.prepare('UPDATE users SET plan = ? WHERE id = ?')
            .bind('free', subscription.user_id),
          c.env.DB.prepare(
            `UPDATE subscriptions SET status = 'cancelled', plan = 'free' WHERE stripe_customer_id = ?`
          ).bind(customerId),
          c.env.DB.prepare('UPDATE books SET max_views = 500 WHERE user_id = ?')
            .bind(subscription.user_id),
        ]);
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;
      await c.env.DB.prepare(
        `UPDATE subscriptions SET status = 'past_due' WHERE stripe_customer_id = ?`
      ).bind(customerId).run();
      break;
    }
  }

  return c.json({ received: true });
});

// Get available plans and pricing
billing.get('/plans', async (c) => {
  return c.json({
    plans: [
      {
        id: 'basic',
        name: 'Basic',
        description: 'For getting started',
        features: ['2 flipbooks', '2,000 views/book', '10MB uploads', 'Bookstore page', 'Basic analytics'],
        pricing: {
          monthly: { amount: 200,  display: '$2',   interval: 'month', note: '+ GST where applicable' },
          yearly:  { amount: 2000, display: '$20',  interval: 'year',  note: '+ GST · Save $4/yr' },
        },
      },
      {
        id: 'pro',
        name: 'Pro',
        description: 'For creators & educators',
        features: ['50 flipbooks', '50,000 views/book', '50MB uploads', 'Custom branding', 'Analytics'],
        pricing: {
          monthly: { amount: 900,  display: '$9',   interval: 'month', note: '+ GST where applicable' },
          yearly:  { amount: 9000, display: '$90',  interval: 'year',  note: '+ GST · Save $18/yr' },
        },
      },
      {
        id: 'business',
        name: 'Business',
        description: 'For teams & publishers',
        features: ['Unlimited flipbooks', 'Unlimited views', '200MB uploads', 'Custom domain', 'API access', 'Priority support'],
        pricing: {
          monthly: { amount: 2900,  display: '$29',  interval: 'month', note: '+ GST where applicable' },
          yearly:  { amount: 29000, display: '$290', interval: 'year',  note: '+ GST · Save $58/yr' },
        },
      },
    ],
  });
});

// Customer portal redirect
billing.get('/portal', authMiddleware(), async (c) => {
  const user = c.get('user');

  const sub = await c.env.DB.prepare(
    'SELECT stripe_customer_id FROM subscriptions WHERE user_id = ?'
  ).bind(user.id).first<{ stripe_customer_id: string }>();

  if (!sub?.stripe_customer_id) {
    return c.json({ error: 'No active subscription' }, 404);
  }

  const portalRes = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      customer: sub.stripe_customer_id,
      return_url: `${c.env.APP_URL}/dashboard`,
    }),
  });

  const portal = await portalRes.json() as { url: string };
  return c.json({ url: portal.url });
});

export default billing;
