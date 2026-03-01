// Bookstore route — public user bookstore page

import { Hono } from 'hono';
import type { Env, Book, User } from '../lib/types';

const store = new Hono<{ Bindings: Env }>();

// Helper to get user by store handle
async function getUserByUsername(db: D1Database, handle: string): Promise<User | null> {
  return await db.prepare(
    'SELECT id, name, store_handle, avatar_url, plan, store_name, store_logo_url, store_settings FROM users WHERE store_handle = ? OR (store_handle IS NULL AND LOWER(REPLACE(name, " ", "-")) = ?)'
  ).bind(handle.toLowerCase(), handle.toLowerCase()).first<User>();
}

export async function getUserByCustomDomain(db: D1Database, domain: string): Promise<User | null> {
  // SQLite json_extract to find domain in the store_settings JSON field
  return await db.prepare(
    'SELECT id, name, avatar_url, plan, store_name, store_logo_url, store_settings FROM users WHERE LOWER(json_extract(store_settings, "$.custom_domain")) = ?'
  ).bind(domain.toLowerCase()).first<User>();
}

export async function getStoreNavInfo(db: D1Database, userId: string): Promise<{hasProducts: boolean, hasGallery: boolean}> {
  const pCount = await db.prepare('SELECT COUNT(*) as count FROM products WHERE store_id = ? AND status = "active"').bind(userId).first<{count: number}>();
  const bCount = await db.prepare('SELECT COUNT(*) as count FROM books WHERE user_id = ? AND is_public = 1').bind(userId).first<{count: number}>();
  return {
    hasProducts: (pCount?.count || 0) > 0,
    hasGallery: (bCount?.count || 0) > 0
  };
}

import { getCookie } from 'hono/cookie';
import { memberAccessPage, memberRegisterPage, memberForgotPage } from '../services/viewerTemplates';

// GET /store/:username - Landing Page or Gallery
store.get('/:username', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);

  const settings = JSON.parse(user.store_settings || '{}');
  
  // Private Store Check
  if (settings.is_private) {
    const cookieName = `mk_${user.id}`;
    const accessKey = getCookie(c, cookieName);
    let isValid = false;
    if (accessKey) {
      const member = await c.env.DB.prepare(
        'SELECT id FROM store_members WHERE store_owner_id = ? AND access_key = ? AND is_active = 1'
      ).bind(user.id, accessKey).first();
      if (member) isValid = true;
    }
    if (!isValid) {
      let html = memberAccessPage(user.store_name || user.name, user.store_logo_url);
      html = html.replace(/__OWNER_ID__/g, user.id);
      return c.html(html);
    }
  }

  const navData = await getStoreNavInfo(c.env.DB, user.id);
  // If no products and no gallery and no landing page, show Contact Us as landing page
  if (!navData.hasProducts && !navData.hasGallery && !settings.landing_page_content) {
    const content = settings.contact_us_content || `
For inquiries, please reach out to us at:
**Email:** ${user.email}
    `;
    return c.html(contentPage(user, 'Contact Us', content, c.env.APP_URL, false, navData));
  }
  // If landing page content exists, show landing page, otherwise gallery
  if (settings.landing_page_content) {
    return c.html(contentPage(user, settings.landing_title || 'Welcome', settings.landing_page_content, c.env.APP_URL, false, navData));
  }

  const booksResult = await c.env.DB.prepare(
    `SELECT id, title, slug, type, cover_url, view_count, created_at, settings, categories, (SELECT AVG(rating) FROM reviews WHERE book_id = books.id) as avg_rating, (SELECT COUNT(id) FROM reviews WHERE book_id = books.id) as review_count FROM books WHERE user_id = ? AND is_public = 1 ORDER BY created_at DESC`
  ).bind(user.id).all<Book>();
  const books = booksResult.results || [];

  return c.html(bookstorePage(user, books, settings, c.env.APP_URL, false, navData));
});

// GET /store/:username/gallery
store.get('/:username/gallery', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);

  const settings = JSON.parse(user.store_settings || '{}');
  
  // Private Store Check
  if (settings.is_private) {
    const cookieName = `mk_${user.id}`;
    const accessKey = getCookie(c, cookieName);
    let isValid = false;
    if (accessKey) {
      const member = await c.env.DB.prepare(
        'SELECT id FROM store_members WHERE store_owner_id = ? AND access_key = ? AND is_active = 1'
      ).bind(user.id, accessKey).first();
      if (member) isValid = true;
    }
    if (!isValid) {
      let html = memberAccessPage(user.store_name || user.name, user.store_logo_url);
      html = html.replace(/__OWNER_ID__/g, user.id);
      return c.html(html);
    }
  }

  const booksResult = await c.env.DB.prepare(
    `SELECT id, title, slug, type, cover_url, view_count, created_at, settings, categories, (SELECT AVG(rating) FROM reviews WHERE book_id = books.id) as avg_rating, (SELECT COUNT(id) FROM reviews WHERE book_id = books.id) as review_count FROM books WHERE user_id = ? AND is_public = 1 ORDER BY created_at DESC`
  ).bind(user.id).all<Book>();
  const books = booksResult.results || [];
  const navData = await getStoreNavInfo(c.env.DB, user.id);
  return c.html(bookstorePage(user, books, settings, c.env.APP_URL, false, navData));
});

// GET /store/:username/products - Duplicates Gallery to act as the Products route
store.get('/:username/products', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);

  const settings = JSON.parse(user.store_settings || '{}');
  
  // Private Store Check
  if (settings.is_private) {
    const cookieName = `mk_${user.id}`;
    const accessKey = getCookie(c, cookieName);
    let isValid = false;
    if (accessKey) {
      const member = await c.env.DB.prepare(
        'SELECT id FROM store_members WHERE store_owner_id = ? AND access_key = ? AND is_active = 1'
      ).bind(user.id, accessKey).first();
      if (member) isValid = true;
    }
    if (!isValid) {
      let html = memberAccessPage(user.store_name || user.name, user.store_logo_url);
      html = html.replace(/__OWNER_ID__/g, user.id);
      return c.html(html);
    }
  }

  const booksResult = await c.env.DB.prepare(
    `SELECT id, title, slug, type, cover_url, view_count, created_at, settings, categories, (SELECT AVG(rating) FROM reviews WHERE book_id = books.id) as avg_rating, (SELECT COUNT(id) FROM reviews WHERE book_id = books.id) as review_count FROM books WHERE user_id = ? AND is_public = 1 ORDER BY created_at DESC`
  ).bind(user.id).all<Book>();
  const books = booksResult.results || [];
  const navData = await getStoreNavInfo(c.env.DB, user.id);
  return c.html(bookstorePage(user, books, settings, c.env.APP_URL, false, navData));
});

// GET /store/:username/cart - A placeholder cart view
store.get('/:username/cart', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);

  const settings = JSON.parse(user.store_settings || '{}');
  
  // Private Store Check
  if (settings.is_private) {
    const cookieName = `mk_${user.id}`;
    const accessKey = getCookie(c, cookieName);
    let isValid = false;
    if (accessKey) {
      const member = await c.env.DB.prepare(
        'SELECT id FROM store_members WHERE store_owner_id = ? AND access_key = ? AND is_active = 1'
      ).bind(user.id, accessKey).first();
      if (member) isValid = true;
    }
    if (!isValid) {
      let html = memberAccessPage(user.store_name || user.name, user.store_logo_url);
      html = html.replace(/__OWNER_ID__/g, user.id);
      return c.html(html);
    }
  }

  // Display empty cart page using the existing contentPage template for simplicity
  const navData = await getStoreNavInfo(c.env.DB, user.id);
  return c.html(contentPage(user, 'Your Cart', 'Your cart is currently empty. <br><br> <a href="/store/' + username + '/products">Browse products</a>.', c.env.APP_URL, false, navData));
});

// GET /store/:username/login
store.get('/:username/login', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  const homeUrl = `/store/${username}`;
  let html = memberAccessPage(user.store_name || user.name, user.store_logo_url, homeUrl);
  html = html.replace(/__OWNER_ID__/g, user.id);
  return c.html(html);
});

// GET /store/:username/register
store.get('/:username/register', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  const homeUrl = `/store/${username}`;
  let html = memberRegisterPage(user.store_name || user.name, user.store_logo_url, homeUrl);
  html = html.replace(/__OWNER_ID__/g, user.id);
  return c.html(html);
});

// GET /store/:username/forgot-password
store.get('/:username/forgot-password', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  const homeUrl = `/store/${username}`;
  let html = memberForgotPage(user.store_name || user.name, user.store_logo_url, homeUrl);
  html = html.replace(/__OWNER_ID__/g, user.id);
  return c.html(html);
});

// GET /store/:username/about
store.get('/:username/about', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  
  const settings = JSON.parse(user.store_settings || '{}');
  if (!settings.about_us_content) return c.html(notFoundPage('About Us section not found'), 404);

  const navData = await getStoreNavInfo(c.env.DB, user.id);
  return c.html(contentPage(user, 'About Us', settings.about_us_content, c.env.APP_URL, false, navData));
});

// GET /store/:username/privacy
store.get('/:username/privacy', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  
  const settings = JSON.parse(user.store_settings || '{}');
  if (!settings.privacy_policy_content) return c.html(notFoundPage('Privacy Policy not found'), 404);

  const navData = await getStoreNavInfo(c.env.DB, user.id);
  return c.html(contentPage(user, 'Privacy Policy', settings.privacy_policy_content, c.env.APP_URL, false, navData));
});

// GET /store/:username/terms
store.get('/:username/terms', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  
  const settings = JSON.parse(user.store_settings || '{}');
  if (!settings.terms_content) return c.html(notFoundPage('Terms & Conditions not found'), 404);

  const navData = await getStoreNavInfo(c.env.DB, user.id);
  return c.html(contentPage(user, 'Terms & Conditions', settings.terms_content, c.env.APP_URL, false, navData));
});

