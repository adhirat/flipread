# FlipRead Feature Enhancement — Implementation Plan

This document outlines the features, architectural changes, and bug fixes implemented to transform FlipRead into a premium SaaS platform for digital book publishing.

## 1. Objectives

- **Modernize UI**: Redesign the dashboard and public storefront with a premium, high-end aesthetic.
- **Book Customization**: Enable authors to edit book metadata, upload custom covers, and set passwords.
- **Storefront Personalization**: Allow users to brand their public bookstores with names, logos, custom domains, and custom policies.
- **Monetization**: Implement a subscription upgrade flow (Free -> Basic -> Pro -> Business).
- **Enterprise Features**: Team members, audit logging, detailed analytics, and API access.

## 2. Technical Architecture

### Database Schema Updates (D1)

- **Users Table**: Added `store_name`, `store_logo_url`, `store_logo_key`, `store_settings` (JSON), `plan`, `api_key`.
- **Books Table**: Added `cover_key`, `type` (PDF/EPUB), `is_public`, `password`, `custom_domain`.
- **Analytics**: Created `activity_logs`, `view_logs`, and `analytics_events` tables.
- **Team**: Created `store_members` table for role-based access.
- **API**: Created `api_keys` table for developer access.

### Storage Strategy (R2)

- Paths:
  - `covers/{user_id}/{book_id}.{ext}`: Custom book covers.
  - `logos/{user_id}/logo.{ext}`: Store branding logos.
  - `files/{user_id}/{book_id}/{filename}`: Book content files.
- Serving:
  - Proxied via Worker routes (`/read/api/cover/:id`, `/read/api/logo/:id`, `/read/api/file/:id`) to handle caching and content-types safely.

### Authentication & Security

- **JWT-based Sessions**: Persistent login across dashboard and protected routes.
- **Password Protection**: Implemented for individual books.
- **Private Store Mode**: Ability to gate entire store access to members only.

## 3. Implementation Phases

### Phase 1: Bug Fixes & Scaffolding (Completed)

- [x] Fix pricing font size inconsistency in `index.ts`.
- [x] Fix 404 error in book viewer file served from `/api/file`.
- [x] Initialize D1 migration for new store/book fields.

### Phase 2: Core Data Services (Completed)

- [x] **Book Service**: Update `PATCH /api/books/:id` and add `POST /api/books/:id/cover`.
- [x] **User/Store Service**: Implement `PATCH /api/user/store` and `POST /api/user/store/logo`.
- [x] **Auth Service**: Expand `/api/auth/me` to include store profile data.
- [x] **Viewer Service**: Serve R2 assets (covers/logos) through the worker.

### Phase 3: Dashboard UI Expansion (Completed)

- [x] **Tabs Navigation**: Separate "My Books", "Store Customization", "Members", "Settings".
- [x] **Book Editing Modal**: Integrated title, visibility, password, and cover upload controls.
- [x] **Upgrade Flow**: Added plan selection modal with Stripe Checkout integration for Monthly/Yearly cycles.
- [x] **Store Settings**: Form for name, description, themes, layout, and legal URLs.

### Phase 4: Premium Storefront (Completed)

- [x] **Design**: Modern dark-mode layout with radial gradients and multiple font choices.
- [x] **Grid System**: Responsive book cards with hover effects and view counts.
- [x] **Branding**: Dynamic loading of user logos and store titles.
- [x] **Themes**: Support for 'Magazine', 'Minimal', 'Dark Luxe' themes.

### Phase 5: Enterprise Features (Completed)

- [x] **Activity Logging**: Comprehensive audit trail for user actions (login, updates, deletions).
- [x] **API Documentation**: Integrated Swagger UI for developer API reference.
- [x] **Team Management**: Invite members to store with email verification.
- [x] **Detailed Analytics**: Dashboard widget for recent activity and view stats.

## 4. Verification Checklist

- [x] User can register/login.
- [x] User can upload a book and see it in the library.
- [x] Cover image upload works and displays correctly.
- [x] Store settings persist to D1.
- [x] Public bookstore displays data correctly via slug.
- [x] Upgrade modal redirects to Stripe.
- [x] Activity logs are recorded and displayed.
- [x] API documentation is accessible.

## 5. Potential Improvements

- [ ] Drag-and-drop sorting for books in the store.
- [ ] Advanced analytics charts (graphs over time).
- [ ] Custom domain DNS verification automation.
