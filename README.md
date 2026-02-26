# ShoPublish Monorepo

This repository contains the full ShoPublish ecosystem, including the web platform and the mobile application.

## Structure

- **[apps/web](file:///Users/acyuta/Documents/GitHub/Flip/shopublish/apps/web)**: The main ShoPublish platform. Built with Hono, Cloudflare Workers, D1, and R2.
- **[apps/mobile](file:///Users/acyuta/Documents/GitHub/Flip/shopublish/apps/mobile)**: The companion mobile application. Built with Flutter.

## Getting Started

### Web Development

To start the web development server:

```bash
npm run web:dev
```

### Mobile Development

Navigate to the mobile directory and run:

```bash
cd apps/mobile
flutter run
```

## Deployment

Web deployment:

```bash
npm run web:deploy
```