// GET /store/:username/contact
store.get('/:username/contact', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  
  const settings = JSON.parse(user.store_settings || '{}');
  // We use a fallback to empty string if not defined, allowing the form to show anyway
  const content = settings.contact_page_content || ''; 

  const navData = await getStoreNavInfo(c.env.DB, user.id);
  return c.html(contentPage(user, 'Contact Us', content, c.env.APP_URL, false, navData));
});

// GET /store/:username/copyright
store.get('/:username/copyright', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.html(notFoundPage(), 404);
  
  const settings = JSON.parse(user.store_settings || '{}');
  const content = settings.copyright_content || settings.contact_info_content || '';
  if (!content) return c.html(notFoundPage('Copyright Information not found'), 404);

  const navData = await getStoreNavInfo(c.env.DB, user.id);
  return c.html(contentPage(user, 'Copyright Information', content, c.env.APP_URL, false, navData));
});

// POST /store/:username/inquiry
store.post('/:username/inquiry', async (c) => {
  const username = c.req.param('username');
  const user = await getUserByUsername(c.env.DB, username);
  if (!user) return c.json({ error: 'Store not found' }, 404);

  const { name, email, mobile, message } = await c.req.json<{ name: string; email: string; mobile?: string; message: string }>();
  if (!name || !email || !message) {
    return c.json({ error: 'Name, email and message are required' }, 400);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    'INSERT INTO store_inquiries (id, store_owner_id, name, email, mobile, message) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(id, user.id, name, email, mobile || null, message).run();

  return c.json({ success: true, message: 'Your inquiry has been submitted. We will get back to you soon.' });
});

export function bookstorePage(user: User, books: Book[], settings: any, appUrl: string, isCustomDomain = false, navData = {hasProducts:true, hasGallery:true}): string {
  const storeName = user.store_name || user.name;
  const safeName = esc(storeName);
  const bookCount = books.length;
  const showSearch = bookCount > 0;

  // Hero settings
  const heroImage = user.store_hero_url || settings.hero_image_url || '';
  const heroTitle = settings.hero_title || safeName;
  const heroCaption = settings.hero_caption || settings.description || `Browse ${user.name}'s curated library.`;

  // Theme customization
  const accentColor = settings.accent_color || '#c45d3e';
  const fontChoice = settings.font_choice || 'dm-sans';
  const layoutStyle = settings.layout_style || 'grid';
  const cardStyle = settings.card_style || '3d-book';
  const showViewCount = settings.show_view_count !== false;
  const themePreset = settings.theme_preset || 'default';

  // New premium settings
  const heroSize = settings.hero_size || 'standard';     // compact | standard | tall | fullscreen
  const bgStyle = settings.bg_style || 'clean';          // clean | dots | grid | lines
  const cornerRadius = settings.corner_radius || 'standard'; // sharp | standard | rounded
  const showDate = settings.show_date === true;
  const sectionHeading = settings.section_heading || '';

  // Social links
  const socialInstagram = settings.social_instagram || '';
  const socialX = settings.social_x || '';
  const socialYoutube = settings.social_youtube || '';
  const socialWebsite = settings.social_website || '';
  const hasSocials = socialInstagram || socialX || socialYoutube || socialWebsite;

  // Navigation Links
  const storeHandle = user.store_handle || user.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const homeUrl = isCustomDomain ? '/' : `/store/${storeHandle}`;
  const galleryUrl = isCustomDomain ? '/gallery' : `/store/${storeHandle}/gallery`;
  const aboutUrl = isCustomDomain ? '/about' : `/store/${storeHandle}/about`;
  const contactUrl = isCustomDomain ? '/contact' : `/store/${storeHandle}/contact`;
  const copyrightUrl = isCustomDomain ? '/copyright' : `/store/${storeHandle}/copyright`;
  const loginUrl = isCustomDomain ? '/login' : `/store/${storeHandle}/login`;
  const privacyUrl = isCustomDomain ? '/privacy' : `/store/${storeHandle}/privacy`;
  const termsUrl = isCustomDomain ? '/terms' : `/store/${storeHandle}/terms`;
  const productsUrl = isCustomDomain ? '/products' : `/store/${storeHandle}/products`;
  const cartUrl = isCustomDomain ? '/cart' : `/store/${storeHandle}/cart`;

  let landingUrl = productsUrl;
  if (!navData.hasProducts && navData.hasGallery) landingUrl = homeUrl; // homeUrl = /store/:username (books overview/gallery)
  if (!navData.hasProducts && !navData.hasGallery) landingUrl = contactUrl;

  // Announcement banner
  const bannerText = settings.banner_text || '';
  const bannerColor = settings.banner_color || accentColor;
  const bannerLink = settings.banner_link || '';

  // Hero CTA
  const ctaText = settings.cta_text || '';
  const ctaLink = settings.cta_link || '';

  // Font imports
  const fontMap: Record<string, { import: string; family: string; heading: string }> = {
    'dm-sans': { import: 'DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1', family: "'DM Sans', system-ui, sans-serif", heading: "'Instrument Serif', Georgia, serif" },
    'inter': { import: 'Inter:wght@400;500;600;700&family=Instrument+Serif:ital@0;1', family: "'Inter', system-ui, sans-serif", heading: "'Instrument Serif', Georgia, serif" },
    'playfair': { import: 'Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@400;500;600', family: "'DM Sans', system-ui, sans-serif", heading: "'Playfair Display', Georgia, serif" },
    'space-grotesk': { import: 'Space+Grotesk:wght@400;500;600;700&family=Instrument+Serif:ital@0;1', family: "'Space Grotesk', system-ui, sans-serif", heading: "'Instrument Serif', Georgia, serif" },
  };
  const font = fontMap[fontChoice] || fontMap['dm-sans'];

  // Hex to RGB helper for accent color
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    return `${r}, ${g}, ${b}`;
  };
  const accentRgb = hexToRgb(accentColor);

  // Layout-specific grid CSS
  const gridCSS = layoutStyle === 'list'
    ? `.grid { display:flex; flex-direction:column; gap:16px; }
       .bk-card { display:flex; gap:20px; align-items:center; }
       .bk-3d { padding-bottom:0; width:80px; height:110px; flex-shrink:0; perspective:none; margin-bottom:0; }
       .bk-cover { position:relative; width:80px; height:110px; transform:none; }
       .bk-card:hover .bk-cover { transform:none; }
       .bk-spine { display:none; }
       .bk-info { text-align:left; flex:1; }
       .bk-ph-letter { font-size:28px; }`
    : layoutStyle === 'masonry'
    ? `.grid { columns: 3; column-gap: 30px; } .bk-card { break-inside:avoid; margin-bottom:30px; display:block; }
       @media(max-width:900px){.grid{columns:2}} @media(max-width:600px){.grid{columns:2;column-gap:12px} .bk-card{margin-bottom:12px}}`
    : '';

  // Card style overrides
  const cardCSS = cardStyle === 'flat-card'
    ? `.bk-3d { perspective:none; } .bk-cover { transform:none; border-radius:12px; box-shadow:var(--shadow-card); } .bk-card:hover .bk-cover { transform:translateY(-4px); box-shadow:var(--shadow-card-hover); } .bk-spine { display:none; }`
    : cardStyle === 'minimal-row'
    ? `.bk-3d { padding-bottom:120%; } .bk-cover { transform:none; border-radius:8px; box-shadow:0 1px 3px rgba(0,0,0,0.08); } .bk-card:hover .bk-cover { transform:none; box-shadow:0 2px 8px rgba(0,0,0,0.12); } .bk-spine { display:none; }`
    : '';

  // Hero size CSS
  const heroSizeCSS = heroSize === 'compact'
    ? '.hero { min-height: 220px; padding: 48px 20px; }'
    : heroSize === 'tall'
    ? '.hero { min-height: 580px; padding: 120px 20px; }'
    : heroSize === 'fullscreen'
    ? '.hero { min-height: 100vh; padding: 120px 20px; }'
    : '';

  // Background pattern CSS
  const bgPatternCSS = bgStyle === 'dots'
    ? `body { background-image: radial-gradient(var(--border-strong) 1px, transparent 1px); background-size: 24px 24px; }`
    : bgStyle === 'grid'
    ? `body { background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 48px 48px; }`
    : bgStyle === 'lines'
    ? `body { background-image: repeating-linear-gradient(0deg, transparent, transparent 39px, var(--border) 39px, var(--border) 40px); }`
    : '';

  const cornerRadiusCSS = cornerRadius === 'sharp'
    ? '.bk-cover { border-radius: 0 !important; } .bk-3d { border-radius: 0; }'
    : cornerRadius === 'rounded'
    ? '.bk-cover { border-radius: 6px 20px 20px 6px !important; }'
    : ''; // standard keeps default

  // Extract unique categories
  const uniqueCategories = Array.from(new Set(
    books.flatMap(b => {
      try { return JSON.parse(b.categories || '[]'); } catch { return []; }
    })
  )).filter(Boolean).sort() as string[];

  const bookCards = books.map((b, i) => {
    const firstLetter = (b.title || 'B').charAt(0).toUpperCase();
    const categoriesList = (() => { try { return JSON.parse(b.categories || '[]').join(','); } catch { return ''; } })();
    const delay = Math.min(i, 11) * 0.06 + 0.4;
    const itemSettings = typeof b.settings === 'string' ? JSON.parse(b.settings) : (b.settings || {});
    
    // Check if custom published_date exists, otherwise fallback to DB created_at, formatted nicely.
    const createdDate = itemSettings.published_date ? new Date(itemSettings.published_date) : (b.created_at ? new Date(b.created_at) : null);
    const dateStr = showDate && createdDate ? createdDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
    
    const authorStr = itemSettings.author ? `<div class="bk-author" style="font-size:12px; color:var(--text-secondary); margin-bottom: 4px;">${esc(itemSettings.author)}</div>` : '';
    const descStr = itemSettings.description ? `<div class="bk-desc" style="font-size:12px; color:var(--text-muted); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${esc(itemSettings.description)}</div>` : '';

    return `<a href="${appUrl}/read/${esc(b.slug)}" class="bk-card" data-title="${esc(b.title.toLowerCase())}" data-categories="${esc(categoriesList.toLowerCase())}" style="animation-delay:${delay.toFixed(2)}s">
      <div class="bk-3d">
        <div class="bk-spine"></div>
        <div class="bk-cover">
          ${b.cover_url
            ? `<img src="${esc(b.cover_url)}" alt="${esc(b.title)}" loading="lazy">`
            : `<div class="bk-ph"><span class="bk-ph-letter">${esc(firstLetter)}</span></div>`}
        </div>
      </div>
      <div class="bk-info">
        <h3 class="bk-title" style="margin-bottom: ${authorStr || descStr ? '2px' : '4px' }">${esc(b.title)}</h3>
        ${authorStr}
        ${descStr}
        <div class="bk-meta" style="margin-top: ${authorStr || descStr ? '8px' : '0' }">
          ${showViewCount ? `<span class="bk-views"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg> ${b.view_count.toLocaleString()}</span>` : ''}
          <span class="bk-type">${b.type.toUpperCase()}</span>
          ${b.review_count ? `<span class="bk-rating" onclick="event.preventDefault(); window.openProductReviews('${b.id}', '${esc(b.title)}')" style="display:flex;align-items:center;gap:3px;cursor:pointer;color:#f59e0b;font-weight:600;"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> ${Number(b.avg_rating).toFixed(1)} (${b.review_count})</span>` : `<span class="bk-rating" onclick="event.preventDefault(); window.openProductReviews('${b.id}', '${esc(b.title)}')" style="display:flex;align-items:center;gap:3px;cursor:pointer;color:var(--text-muted);opacity:0.6;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Rate</span>`}
          ${dateStr ? `<span class="bk-date">${dateStr}</span>` : ''}
        </div>
      </div>
    </a>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${safeName}</title>
<meta name="description" content="${esc(settings.description || `Browse ${user.name}'s library on SHOPUBLISH.`)}">
<link rel="icon" type="image/png" href="${user.store_logo_url || '/logo.png'}">
<link rel="apple-touch-icon" href="${user.store_logo_url || '/logo.png'}">
<meta property="og:title" content="${safeName}">
<meta property="og:description" content="${esc(settings.description || `Browse ${user.name}'s library on SHOPUBLISH.`)}">
<meta property="og:image" content="${user.store_logo_url || appUrl + '/logo.png'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${font.import}&display=swap" rel="stylesheet">
<script>
(function(){var t=localStorage.getItem('shopublish-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.setAttribute('data-theme','light')}})();
</script>
<style>
/* ====== COLOR SYSTEM ====== */
/* Determine if preset forces a specific mode */
${themePreset === 'magazine' ? `
/* Magazine - Sophisticated Serif */
:root, [data-theme="light"] {
  --bg-primary: #f9f7f2;
  --bg-secondary: #f2eee6;
  --bg-card: #ffffff;
  --bg-card-hover: #fcfbf9;
  --bg-hero: #f2eee6;
  --text-primary: #1a1a1a;
  --text-secondary: #4a4a4a;
  --text-tertiary: #8a8a8a;
  --accent: ${accentColor};
  --accent-hover: ${accentColor};
  --accent-subtle: rgba(${accentRgb}, 0.08);
  --accent-glow: rgba(${accentRgb}, 0.15);
  --border: rgba(26, 22, 19, 0.1);
  --border-strong: rgba(26, 22, 19, 0.18);
  --shadow-card: 0 4px 12px rgba(0,0,0,0.05);
  --shadow-card-hover: 0 12px 24px rgba(0,0,0,0.1);
  --shadow-book: 4px 6px 20px rgba(0,0,0,0.12);
  --shadow-book-hover: 8px 12px 30px rgba(0,0,0,0.18);
  --noise-opacity: 0.02;
  --header-bg: rgba(249, 247, 242, 0.85);
  --search-bg: rgba(0,0,0,0.03);
  --ph-bg: linear-gradient(145deg, #f2eee6, #e8e4db);
  --ph-color: rgba(${accentRgb}, 0.2);
  --spine-color: rgba(0,0,0,0.08);
  --toggle-bg: rgba(0,0,0,0.05);
  color-scheme: light;
}
[data-theme="dark"] {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-card: #1f2847;
  --bg-card-hover: #263258;
  --bg-hero: #0f1629;
  --text-primary: #ede9e3;
  --text-secondary: #a39d94;
  --text-tertiary: #6b655c;
  --accent: ${accentColor};
  --accent-hover: ${accentColor};
  --accent-subtle: rgba(${accentRgb}, 0.12);
  --accent-glow: rgba(${accentRgb}, 0.2);
  --border: rgba(237, 233, 227, 0.08);
  --border-strong: rgba(237, 233, 227, 0.16);
  --shadow-card: 0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4);
  --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.5);
  --shadow-book: 3px 3px 15px rgba(0,0,0,0.4), 6px 6px 30px rgba(0,0,0,0.3);
  --shadow-book-hover: 6px 6px 20px rgba(0,0,0,0.5), 12px 12px 40px rgba(0,0,0,0.4);
  --noise-opacity: 0.035;
  --header-bg: rgba(15, 22, 41, 0.85);
  --search-bg: rgba(237, 233, 227, 0.04);
  --ph-bg: linear-gradient(145deg, #1f1d19, #262420);
  --ph-color: rgba(${accentRgb}, 0.3);
  --spine-color: rgba(237, 233, 227, 0.08);
  --toggle-bg: rgba(237, 233, 227, 0.08);
  color-scheme: dark;
}
` : themePreset === 'dark-luxe' ? `
/* Dark Luxe - Premium Minimal */
:root, [data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #fdfdfd;
  --bg-card: #ffffff;
  --bg-card-hover: #fafafa;
  --bg-hero: #f8f8f8;
  --text-primary: #000000;
  --text-secondary: #444444;
  --text-tertiary: #888888;
  --accent: ${accentColor};
  --accent-hover: ${accentColor};
  --accent-subtle: rgba(${accentRgb}, 0.05);
  --accent-glow: rgba(${accentRgb}, 0.1);
  --border: rgba(0,0,0,0.05);
  --border-strong: rgba(0,0,0,0.12);
  --shadow-card: 0 2px 10px rgba(0,0,0,0.03);
  --shadow-card-hover: 0 10px 30px rgba(0,0,0,0.08);
  --shadow-book: 5px 10px 25px rgba(0,0,0,0.1);
  --shadow-book-hover: 10px 20px 45px rgba(0,0,0,0.15);
  --noise-opacity: 0;
  --header-bg: rgba(255, 255, 255, 0.9);
  --search-bg: rgba(0,0,0,0.02);
  --ph-bg: #f5f5f5;
  --ph-color: #ddd;
  --spine-color: rgba(0,0,0,0.04);
  --toggle-bg: #f0f0f0;
  color-scheme: light;
}
[data-theme="dark"] {
  --bg-primary: #0a0a0a;
  --bg-secondary: #111111;
  --bg-card: #1a1a1a;
  --bg-card-hover: #222222;
  --bg-hero: #050505;
  --text-primary: #ede9e3;
  --text-secondary: #a39d94;
  --text-tertiary: #6b655c;
  --accent: ${accentColor};
  --accent-hover: ${accentColor};
  --accent-subtle: rgba(${accentRgb}, 0.12);
  --accent-glow: rgba(${accentRgb}, 0.2);
  --border: rgba(237, 233, 227, 0.08);
  --border-strong: rgba(237, 233, 227, 0.16);
  --shadow-card: 0 1px 3px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4);
  --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.4), 0 24px 48px rgba(0,0,0,0.5);
  --shadow-book: 3px 3px 15px rgba(0,0,0,0.4), 6px 6px 30px rgba(0,0,0,0.3);
  --shadow-book-hover: 6px 6px 20px rgba(0,0,0,0.5), 12px 12px 40px rgba(0,0,0,0.4);
  --noise-opacity: 0.035;
  --header-bg: rgba(5, 5, 5, 0.85);
  --search-bg: rgba(237, 233, 227, 0.04);
  --ph-bg: linear-gradient(145deg, #1f1d19, #262420);
  --ph-color: rgba(${accentRgb}, 0.3);
  --spine-color: rgba(237, 233, 227, 0.08);
  --toggle-bg: rgba(237, 233, 227, 0.08);
  color-scheme: dark;
}
` : themePreset === 'minimal' ? `
/* Minimal - Clean Modern */
:root, [data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-card: #ffffff;
  --bg-card-hover: #fafafa;
  --bg-hero: #fafafa;
  --text-primary: #111111;
  --text-secondary: #555555;
  --text-tertiary: #999999;
  --accent: ${accentColor};
  --accent-hover: ${accentColor};
  --accent-subtle: rgba(${accentRgb}, 0.06);
  --accent-glow: rgba(${accentRgb}, 0.1);
  --border: rgba(0, 0, 0, 0.06);
  --border-strong: rgba(0, 0, 0, 0.12);
  --shadow-card: 0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06);
  --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.08), 0 20px 40px rgba(0,0,0,0.1);
  --shadow-book: 2px 2px 10px rgba(0,0,0,0.08), 4px 4px 24px rgba(0,0,0,0.06);
  --shadow-book-hover: 4px 4px 16px rgba(0,0,0,0.1), 8px 8px 32px rgba(0,0,0,0.08);
  --noise-opacity: 0;
  --header-bg: rgba(255,255,255,0.9);
  --search-bg: rgba(0,0,0,0.03);
  --ph-bg: linear-gradient(145deg, #f8f8f8, #efefef);
  --ph-color: rgba(0,0,0,0.1);
  --spine-color: rgba(0,0,0,0.06);
  --toggle-bg: rgba(0,0,0,0.04);
  color-scheme: light;
}
[data-theme="dark"] {
  --bg-primary: #0a0a0a;
  --bg-secondary: #141414;
  --bg-card: #1a1a1a;
  --bg-card-hover: #222222;
  --bg-hero: #080808;
  --text-primary: #ffffff;
  --text-secondary: #a0a0a0;
  --text-tertiary: #606060;
  --accent: ${accentColor};
  --accent-hover: ${accentColor};
  --accent-subtle: rgba(${accentRgb}, 0.1);
  --accent-glow: rgba(${accentRgb}, 0.15);
  --border: rgba(255, 255, 255, 0.08);
  --border-strong: rgba(255, 255, 255, 0.15);
  --shadow-card: 0 4px 20px rgba(0,0,0,0.4);
  --shadow-card-hover: 0 8px 32px rgba(0,0,0,0.6);
  --shadow-book: 4px 8px 24px rgba(0,0,0,0.3);
  --shadow-book-hover: 8px 16px 40px rgba(0,0,0,0.5);
  --noise-opacity: 0.02;
  --header-bg: rgba(10, 10, 10, 0.9);
  --search-bg: rgba(255,255,255,0.03);
  --ph-bg: #1a1a1a;
  --ph-color: #333;
  --spine-color: rgba(255,255,255,0.05);
  --toggle-bg: #1f1f1f;
  color-scheme: dark;
}
` : `
/* Default preset */
:root, [data-theme="light"] {
  --bg-primary: #faf9f7;
  --bg-secondary: #f0eeeb;
  --bg-card: #ffffff;
  --bg-card-hover: #fefefe;
  --bg-hero: #f5f3f0;
  --text-primary: #1a1613;
  --text-secondary: #5c554d;
  --text-tertiary: #9c9489;
  --accent: ${accentColor};
  --accent-hover: ${accentColor};
  --accent-subtle: rgba(${accentRgb}, 0.06);
  --accent-glow: rgba(${accentRgb}, 0.12);
  --border: rgba(26, 22, 19, 0.08);
  --border-strong: rgba(26, 22, 19, 0.15);
  --shadow-card: 0 1px 3px rgba(26, 22, 19, 0.04), 0 8px 24px rgba(26, 22, 19, 0.06);
  --shadow-card-hover: 0 4px 12px rgba(26, 22, 19, 0.06), 0 24px 48px rgba(26, 22, 19, 0.12);
  --shadow-book: 3px 3px 15px rgba(26, 22, 19, 0.12), 6px 6px 30px rgba(26, 22, 19, 0.08);
  --shadow-book-hover: 6px 6px 20px rgba(26, 22, 19, 0.15), 12px 12px 40px rgba(26, 22, 19, 0.12);
  --noise-opacity: 0.012;
  --header-bg: rgba(250, 249, 247, 0.82);
  --search-bg: rgba(26, 22, 19, 0.03);
  --ph-bg: linear-gradient(145deg, #f5f0eb, #ebe5dd);
  --ph-color: rgba(196, 93, 62, 0.2);
  --spine-color: rgba(26, 22, 19, 0.08);
  --toggle-bg: rgba(26, 22, 19, 0.06);
  color-scheme: light;
}
[data-theme="dark"] {
  --bg-primary: #0e0d0b;
  --bg-secondary: #1a1815;
  --bg-card: #1f1d19;
  --bg-card-hover: #262420;
  --bg-hero: #141210;
  --text-primary: #ede9e3;
  --text-secondary: #a39d94;
  --text-tertiary: #6b655c;
  --accent: ${accentColor};
  --accent-hover: ${accentColor};
  --accent-subtle: rgba(${accentRgb}, 0.08);
  --accent-glow: rgba(${accentRgb}, 0.15);
  --border: rgba(237, 233, 227, 0.06);
  --border-strong: rgba(237, 233, 227, 0.12);
  --shadow-card: 0 1px 3px rgba(0,0,0,0.2), 0 8px 24px rgba(0,0,0,0.3);
  --shadow-card-hover: 0 4px 12px rgba(0,0,0,0.3), 0 24px 48px rgba(0,0,0,0.4);
  --shadow-book: 3px 3px 15px rgba(0,0,0,0.3), 6px 6px 30px rgba(0,0,0,0.2);
  --shadow-book-hover: 6px 6px 20px rgba(0,0,0,0.4), 12px 12px 40px rgba(0,0,0,0.3);
  --noise-opacity: 0.035;
  --header-bg: rgba(14, 13, 11, 0.82);
  --search-bg: rgba(237, 233, 227, 0.04);
  --ph-bg: linear-gradient(145deg, #1f1d19, #262420);
  --ph-color: rgba(${accentRgb}, 0.25);
  --spine-color: rgba(237, 233, 227, 0.06);
  --toggle-bg: rgba(237, 233, 227, 0.08);
  color-scheme: dark;
}
`}


/* ====== RESET & BASE ====== */
*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body {
  font-family: ${font.family};
  background: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
  line-height: 1.6;
  transition: background 0.3s ease, color 0.3s ease;
}

/* ====== NOISE OVERLAY ====== */
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: var(--noise-opacity);
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-repeat: repeat;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background: var(--header-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-bottom: 1px solid var(--border);
  transition: all 0.3s ease;
}

.site-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--text-primary);
  justify-self: start;
}
.site-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  background: var(--bg-secondary);
}
.site-title {
  font-family: ${font.heading};
  font-size: 20px;
  font-weight: 400;
  letter-spacing: -0.01em;
  white-space: nowrap;
}

/* Center Menu */
.nav-menu {
  display: flex;
  gap: 32px;
  align-items: center;
}
.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}
.nav-link:hover { color: var(--accent); }

/* Right Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-self: end;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 10px;
  background: var(--accent);
  color: #fff;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}
.login-btn:hover { background: var(--accent-hover); transform: translateY(-1px); }
.login-btn svg { width: 14px; height: 14px; }

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  border: none;
  background: var(--toggle-bg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.25s ease;
}
.theme-toggle:hover {
  background: var(--accent-subtle);
  color: var(--accent);
  transform: scale(1.05);
}
.theme-toggle svg { width: 18px; height: 18px; transition: transform 0.3s ease; }
.theme-toggle:hover svg { transform: rotate(15deg); }

.menu-trigger {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
}

/* Mobile Drawer */
.mobile-drawer {
  position: fixed;
  top: 0;
  right: -100%;
  width: 280px;
  height: 100%;
  background: var(--bg-primary);
  z-index: 2000;
  box-shadow: -10px 0 40px rgba(0,0,0,0.1);
  transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.mobile-drawer.active { right: 0; }
.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.drawer-close {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-tertiary);
  cursor: pointer;
}
.drawer-nav {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.drawer-link {
  text-decoration: none;
  color: var(--text-primary);
  font-size: 18px;
  font-weight: 600;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(4px);
  z-index: 1999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}
.drawer-overlay.active { opacity: 1; pointer-events: auto; }

@media (max-width: 768px) {
  .site-header {
    grid-template-columns: 1fr auto;
    padding: 0 16px;
  }
  .nav-menu { display: none; }
  .login-btn { display: none; }
  .login-icon-sm { display: flex !important; }
  .menu-trigger { display: flex; }
}

.login-icon-sm {
  display: none;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: var(--accent-subtle);
  color: var(--accent);
  text-decoration: none;
}

.icon-sun { display: none; }
.icon-moon { display: block; }
[data-theme="dark"] .icon-sun { display: block; }
[data-theme="dark"] .icon-moon { display: none; }

/* ====== HERO PARALLAX ====== */
.hero {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  padding: 80px 20px;
}
.hero-bg {
  position: absolute;
  inset: 0;
  z-index: -1;
  background-size: cover;
  background-position: center;
  transform: translateZ(0);
  background-color: var(--bg-hero);
}
.hero-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7));
}
.hero-no-img {
  background: var(--bg-hero);
}
.hero-no-img::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  background: var(--accent-glow);
  filter: blur(120px);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  padding: 0 20px;
  animation: revealUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
}
.hero-title {
  font-family: ${font.heading};
  font-size: clamp(42px, 6vw, 64px);
  font-weight: 400;
  line-height: 1.1;
  color: ${heroImage ? '#fff' : 'var(--text-primary)'};
  text-shadow: ${heroImage ? '0 2px 20px rgba(0,0,0,0.5)' : 'none'};
  margin-bottom: 16px;
}
.hero-caption {
  font-size: 18px;
  color: ${heroImage ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)'};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;
}

