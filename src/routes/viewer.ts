// Viewer route — serves the flipbook viewer for a published book

import { Hono } from 'hono';
import type { Env, Book } from '../lib/types';
import { StorageService } from '../services/storage';
import { trackView } from '../middleware/viewCounter';
import { getPlanLimits } from '../lib/plans';
import { pdfViewerHTML, epubViewerHTML, documentViewerHTML, pptViewerHTML, webViewerHTML, passwordPage, errorPage } from '../services/viewerTemplates';

export function viewerPage(book: Book & { author_name: string; author_plan: string; store_logo_key?: string }, appUrl: string, mode: string = 'standard'): string {
  const settings = JSON.parse(book.settings || '{}');
  const authorPlan = getPlanLimits(book.author_plan);
  const showBranding = !authorPlan.removeBranding;
  const fileUrl = `${appUrl}/read/api/file/${book.id}`;
  const coverUrl = book.cover_key ? `${appUrl}/read/api/cover/${book.id}` : '';
  const logoUrl = book.store_logo_key ? `${appUrl}/read/api/logo/${book.user_id}` : '';

  if (mode === 'web') {
    return webViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl);
  }

  if (book.type === 'pdf') {
    return pdfViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl);
  } else if (['doc', 'docx'].includes(book.type)) {
    return documentViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl);
  } else if (['ppt', 'pptx'].includes(book.type)) {
    return pptViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl);
  } else {
    return epubViewerHTML(book.title, fileUrl, coverUrl, settings, showBranding, logoUrl);
  }
}

const viewer = new Hono<{ Bindings: Env }>();

// GET /read/:slug — public flipbook viewer
viewer.get('/:slug', async (c) => {
  const slug = c.req.param('slug');

  const book = await c.env.DB.prepare(
    `SELECT b.*, u.name as author_name, u.plan as author_plan, u.store_logo_key
     FROM books b JOIN users u ON b.user_id = u.id
     WHERE b.slug = ? AND b.is_public = 1`
  ).bind(slug).first<Book & { author_name: string; author_plan: string; store_logo_key?: string }>();

  if (!book) {
    return c.html(errorPage('Book Not Found', 'This book does not exist or has been made private.'), 404);
  }

  // Check password protection
  const password = c.req.query('p');
  if (book.password && password !== book.password) {
    return c.html(passwordPage(slug));
  }

  // Track view and check limits
  const { allowed } = await trackView(c.env.DB, c.env.KV, book, c.req.raw);
  if (!allowed) {
    return c.html(errorPage('View Limit Reached',
      'This book has reached its monthly view limit. The publisher can upgrade their plan for more views.'), 403);
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

  const contentType = book.type === 'pdf' ? 'application/pdf' : 'application/epub+zip';
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

export default viewer;
