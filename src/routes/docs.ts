// Book routes — CRUD + upload

import { Hono } from 'hono';
import type { Env, User, Book } from '../lib/types';
import { generateId, generateSlug, getFileType } from '../lib/utils';
import { getPlanLimits } from '../lib/plans';
import { StorageService } from '../services/storage';
import { authMiddleware } from '../middleware/auth';
import { logActivity } from '../lib/activity';

type Variables = { user: User };

const books = new Hono<{ Bindings: Env; Variables: Variables }>();

// All routes require auth
books.use('/*', authMiddleware());

/**
 * GET /api/books
 * Lists all books owned by the current user.
 */
books.get('/', async (c) => {
  const user = c.get('user');
  const results = await c.env.DB.prepare(
    'SELECT id, title, slug, type, file_size_bytes, view_count, max_views, is_public, password, custom_domain, cover_url, created_at, updated_at FROM books WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(user.id).all<Book>();

  return c.json({ books: results.results || [] });
});

/**
 * POST /api/books/upload
 * Uploads a new book (PDF/EPUB) to R2 and creates a record in D1.
 * 
 * @param {File} file - The book file
 * @param {string} title - The title of the book
 * @param {string} slug - Custom slug (optional)
 * @param {File} cover - Custom cover image (optional)
 */
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
  const files = formData.getAll('file').filter(f => typeof f !== 'string') as File[];
  const customTitle = formData.get('title') as string | null;
  const customSlug = formData.get('slug') as string | null;

  if (!files || files.length === 0) {
    return c.json({ error: 'No file provided' }, 400);
  }

  // Validate file type(s)
  let fileType = getFileType(files[0].name);
  if (!fileType) {
    return c.json({ error: 'Unsupported file type.' }, 400);
  }

  // Handle multiple files
  if (files.length > 1) {
    if (user.plan !== 'business') {
      return c.json({ error: 'Multiple file upload (albums) is only available on the Business plan.' }, 403);
    }
    if (fileType !== 'image' && fileType !== 'audio' && fileType !== 'video') {
      return c.json({ error: 'Albums can only contain image, audio, or video files.' }, 400);
    }
    
    for (const f of files) {
      if (getFileType(f.name) !== fileType) {
        return c.json({ error: 'All files in a multiple upload must be the exact same media category (image, audio, or video).' }, 400);
      }
    }
  }

  let totalSize = 0;
  for (const f of files) totalSize += f.size;

  // Validate file size
  if (totalSize > plan.maxFileSizeBytes) {
    const maxMB = Math.round(plan.maxFileSizeBytes / (1024 * 1024));
    return c.json({
      error: `Total file size too large. Your ${user.plan} plan allows up to ${maxMB}MB. Upgrade for larger files.`,
    }, 413);
  }

  const title = customTitle || (files.length > 1 ? 'Untitled Album' : files[0].name.replace(/\.[^.]+$/, ''));

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

  // Handle optional cover image (extracted by client)
  const coverFile = formData.get('cover') as File | null;
  let coverUrl = null;
  let coverKey = null;

  const storage = new StorageService(c.env.BUCKET);

  if (coverFile && coverFile.size > 0) {
    const ext = coverFile.name.split('.').pop() || 'jpg';
    coverKey = `covers/${user.id}/${bookId}_auto.${ext}`;
    await storage.upload(coverKey, await coverFile.arrayBuffer(), coverFile.type);
    coverUrl = `/read/api/cover/${bookId}`;
  }

  let fileKey = '';
  let settings: any = {};
  
  if (files.length === 1) {
    const file = files[0];
    fileKey = StorageService.generateFileKey(user.id, bookId, file.name);
    await storage.upload(fileKey, await file.arrayBuffer(), file.type);
  } else {
    // It's a multiple file album
    fileKey = `albums/${user.id}/${bookId}/`;
    const uploadedFiles = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const key = `albums/${user.id}/${bookId}/${i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        await storage.upload(key, await file.arrayBuffer(), file.type);
        uploadedFiles.push({
            name: file.name,
            key: key,
            type: file.type
        });
    }
    settings.album_files = uploadedFiles;
  }

  // Insert into D1
  await c.env.DB.prepare(
    `INSERT INTO books (id, user_id, title, slug, type, file_key, file_size_bytes, max_views, is_public, cover_url, cover_key, settings)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    bookId,
    user.id,
    title,
    slug,
    fileType,
    fileKey,
    totalSize,
    plan.maxMonthlyViews === Infinity ? -1 : plan.maxMonthlyViews,
    1,
    coverUrl,
    coverKey,
    JSON.stringify(settings)
  ).run();

  // Log activity
  await logActivity(c, user.id, 'create_book', 'book', bookId, { title, type: fileType });

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

    // Log activity
    await logActivity(c, user.id, 'update_book', 'book', bookId, updates);
  }

  return c.json({ success: true });
});

