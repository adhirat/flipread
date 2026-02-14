# FlipRead

A modern platform for selling and reading PDF books online, built on Cloudflare's edge infrastructure.

## 🚀 Features

- **PDF Book Management**: Upload, manage, and sell PDF books
- **Tiered Subscriptions**: Free, Basic, Pro, and Business plans with different upload limits
- **Secure Reading**: Password-protected books for premium content
- **Custom Storefront**: Personalized store with custom branding, logo, and policies
- **Stripe Integration**: Seamless payment processing for subscriptions
- **Edge-Native**: Built on Cloudflare Workers for global performance

## 🛠️ Tech Stack

- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/)
- **Framework**: [Hono](https://hono.dev/) - Fast, lightweight web framework
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite at the edge)
- **Storage**: [Cloudflare R2](https://developers.cloudflare.com/r2/) (S3-compatible object storage)
- **Cache**: [Cloudflare KV](https://developers.cloudflare.com/kv/) (key-value store)
- **Payments**: [Stripe](https://stripe.com/)
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

Your app will be deployed to Cloudflare Workers!

## 🔗 Published URL

**Production**: [https://flipread.flipread.workers.dev](https://flipread.flipread.workers.dev)

> You can configure a custom domain in the [Cloudflare Dashboard](https://dash.cloudflare.com/) under Workers & Pages → Your Worker → Settings → Domains & Routes

## 📁 Project Structure

```
flipread/
├── src/
│   ├── index.ts           # Main application entry point
│   ├── routes/
│   │   ├── auth.ts        # Authentication routes
│   │   ├── books.ts       # Book management routes
│   │   ├── billing.ts     # Stripe billing routes
│   │   ├── viewer.ts      # PDF viewer routes
│   │   └── store.ts       # Public storefront routes
│   ├── db/
│   │   └── schema.sql     # Database schema
│   └── middleware/        # Authentication & validation
├── public/                # Static assets
├── wrangler.toml         # Cloudflare Workers configuration
└── package.json
```

## 🎯 Subscription Plans

| Plan       | Upload Limit | Features                              |
|------------|--------------|---------------------------------------|
| **Free**   | 5 MB         | Basic book uploads                    |
| **Basic**  | 10 MB        | Increased storage                     |
| **Pro**    | 50 MB        | Password protection, analytics        |
| **Business** | 200 MB     | Custom branding, priority support     |

## 🔐 Security Features

- JWT-based authentication
- Password-protected books (Pro+ plans)
- Secure file uploads with validation
- Stripe webhook signature verification
- Environment-based secret management

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

## 📝 Environment Variables

Non-sensitive variables are configured in `wrangler.toml`:

- `APP_URL`: Your application URL
- `MAX_UPLOAD_SIZE_*`: Upload limits per plan
- `STRIPE_PRICE_*`: Stripe price IDs for subscriptions

Sensitive secrets are set via Wrangler:

- `JWT_SECRET`: Secret for signing authentication tokens
- `STRIPE_SECRET_KEY`: Stripe API secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

## 🆘 Support

For issues and questions, please contact the development team or open an issue in the repository.

---

Built with ⚡ on [Cloudflare Workers](https://workers.cloudflare.com/)
