# Deployment Guide

This guide provides step-by-step instructions for deploying Family Dashboard. The deployment process involves setting up three main services: Google Cloud (for authentication), Supabase (for database and backend), and Vercel (for frontend hosting).

## Prerequisites

Before you begin, ensure you have:

- A Google account
- A GitHub account
- A Supabase account
- A Vercel account

---

## Step 1: Set Up Google Cloud Project (OAuth)

We use Google OAuth for secure authentication.

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the project dropdown at the top and click **New Project**. Give it a name (e.g., "Family Dashboard Auth") and click **Create**.
3. **Configure the OAuth Consent Screen:**
   - Go to **APIs & Services > OAuth consent screen**.
   - Choose **External** (unless you have a Google Workspace) and click **Create**.
   - Fill in the required fields: App name, User support email, and Developer contact information.
   - Click **Save and Continue** through the Scopes page (default scopes `email`, `profile`, `openid` are fine).
   - On the **Test users** page, if your app is in "Testing" mode, add the specific email addresses that are allowed to log in. _Note: If you don't do this, users will get a "403 Access Blocked" error during login._
4. **Create Credentials:**
   - Go to **APIs & Services > Credentials**.
   - Click **Create Credentials** and select **OAuth client ID**.
   - Choose **Web application** as the Application type. Give it a distinctive name.
   - We will need to return to this screen to add the Authorized JavaScript origins and Redirect URIs once we have our Supabase and Vercel URLs. Keep this tab open.

---

## Step 2: Set Up Supabase

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard) and create a new project.
2. Under **Project Settings > API**, you will find your `Project URL`, `anon / public` key, and `service_role` key. Note these down, as you will need them for Vercel.
3. **Enable Google Authentication:**
   - Go to **Authentication > Providers**.
   - Expand the **Google** section and toggle it on.
   - Copy the **Client ID** and **Client Secret** from your Google Cloud Console (Step 1) and paste them here.
   - Save the configuration.
4. **Configure Redirect URLs:**
   - Still in Supabase, go to **Authentication > URL Configuration**.
   - Under **Site URL**, you will eventually place your Vercel production deployment URL (e.g., `https://your-app.vercel.app`). For local development, you might leave it as `http://localhost:3000`.
   - Scroll down to **Redirect URLs** and add your app's callback URL. This ensures Supabase knows where to send users after they log in. For local development, add `http://localhost:3000/**`. For production, add `https://your-app.vercel.app/**`.
5. **Database Setup:**
   - Run the initial SQL migrations provided in the `supabase/migrations/` folder in the Supabase SQL Editor to spin up the required tables.
   - You rely on an `authorized_users` table to manage who can access the family dashboard. Be sure to add the desired email addresses into this table to avoid users getting locked out.

---

## Step 3: Connect Google to Supabase

1. Go back to your Google Cloud Console tab (Credentials screen of your OAuth Client ID).
2. Under **Authorized JavaScript origins**, add your Vercel App URL (e.g., `https://your-app.vercel.app`).
3. Under **Authorized redirect URIs**, add the Supabase Auth Callback URL. You can construct this by taking your Supabase Project URL and appending `/auth/v1/callback` to it. (e.g., `https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback`).
4. Click **Save**.

---

## Step 4: Deploy to Vercel

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New** > **Project** and import your Family Dashboard GitHub repository.
3. Before deploying, you must configure the Environment Variables. Add the following keys corresponding to your `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase `anon / public` key.
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase `service_role` key.
   - `GEMINI_API_KEY`: Your API key for Google Gemini (if applicable).
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Your public API key for Gemini (if applicable).
4. Click **Deploy**. Vercel will install dependencies and build the Next.js application.

---

## Troubleshooting Common Issues

### 403 Access Blocked (Google Login)

- **Cause:** Your Google Cloud OAuth Consent Screen is set to "Testing", but the email you are trying to log in with is not added to the "Test users" list.
- **Fix:** Go to Google Cloud Console > APIs & Services > OAuth consent screen > Test users, and add the email address. Alternatively, publish the app.

### Supabase Redirects to `localhost:3000` in Production

- **Cause:** The Site URL in Supabase is still pointing to `localhost`.
- **Fix:** Go to Supabase Dashboard > Authentication > URL Configuration and change the Site URL to your Vercel deployment URL.

### "Unauthorized Email" After Login

- **Cause:** The user successfully logged in with Google, but their email is not present in the `authorized_users` table in your Supabase database.
- **Fix:** Manually insert a record for the user's email into the `authorized_users` table in the Supabase SQL Editor or Table Editor.
