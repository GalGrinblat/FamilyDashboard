# Family Dashboard (Family ERP)

A comprehensive family management system designed for tracking finances, assets, insurances, and life planning. The system natively supports Hebrew (RTL) while maintaining strong security and automated data processing.

## 🎯 Features

- **Monthly Balance Tracking:** View expected and actual income vs. expenses chronologically with local overrides.
- **Transactions & Cash Flow:** Track general spending, map expenses to bank/credit cards, and utilize an AI-powered Expense Engine for automated CSV classification.
- **Finance & Wealth:** Track income sources, assets (crypto, stocks, real estate).
- **Housing & Household:** Manage contracts, utilities, and track inventory (appliances, furniture, electronics).
- **Vehicles:** Overview fleet values and log maintenance and licensing (annual tests, mileage).
- **Insurances:** Track health, life, property, and vehicle insurances in one place.
- **Planning:** Visual timeline for periodic planning (renewals, maintenance) and dedicated vacation budgeting.
- **Mobile & PWA Ready:** Responsive design with bottom navigation, touch-first UI, and offline caching support for core views.

## 🛠 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org) (App Router)
- **Language:** TypeScript
- **Database/Auth:** [Supabase](https://supabase.com) (PostgreSQL)
- **Styling:** Tailwind CSS + Shadcn/ui
- **Icons:** Lucide-react

## 🚀 Getting Started

First, install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

Set up your environment variables by copying the example file:
```bash
cp .env.example .env.local
```
Fill in `.env.local` with your Supabase credentials.

Then, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📏 Development Rules (Critical)

1. **RTL First:** The root layout must have `dir="rtl"` and `lang="he"`. All UI components (Sidebar, Tabs, Tables) must be mirrored for Hebrew.
2. **Naming Conventions:** All file names, variables, and logic must be in **English**. All UI labels, buttons, and display text must be in **Hebrew**.
3. **Architecture:** Use Server Components for data fetching and Client Components for interactive UI (forms, tabs, uploads).
4. **Shadcn/ui:** Use Shadcn for the base components, ensuring they are adjusted for RTL (check animation directions).
5. **TypeScript Guidelines:**
    - **Strict Typing**: NEVER use the `any` type under any circumstances.
    - **Defined Types**: ALWAYS use strictly defined types or interfaces for variables, function parameters, and return types.
    - **Supabase**: When working with database payloads, always import and use the strictly generated types from the `Database` schema (e.g., `Database['public']['Tables']['table_name']['Row']`).
    - **Unknown Data**: If the exact shape of data is truly unknown at runtime, use the `unknown` type and employ type-narrowing/validation before use, but prefer explicitly mapping the expected structure.

## 💾 Database Schema (Supabase)

- **Tables:** `categories`, `accounts`, `trips`, `transactions`, `assets`, `household_items`, `reminders`, `merchant_mappings`.
- **Security:** Implement Row Level Security (RLS) so users only see their family's data.
- **Optimization:** Add a mapping table for merchants to cache AI classifications.

## 🚀 Advanced Features (Phase 2 Roadmap)
- **Currency Handling:** Automated conversion from USD/EUR to ILS for investments.
- **Deduplication:** Logic to merge identical transactions appearing in both Bank and Credit Card exports.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.
Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
