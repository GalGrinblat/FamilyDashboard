# Deployment Guide

Step-by-step instructions for deploying Family Dashboard. Three services are involved: Google Cloud (OAuth), Supabase (database + auth backend), and Vercel (frontend hosting).

## Prerequisites

- Google account
- GitHub account with the repository
- Supabase account
- Vercel account

---

## Step 1: Set Up Google Cloud Project (OAuth)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click the project dropdown at the top and click **New Project**. Give it a name (e.g., "Family Dashboard Auth") and click **Create**.
3. **Configure the OAuth Consent Screen:**
   - Go to **APIs & Services > OAuth consent screen**.
   - Choose **External** and click **Create**.
   - Fill in App name, User support email, and Developer contact information.
   - Click **Save and Continue** through the Scopes page (default scopes `email`, `profile`, `openid` are sufficient).
   - On the **Test users** page, add the email addresses that should be allowed to log in while the app is in "Testing" mode. Skipping this step causes a "403 Access Blocked" error.
4. **Create Credentials:**
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials > OAuth client ID**.
   - Choose **Web application**. Give it a distinctive name.
   - Leave this tab open — you will add Authorized Origins and Redirect URIs after getting your Supabase URL.

---

## Step 2: Set Up Supabase

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Under **Project Settings > API**, note down:
   - `Project URL`
   - `anon / public` key
   - `service_role` key
3. **Enable Google Authentication:**
   - Go to **Authentication > Providers > Google** and toggle it on.
   - Paste the **Client ID** and **Client Secret** from your Google Cloud OAuth client (Step 1).
   - Save.
4. **Configure Redirect URLs:**
   - Go to **Authentication > URL Configuration**.
   - **Site URL:** Your Vercel production URL (e.g., `https://your-app.vercel.app`). Use `http://localhost:3000` for local dev.
   - **Redirect URLs:** Add `http://localhost:3000/**` (dev) and `https://your-app.vercel.app/**` (prod).
5. **Database Setup:**
   - Run the SQL migrations from `supabase/migrations/` in the Supabase SQL Editor to create all required tables.
   - **Important:** Insert the family members' email addresses into the `authorized_users` table. Anyone not in this table will be rejected after login with an "Unauthorized Email" error.

---

## Step 3: Connect Google to Supabase

1. Return to the Google Cloud Console, Credentials screen for your OAuth client.
2. **Authorized JavaScript origins:** Add your Vercel URL (e.g., `https://your-app.vercel.app`).
3. **Authorized redirect URIs:** Add `https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback`.
4. Click **Save**.

---

## Step 4: Deploy to Vercel

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New > Project** and import the GitHub repository.
3. Add the following **Environment Variables** before clicking Deploy:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase `anon / public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase `service_role` key (never expose client-side) |
| `GEMINI_API_KEY` | Google Gemini API key (server-side classification endpoint) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key (client-side fallback, if needed) |

4. Click **Deploy**. Vercel installs dependencies and builds the Next.js application automatically.

---

## Troubleshooting

### 403 Access Blocked (Google Login)

- **Cause:** OAuth Consent Screen is in "Testing" mode and the user's email is not on the Test users list.
- **Fix:** Go to Google Cloud Console > APIs & Services > OAuth consent screen > Test users and add the email. Alternatively, publish the app to production mode.

### Supabase Redirects to `localhost:3000` in Production

- **Cause:** Site URL in Supabase still points to `localhost`.
- **Fix:** Go to Supabase Dashboard > Authentication > URL Configuration and update the Site URL to your Vercel URL.

### "Unauthorized Email" After Login

- **Cause:** The user authenticated successfully with Google, but their email is not in the `authorized_users` table.
- **Fix:** Insert a row for the user's email into `authorized_users` via the Supabase Table Editor or SQL Editor:
  ```sql
  INSERT INTO authorized_users (email) VALUES ('user@example.com');
  ```

### AI Classification Not Working

- **Cause:** `GEMINI_API_KEY` environment variable is missing or incorrect.
- **Effect:** Transactions are returned as unmapped (no crash). Classification silently skips.
- **Fix:** Add a valid Gemini API key in the Vercel environment variables and redeploy.
