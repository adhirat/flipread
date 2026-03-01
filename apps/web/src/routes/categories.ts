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

// PATCH /api/categories/:id - Update a category
categories.patch('/:id', authMiddleware(), async (c) => {
  const id = c.req.param('id');
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
    } else if (typeof file === 'string' && file.trim() !== '') {
       // if it's a string, it might be the existing URL being passed back unmodified
       image_url = file;
    }
  } else {
    // legacy fallback
    const body = await c.req.json<{ name: string; parent_id?: string; image_url?: string }>();
    name = body.name;
    parent_id = body.parent_id || null;
    image_url = body.image_url || '';
  }

  if (!name || name.trim() === '') {
    return c.json({ error: 'Category name is required' }, 400);
  }

  const categoryName = name.trim();

  try {
    if (image_url) {
      await c.env.DB.prepare(
        'UPDATE categories SET name = ?, parent_id = ?, image_url = ? WHERE id = ?'
      ).bind(categoryName, parent_id, image_url, id).run();
    } else {
      await c.env.DB.prepare(
        'UPDATE categories SET name = ?, parent_id = ? WHERE id = ?'
      ).bind(categoryName, parent_id, id).run();
    }
    
    return c.json({ success: true, id, name: categoryName, parent_id, image_url });
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE')) {
      return c.json({ error: 'Category already exists' }, 400);
    }
    return c.json({ error: 'Failed to update category' }, 500);
  }
});

// DELETE /api/categories/:id - Delete a category
categories.delete('/:id', authMiddleware(), async (c) => {
  const id = c.req.param('id');
  try {
    // Unlink children categories first or just delete them?
    // Let's just unlink parent_id for any children
    await c.env.DB.prepare('UPDATE categories SET parent_id = NULL WHERE parent_id = ?').bind(id).run();
    await c.env.DB.prepare('DELETE FROM categories WHERE id = ?').bind(id).run();
    return c.json({ success: true });
  } catch (error) {
    console.error('Failed to delete category:', error);
    return c.json({ error: 'Failed to delete category' }, 500);
  }
});

export default categories;