/* ====== CONTAINER ====== */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* ====== SEARCH BAR ====== */
.search-section {
  padding: 32px 0 0;
  display: flex;
  justify-content: center;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  background: var(--search-bg);
  border: 1px solid var(--border);
  border-radius: 100px;
  transition: border-color 0.25s, box-shadow 0.25s;
  width: 100%;
  max-width: 420px;
}
.search-bar:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-subtle);
}
.search-bar svg {
  width: 18px;
  height: 18px;
  color: var(--text-tertiary);
  flex-shrink: 0;
}
.search-bar input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: ${font.family};
  font-size: 15px;
  color: var(--text-primary);
  min-width: 0;
}
.search-bar input::placeholder { color: var(--text-tertiary); }

/* ====== BOOK GRID ====== */
.grid-section {
  padding: 60px 0 100px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 40px;
  justify-content: center;
}
@media (min-width: 600px) {
  .grid {
    grid-template-columns: repeat(auto-fit, minmax(240px, 300px));
    justify-content: center;
  }
}

/* ====== 3D BOOK CARD ====== */
.bk-card {
  display: block;
  text-decoration: none;
  color: inherit;
  opacity: 0;
  animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  transition: transform 0.3s;
}
.bk-card:hover { transform: translateY(-4px); }

.bk-3d {
  position: relative;
  padding-bottom: 145%;
  perspective: 900px;
  margin-bottom: 20px;
}

