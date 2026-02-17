# FlipRead

A modern, edge-native platform for selling and reading digital books (PDF/EPUB), built on Cloudflare's global network.

## 🚀 Features

- **Multi-Format Support**: Upload and read PDF and EPUB books with a premium viewer experience.
- **Custom Storefronts**: Personalized branded stores with custom domains, logos, themes, and layouts.
- **Tiered Subscriptions**: Free, Basic, Pro, and Business plans with tailored limits and features.
- **Secure Access**: Password protection, private store modes, and secure member access.
- **Team Collaboration**: Invite members to your store with role-based access (Pro/Business).
- **Detailed Analytics**: Track views, geographic data, and user activity logs.
- **Developer API**: Full REST API with Swagger documentation for external integrations.
- **Activity Logging**: Comprehensive audit logs for all user actions.
- **Edge Performance**: Built on Cloudflare Workers, D1, R2, and KV for low-latency global access.

## 🛠️ Tech Stack

- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Framework**: [Hono](https://hono.dev/) - Fast, lightweight web framework
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite at the edge)
- **Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/) (Object storage for books/covers)
- **Cache**: [Cloudflare KV](https://developers.cloudflare.com/kv/) (Session and performant data caching)
- **Payments**: [Stripe](https://stripe.com/)
- **Documentation**: [Swagger UI](https://swagger.io/)
- **Language**: TypeScript

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) 18+ and npm
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Stripe account](https://dashboard.stripe.com/register) (for payment features)

## 🔧 Local Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd flipread
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.dev.vars` file in the project root:

```bash
# .dev.vars
JWT_SECRET=your-local-jwt-secret-change-in-production
STRIPE_SECRET_KEY=sk_test_your_stripe_test_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
RESEND_API_KEY=re_your_resend_key_optional
```

> **Note**: Get your Stripe test keys from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)

### 4. Set Up Local Database

Run database migrations:

```bash
npm run db:migrate
```

This creates the local D1 database with all necessary tables in `.wrangler/state/v3/d1/`

### 5. Start Development Server

```bash
npm run dev
```

The app will be available at **http://localhost:8787**
Swagger Documentation is available at **http://localhost:8787/api/swagger**

## 🌐 Deployment to Cloudflare

### 1. Authenticate with Cloudflare

```bash
npx wrangler login
```

### 2. Create Production Resources

#### Create D1 Database

```bash
npx wrangler d1 create flipread-db
```

Copy the `database_id` from the output and update `wrangler.toml`.

#### Create R2 Bucket

```bash
npx wrangler r2 bucket create flipread-files
```

#### Create KV Namespace

```bash
npx wrangler kv:namespace create KV
```

Copy the `id` from the output and update `wrangler.toml`.

### 3. Set Production Secrets

```bash
# JWT secret for authentication
echo "your-production-jwt-secret" | npx wrangler secret put JWT_SECRET

# Stripe production keys
echo "sk_live_..." | npx wrangler secret put STRIPE_SECRET_KEY
echo "whsec_..." | npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

### 4. Run Production Migrations

```bash
npm run db:migrate:prod
```

### 5. Deploy to Cloudflare

```bash
npm run deploy
```

## 🔗 Published URL

**Production**: [https://flipread.adhirat.workers.dev](https://flipread.adhirat.workers.dev)

> You can configure a custom domain in the [Cloudflare Dashboard](https://dash.cloudflare.com/) under Workers & Pages → Your Worker → Settings → Domains & Routes

## 📁 Project Structure

```
flipread/
├── src/
│   ├── index.ts           # Main application entry point
│   ├── routes/            # API Route handlers
│   │   ├── auth.ts        # Authentication & Session
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
│   ├── views/             # HTML templates & dashboard components
│   └── middleware/        # Auth & Logging middleware
├── public/                # Static assets (images, styles)
├── wrangler.toml          # Cloudflare configuration
└── package.json
```

## 🎯 Subscription Plans

| Plan         | Upload Limit | Monthly Views | Store Features                                              | Team       |
| ------------ | ------------ | ------------- | ----------------------------------------------------------- | ---------- |
| **Free**     | 5 MB         | 500           | Basic Store                                                 | -          |
| **Basic**    | 10 MB        | 2,000         | Custom Backgrounds                                          | -          |
| **Pro**      | 50 MB        | 50,000        | Custom Domain, Password Protection, Analytics, Private Mode | 50 Members |
| **Business** | 200 MB       | Unlimited     | API Access, Priority Support, Raw Data Export               | Unlimited  |

## 🔐 Security Features

- **JWT Authentication**: Secure, stateless session management.
- **Role-Based Access**: Granular permissions for store members.
- **Activity Logging**: Full audit trail of all sensitive actions.
- **Secure Uploads**: File type validation and sanitized filenames.
- **Secret Management**: Environment-based configuration for API keys.

## 🧪 Development Commands

```bash
# Start local development server
npm run dev

# Deploy to production
npm run deploy

# Run database migrations (local)
npm run db:migrate

# Run database migrations (production)
npm run db:migrate:prod
```
