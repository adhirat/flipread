// Auth middleware — JWT-based session validation

import { Context, Next } from 'hono';
import type { Env, User } from '../lib/types';

type Variables = {
  user: User;
};

// ---------------------------------------------------------------------------
// Base64url helpers (RFC 4648 §5 — required by JWT spec)
// Standard btoa/atob uses base64 which includes +, /, = characters that are
// not safe in URL contexts and can silently break cookie / header parsing.
// ---------------------------------------------------------------------------

function base64urlEncode(data: Uint8Array | ArrayBuffer): string {
  const bytes = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlDecode(str: string): Uint8Array {
  // Re-add standard base64 padding and swap url-safe chars back
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  return Uint8Array.from(atob(padded), (ch) => ch.charCodeAt(0));
}

/**
 * Create and sign a JWT token for a user session.
 * Uses base64url encoding (RFC 4648 §5) so the token is safe in cookies and
 * Authorization headers without further encoding.
 */
export async function createToken(userId: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();

  const header  = base64urlEncode(encoder.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const payload = base64urlEncode(encoder.encode(JSON.stringify({
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // 7 days
  })));

  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );

  const sig = base64urlEncode(
    await crypto.subtle.sign('HMAC', key, encoder.encode(`${header}.${payload}`))
  );

  return `${header}.${payload}.${sig}`;
}

/**
 * Verify and decode a JWT token.
 * Accepts tokens encoded with base64url (new) or legacy base64 (old btoa).
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
      ['verify'],
    );

    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlDecode(sig),
      encoder.encode(`${header}.${payload}`),
    );

    if (!valid) return null;

    const decoded = JSON.parse(new TextDecoder().decode(base64urlDecode(payload)));
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

/**
 * Extract a bearer token from the request.
 * Checks HttpOnly cookie first, then the Authorization header.
 * Exported so routes that need token inspection without full middleware can reuse this.
 */
export function extractToken(c: Context): string | null {
  return getCookie(c, 'token') ?? (
    c.req.header('Authorization')?.startsWith('Bearer ')
      ? c.req.header('Authorization')!.slice(7)
      : null
  );
}