.bk-cover {
  position: absolute;
  inset: 0;
  border-radius: 2px 10px 10px 2px;
  overflow: hidden;
  background: var(--bg-card);
  box-shadow: var(--shadow-book);
  transform: rotateY(-3deg);
  transform-origin: left center;
  transition: transform 0.45s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.45s ease;
}
.bk-card:hover .bk-cover {
  transform: rotateY(-8deg) scale(1.02);
  box-shadow: var(--shadow-book-hover);
}

.bk-cover img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; background: var(--bg-card); }

.bk-spine {
  position: absolute;
  left: 0;
  top: 3%;
  bottom: 3%;
  width: 5px;
  background: linear-gradient(to right, var(--spine-color), transparent);
  border-radius: 1px 0 0 1px;
  z-index: 2;
  pointer-events: none;
}

.bk-ph {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ph-bg);
}
.bk-ph-letter {
  font-family: ${font.heading};
  font-size: 72px;
  font-style: italic;
  color: var(--ph-color);
}

.bk-info { padding: 0 4px; text-align: center; }
.bk-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: var(--text-primary);
  transition: color 0.2s;
}
.bk-card:hover .bk-title { color: var(--accent); }

.bk-meta {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--text-tertiary);
}
.bk-views { display: inline-flex; align-items: center; gap: 4px; }
.bk-views svg { width: 13px; height: 13px; }
.bk-type {
  border: 1px solid var(--border-strong);
  padding: 1px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ====== EMPTY STATE ====== */
.empty-state {
  text-align: center;
  padding: 120px 20px;
}
.empty-state svg {
  width: 64px;
  height: 64px;
  color: var(--text-tertiary);
  opacity: 0.25;
  margin-bottom: 24px;
}
.empty-state h2 {
  font-family: ${font.heading};
  font-size: 28px;
  font-weight: 400;
  font-style: italic;
  color: var(--text-secondary);
  margin-bottom: 8px;
}
.empty-state p { font-size: 15px; color: var(--text-tertiary); }

/* ====== ANNOUNCEMENT BANNER ====== */
.ann-banner {
  position: relative;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 10px 48px 10px 20px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  background: ${bannerColor};
  color: #fff;
  line-height: 1.5;
}
.ann-banner a { color: #fff; text-decoration: underline; text-underline-offset: 2px; }
.ann-close {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255,255,255,0.8);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 4px;
  transition: color 0.2s;
}
.ann-close:hover { color: #fff; }

/* ====== HERO CTA BUTTON ====== */
.hero-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 28px;
  padding: 14px 32px;
  background: var(--accent);
  color: #fff;
  border-radius: 100px;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.01em;
  transition: transform 0.25s ease, box-shadow 0.25s ease, opacity 0.2s;
  box-shadow: 0 4px 20px rgba(${accentRgb}, 0.4);
}
.hero-cta:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 32px rgba(${accentRgb}, 0.55);
}
.hero-cta svg { width: 16px; height: 16px; }

