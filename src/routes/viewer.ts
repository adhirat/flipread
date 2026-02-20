// Viewer route — serves the flipbook viewer for a published book

import { Hono } from 'hono';
import type { Env, Book } from '../lib/types';
import { StorageService } from '../services/storage';
import { trackView } from '../middleware/viewCounter';
import { getPlanLimits } from '../lib/plans';
import { getCookie } from 'hono/cookie';
import { 
  pdfViewerHTML, epubViewerHTML, documentViewerHTML, pptViewerHTML, 
  spreadsheetViewerHTML, textViewerHTML, imageViewerHTML, 
  pdfWebViewerHTML, epubWebViewerHTML, docxWebViewerHTML, pptWebViewerHTML, 
  spreadsheetWebViewerHTML, textWebViewerHTML, imageWebViewerHTML,
  passwordPage, errorPage, memberAccessPage 
} from '../services/viewerTemplates';

export function viewerPage(book: Book & { author_name: string; author_plan: string; store_handle?: string; store_logo_key?: string; store_name?: string }, appUrl: string, mode: string = 'standard'): string {
  const settings = JSON.parse(book.settings || '{}');
  const authorPlan = getPlanLimits(book.author_plan);
  const showBranding = !authorPlan.removeBranding;
  const fileUrl = `${appUrl}/read/api/file/${book.id}`;
  const coverUrl = book.cover_key ? `${appUrl}/read/api/cover/${book.id}` : '';
  const logoUrl = book.store_logo_key ? `${appUrl}/read/api/logo/${book.user_id}` : '';
  
  const storeHandle = book.store_handle || book.author_name.toLowerCase().replace(/ /g, '-');
  const storeUrl = `${appUrl}/store/${storeHandle}`;
  const storeName = book.store_name || book.author_name;
  const common = [book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName];

  if (mode === 'web') {
    if (book.type === 'pdf') return pdfWebViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
    if (['doc', 'docx'].includes(book.type)) return docxWebViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
    if (['ppt', 'pptx'].includes(book.type)) return pptWebViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
    if (['xlsx', 'xls', 'csv'].includes(book.type)) return spreadsheetWebViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
    if (['txt', 'md', 'rtf', 'html'].includes(book.type)) return textWebViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
    if (book.type === 'image') return imageWebViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
    return epubWebViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
  }

  if (book.type === 'pdf') {
    return pdfViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
  } else if (['doc', 'docx'].includes(book.type)) {
    return documentViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
  } else if (['ppt', 'pptx'].includes(book.type)) {
    return pptViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
  } else if (['xlsx', 'xls', 'csv'].includes(book.type)) {
    return spreadsheetViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
  } else if (['txt', 'md', 'rtf', 'html'].includes(book.type)) {
    return textViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
  } else if (book.type === 'image') {
    return imageViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
  } else {
    return epubViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl, storeUrl, storeName);
  }
}

const viewer = new Hono<{ Bindings: Env }>();

// GET /read/:slug — public flipbook viewer
viewer.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const book = await c.env.DB.prepare(
    `SELECT b.*, u.name as author_name, u.plan as author_plan, u.store_handle, u.store_logo_key, u.store_settings, u.store_name, u.store_logo_url
     FROM books b JOIN users u ON b.user_id = u.id
     WHERE b.slug = ? AND b.is_public = 1`
  ).bind(slug).first<Book & { author_name: string; author_plan: string; store_handle: string; store_logo_key?: string; store_settings?: string; store_name?: string; store_logo_url?: string }>();

  if (!book) {
    return c.html(errorPage('Book Not Found', 'This book does not exist or has been made private.'), 404);
  }

  const logoUrl = book.store_logo_key ? `${c.env.APP_URL}/read/api/logo/${book.user_id}` : '';

  // Private Store Access Check
  const storeSettings = JSON.parse(book.store_settings || '{}');
  if (storeSettings.is_private) {
        // First check: Is this user the owner? (Optional, if logged in)
    // For now, rely on member cookie logic.
    // Ideally we should also check if the logged-in user is the owner, but we don't have easy session access here without middlewares.
    // Cookies are the way for members.

    const cookieName = `mk_${book.user_id}`;
    const accessKey = getCookie(c, cookieName);
    
    let isValid = false;
    // Check cookie
    if (accessKey) {
      // Validate key lightly (or deeply)
      // Deep validation:
      const member = await c.env.DB.prepare(
        'SELECT id FROM store_members WHERE store_owner_id = ? AND access_key = ? AND is_active = 1'
      ).bind(book.user_id, accessKey).first();
      if (member) isValid = true;
    }
    
    // Check shared_book access if cookie fails?
    // The requirement was "Private Store", usually implying all content is gated.
    // But if a book is shared explicitly, maybe it should bypass?
    // Let's stick to "Private Store = Gate Everything" for now unless member key is present.
    // Wait, shared_books might be a way to access *specific* books even in a private store?
    // The requirement for "Private Store" usually overrides individual book settings or works alongside.
    // Let's implement Shared Book access bypass if Store is Private.
    // Check if user email is in shared_books for this book? We don't know user email unless they login.
    // But we have "login" page. The login page takes email/key.
    // If I have a specific book link and store is private, maybe I can enter my email to check if it's shared with me?
    // Unclear. For now, strict Private Store implementation: Must be a Member.

    if (!isValid) {
      // Inject owner ID
      let html = memberAccessPage(book.store_name || book.author_name, logoUrl || book.store_logo_url);
      html = html.replace('__OWNER_ID__', book.user_id);
      return c.html(html);
    }
  }

  // Check password protection (Book Level)
  const password = c.req.query('p');
  if (book.password && password !== book.password) {
    return c.html(passwordPage(slug, logoUrl));
  }

  // Track view and check limits
  const { allowed } = await trackView(c.env.DB, c.env.KV, book, c.req.raw);
  if (!allowed) {
    return c.html(errorPage('View Limit Reached',
      'This book has reached its monthly view limit. The publisher can upgrade their plan for more views.', logoUrl), 403);
  }

  const mode = c.req.query('mode') || 'standard';
  return c.html(viewerPage(book, c.env.APP_URL, mode));
});

