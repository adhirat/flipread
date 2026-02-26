# ShoPublish

A modern, edge-native platform for selling and reading digital books (PDF/EPUB), built on Cloudflare's global network.

## 🚀 Features

- **Premium Viewers** — High-performance PDF and EPUB viewers with professional streaming support
- **Large File Support** — Optimized rendering for GB-sized PDFs with intelligent memory management and Range Requests
- **Custom Storefronts** — Personalized branded stores with custom domains, logos, themes, and layouts
- **Tiered Subscriptions** — Free, Basic, Pro, and Business plans with tailored limits and features
- **Secure Access** — Password protection, private store modes, and secure member access
- **Team Collaboration** — Invite members to your store with role-based access (Pro/Business)
- **Detailed Analytics** — Track views, geographic data, and user activity logs
- **Developer API** — Full REST API with Swagger documentation for external integrations
- **Activity Logging** — Comprehensive audit logs for all user actions
- **Edge Performance** — Built on Cloudflare Workers, D1, R2, and KV for low-latency global access

## 🛠️ Tech Stack

| Layer         | Technology                                                                               |
| ------------- | ---------------------------------------------------------------------------------------- |
| **Runtime**   | [Cloudflare Workers](https://workers.cloudflare.com/)                                    |
| **Framework** | [Hono](https://hono.dev/)                                                                |
| **Database**  | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite at the edge)              |
| **Storage**   | [Cloudflare R2](https://developers.cloudflare.com/r2/) (Object storage for books/covers) |
| **Cache**     | [Cloudflare KV](https://developers.cloudflare.com/kv/) (Sessions & data caching)         |
| **Payments**  | [Stripe](https://stripe.com/)                                                            |
| **Docs**      | [Swagger UI](https://swagger.io/)                                                        |
| **Language**  | TypeScript                                                                               |

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Stripe account](https://dashboard.stripe.com/register) (for payment features)

---

## 🔧 Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/adhirat/shopublish.git
cd shopublish
npm install
```

### 2. Configure Secrets

`.dev.vars` contains local development secrets (Stripe test keys, JWT). This file is **gitignored** — create it from the template:

```bash
# .dev.vars
JWT_SECRET=your-local-jwt-secret
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

> Get Stripe test keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

### 3. Set Up Local Database

```bash
npm run db:migrate
```

Creates the local D1 database in `.wrangler/state/v3/d1/`.

### 4. Start Dev Server

```bash
npm run dev
```

- App: **http://localhost:8787**
- Swagger Docs: **http://localhost:8787/api/swagger**

---

## 🌐 Environments

|            | Production                                           | Staging                                                              |
| ---------- | ---------------------------------------------------- | -------------------------------------------------------------------- |
| **URL**    | [shopublish.adhirat.com](https://shopublish.adhirat.com) | [staging.shopublish.adhirat.com](https://staging.shopublish.adhirat.com) |
| **Branch** | `main`                                               | `staging`                                                            |
| **D1**     | `shopublish-db`                                        | `shopublish-db-staging`                                                |
| **KV**     | `KV`                                                 | `KV` (staging ID)                                                    |
| **R2**     | `shopublish-files`                                     | `shopublish-files-staging`                                             |

### CI/CD

Deployments are automated via GitHub Actions (`.github/workflows/deploy.yml`):

- `git push origin main` → deploys to **Production**
- `git push origin staging` → deploys to **Staging**
- Pull requests run type checking only (no deploy)

### Required GitHub Secrets

| Secret                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare account ID                    |
| `CLOUDFLARE_API_TOKEN`  | API token with "Edit Workers" permission |

### Cloudflare Secrets

Set separately for each environment via `wrangler secret put`:

```bash
# Staging
npx wrangler secret put JWT_SECRET --env staging
npx wrangler secret put STRIPE_SECRET_KEY --env staging
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env staging

# Production
npx wrangler secret put JWT_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

> **Full deploy command reference:** See [deploy.md](./deploy.md)

---

## 📁 Project Structure

```
shopublish/
├── src/
│   ├── index.ts           # Main application entry point
│   ├── routes/            # API route handlers
│   │   ├── auth.ts        # Authentication & sessions
│   │   ├── books.ts       # Book management
│   │   ├── user.ts        # User profile & settings
│   │   ├── store.ts       # Public storefront
│   │   ├── viewer.ts      # Book viewer & asset serving
│   │   ├── members.ts     # Team member management
│   │   ├── docs.ts        # Swagger API docs
│   │   └── swagger.ts     # Swagger UI setup
│   ├── db/                # Database schema & migrations
│   ├── lib/               # Shared utilities & types
│   ├── services/          # Business logic services
│   ├── views/             # HTML templates & dashboard
│   └── middleware/        # Auth & logging middleware
├── public/                # Static assets (images, styles)
├── wrangler.toml          # Cloudflare configuration
├── deploy.md              # Deploy command reference
└── package.json
```

## 🎯 Subscription Plans

| Plan         | Upload Limit | Monthly Views | Store Features                                              | Team       |
| ------------ | ------------ | ------------- | ----------------------------------------------------------- | ---------- |
| **Free**     | 5 MB         | 500           | Basic Store                                                 | —          |
| **Basic**    | 10 MB        | 2,000         | Custom Backgrounds                                          | —          |
| **Pro**      | 50 MB        | 50,000        | Custom Domain, Password Protection, Analytics, Private Mode | 50 Members |
| **Business** | 200 MB       | Unlimited     | API Access, Priority Support, Raw Data Export               | Unlimited  |

## 🔐 Security

- **JWT Authentication** — Secure, stateless session management
- **Role-Based Access** — Granular permissions for store members
- **Activity Logging** — Full audit trail of all sensitive actions
- **Secure Uploads** — File type validation and sanitized filenames
- **Secret Management** — Environment-based configuration for API keys

## 🗺️ Roadmap

- [ ] Drag-and-drop sorting for books in the store
- [ ] Advanced analytics charts (graphs over time)
- [ ] Custom domain DNS verification automation
