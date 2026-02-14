# FlipRead Feature Enhancement — Implementation Plan

This document outlines the features, architectural changes, and bug fixes implemented to transform FlipRead into a premium SaaS platform for digital book publishing.

## 1. Objectives

- **Modernize UI**: Redesign the dashboard and public storefront with a premium, high-end aesthetic.
- **Book Customization**: Enable authors to edit book metadata, upload custom covers, and set passwords.
- **Storefront Personalization**: Allow users to brand their public bookstores with names, logos, and custom policies.
- **Monetization**: Implement a subscription upgrade flow (Free -> Pro -> Business).
- **Hardening**: Fix critical routing and styling bugs.

## 2. Technical Architecture

### Database Schema Updates (D1)

- **Users Table**: Added `store_name`, `store_logo_url`, `store_logo_key`, and `store_settings` (JSON).
- **Books Table**: Added `cover_key` and updated existing fields for visibility and password protection.

### Storage Strategy (R2)

- Paths:
  - `covers/{user_id}/{book_id}.{ext}`: Custom book covers.
  - `logos/{user_id}/logo.{ext}`: Store branding logos.
- Serving:
  - Proxied via Worker routes (`/read/api/cover/:id` and `/read/api/logo/:id`) to handle caching and content-types safely.

### Authentication & Security

- **JWT-based Sessions**: Persistent login across dashboard and protected routes.
- **Password Protection**: Implemented for individual books using bcrypt-style hashing check (available for Pro+ users).

## 3. Implementation Phases

### Phase 1: Bug Fixes & Scaffolding

- [x] Fix pricing font size inconsistency in `index.ts`.
- [x] Fix 404 error in book viewer file served from `/api/file`.
- [x] Initialize D1 migration for new store/book fields.

### Phase 2: Core Data Services

- [x] **Book Service**: Update `PATCH /api/books/:id` and add `POST /api/books/:id/cover`.
- [x] **User/Store Service**: Implement `PATCH /api/user/store` and `POST /api/user/store/logo`.
- [x] **Auth Service**: Expand `/api/auth/me` to include store profile data.
- [x] **Viewer Service**: Serve R2 assets (covers/logos) through the worker.

### Phase 3: Dashboard UI Expansion

- [x] **Tabs Navigation**: Separate "My Books" from "Store Customization".
- [x] **Book Editing Modal**: Integrated title, visibility, and cover upload controls.
- [x] **Upgrade Flow**: Added plan selection modal with Stripe Checkout integration for Monthly/Yearly cycles.
- [x] **Store Settings**: Form for name, description, and legal URLs.

### Phase 4: Premium Storefront

- [x] **Design**: Modern dark-mode layout with radial gradients and Outfit typography.
- [x] **Grid System**: Responsive book cards with hover effects and view counts.
- [x] **Branding**: Dynamic loading of user logos and store titles.

## 4. Verification Checklist

- [x] User can register/login.
- [x] User can upload a book and see it in the library.
- [x] Cover image upload works and displays correctly.
- [x] Store settings persist to D1.
- [x] Public bookstore displays data correctly via slug.
- [x] Upgrade modal redirects to Stripe (simulated in local dev).

## 5. Potential Improvements

- [ ] Drag-and-drop sorting for books in the store.
- [ ] Custom domain support for Business users.
- [ ] Detailed analytics dashboard (Views over time graph).
- [ ] Support for multiple themes/templates for bookstores.
