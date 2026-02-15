// Book routes — CRUD + upload

import { Hono } from 'hono';
import type { Env, User, Book } from '../lib/types';
import { generateId, generateSlug, getFileType } from '../lib/utils';
import { getPlanLimits } from '../lib/plans';
import { StorageService } from '../services/storage';
import { authMiddleware } from '../middleware/auth';

type Variables = { user: User };

const books = new Hono<{ Bindings: Env; Variables: Variables }>();

// All routes require auth
books.use('/*', authMiddleware());

// GET /api/books — list user's books
books.get('/', async (c) => {
  const user = c.get('user');
  const results = await c.env.DB.prepare(
    'SELECT id, title, slug, type, file_size_bytes, view_count, max_views, is_public, password, custom_domain, cover_url, created_at, updated_at FROM books WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all<Book>();

  return c.json({ books: results.results || [] });
});

// POST /api/books/upload — upload a new book
books.post('/upload', async (c) => {
  const user = c.get('user');
  const plan = getPlanLimits(user.plan);

  // Check book count limit
  const countResult = await c.env.DB.prepare(
    'SELECT COUNT(*) as count FROM books WHERE user_id = ?'
  ).bind(user.id).first<{ count: number }>();

  const currentCount = countResult?.count || 0;
  if (currentCount >= plan.maxBooks) {
    return c.json({
      error: `Book limit reached. Your ${user.plan} plan allows ${plan.maxBooks} book(s). Upgrade for more.`,
    }, 403);
  }

  // Parse multipart form
  const formData = await c.req.formData();
  const file = formData.get('file') as File | null;
  const title = (formData.get('title') as string) || 'Untitled Book';
  const customSlug = formData.get('slug') as string | null;

  if (!file) {
    return c.json({ error: 'No file provided' }, 400);
  }

  // Validate file type
  const fileType = getFileType(file.name);
  if (!fileType) {
    return c.json({ error: 'Only PDF and EPUB files are supported' }, 400);
  }

  // Validate file size
  if (file.size > plan.maxFileSizeBytes) {
    const maxMB = Math.round(plan.maxFileSizeBytes / (1024 * 1024));
    return c.json({
      error: `File too large. Your ${user.plan} plan allows up to ${maxMB}MB. Upgrade for larger files.`,
    }, 413);
  }

  // Generate IDs
  const bookId = generateId();
  let slug = customSlug && plan.customSlug
    ? customSlug.toLowerCase().replace(/[^a-z0-9-]/g, '').substring(0, 50)
    : generateSlug(title);

  // Ensure slug uniqueness
  const slugExists = await c.env.DB.prepare('SELECT id FROM books WHERE slug = ?')
    .bind(slug).first();
  if (slugExists) {
    slug = generateSlug(title); // Fallback to generated
  }

  // Upload to R2
  const fileKey = StorageService.generateFileKey(user.id, bookId, file.name);
  const storage = new StorageService(c.env.BUCKET);
  await storage.upload(fileKey, await file.arrayBuffer(), file.type);

  // Insert into D1
  await c.env.DB.prepare(
    `INSERT INTO books (id, user_id, title, slug, type, file_key, file_size_bytes, max_views, is_public)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    bookId,
    user.id,
    title,
    slug,
    fileType,
    fileKey,
    file.size,
    plan.maxMonthlyViews === Infinity ? -1 : plan.maxMonthlyViews,
    1,
  ).run();

  const viewerUrl = `${c.env.APP_URL}/read/${slug}`;

  return c.json({
    book: { id: bookId, title, slug, type: fileType, viewerUrl },
    message: 'Book published successfully!',
  }, 201);
});

// PATCH /api/books/:id — update book settings
books.patch('/:id', async (c) => {
  const user = c.get('user');
  const bookId = c.req.param('id');
  const updates = await c.req.json<{
    title?: string;
    is_public?: boolean;
    password?: string | null;
    custom_domain?: string | null;
    cover_url?: string;
    settings?: Record<string, unknown>;
  }>();

  // Verify ownership
  const book = await c.env.DB.prepare(
    'SELECT * FROM books WHERE id = ? AND user_id = ?'
  ).bind(bookId, user.id).first<Book>();

  if (!book) {
    return c.json({ error: 'Book not found' }, 404);
  }

  const plan = getPlanLimits(user.plan);
  const sets: string[] = [];
  const values: unknown[] = [];

  if (updates.title !== undefined) {
    sets.push('title = ?');
    values.push(updates.title);
  }
  if (updates.is_public !== undefined) {
    sets.push('is_public = ?');
    values.push(updates.is_public ? 1 : 0);
  }
  if (updates.password !== undefined && plan.passwordProtection) {
    sets.push('password = ?');
    values.push(updates.password);
  }
  if (updates.custom_domain !== undefined && plan.customDomain) {
    sets.push('custom_domain = ?');
    values.push(updates.custom_domain);
  }
  if (updates.settings !== undefined) {
    sets.push('settings = ?');
    values.push(JSON.stringify(updates.settings));
  }
  if (updates.cover_url !== undefined) {
    sets.push('cover_url = ?');
    values.push(updates.cover_url);
  }

  if (sets.length > 0) {
    sets.push("updated_at = datetime('now')");
    values.push(bookId, user.id);
    await c.env.DB.prepare(
      `UPDATE books SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`
    ).bind(...values).run();
  }

  return c.json({ success: true });
});

// POST /api/books/:id/cover — upload cover image
books.post('/:id/cover', async (c) => {
  const user = c.get('user');
  const bookId = c.req.param('id');

  const book = await c.env.DB.prepare(
    'SELECT * FROM books WHERE id = ? AND user_id = ?'
  ).bind(bookId, user.id).first<Book>();

  if (!book) {
    return c.json({ error: 'Book not found' }, 404);
  }

  const formData = await c.req.formData();
  const file = formData.get('cover') as File | null;
  if (!file) {
    return c.json({ error: 'No cover image provided' }, 400);
  }

  // Validate image type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!validTypes.includes(file.type)) {
    return c.json({ error: 'Cover must be JPEG, PNG, WebP, or GIF' }, 400);
  }

  // Max 2MB for cover
  if (file.size > 2 * 1024 * 1024) {
    return c.json({ error: 'Cover image must be under 2MB' }, 400);
  }

  const ext = file.name.split('.').pop() || 'jpg';
  const coverKey = `covers/${user.id}/${bookId}.${ext}`;
  const storage = new StorageService(c.env.BUCKET);
  await storage.upload(coverKey, await file.arrayBuffer(), file.type);

  // Build a public URL for the cover
  const coverUrl = `/read/api/cover/${bookId}`;

  await c.env.DB.prepare(
    "UPDATE books SET cover_url = ?, cover_key = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
  ).bind(coverUrl, coverKey, bookId, user.id).run();

  return c.json({ success: true, cover_url: coverUrl });
});

// DELETE /api/books/:id — delete a book
books.delete('/:id', async (c) => {
  const user = c.get('user');
  const bookId = c.req.param('id');

  const book = await c.env.DB.prepare(
    'SELECT * FROM books WHERE id = ? AND user_id = ?'
  ).bind(bookId, user.id).first<Book>();

  if (!book) {
    return c.json({ error: 'Book not found' }, 404);
  }

  // Delete from R2
  const storage = new StorageService(c.env.BUCKET);
  await storage.delete(book.file_key);

  // Delete from D1 (cascades to view_logs)
  await c.env.DB.prepare('DELETE FROM books WHERE id = ?').bind(bookId).run();

  return c.json({ success: true });
});

// GET /api/books/:id/analytics — view analytics
books.get('/:id/analytics', async (c) => {
  const user = c.get('user');
  const bookId = c.req.param('id');

  const book = await c.env.DB.prepare(
    'SELECT * FROM books WHERE id = ? AND user_id = ?'
  ).bind(bookId, user.id).first<Book>();

  if (!book) {
    return c.json({ error: 'Book not found' }, 404);
  }

  // Get view stats
  const totalViews = book.view_count;

  const last7Days = await c.env.DB.prepare(
    `SELECT DATE(viewed_at) as date, COUNT(*) as views
     FROM view_logs WHERE book_id = ? AND viewed_at >= datetime('now', '-7 days')
     GROUP BY DATE(viewed_at) ORDER BY date`
  ).bind(bookId).all();

  const countries = await c.env.DB.prepare(
    `SELECT country, COUNT(*) as views FROM view_logs
     WHERE book_id = ? AND country != '' GROUP BY country ORDER BY views DESC LIMIT 10`
  ).bind(bookId).all();

  return c.json({
    totalViews,
    maxViews: book.max_views,
    last7Days: last7Days.results,
    topCountries: countries.results,
  });
});

export default books;