/* ====== SOCIAL LINKS ====== */
.social-links {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
}
.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--toggle-bg);
  color: var(--text-secondary);
  text-decoration: none;
  transition: all 0.25s ease;
  border: 1px solid var(--border);
}
.social-link:hover {
  background: var(--accent-subtle);
  color: var(--accent);
  border-color: var(--accent);
  transform: translateY(-2px);
}
.social-link svg { width: 18px; height: 18px; }

/* ====== SECTION HEADING ====== */
.section-heading {
  text-align: center;
  margin-bottom: 40px;
}
.section-heading h2 {
  font-family: ${font.heading};
  font-size: clamp(26px, 3vw, 36px);
  font-weight: 400;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}
.section-heading-divider {
  width: 40px;
  height: 2px;
  background: var(--accent);
  margin: 12px auto 0;
  border-radius: 2px;
}

/* ====== BOOK DATE ====== */
.bk-date { font-size: 11px; color: var(--text-tertiary); }

.category-filters { display:flex; gap:10px; margin-bottom: 24px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
.category-filters::-webkit-scrollbar { display: none; }
.category-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid var(--border); background: var(--bg2); color: var(--text-secondary); cursor: pointer; white-space: nowrap; transition: all 0.2s; font-size: 13px; font-weight: 500; }
.category-btn:hover { background: var(--border); color: var(--text); }
.category-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

/* ====== HERO ====== */
.site-footer {
  border-top: 1px solid var(--border);
  padding: 60px 20px;
  background: var(--bg-secondary);
  text-align: center;
}
.footer-inner {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
}
.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 600;
}
.footer-logo {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--bg-card);
  object-fit: cover;
}
.footer-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  justify-content: center;
}
.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.2s;
}
.footer-links a:hover { color: var(--accent); }
.footer-copy {
  font-size: 13px;
  color: var(--text-tertiary);
}

/* ====== ANIMATIONS ====== */
@keyframes revealUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideBanner { from { opacity: 0; transform: translateY(-100%); } to { opacity: 1; transform: translateY(0); } }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
}

/* ====== RESPONSIVE ====== */
@media (max-width: 639px) {
  .grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .bk-3d { perspective: 600px; }
  .site-header { padding: 0 16px; }
  .ann-banner { font-size: 13px; }
}
/* ====== LAYOUT & CARD OVERRIDES ====== */
${gridCSS}
${cardCSS}
/* ====== HERO SIZE OVERRIDE ====== */
${heroSizeCSS}
/* ====== BACKGROUND PATTERN ====== */
${bgPatternCSS}
/* ====== CORNER RADIUS OVERRIDE ====== */
${cornerRadiusCSS}
</style>
</head>
<body>

${bannerText ? `<div class="ann-banner" id="ann-banner" style="animation:slideBanner 0.4s ease both">
  ${bannerLink ? `<a href="${esc(bannerLink)}" target="_blank" rel="noopener">${esc(bannerText)}</a>` : esc(bannerText)}
  <button class="ann-close" onclick="document.getElementById('ann-banner').remove()" aria-label="Dismiss">&#x2715;</button>
</div>` : ''}

<header class="site-header">
  <div class="site-brand">
    <a href="${landingUrl}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;">
      ${user.store_logo_url ? `<img src="${esc(user.store_logo_url)}" class="site-logo" alt="">` : ''}
      <span class="site-title">${safeName}</span>
    </a>
  </div>

  <nav class="nav-menu">
    ${navData.hasProducts ? `<a href="${productsUrl}" class="nav-link">Home</a>` : ''}
    ${navData.hasGallery ? `<a href="${homeUrl}" class="nav-link">Gallery</a>` : ''}
    ${settings.about_us_content ? `<a href="${aboutUrl}" class="nav-link">About Us</a>` : ''}
    <a href="${contactUrl}" class="nav-link">Contact Us</a>
  </nav>

  <div class="header-actions">
    <a href="${cartUrl}" class="cart-icon-btn" title="Cart" style="position:relative; display:flex; align-items:center; justify-content:center; width:38px; height:38px; color:var(--text-secondary); transition:color 0.2s;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <span class="cart-badge" id="cart-badge-desk" style="position:absolute; top:2px; right:-2px; background:var(--accent); color:#fff; font-size:10px; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; outline:2px solid var(--header-bg); display:none;">0</span>
    </a>
    <a href="${loginUrl}" class="login-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;margin-right:6px;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Login
    </a>
    <a href="${loginUrl}" class="login-icon-sm" title="Login">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </a>
    <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme" title="Toggle theme">
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>
    <button class="menu-trigger" id="menu-trigger" aria-label="Menu">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
  </div>
</header>

<div class="drawer-overlay" id="drawer-overlay"></div>
<div class="mobile-drawer" id="mobile-drawer">
  <div class="drawer-header">
    <div class="site-brand">
      <a href="${landingUrl}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;">
        ${user.store_logo_url ? `<img src="${esc(user.store_logo_url)}" class="site-logo" alt="">` : ''}
        <span class="site-title">${safeName}</span>
      </a>
    </div>
    <button class="drawer-close" id="drawer-close">&times;</button>
  </div>
  <nav class="drawer-nav">
    ${navData.hasProducts ? `<a href="${productsUrl}" class="drawer-link">Home</a>` : ''}
    ${navData.hasGallery ? `<a href="${homeUrl}" class="drawer-link">Gallery</a>` : ''}
    ${settings.about_us_content ? `<a href="${aboutUrl}" class="drawer-link">About Us</a>` : ''}
    <a href="${contactUrl}" class="drawer-link">Contact Us</a>
  </nav>
</div>
${settings.hide_hero ? '' : `
<section class="hero ${!heroImage ? 'hero-no-img' : ''}">
  ${heroImage ? `<div class="hero-bg" style="background-image: url('${esc(heroImage)}')"></div>` : ''}
  <div class="hero-content">
    <h1 class="hero-title">${esc(heroTitle)}</h1>
    <p class="hero-caption">${esc(heroCaption)}</p>
    ${ctaText && ctaLink ? `<a href="${esc(ctaLink)}" class="hero-cta" target="_blank" rel="noopener">${esc(ctaText)}<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>` : ''}
  </div>
</section>
`}

<div class="container">
  ${showSearch ? `<div class="search-section">
    <div class="search-bar">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      <input type="text" id="book-search" placeholder="Search ${bookCount} publications..." autocomplete="off">
    </div>
  </div>` : ''}
  
  ${uniqueCategories.length > 0 ? `
    <div class="category-filters">
      ${uniqueCategories.map(cat => `<button class="category-btn" data-category="${esc(cat.toLowerCase())}">${esc(cat)}</button>`).join('')}
    </div>
  ` : ''}

  ${bookCount > 0
    ? `<div class="grid-section">${sectionHeading ? `<div class="section-heading"><h2>${esc(sectionHeading)}</h2><div class="section-heading-divider"></div></div>` : ''}<div class="grid" id="book-grid">${bookCards}</div></div>`
    : `<div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        <h2>Nothing here yet</h2>
        <p>This library is waiting for its first publication.</p>
      </div>`}
</div>

