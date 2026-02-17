# GitHub Deployment Setup Guide

This guide explains how to set up automated deployments for FlipRead using GitHub Actions.

## Prerequisites

- A Cloudflare account
- Access to the GitHub repository settings

## 1. Get Your Cloudflare Account ID

Your Cloudflare Account ID is:
`d660af0bb5a3a29ba9ce1266e59b87c5`

_(You can also find this in the Cloudflare Dashboard URL: `dash.cloudflare.com/<ACCOUNT_ID>`) or by running `npx wrangler whoami` locally._

## 2. Create a Cloudflare API Token

1. Go to the [Cloudflare API Tokens Dashboard](https://dash.cloudflare.com/profile/api-tokens).
2. Click **Create Token**.
3. Use the **Edit Cloudflare Workers** template.
4. Review the permissions. They should look like this:
   - **Account** / **Workers Scripts** / **Edit**
   - **Account** / **Workers KV Storage** / **Edit**
   - **Account** / **Workers Routes** / **Edit**
   - **Account** / **D1** / **Edit** (You may need to add this manually if it's missing from the template)
   - **User** / **User Details** / **Read**
   - **Zone** / **Workers Routes** / **Edit**
5. Click **Continue to summary** and then **Create Token**.
6. **Copy the token immediately**. You won't be able to see it again.

## 3. Configure GitHub Secrets

1. Go to your GitHub repository.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Add the following secrets:

| Name                    | Value                              |
| ----------------------- | ---------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | `d660af0bb5a3a29ba9ce1266e59b87c5` |
| `CLOUDFLARE_API_TOKEN`  | _The token you copied in Step 2_   |

## 4. Verify Deployment

Your repository already has a deployment workflow configured in `.github/workflows/deploy.yml`.

Once you add the secrets:

1. Push a change to the `main` branch.
2. Go to the **Actions** tab in your GitHub repository.
3. You should see a "Deploy Worker" workflow running.

## Database Migrations (Optional)

The current deployment workflow handles the application code. Database migrations are typically run manually to prevent accidental data changes.

To run production migrations manually from your local machine:

```bash
npm run db:migrate:prod
```

If you want to automate this, you can add a step to your `deploy.yml` file, but use caution.
