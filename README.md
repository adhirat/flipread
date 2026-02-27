# ShoPublish Monorepo 🚀

Welcome to the **ShoPublish** monorepo. This project is a comprehensive digital publishing ecosystem that allows creators to turn documents into interactive flipbooks and manage a professional digital bookstore.

---

## 📂 Project Structure

This is a monorepo managed with **NPM Workspaces**.

- **[`apps/web`](./apps/web)**: The core platform built on **Cloudflare Workers**.
  - **Framework**: Hono (SSR / API)
  - **Database**: Cloudflare D1 (Serverless SQL)
  - **Storage**: Cloudflare R2
  - **Payments**: Stripe Integration
- **[`apps/mobile`](./apps/mobile)**: Companion mobile application.
  - **Framework**: Flutter (Android/iOS)

---

## 🛠️ Getting Started

### Prerequisites

- Node.js (v20 or later)
- Flutter SDK
- Cloudflare Wrangler CLI (`npm install -g wrangler`)

### Installation

From the root directory:

```bash
npm install
```

### Running Locally

| Service        | Command                         | URL                     |
| :------------- | :------------------------------ | :---------------------- |
| **Web App**    | `npm run web:dev`               | `http://localhost:8787` |
| **Mobile App** | `cd apps/mobile && flutter run` | N/A                     |

---

## 🚀 Deployment & Environments

We use a three-stage deployment strategy for the web application.

### Web Deployment

| Environment    | Branch    | Command                        | Database                |
| :------------- | :-------- | :----------------------------- | :---------------------- |
| **Local**      | N/A       | `npm run web:db:migrate:local` | Local D1                |
| **Staging**    | `staging` | `npm run web:deploy:staging`   | `shopublish-db-staging` |
| **Production** | `main`    | `npm run web:deploy:prod`      | `shopublish-db`         |

### Database Migrations

Always run migrations before deploying code changes that affect the schema:

- Local: `npm run web:db:migrate:local`
- Staging: `npm run web:db:migrate:staging`
- Production: `npm run web:db:migrate:prod`

---

## 🤖 CI/CD Integration

The repository is integrated with automated workflows for testing and deployment.

### GitHub Actions

- **Web CI/CD**: Automatically builds, type-checks, and deploys pushes to `main` (Production) and `staging` (Staging).
- **Mobile CI**: Runs Flutter analysis, unit tests, and smoke builds on every pull request to ensure code quality.

### Codemagic

- **Mobile CD**: Fully configured via [`codemagic.yaml`](./codemagic.yaml).
- Handles Android (APK/AAB) and iOS (IPA) release builds automatically on pushes to `main` and `staging`.

---

## 📜 Available Scripts (Root)

| Script                   | Description                                        |
| :----------------------- | :------------------------------------------------- |
| `web:dev`                | Start the web development server.                  |
| `web:deploy:staging`     | Deploy the web app to the staging environment.     |
| `web:deploy:prod`        | Deploy the web app to production.                  |
| `web:db:migrate:local`   | Run migrations on your local development database. |
| `web:db:migrate:staging` | Run migrations on the remote staging database.     |
| `web:db:migrate:prod`    | Run migrations on the remote production database.  |

---

## 🌍 Useful Links

- **Staging URL**: [https://staging.shopublish.com](https://staging.shopublish.com)
- **API Reference**: [Swagger UI / API Docs](https://staging.shopublish.com/api/swagger)
