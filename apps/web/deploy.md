# SHOPUBLISH — Deploy Commands

Quick reference for deploying from your local terminal.

---

## 🟡 Staging

**URL:** `https://staging.shopublish.com`

### Deploy via Git (triggers GitHub Actions)

```bash
git push origin staging
```

### Build & Deploy directly from root (bypasses CI)

```bash
npm run web:deploy:staging
```

### Run database migrations from root

```bash
npm run web:db:migrate:staging
```

### Set secrets

```bash
cd apps/web
npx wrangler secret put JWT_SECRET --env staging
npx wrangler secret put STRIPE_SECRET_KEY --env staging
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env staging
```

---

## 🟢 Production

**URL:** `https://shopublish.com`

### Deploy via Git (triggers GitHub Actions)

```bash
git push origin main
```

### Build & Deploy directly from root (bypasses CI)

```bash
npm run web:deploy:prod
```

### Run database migrations from root

```bash
npm run web:db:migrate:prod
```

### Set secrets

```bash
cd apps/web
npx wrangler secret put JWT_SECRET --env=""
npx wrangler secret put STRIPE_SECRET_KEY --env=""
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env=""
```

---

## 🔵 Local Development

```bash
# Start dev server from root
npm run web:dev

# Run local DB migrations from root
npm run web:db:migrate:local
```

Local secrets are in `apps/web/.dev.vars` (gitignored).

---

## ⚡ Quick Cheatsheet (Run from root)

| Action              | Staging                                          | Production                                  |
| ------------------- | ------------------------------------------------ | ------------------------------------------- |
| **Deploy (Git)**    | `git push origin staging`                        | `git push origin main`                      |
| **Deploy (Direct)** | `npm run web:deploy:staging`                     | `npm run web:deploy:prod`                   |
| **DB Migrate**      | `npm run web:db:migrate:staging`                 | `npm run web:db:migrate:prod`               |
| **Live Logs**       | `cd apps/web && npx wrangler tail --env staging` | `cd apps/web && npx wrangler tail --env=""` |

---

## 🛡️ Recommended Workflow

1. Develop locally → `npm run web:dev`
2. Push to **staging** → verify at `staging.shopublish.com`
3. Merge staging → **main** → live at `shopublish.com`

> **Tip:** Always run migrations on staging first before production.
