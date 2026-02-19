# FlipRead Multi-Environment Deployment Guide

This guide explains how to set up and manage the professional multi-environment deployment pipeline (Staging & Production) for FlipRead using Cloudflare Workers and GitHub Actions.

## 🏗️ Architecture Overview

FlipRead uses a dual-environment strategy to ensure stability:

| Environment    | Branch    | URL                            | Purpose                              |
| :------------- | :-------- | :----------------------------- | :----------------------------------- |
| **Production** | `main`    | `flipread.adhirat.com`         | Live site for customers              |
| **Staging**    | `staging` | `staging.flipread.adhirat.com` | Testing new features & optimizations |

## 1. Cloudflare Resource Setup

Each environment requires its own set of Cloudflare resources to maintain isolation.

### 🟢 Production Resources

Resources defined in the top-level of `wrangler.toml`:

- **D1**: `flipread-db`
- **KV**: `KV`
- **R2**: `flipread-files`

### 🟡 Staging Resources

Resources defined under `[env.staging]` in `wrangler.toml`:

- **D1**: `flipread-db-staging`
- **KV**: `flipread-kv-staging`
- **R2**: `flipread-files-staging`

> [!NOTE]
> If you need to recreate these, use the standard `npx wrangler` commands including the `--env staging` flag where applicable.

## 2. GitHub Actions Configuration

The deployment is fully automated via `.github/workflows/deploy.yml`.

1. **Secrets**: Ensure your GitHub Repository has these secrets set (**Settings > Secrets > Actions**):
   - `CLOUDFLARE_ACCOUNT_ID`: `d660af0bb5a3a29ba9ce1266e59b87c5`
   - `CLOUDFLARE_API_TOKEN`: A token with "Edit Workers" permissions.

2. **Triggering**:
   - `git push origin main` ➡️ Deploys to **Production**.
   - `git push origin staging` ➡️ Deploys to **Staging**.

## 3. Secret Management

Cloudflare Secrets (like `JWT_SECRET`) must be set **separately** for each environment.

### Set Staging Secrets

```bash
npx wrangler secret put JWT_SECRET --env staging
npx wrangler secret put STRIPE_SECRET_KEY --env staging
npx wrangler secret put STRIPE_WEBHOOK_SECRET --env staging
```

### Set Production Secrets (Main branch context)

```bash
npx wrangler secret put JWT_SECRET
npx wrangler secret put STRIPE_SECRET_KEY
npx wrangler secret put STRIPE_WEBHOOK_SECRET
```

## 4. Database Migrations

Always run migrations on staging first to verify schema changes.

### Staging Migrations

```bash
npx wrangler d1 execute flipread-db-staging --remote --file=./src/db/schema.sql
```

### Production Migrations

```bash
npm run db:migrate:prod
# or
npx wrangler d1 execute flipread-db --remote --file=./src/db/schema.sql
```

## 🚀 Deployment Workflow

1. **Local Development**: Work on your feature or bug fix.
2. **Staging**: Push to the `staging` branch.
   ```bash
   git checkout staging
   git merge <your-feature-branch>
   git push origin staging
   ```
3. **Verification**: Test the changes at `https://staging.flipread.adhirat.com`.
4. **Go Live**: Merge to `main` and push.
   ```bash
   git checkout main
   git merge staging
   git push origin main
   ```