// POST /api/books/:id/album — add files to existing album
books.post('/:id/album', async (c) => {
  const user = c.get('user');
  const bookId = c.req.param('id');
  
  const book = await c.env.DB.prepare(
    'SELECT * FROM books WHERE id = ? AND user_id = ?'
  ).bind(bookId, user.id).first<Book>();

  if (!book) return c.json({ error: 'Book not found' }, 404);
  
  const formData = await c.req.parseBody();
  const files = formData['file'];
  const fileArray = Array.isArray(files) ? files : (files ? [files] : []);

  if (fileArray.length === 0) return c.json({ error: 'No files provided.' }, 400);

  const settings = typeof book.settings === 'string' ? JSON.parse(book.settings) : (book.settings || {});
  let albumFiles = settings.album_files || [];
  
  if (albumFiles.length === 0 && book.file_key && !book.file_key.startsWith('albums/')) {
    // Current book has single file, convert to album
    albumFiles.push({
      name: 'Original File',
      key: book.file_key,
      type: book.type
    });
  }

  const storage = new StorageService(c.env.BUCKET);
  const startIndex = albumFiles.length;
  
  for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i] as File;
      const key = `albums/${user.id}/${bookId}/${startIndex + i}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      await storage.upload(key, await file.arrayBuffer(), file.type);
      albumFiles.push({
          name: file.name,
          key: key,
          type: file.type
      });
  }
  
  settings.album_files = albumFiles;
  
  await c.env.DB.prepare(
    "UPDATE books SET settings = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
  ).bind(JSON.stringify(settings), bookId, user.id).run();

  return c.json({ success: true, album_files: albumFiles });
});

// DELETE /api/books/:id/album/:index — remove file from existing album
books.delete('/:id/album/:index', async (c) => {
  const user = c.get('user');
  const bookId = c.req.param('id');
  const index = parseInt(c.req.param('index'));
  
  const book = await c.env.DB.prepare(
    'SELECT * FROM books WHERE id = ? AND user_id = ?'
  ).bind(bookId, user.id).first<Book>();

  if (!book) return c.json({ error: 'Book not found' }, 404);
  
  const settings = typeof book.settings === 'string' ? JSON.parse(book.settings) : (book.settings || {});
  let albumFiles = settings.album_files || [];
  
  if (index < 0 || index >= albumFiles.length) {
    return c.json({ error: 'Index out of bounds' }, 400);
  }
  
  const fileToRemove = albumFiles[index];
  const storage = new StorageService(c.env.BUCKET);
  // Optional: delete from R2? await storage.delete(fileToRemove.key);
  
  albumFiles.splice(index, 1);
  settings.album_files = albumFiles;
  
  await c.env.DB.prepare(
    "UPDATE books SET settings = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?"
  ).bind(JSON.stringify(settings), bookId, user.id).run();

  return c.json({ success: true, album_files: albumFiles });
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

  // Delete from R2 (file and cover)
  const storage = new StorageService(c.env.BUCKET);
  
  // Delete main file
  if (book.file_key) {
    await storage.delete(book.file_key).catch(e => console.error('Failed to delete file', e));
  }

  // Delete cover if exists  
  if (book.cover_key) {
    await storage.delete(book.cover_key).catch(e => console.error('Failed to delete cover', e));
  }

  // Delete from D1 (cascades to view_logs)
  await c.env.DB.prepare('DELETE FROM books WHERE id = ?').bind(bookId).run();

  // Log activity
  await logActivity(c, user.id, 'delete_book', 'book', bookId, { title: book.title });

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

// Book Sharing Routes

// GET /api/books/shared-with-me
books.get('/shared-with-me', async (c) => {
  const user = c.get('user');
  
  const results = await c.env.DB.prepare(
    `SELECT b.*, u.name as owner_name, sb.can_view
     FROM shared_books sb
     JOIN books b ON sb.book_id = b.id
     JOIN users u ON b.user_id = u.id
     WHERE sb.shared_with_email = ? OR sb.shared_with_user_id = ?
     ORDER BY sb.created_at DESC`
  ).bind(user.email, user.id).all();

  return c.json({ books: results.results || [] });
});

// GET /api/books/:id/shares
books.get('/:id/shares', async (c) => {
  const user = c.get('user');
  const bookId = c.req.param('id');
  
  // Verify ownership
  const book = await c.env.DB.prepare(
    `SELECT id FROM books WHERE id = ? AND user_id = ?`
  ).bind(bookId, user.id).first();
  
  if (!book) return c.json({ error: 'Book not found' }, 404);

  const shares = await c.env.DB.prepare(
    `SELECT * FROM shared_books WHERE book_id = ? ORDER BY created_at DESC`
  ).bind(bookId).all();

  return c.json({ shares: shares.results || [] });
});

// POST /api/books/:id/share
books.post('/:id/share', async (c) => {
  const user = c.get('user');
  const bookId = c.req.param('id');
  const { email } = await c.req.json();

  if (!email) return c.json({ error: 'Email is required' }, 400);

  // Check plan limits
  const allowedPlans = ['pro', 'business'];
  if (!allowedPlans.includes(user.plan)) {
    return c.json({ error: 'Sharing is only available on Pro and Business plans.' }, 403);
  }

  // Verify ownership
  const book = await c.env.DB.prepare(
    `SELECT id, title FROM books WHERE id = ? AND user_id = ?`
  ).bind(bookId, user.id).first();
  
  if (!book) return c.json({ error: 'Book not found' }, 404);

  // Check if already shared
  const existing = await c.env.DB.prepare(
    `SELECT id FROM shared_books WHERE book_id = ? AND shared_with_email = ?`
  ).bind(bookId, email).first();

  if (existing) {
    return c.json({ error: 'Already shared with this user' }, 409);
  }

  const id = crypto.randomUUID();
  
  try {
    await c.env.DB.prepare(
      `INSERT INTO shared_books (id, book_id, owner_id, shared_with_email) VALUES (?, ?, ?, ?)`
    ).bind(id, bookId, user.id, email).run();
    
    
    // Log activity
    await logActivity(c, user.id, 'share_book', 'book', bookId, { type: 'email', target: email });
    
    // Ideally look up if user exists and link user_id, but email is enough for now
    
    return c.json({ share: { id, book_id: bookId, shared_with_email: email, created_at: new Date().toISOString() } });
  } catch (e) {
    return c.json({ error: 'Failed to share book' }, 500);
  }
});

// DELETE /api/books/shares/:shareId
books.delete('/shares/:shareId', async (c) => {
  const user = c.get('user');
  const shareId = c.req.param('shareId');

  // Verify ownership of the share (must be owner of the book)
  const share = await c.env.DB.prepare(
    `SELECT sb.id, sb.book_id FROM shared_books sb
     JOIN books b ON sb.book_id = b.id
     WHERE sb.id = ? AND b.user_id = ?`
  ).bind(shareId, user.id).first<{ id: string; book_id: string }>();

  if (!share) return c.json({ error: 'Share not found or permission denied' }, 404);

  await c.env.DB.prepare(
    `DELETE FROM shared_books WHERE id = ?`
  ).bind(shareId).run();

  // Log activity
  await logActivity(c, user.id, 'unshare_book', 'book', share?.book_id || '', { shareId });

  return c.json({ success: true });
});

export default books;
