// View counter middleware — tracks views and enforces limits

import { Context, Next } from 'hono';
import type { Env, Book } from '../lib/types';
import { generateId, hashIp } from '../lib/utils';

/**
 * Increment view count for a book and check limits.
 * Returns true if the view is allowed, false if limit reached.
 */
export async function trackView(
  db: D1Database,
  kv: KVNamespace,
  book: Book,
  request: Request
): Promise<{ allowed: boolean; currentViews: number }> {
  const kvKey = `views:${book.id}:${getMonthKey()}`;

  // Get current monthly view count from KV (fast)
  const cached = await kv.get(kvKey);
  let currentViews = cached ? parseInt(cached, 10) : book.view_count;

  // Check limit
  if (book.max_views > 0 && currentViews >= book.max_views) {
    return { allowed: false, currentViews };
  }

  // Deduplicate by IP hash (prevent refresh spam)
  const ip = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';
  const ipHash = hashIp(ip);
  const dedupeKey = `viewip:${book.id}:${ipHash}`;
  const recentView = await kv.get(dedupeKey);

  if (!recentView) {
    // New unique view — count it
    currentViews++;

    // Update KV counter (fast, edge-cached)
    await kv.put(kvKey, currentViews.toString(), {
      expirationTtl: 60 * 60 * 24 * 32, // expire after ~1 month
    });

    // Set dedupe key (1 hour cooldown per IP)
    await kv.put(dedupeKey, '1', { expirationTtl: 3600 });

    // Persist to D1 asynchronously (view log + update count)
    const country = request.headers.get('CF-IPCountry') || '';
    const userAgent = request.headers.get('User-Agent') || '';

    await db.batch([
      db.prepare('UPDATE books SET view_count = view_count + 1 WHERE id = ?').bind(book.id),
      db.prepare(
        'INSERT INTO view_logs (id, book_id, viewer_ip_hash, user_agent, country) VALUES (?, ?, ?, ?, ?)'
      ).bind(generateId(), book.id, ipHash, userAgent.substring(0, 200), country),
    ]);
  }

  return { allowed: true, currentViews };
}

function getMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
