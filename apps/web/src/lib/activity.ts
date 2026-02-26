import type { Env } from '../lib/types';
import { generateId } from '../lib/utils';
import { Context } from 'hono';

/**
 * Activity Log Interface
 */
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/**
 * Log a user activity to the database.
 * 
 * @param c - Hono Context
 * @param userId - The ID of the user performing the action
 * @param action - The action performed (e.g., 'login', 'create_book')
 * @param entityType - The type of entity affected (optional)
 * @param entityId - The ID of the entity affected (optional)
 * @param details - Additional details as a JSON object (optional)
 */
export async function logActivity(
  c: Context<any>,
  userId: string,
  action: string,
  entityType?: string,
  entityId?: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    const id = generateId();
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const ua = c.req.header('User-Agent') || 'unknown';
    const detailsJson = details ? JSON.stringify(details) : null;

    // Fire and forget - don't await if you don't want to block the response
    // But for crucial logs we might want to await. 
    // Given Cloudflare Workers execution model, we MUST await or use ctx.executionCtx.waitUntil
    
    const query = c.env.DB.prepare(
      `INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(id, userId, action, entityType || null, entityId || null, detailsJson, ip, ua);

    if (c.executionCtx) {
      c.executionCtx.waitUntil(query.run());
    } else {
      await query.run();
    }
  } catch (err) {
    console.error('Failed to log activity:', err);
    // Don't throw, failing to log shouldn't break the app flow usually
  }
}

/**
 * Retrieve activity logs for a user.
 * 
 * @param db - D1 Database instance
 * @param userId - The user ID
 * @param limit - Number of logs to retrieve (default 50)
 * @returns Array of ActivityLog objects
 */
export async function getActivityLogs(
  db: D1Database,
  userId: string,
  limit: number = 50
): Promise<ActivityLog[]> {
  const result = await db.prepare(
    `SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`
  ).bind(userId, limit).all<ActivityLog>();
  
  return result.results || [];
}