// GET /api/file/:bookId — serve the actual file from R2
viewer.get('/api/file/:bookId', async (c) => {
  const bookId = c.req.param('bookId');

  const book = await c.env.DB.prepare(
    'SELECT file_key, type FROM books WHERE id = ? AND is_public = 1'
  ).bind(bookId).first<{ file_key: string; type: string }>();

  if (!book) return c.text('Not found', 404);

  const storage = new StorageService(c.env.BUCKET);
  const obj = await storage.getObject(book.file_key);
  if (!obj) return c.text('File not found', 404);

  const contentTypeMap: Record<string, string> = {
    pdf: 'application/pdf',
    epub: 'application/epub+zip',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ppt: 'application/vnd.ms-powerpoint',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    csv: 'text/csv',
    txt: 'text/plain',
    md: 'text/plain',
    rtf: 'application/rtf',
    html: 'text/html',
    image: 'application/octet-stream',
  };
  // For images, detect from the file extension in the key
  let contentType = contentTypeMap[book.type] || 'application/octet-stream';
  if (book.type === 'image') {
    const ext = book.file_key.split('.').pop()?.toLowerCase() || '';
    const imgMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' };
    contentType = imgMap[ext] || 'image/jpeg';
  }
  return new Response(obj.body, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

// GET /api/cover/:bookId — serve cover image from R2
viewer.get('/api/cover/:bookId', async (c) => {
  const bookId = c.req.param('bookId');

  const book = await c.env.DB.prepare(
    'SELECT cover_key FROM books WHERE id = ?'
  ).bind(bookId).first<{ cover_key: string }>();

  if (!book || !book.cover_key) return c.text('Not found', 404);

  const storage = new StorageService(c.env.BUCKET);
  const obj = await storage.getObject(book.cover_key);
  if (!obj) return c.text('Cover not found', 404);

  const ext = book.cover_key.split('.').pop() || 'jpg';
  const mimeMap: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
  return new Response(obj.body, {
    headers: {
      'Content-Type': mimeMap[ext] || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

// GET /api/logo/:userId — serve store logo from R2
viewer.get('/api/logo/:userId', async (c) => {
  const userId = c.req.param('userId');

  const user = await c.env.DB.prepare(
    'SELECT store_logo_key FROM users WHERE id = ?'
  ).bind(userId).first<{ store_logo_key: string }>();

  if (!user || !user.store_logo_key) return c.text('Not found', 404);

  const storage = new StorageService(c.env.BUCKET);
  const obj = await storage.getObject(user.store_logo_key);
  if (!obj) return c.text('Logo not found', 404);

  const ext = user.store_logo_key.split('.').pop() || 'png';
  const mimeMap: Record<string, string> = { 
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', 
    webp: 'image/webp', svg: 'image/svg+xml' 
  };
  return new Response(obj.body, {
    headers: {
      'Content-Type': mimeMap[ext] || 'image/png',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

// GET /api/hero/:userId — serve store hero image from R2
viewer.get('/api/hero/:userId', async (c) => {
  const userId = c.req.param('userId');

  const user = await c.env.DB.prepare(
    'SELECT store_hero_key FROM users WHERE id = ?'
  ).bind(userId).first<{ store_hero_key: string }>();

  if (!user || !user.store_hero_key) return c.text('Not found', 404);

  const storage = new StorageService(c.env.BUCKET);
  const obj = await storage.getObject(user.store_hero_key);
  if (!obj) return c.text('Hero image not found', 404);

  const ext = user.store_hero_key.split('.').pop() || 'jpg';
  const mimeMap: Record<string, string> = { 
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', 
    webp: 'image/webp'
  };
  return new Response(obj.body, {
    headers: {
      'Content-Type': mimeMap[ext] || 'image/jpeg',
      'Cache-Control': 'public, max-age=86400',
      'Access-Control-Allow-Origin': '*',
    },
  });
});

export default viewer;
