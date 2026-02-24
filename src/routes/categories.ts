import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { StorageService } from '../services/storage';
import type { Env, Variables } from '../lib/types';

const categories = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /api/categories - List all categories
categories.get('/', async (c) => {
  try {
    const result = await c.env.DB.prepare(
      'SELECT c.id, c.name, c.parent_id, c.image_url, p.name as parent_name FROM categories c LEFT JOIN categories p ON c.parent_id = p.id ORDER BY p.name ASC, c.name ASC'
    ).all();
    return c.json(result.results || []);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return c.json([], 200); // Fail silently with empty array if table not exists yet
  }
});

// POST /api/categories - Create a category
categories.post('/', authMiddleware(), async (c) => {
  let name = '';
  let parent_id = null;
  let image_url = '';

  const isMultipart = c.req.header('content-type')?.includes('multipart/form-data');
  if (isMultipart) {
    const fd = await c.req.parseBody();
    name = (fd['name'] as string) || '';
    if (fd['parent_id']) parent_id = fd['parent_id'] as string;
    const file = fd['image'];
    if (file && typeof file !== 'string') {
       const f = file as File;
       const storage = new StorageService(c.env.BUCKET);
       const key = `categories/${crypto.randomUUID()}_${f.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
       await storage.upload(key, await f.arrayBuffer(), f.type);
       image_url = `${c.env.APP_URL}/read/file/${key}`;
    }
  } else {
    // legacy fallback
    const body = await c.req.json<{ name: string; parent_id?: string }>();
    name = body.name;
    parent_id = body.parent_id || null;
  }

  if (!name || name.trim() === '') {
    return c.json({ error: 'Category name is required' }, 400);
  }

  const categoryName = name.trim();
  const id = crypto.randomUUID();

  try {
    await c.env.DB.prepare(
      'INSERT INTO categories (id, name, parent_id, image_url) VALUES (?, ?, ?, ?)'
    ).bind(id, categoryName, parent_id, image_url).run();
    
    return c.json({ success: true, id, name: categoryName, parent_id, image_url });
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE')) {
      return c.json({ error: 'Category already exists' }, 400);
    }
    return c.json({ error: 'Failed to create category' }, 500);
  }
});

export default categories;
