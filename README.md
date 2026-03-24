# Family Dashboard (Family ERP)

A comprehensive Hebrew-first family management system for tracking finances, assets, insurances, and life planning. Built on Next.js 16 + Supabase with full RTL support, AI-powered transaction classification, and PWA offline capabilities.

## Pillars

| Pillar | Hebrew | Route | Description |
|--------|--------|-------|-------------|
| Overview | סקירה כללית | `/` | Dashboard — KPIs, net worth snapshot, upcoming reminders, cash flow overview |
| Daily Liquidity | עו״ש ותזרים | `/liquidity` | Bank/credit-card balances, recurring budget flows, monthly & yearly projections |
| Transaction Hub | יומן תנועות | `/transactions` | CSV upload with AI classification, review queue, global search |
| Wealth & Assets | הון ונכסים | `/wealth` | Investments, real estate, pension/Gemel, RSU vesting |
| Housing | מגורים | `/housing` | Properties, contracts, household inventory |
| Transportation | תחבורה | `/transportation` | Vehicles, maintenance log |
| Insurances | ביטוחים | `/insurances` | Health, property, vehicle policies |
| Planning | תכנון | `/planning` | Reminders, financial goals, trip budgeting, calendar |
| Analytics | אנליטיקס | `/analytics` | Budget vs actual, cash flow trends, domain spending |
| Settings | הגדרות | `/settings` | Category management |

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in Supabase + Gemini credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |
| `GEMINI_API_KEY` | Google Gemini API key (server-side classification) |
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key (client-side fallback) |

## Dev Commands

```bash
npm run dev        # Start dev server (db:watch + next dev with Turbopack)
npm run build      # Production build
npm run lint       # ESLint
npm run db:combine # Combine Supabase migrations into a single file
```

To add a Shadcn component: `npx shadcn@latest add <component>`

## Critical Development Rules

1. **RTL/Hebrew** — root layout has `dir="rtl"` and `lang="he"`. All UI text in Hebrew; all identifiers/filenames in English.
2. **TypeScript strict** — never use `any`; use `unknown` + type narrowing. Always use generated types from `src/types/database.types.ts`.
3. **Server Components** — fetch data in Server Components; use Client Components only for interactivity. Mutations call Supabase browser client then `router.refresh()`.
4. **Forms** — React Hook Form + Zod validation. All forms live in dialogs.
5. **Font sizes** — minimum `text-base` (16 px). Never use `text-xs` or `text-sm`.
6. **Constants** — new enums and labels go in `src/lib/constants.ts`, not inline.

## Docs

- [Tech Stack](docs/tech-stack.md)
- [Deployment Guide](docs/deployment.md)
- **Pillars:**
  - [Overview](docs/pillars/overview.md)
  - [Daily Liquidity](docs/pillars/liquidity.md)
  - [Transaction Hub](docs/pillars/transactions.md)
  - [Wealth & Assets](docs/pillars/wealth.md)
  - [Housing](docs/pillars/housing.md)
  - [Transportation](docs/pillars/transportation.md)
  - [Insurances](docs/pillars/insurances.md)
  - [Planning](docs/pillars/planning.md)
  - [Analytics](docs/pillars/analytics.md)
  - [Settings](docs/pillars/settings.md)