<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <a href="${homeUrl}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;">
        ${user.store_logo_url ? `<img src="${esc(user.store_logo_url)}" class="footer-logo" alt="">` : ''}
        <span>${safeName}</span>
      </a>
    </div>
    ${hasSocials ? `<div class="social-links">
      ${socialInstagram ? `<a href="${esc(socialInstagram)}" class="social-link" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>` : ''}
      ${socialX ? `<a href="${esc(socialX)}" class="social-link" target="_blank" rel="noopener" aria-label="X / Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>` : ''}
      ${socialYoutube ? `<a href="${esc(socialYoutube)}" class="social-link" target="_blank" rel="noopener" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg></a>` : ''}
      ${socialWebsite ? `<a href="${esc(socialWebsite)}" class="social-link" target="_blank" rel="noopener" aria-label="Website"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>` : ''}
    </div>` : ''}
    <div class="footer-links">
      ${(settings.copyright_content || settings.contact_info_content) ? `<a href="${copyrightUrl}">Copyrights</a>` : ''}
      ${settings.privacy_policy_content ? `<a href="${privacyUrl}">Privacy Policy</a>` : ''}
      ${settings.terms_content ? `<a href="${termsUrl}">Terms & Conditions</a>` : ''}
    </div>
    <div class="footer-copy">
      &copy; ${new Date().getFullYear()} ${safeName}. All rights reserved.
    </div>
  </div>
</footer>

<script>
document.getElementById('theme-toggle').onclick=function(){var h=document.documentElement;var d=h.getAttribute('data-theme')==='dark';h.setAttribute('data-theme',d?'light':'dark');localStorage.setItem('shopublish-theme',d?'light':'dark')};

// Mobile drawer toggle
(function(){
  var trigger = document.getElementById('menu-trigger');
  var drawer = document.getElementById('mobile-drawer');
  var overlay = document.getElementById('drawer-overlay');
  var close = document.getElementById('drawer-close');

  function toggle(open) {
    drawer.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if(trigger) trigger.onclick = function() { toggle(true); };
  if(close) close.onclick = function() { toggle(false); };
  if(overlay) overlay.onclick = function() { toggle(false); };
})();

// Simple parallax
window.addEventListener('scroll', function() {
  var scrolled = window.scrollY;
  var bg = document.querySelector('.hero-bg');
  if(bg) {
    bg.style.transform = 'translateY(' + (scrolled * 0.4) + 'px)';
  }
});

${showSearch || uniqueCategories.length > 0 ? `(function(){
  var input=document.getElementById('book-search');
  var catBtns=document.querySelectorAll('.category-btn');
  var cards=document.querySelectorAll('.bk-card');
  var activeCat='';
  function filterCards() {
    var q = input ? input.value.toLowerCase().trim() : '';
    for(var i=0;i<cards.length;i++){
      var title=cards[i].getAttribute('data-title')||'';
      var cats=cards[i].getAttribute('data-categories')||'';
      var matchQ = !q || title.indexOf(q)!==-1 || cats.indexOf(q)!==-1;
      var matchCat = !activeCat || cats.split(',').indexOf(activeCat)!==-1;
      cards[i].style.display = (matchQ && matchCat) ? '' : 'none';
      if(matchQ && matchCat) {
        cards[i].style.animation = 'none'; // Fix animation on refilter
        cards[i].style.opacity = '1';
      }
    }
  }
  if(input) input.oninput=filterCards;
  catBtns.forEach(function(btn){
    btn.onclick = function() {
      if(this.classList.contains('active')) {
        this.classList.remove('active');
        activeCat = '';
      } else {
        catBtns.forEach(function(b){b.classList.remove('active')});
        this.classList.add('active');
        activeCat = this.getAttribute('data-category');
      }
      filterCards();
    };
  });
  });
})();` : ''}

// Reviews logic
window.openProductReviews = function(bookId, title) {
  var modal = document.getElementById('reviews-modal');
  var header = document.getElementById('reviews-title');
  var list = document.getElementById('reviews-list');
  var bookIdInput = document.getElementById('review-book-id');
  
  if(modal && header && list && bookIdInput) {
    header.innerText = 'Reviews for ' + title;
    bookIdInput.value = bookId;
    list.innerHTML = '<div style="text-align:center;padding:20px;opacity:0.5;">Loading reviews...</div>';
    
    // reset form
    document.getElementById('review-form').reset();
    document.getElementById('review-form-container').style.display = 'none';
    
    // open
    modal.style.display = 'flex';
    
    // fetch
    fetch('/read/api/reviews/' + bookId)
      .then(r => r.json())
      .then(data => {
        if(!data || data.length === 0) {
          list.innerHTML = '<div style="text-align:center;padding:20px;opacity:0.5;">No reviews yet. Be the first!</div>';
        } else {
          list.innerHTML = data.map(r => {
            let mediaHtml = '';
            if (r.media_key) {
               const mediaUrl = '/read/api/reviews/media/' + r.id + '/' + r.media_key.split('/').pop();
               if (r.media_type && r.media_type.startsWith('video/')) {
                  mediaHtml = '<video src="' + mediaUrl + '" controls style="max-width:100%; max-height:200px; border-radius:8px; margin-top:10px;"></video>';
               } else {
                  mediaHtml = '<img src="' + mediaUrl + '" style="max-width:100%; max-height:200px; border-radius:8px; margin-top:10px; object-fit:cover;">';
               }
            }
            return '<div style="padding:12px 0; border-bottom:1px solid var(--border);"><div style="display:flex; justify-content:space-between; margin-bottom:4px;"><strong>' + escHtml(r.user_name) + '</strong><span style="color:#f59e0b">' + '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating) + '</span></div><div style="font-size:13px; color:var(--text-secondary);">' + escHtml(r.review_text) + '</div>' + mediaHtml + '</div>';
          }).join('');
        }
      })
      .catch(e => {
        list.innerHTML = '<div style="text-align:center;padding:20px;opacity:0.5;">Failed to load reviews.</div>';
      });
  }
};

window.closeProductReviews = function() {
  var modal = document.getElementById('reviews-modal');
  if(modal) modal.style.display = 'none';
};

window.showReviewForm = function() {
  document.getElementById('review-form-container').style.display = 'block';
};

window.submitReview = function(e) {
  e.preventDefault();
  var bookId = document.getElementById('review-book-id').value;
  var name = document.getElementById('review-name').value;
  var rating = document.querySelector('input[name="rating"]:checked');
  var text = document.getElementById('review-text').value;
  var mediaInput = document.getElementById('review-media');
  
  if(!name || !rating) return alert('Please provide a name and rating.');
  
  var btn = document.getElementById('submit-review-btn');
  btn.disabled = true;
  btn.innerText = 'Submitting...';
  
  var formData = new FormData();
  formData.append('user_name', name);
  formData.append('rating', rating.value);
  formData.append('review_text', text);
  if (mediaInput && mediaInput.files && mediaInput.files[0]) {
    formData.append('media', mediaInput.files[0]);
  }
  
  fetch('/read/api/reviews/' + bookId, {
    method: 'POST',
    body: formData
  }).then(r => r.json()).then(res => {
    btn.disabled = false;
    btn.innerText = 'Submit Review';
    if(res.success) {
      document.getElementById('review-form-container').style.display = 'none';
      window.openProductReviews(bookId, document.getElementById('reviews-title').innerText.replace('Reviews for ', ''));
    } else {
      alert('Error: ' + res.error);
    }
  }).catch(e => {
    btn.disabled = false;
    btn.innerText = 'Submit Review';
    alert('Failed to submit.');
  });
};

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
</script>

<!-- Reviews Modal HTML -->
<div id="reviews-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9999; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px);">
  <div style="background:var(--bg-surface); color:var(--text-primary); border-radius:12px; width:100%; max-width:500px; max-height:85vh; display:flex; flex-direction:column; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
    <div style="padding:20px; border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
      <h3 id="reviews-title" style="margin:0; font-size:18px; font-weight:700;">Reviews</h3>
      <button onclick="window.closeProductReviews()" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:20px; line-height:1;">&times;</button>
    </div>
    <div style="padding:20px; overflow-y:auto; flex:1;" id="reviews-list">
    </div>
    <div style="padding:20px; border-top:1px solid var(--border); background:var(--bg-elevated); border-bottom-left-radius:12px; border-bottom-right-radius:12px;">
      <button onclick="window.showReviewForm()" style="width:100%; padding:10px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer; font-weight:600;">Write a Review</button>
      
      <div id="review-form-container" style="display:none; margin-top:20px;">
        <form id="review-form" onsubmit="window.submitReview(event)">
          <input type="hidden" id="review-book-id">
          <div style="margin-bottom:12px;">
            <label style="display:block; margin-bottom:4px; font-size:12px; font-weight:600; color:var(--text-secondary);">Your Name</label>
            <input type="text" id="review-name" required style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px; background:var(--bg-default); color:var(--text-primary);">
          </div>
          <div style="margin-bottom:12px;">
            <label style="display:block; margin-bottom:4px; font-size:12px; font-weight:600; color:var(--text-secondary);">Rating</label>
            <div style="display:flex; gap:10px; font-size:18px; color:#f59e0b;" class="rating-stars-input">
              <label><input type="radio" name="rating" value="1" required style="display:none">★</label>
              <label><input type="radio" name="rating" value="2" style="display:none">★</label>
              <label><input type="radio" name="rating" value="3" style="display:none">★</label>
              <label><input type="radio" name="rating" value="4" style="display:none">★</label>
              <label><input type="radio" name="rating" value="5" style="display:none">★</label>
            </div>
            <style>
              .rating-stars-input label { cursor:pointer; filter:grayscale(1); opacity:0.4; transition:0.2s; }
              .rating-stars-input label:hover,
              .rating-stars-input label:has(input:checked),
              .rating-stars-input:has(label:hover) label:has(~ label:hover),
              .rating-stars-input label:has(~ label input:checked) { filter:grayscale(0); opacity:1; }
            </style>
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block; margin-bottom:4px; font-size:12px; font-weight:600; color:var(--text-secondary);">Review</label>
            <textarea id="review-text" rows="3" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px; background:var(--bg-default); color:var(--text-primary); resize:vertical;"></textarea>
          </div>
          <div style="margin-bottom:16px;">
            <label style="display:block; margin-bottom:4px; font-size:12px; font-weight:600; color:var(--text-secondary);">Attach Image or Video (Optional)</label>
            <input type="file" id="review-media" accept="image/*,video/*" style="width:100%; padding:8px; border:1px solid var(--border); border-radius:4px; background:var(--bg-default); color:var(--text-primary); font-size: 13px;">
          </div>
          <button type="submit" id="submit-review-btn" style="width:100%; padding:10px; background:var(--accent); color:white; border:none; border-radius:6px; cursor:pointer; font-weight:600;">Submit Review</button>
        </form>
      </div>
    </div>
  </div>
</div>
</body></html>`;
}

