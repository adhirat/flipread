// Auth middleware — JWT-based session validation

import { Context, Next } from 'hono';
import type { Env, User } from '../lib/types';

type Variables = {
  user: User;
};

/**
 * Create and sign a JWT token for a user session
 */
export async function createToken(userId: string, secret: string): Promise<string> {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  }));

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const data = encoder.encode(`${header}.${payload}`);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const sig = btoa(String.fromCharCode(...new Uint8Array(signature)));

  return `${header}.${payload}.${sig}`;
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string, secret: string): Promise<{ sub: string } | null> {
  try {
    const [header, payload, sig] = token.split('.');
    if (!header || !payload || !sig) return null;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${header}.${payload}`);
    const signature = Uint8Array.from(atob(sig), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, signature, data);

    if (!valid) return null;

    const decoded = JSON.parse(atob(payload));
    if (decoded.exp < Math.floor(Date.now() / 1000)) return null;

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Auth middleware — validates JWT from cookie or Authorization header
 */
export function authMiddleware() {
  return async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
    // Check cookie first, then Authorization header
    let token = getCookie(c, 'token');
    if (!token) {
      const authHeader = c.req.header('Authorization');
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
      }
    }

    if (!token) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const decoded = await verifyToken(token, c.env.JWT_SECRET);
    if (!decoded) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Look up user
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?')
      .bind(decoded.sub)
      .first<User>();

    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }

    c.set('user', user);
    await next();
  };
}

function getCookie(c: Context, name: string): string | null {
  const cookies = c.req.header('Cookie');
  if (!cookies) return null;
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
