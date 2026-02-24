# FlipRead — Deploy Commands

Quick reference for deploying from your local terminal.

---

## 🟡 Staging

**URL:** `https://staging.flipread.adhirat.com`

### Deploy via Git (triggers GitHub Actions)

```bash
git checkout staging
git merge <your-branch>
git push origin staging
```

### Deploy directly from terminal (bypasses CI)

```bash
npx wrangler deploy --env staging
```

### Run database migrations

```bash
npm run db:migrate:staging
# or
npx wrangler d1 execute flipread-db-staging --remote --file=./src/db/schema.sql
```

### Set secrets

```bash
npx wrangler secret put JWT_SECRET --env staging
npx wrangler secret put STRIPE_SECRET_KEY --env staging
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env staging
```

### View logs

```bash
npx wrangler tail --env staging
```

---

## 🟢 Production

**URL:** `https://flipread.adhirat.com`

### Deploy via Git (triggers GitHub Actions)

```bash
git checkout main
git merge staging
git push origin main
```

### Deploy directly from terminal (bypasses CI)

```bash
npx wrangler deploy --env=""
```

### Run database migrations

```bash
npm run db:migrate:prod
# or
npx wrangler d1 execute flipread-db --remote --file=./src/db/schema.sql
```

### Set secrets

```bash
npx wrangler secret put JWT_SECRET --env=""
npx wrangler secret put STRIPE_SECRET_KEY --env=""
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env=""
```

### View logs

```bash
npx wrangler tail --env=""
```

---

## 🔵 Local Development

```bash
# Start dev server
npm run dev

# Run local DB migrations
npm run db:migrate
```

Local secrets are in `.dev.vars` (gitignored).

---

## ⚡ Quick Cheatsheet

| Action              | Staging                                        | Production                                |
| ------------------- | ---------------------------------------------- | ----------------------------------------- |
| **Deploy (Git)**    | `git push origin staging`                      | `git push origin main`                    |
| **Deploy (Direct)** | `npx wrangler deploy --env staging`            | `npx wrangler deploy --env=""`            |
| **DB Migrate**      | `npm run db:migrate:staging`                   | `npm run db:migrate:prod`                 |
| **Live Logs**       | `npx wrangler tail --env staging`              | `npx wrangler tail --env=""`              |
| **Set Secret**      | `npx wrangler secret put <NAME> --env staging` | `npx wrangler secret put <NAME> --env=""` |
| **List Secrets**    | `npx wrangler secret list --env staging`       | `npx wrangler secret list --env=""`       |

---

## 🛡️ Recommended Workflow

1. Develop locally → `npm run dev`
2. Push to **staging** → verify at `staging.flipread.adhirat.com`
3. Merge staging → **main** → live at `flipread.adhirat.com`

> **Tip:** Always run migrations on staging first before production.