export function contentPage(user: User, title: string, content: string, appUrl: string, isCustomDomain = false, navData = {hasProducts:true, hasGallery:true}): string {
  const storeName = user.store_name || user.name;
  const settings = JSON.parse(user.store_settings || '{}');
  const accentColor = settings.accent_color || '#c45d3e';
  const htmlContent = mdToHtml(content);

  // Social links for footer
  const socialInstagram = settings.social_instagram || '';
  const socialX = settings.social_x || '';
  const socialYoutube = settings.social_youtube || '';
  const socialWebsite = settings.social_website || '';
  const hasSocials = socialInstagram || socialX || socialYoutube || socialWebsite;

  // Navigation Links
  const storeHandle = user.store_handle || user.name.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const homeUrl = isCustomDomain ? '/' : `/store/${storeHandle}`;
  const galleryUrl = isCustomDomain ? '/gallery' : `/store/${storeHandle}/gallery`;
  const aboutUrl = isCustomDomain ? '/about' : `/store/${storeHandle}/about`;
  const contactUrl = isCustomDomain ? '/contact' : `/store/${storeHandle}/contact`;
  const copyrightUrl = isCustomDomain ? '/copyright' : `/store/${storeHandle}/copyright`;
  const loginUrl = isCustomDomain ? '/login' : `/store/${storeHandle}/login`;
  const privacyUrl = isCustomDomain ? '/privacy' : `/store/${storeHandle}/privacy`;
  const termsUrl = isCustomDomain ? '/terms' : `/store/${storeHandle}/terms`;
  const productsUrl = isCustomDomain ? '/products' : `/store/${storeHandle}/products`;
  const cartUrl = isCustomDomain ? '/cart' : `/store/${storeHandle}/cart`;
  
  let landingUrl = productsUrl;
  if (!navData.hasProducts && navData.hasGallery) landingUrl = homeUrl;
  if (!navData.hasProducts && !navData.hasGallery) landingUrl = contactUrl;

  const backUrl = landingUrl;

  let extraHtml = '';
  if (title === 'Contact Us') {
    extraHtml = `
      <div class="contact-form-container">
        <form id="contact-form" class="contact-form">
          <div class="form-grid">
            <div class="form-group">
              <label for="c-name">Name</label>
              <input type="text" id="c-name" name="name" placeholder="Your Name" required>
            </div>
            <div class="form-group">
              <label for="c-email">Email</label>
              <input type="email" id="c-email" name="email" placeholder="Email Address" required>
            </div>
          </div>
          <div class="form-group">
            <label for="c-mobile">Mobile (Optional)</label>
            <input type="tel" id="c-mobile" name="mobile" placeholder="Mobile Number">
          </div>
          <div class="form-group">
            <label for="c-message">Message</label>
            <textarea id="c-message" name="message" rows="5" placeholder="How can we help?" required></textarea>
          </div>
          <div id="form-msg" class="form-msg"></div>
          <button type="submit" class="submit-btn" id="sbtn">Send Message</button>
        </form>
      </div>
      <style>
        .contact-form-container { margin-top: 40px; padding-top: 40px; border-top: 1px solid var(--border); }
        .contact-form { display: grid; gap: 20px; max-width: 600px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        @media(max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
        .form-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text2); }
        .form-group input, .form-group textarea {
          width: 100%; padding: 12px 16px; border-radius: 12px; border: 1.5px solid var(--border);
          background: var(--bg2); color: var(--text); font-family: inherit; transition: all 0.2s;
        }
        .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--accent); background: var(--bg); }
        .submit-btn {
          background: var(--accent); color: white; border: none; padding: 14px 28px; border-radius: 14px;
          font-weight: 700; cursor: pointer; transition: transform 0.2s, opacity 0.2s; width: fit-content;
        }
        .submit-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        .form-msg { font-size: 14px; padding: 12px; border-radius: 10px; display: none; margin-bottom: 10px; }
        .form-msg.success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.2); }
        .form-msg.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.2); }
      </style>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${esc(title)} — ${esc(storeName)}</title>
<link rel="icon" type="image/png" href="${user.store_logo_url || '/logo.png'}">
<link rel="apple-touch-icon" href="${user.store_logo_url || '/logo.png'}">
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<script>
(function(){var t=localStorage.getItem('shopublish-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.setAttribute('data-theme','dark')}else{document.documentElement.setAttribute('data-theme','light')}})();
</script>
<style>
:root, [data-theme="light"] {
  --bg: #faf9f7; --bg2: #f0eeeb; --text: #1a1613; --text2: #5c554d; --border: rgba(26,22,19,0.08);
  --accent: ${accentColor}; --header-bg: rgba(250,249,247,0.88); color-scheme: light;
}
[data-theme="dark"] {
  --bg: #0e0d0b; --bg2: #1a1815; --text: #ede9e3; --text2: #a39d94; --border: rgba(237,233,227,0.06);
  --accent: ${accentColor}; --header-bg: rgba(14,13,11,0.88); color-scheme: dark;
}
@media(prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0e0d0b;--bg2:#1a1815;--text:#ede9e3;--text2:#a39d94;--border:rgba(237,233,227,0.06);--accent:${accentColor};--header-bg:rgba(14,13,11,0.88);color-scheme:dark}}
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  html{scroll-behavior:smooth;-webkit-font-smoothing:antialiased}
  body{font-family:'DM Sans',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.7;min-height:100vh;}

  .site-header {
    position: sticky; top: 0; z-index: 1000;
    display: grid; grid-template-columns: 1fr auto 1fr;
    align-items: center; padding: 0 24px; height: 60px;
    background: var(--header-bg); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid var(--border);
  }
  .site-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text); justify-self: start; }
  .site-logo { width: 28px; height: 28px; border-radius: 8px; object-fit: cover; }
  .site-title { font-family: 'Instrument Serif', serif; font-size: 18px; font-weight: 400; }

  .nav-menu { display: flex; gap: 24px; align-items: center; }
  .nav-link { text-decoration: none; color: var(--text2); font-size: 14px; font-weight: 500; transition: color 0.2s; }
  .nav-link:hover { color: var(--accent); }

  .header-actions { display: flex; align-items: center; gap: 12px; justify-self: end; }
  .login-btn {
    display: flex; align-items: center; gap: 8px; padding: 6px 14px;
    border-radius: 8px; background: var(--accent); color: #fff;
    text-decoration: none; font-size: 13px; font-weight: 600;
  }
  .login-btn svg { width: 14px; height: 14px; }
  .theme-toggle {
    display: flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid var(--border); background: transparent;
    color: var(--text2); cursor: pointer; transition: all 0.2s;
  }
  .theme-toggle:hover { background: var(--border); color: var(--text); }
  .icon-sun { display: none; } .icon-moon { display: block; }
  [data-theme="dark"] .icon-sun { display: block; } [data-theme="dark"] .icon-moon { display: none; }

  .menu-trigger {
    display: none; align-items: center; justify-content: center;
    width: 36px; height: 36px; background: none; border: none;
    color: var(--text); cursor: pointer;
  }

  .mobile-drawer {
    position: fixed; top: 0; right: -100%; width: 280px; height: 100%;
    background: var(--bg); z-index: 2000; box-shadow: -10px 0 40px rgba(0,0,0,0.1);
    transition: right 0.3s cubic-bezier(0.16, 1, 0.3, 1); padding: 24px;
    display: flex; flex-direction: column; gap: 32px;
  }
  .mobile-drawer.active { right: 0; }
  .drawer-header { display: flex; justify-content: space-between; align-items: center; }
  .drawer-close { background: none; border: none; font-size: 24px; color: var(--text2); cursor: pointer; }
  .drawer-nav { display: flex; flex-direction: column; gap: 16px; }
  .drawer-link { text-decoration: none; color: var(--text); font-size: 18px; font-weight: 600; padding: 12px 0; border-bottom: 1px solid var(--border); }
  .drawer-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
    z-index: 1999; opacity: 0; pointer-events: none; transition: opacity 0.3s;
  }
  .drawer-overlay.active { opacity: 1; pointer-events: auto; }

  @media (max-width: 768px) {
    .site-header { grid-template-columns: 1fr auto; padding: 0 16px; }
    .nav-menu, .login-btn { display: none; }
    .login-icon-sm { display: flex !important; }
    .menu-trigger { display: flex; }
  }

  .login-icon-sm {
    display: none; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 10px;
    border: 1px solid var(--border); color: var(--accent); text-decoration: none;
  }

  .page-wrap{max-width:720px;margin:0 auto;padding:60px 24px 100px}
  .back-link{display:inline-flex;align-items:center;gap:6px;margin-bottom:40px;color:var(--text2);text-decoration:none;font-size:14px;font-weight:500;transition:color 0.2s}
  .back-link:hover{color:var(--accent)}
  .page-title{font-family:'Instrument Serif',serif;font-size:clamp(32px,5vw,48px);font-weight:400;line-height:1.15;margin-bottom:8px;letter-spacing:-0.02em}
  .page-meta{font-size:14px;color:var(--text2);margin-bottom:48px;padding-bottom:24px;border-bottom:1px solid var(--border)}
  .md-content h1,.md-content h2,.md-content h3,.md-content h4{font-family:'Instrument Serif',serif;font-weight:400;line-height:1.3;margin:1.8em 0 0.6em;color:var(--text)}
  .md-content h1{font-size:2em}.md-content h2{font-size:1.5em}.md-content h3{font-size:1.2em}.md-content h4{font-size:1.05em}
  .md-content p{margin:0 0 1.2em;color:var(--text)}
  .md-content strong{font-weight:700}
  .md-content em{font-style:italic}
  .md-content a{color:var(--accent);text-decoration:underline;text-underline-offset:2px}
  .md-content hr{border:none;border-top:1px solid var(--border);margin:2em 0}
  .md-content ul,.md-content ol{padding-left:1.5em;margin:0 0 1.2em}
  .md-content li{margin-bottom:0.4em}
  .md-content blockquote{border-left:3px solid var(--accent);padding:0.5em 1em;margin:1.2em 0;color:var(--text2);font-style:italic}
  .md-content code{background:var(--bg2);padding:2px 6px;border-radius:4px;font-family:monospace;font-size:0.9em}
  .page-footer{border-top:1px solid var(--border);padding:40px 24px;text-align:center;background:var(--bg2)}
  .footer-brand-sm{display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;font-weight:600;color:var(--text);margin-bottom:16px}
  .footer-logo-sm{width:20px;height:20px;border-radius:5px;object-fit:cover}
  .footer-socials{display:flex;gap:10px;justify-content:center;margin-bottom:16px}
  .footer-social-link{display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:10px;border:1px solid var(--border);color:var(--text2);text-decoration:none;transition:all 0.2s}
  .footer-social-link:hover{border-color:var(--accent);color:var(--accent)}
  .footer-social-link svg{width:16px;height:16px}
  .footer-copy-sm{font-size:12px;color:var(--text2)}
</style>
</head>
<body>
<header class="site-header">
  <div class="site-brand">
    <a href="${landingUrl}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;">
      ${user.store_logo_url ? `<img src="${esc(user.store_logo_url)}" class="site-logo" alt="">` : ''}
      <span class="site-title">${esc(storeName)}</span>
    </a>
  </div>

  <nav class="nav-menu">
    ${navData.hasProducts ? `<a href="${productsUrl}" class="nav-link">Home</a>` : ''}
    ${navData.hasGallery ? `<a href="${homeUrl}" class="nav-link">Gallery</a>` : ''}
    ${settings.about_us_content ? `<a href="${aboutUrl}" class="nav-link">About Us</a>` : ''}
    <a href="${contactUrl}" class="nav-link">Contact Us</a>
  </nav>

  <div class="header-actions">
    <a href="${cartUrl}" class="cart-icon-btn" title="Cart" style="position:relative; display:flex; align-items:center; justify-content:center; width:36px; height:36px; color:var(--text2); transition:color 0.2s;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <span class="cart-badge" id="cart-badge-cont" style="position:absolute; top:2px; right:-2px; background:var(--accent); color:#fff; font-size:10px; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; outline:2px solid var(--header-bg); display:none;">0</span>
    </a>
    <a href="${loginUrl}" class="login-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;margin-right:6px;"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Login
    </a>
    <a href="${loginUrl}" class="login-icon-sm" title="Login">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    </a>
    <button class="theme-toggle" id="tt" aria-label="Toggle theme" title="Toggle theme">
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:16px;height:16px;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>
    <button class="menu-trigger" id="menu-trigger" aria-label="Menu">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    </button>
  </div>
</header>

<div class="drawer-overlay" id="drawer-overlay"></div>
<div class="mobile-drawer" id="mobile-drawer">
  <div class="drawer-header">
    <div class="site-brand">
      <a href="${landingUrl}" style="display:flex;align-items:center;gap:10px;text-decoration:none;color:inherit;">
        ${user.store_logo_url ? `<img src="${esc(user.store_logo_url)}" class="site-logo" alt="">` : ''}
        <span class="site-title">${esc(storeName)}</span>
      </a>
    </div>
    <button class="drawer-close" id="drawer-close">&times;</button>
  </div>
  <nav class="drawer-nav">
    ${navData.hasProducts ? `<a href="${productsUrl}" class="drawer-link">Home</a>` : ''}
    ${navData.hasGallery ? `<a href="${homeUrl}" class="drawer-link">Gallery</a>` : ''}
    ${settings.about_us_content ? `<a href="${aboutUrl}" class="drawer-link">About Us</a>` : ''}
    <a href="${contactUrl}" class="drawer-link">Contact Us</a>
  </nav>
</div>
<div class="page-wrap">
  <h1 class="page-title">${esc(title)}</h1>
  <div class="page-meta">${esc(storeName)}</div>
  <div class="md-content">${htmlContent}</div>
  ${extraHtml}
</div>
<footer class="page-footer">
  <div class="footer-brand-sm">
    <a href="${homeUrl}" style="display:flex;align-items:center;gap:8px;text-decoration:none;color:inherit;">
      ${user.store_logo_url ? `<img src="${esc(user.store_logo_url)}" class="footer-logo-sm" alt="">` : ''}
      <span>${esc(storeName)}</span>
    </a>
  </div>
  ${hasSocials ? `<div class="footer-socials">
    ${socialInstagram ? `<a href="${esc(socialInstagram)}" class="footer-social-link" target="_blank" rel="noopener" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>` : ''}
    ${socialX ? `<a href="${esc(socialX)}" class="footer-social-link" target="_blank" rel="noopener" aria-label="X"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg></a>` : ''}
    ${socialYoutube ? `<a href="${esc(socialYoutube)}" class="footer-social-link" target="_blank" rel="noopener" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg></a>` : ''}
    ${socialWebsite ? `<a href="${esc(socialWebsite)}" class="footer-social-link" target="_blank" rel="noopener" aria-label="Website"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></a>` : ''}
  </div>` : ''}
  <div style="display:flex;gap:16px;justify-content:center;margin-bottom:16px;font-size:13px;">
    ${(settings.copyright_content || settings.contact_info_content) ? `<a href="${copyrightUrl}" style="color:var(--text2);text-decoration:none;">Copyrights</a>` : ''}
    ${settings.privacy_policy_content ? `<a href="${privacyUrl}" style="color:var(--text2);text-decoration:none;">Privacy Policy</a>` : ''}
    ${settings.terms_content ? `<a href="${termsUrl}" style="color:var(--text2);text-decoration:none;">Terms & Conditions</a>` : ''}
  </div>
  <div class="footer-copy-sm">&copy; ${new Date().getFullYear()} ${esc(storeName)}. All rights reserved.</div>
</footer>
<script>
document.getElementById('tt').onclick=function(){var h=document.documentElement;var d=h.getAttribute('data-theme')==='dark';h.setAttribute('data-theme',d?'light':'dark');localStorage.setItem('shopublish-theme',d?'light':'dark')};

// Mobile drawer toggle
(function(){
  var trigger = document.getElementById('menu-trigger');
  var drawer = document.getElementById('mobile-drawer');
  var overlay = document.getElementById('drawer-overlay');
  var close = document.getElementById('drawer-close');

  function toggle(open) {
    drawer.classList.toggle('active', open);
    overlay.classList.toggle('active', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if(trigger) trigger.onclick = function() { toggle(true); };
  if(close) close.onclick = function() { toggle(false); };
  if(overlay) overlay.onclick = function() { toggle(false); };
})();

if (document.getElementById('contact-form')) {
  document.getElementById('contact-form').onsubmit = async (e) => {
    e.preventDefault();
    const btn = document.getElementById('sbtn');
    const msg = document.getElementById('form-msg');
    const oldText = btn.textContent;
    btn.textContent = 'Sending...';
    btn.disabled = true;
    msg.style.display = 'none';

    const data = {
      name: document.getElementById('c-name').value,
      email: document.getElementById('c-email').value,
      mobile: document.getElementById('c-mobile').value,
      message: document.getElementById('c-message').value
    };

    try {
      const res = await fetch('/store/${storeHandle}/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const resData = await res.json();
      if (res.ok) {
        msg.textContent = resData.message;
        msg.className = 'form-msg success';
        msg.style.display = 'block';
        e.target.reset();
      } else {
        msg.textContent = resData.error || 'Something went wrong';
        msg.className = 'form-msg error';
        msg.style.display = 'block';
      }
    } catch (err) {
      msg.textContent = 'Network error. Please try again.';
      msg.className = 'form-msg error';
      msg.style.display = 'block';
    } finally {
      btn.textContent = oldText;
      btn.disabled = false;
    }
  };
}
</script>
</body>
</html>`;
}

/** Lightweight server-side Markdown to HTML converter */
function mdToHtml(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const out: string[] = [];
  let inUl = false, inOl = false;

  const flushList = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };

  const inline = (s: string) =>
    s
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/\*\*\*(.+?)\*\*\*/g,'<strong><em>$1</em></strong>')
      .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
      .replace(/\*(.+?)\*/g,'<em>$1</em>')
      .replace(/`([^`]+)`/g,'<code>$1</code>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^#{4}\s/.test(line)) { flushList(); out.push(`<h4>${inline(line.slice(5))}</h4>`); continue; }
    if (/^#{3}\s/.test(line)) { flushList(); out.push(`<h3>${inline(line.slice(4))}</h3>`); continue; }
    if (/^#{2}\s/.test(line)) { flushList(); out.push(`<h2>${inline(line.slice(3))}</h2>`); continue; }
    if (/^#\s/.test(line))   { flushList(); out.push(`<h1>${inline(line.slice(2))}</h1>`); continue; }
    if (/^\*\*\*[- ]*$/.test(line) || /^---+$/.test(line) || /^===+$/.test(line)) { flushList(); out.push('<hr>'); continue; }
    if (/^>\s?/.test(line)) { flushList(); out.push(`<blockquote><p>${inline(line.replace(/^>\s?/,''))}</p></blockquote>`); continue; }
    if (/^[*-]\s/.test(line)) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${inline(line.slice(2))}</li>`);
      continue;
    }
    if (/^\d+\.\s/.test(line)) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${inline(line.replace(/^\d+\.\s/,''))}</li>`);
      continue;
    }
    flushList();
    if (line === '') { out.push('<br>'); continue; }
    out.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  return out.join('\n');
}

function notFoundPage(msg = 'Store not found'): string {
  return `<!DOCTYPE html><html><head><title>Not Found — SHOPUBLISH</title><link rel="icon" type="image/png" href="/logo.png"><link rel="apple-touch-icon" href="/logo.png"></head><body style="font-family:system-ui,sans-serif;text-align:center;padding:100px 20px;background:#f9fafb;color:#374151"><h1>404</h1><p>${msg}</p><a href="/" style="color:#4f46e5;text-decoration:none;font-weight:600">Back to SHOPUBLISH</a></body></html>`;
}

function esc(s: string): string {
  return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

export default store;

