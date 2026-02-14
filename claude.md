# FlipRead Feature Enhancements

Six issues to fix across the landing page, dashboard, viewer, and store.

## User Review Required

> [!IMPORTANT]
> **Store Customization Scope**: The store currently has no database fields for store name, logo, privacy policy, or terms. I'll add `store_name`, `store_logo_url`, `store_description` columns to the `users` table via a migration. Privacy policy and terms will be free-text fields stored as JSON in a `store_settings` column. Is this acceptable?

> [!IMPORTANT]
> **Cover Image Upload**: Currently there's a `cover_url` column in the books table but no upload mechanism. I'll add cover image upload during book editing (the first page of the PDF would need manual screenshot — Cloudflare Workers can't render PDFs). The user will manually upload a cover image per book.

---

## Proposed Changes

### 1. Fix Pricing Font Size (Bug)

**Root cause**: `.p-price span { font-size: 14px }` applies to ALL nested spans, including the price dollar amount spans inside `.price-monthly` / `.price-yearly`.

#### [MODIFY] [index.ts](file:///Users/acyuta/Documents/GitHub/Flip/flipread/src/index.ts)

- Change `.p-price span` CSS to `.p-price > span:last-child` or use a `.p-unit` class
- Restructure HTML: `<div class="p-price"><span class="price-monthly">$9</span><span class="p-unit">/mo</span>...`
- Ensures Pro & Business price numbers display at full 36px like Free

---

### 2. Fix 404 on `/api/file/:bookId` (Bug)

**Root cause**: Viewer routes are mounted at `/read`, so the file API becomes `/read/api/file/:bookId`. But the viewer HTML references `/api/file/${book.id}` (no `/read` prefix).

#### [MODIFY] [viewer.ts](file:///Users/acyuta/Documents/GitHub/Flip/flipread/src/routes/viewer.ts)

- Move the `/api/file/:bookId` route to the main app in `index.ts`, OR
- Change the `fileUrl` in the viewer GET handler from `/api/file/${book.id}` to `/read/api/file/${book.id}`

---

### 3. Add Upgrade Plan UI (Feature)

#### [MODIFY] [index.ts](file:///Users/acyuta/Documents/GitHub/Flip/flipread/src/index.ts) — Dashboard

- Add an "Upgrade" button in the stats section (next to plan badge)
- Button triggers `upgradePlan()` JS function
- Shows a modal with Pro/Business plan options and monthly/yearly toggle
- Calls `POST /api/billing/checkout` with selected plan + interval
- Redirects to Stripe Checkout URL

---

### 4. Add Book Editing UI (Feature)

#### [MODIFY] [index.ts](file:///Users/acyuta/Documents/GitHub/Flip/flipread/src/index.ts) — Dashboard

- Add an "Edit" button to each book item (pencil icon)
- Opens an inline edit panel / modal with:
  - **Title** (text input)
  - **Cover Image** (file upload → R2 → updates `cover_url`)
  - **Background Color** (color picker → stored in `settings` JSON)
  - **Public/Private** toggle
  - **Password** field (Pro+ only)
- Save calls `PATCH /api/books/:id`

#### [MODIFY] [books.ts](file:///Users/acyuta/Documents/GitHub/Flip/flipread/src/routes/books.ts)

- Add `cover_url` update support in PATCH route
- Add `POST /api/books/:id/cover` endpoint for cover image upload to R2

---

### 5. Store Customization (Feature)

#### [NEW] Migration: Add store columns to users table

- `store_name TEXT DEFAULT ''`
- `store_logo_url TEXT DEFAULT ''`
- `store_settings TEXT DEFAULT '{}'` (JSON: description, privacy_policy, terms)

#### [MODIFY] [index.ts](file:///Users/acyuta/Documents/GitHub/Flip/flipread/src/index.ts) — Dashboard

- Add "Store Settings" section with fields for store name, logo upload, description, privacy policy, terms

#### [MODIFY] [auth.ts](file:///Users/acyuta/Documents/GitHub/Flip/flipread/src/routes/auth.ts) or new route

- Add `PATCH /api/store/settings` to save store customization
- Add `POST /api/store/logo` for logo upload

#### [MODIFY] [store.ts](file:///Users/acyuta/Documents/GitHub/Flip/flipread/src/routes/store.ts)

- Read `store_name`, `store_logo_url`, `store_settings` from user record
- Pass to template for rendering

---

### 6. Premium Store Design (Enhancement)

#### [MODIFY] [store.ts](file:///Users/acyuta/Documents/GitHub/Flip/flipread/src/routes/store.ts)

- Redesign with premium aesthetics:
  - Hero section with gradient/glassmorphism, store logo, store name
  - Book grid with prominent cover images (3D hover effect)
  - Search/filter books
  - Footer with privacy policy, terms links
  - Responsive grid layout
  - Smooth animations

---

## Verification Plan

### Automated Tests

- Deploy locally with `npx wrangler dev --local`
- Browser verification of all 6 changes:
  1. Landing page pricing fonts match Free tier size
  2. `/read/:slug` loads without 404 on file
  3. Dashboard upgrade button → Stripe checkout flow
  4. Book edit modal → save title/cover/background
  5. Store settings → save name/logo/terms
  6. Store page renders with premium design
