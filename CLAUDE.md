# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev        # Start dev server (runs db:watch + next dev concurrently)
npm run build      # Production build
npm run lint       # Run ESLint
npm run db:combine # Combine Supabase migrations into a single file
```

There are no test commands configured. Linting is the primary code quality gate.

To add Shadcn components: `npx shadcn@latest add <component>`

## Architecture Overview

**Stack**: Next.js 16 (App Router) + TypeScript + Supabase + Tailwind CSS 4 + Shadcn/ui

### Routing & Layouts

Two route groups:
- `(app)/` — protected pages with Sidebar + MobileNav + GlobalFAB layout
- `(auth)/` — public login page

The root `(app)/layout.tsx` is a Server Component that pre-fetches shared data (categories, accounts) passed down as props. Individual pages also fetch their own data server-side.

### Data Fetching Pattern

- **Server Components** fetch data directly via Supabase (`src/lib/supabase/server.ts`)
- **Client Components** (`'use client'`) handle interactivity; they call Supabase browser client (`src/lib/supabase/client.ts`) for mutations, then trigger `router.refresh()` to re-render server state
- No separate state management library — server components + router refresh is the pattern

### Database

- Supabase PostgreSQL with Row Level Security (RLS) — users only see their family's data
- Generated types live in `src/types/database.types.ts` — always use these, never raw strings
- Zod schemas in `src/lib/schemas.ts` validate data from Supabase before use

### AI Integration

Google Gemini API (`@google/genai`) powers transaction classification at `src/app/api/classify/route.ts`. Batch processing at `src/app/api/transactions/batch/route.ts`.

### PWA

Serwist (service worker) configured in `next.config.ts`. Service worker entry at `src/app/sw.ts`.

## Critical Development Rules

**RTL / Hebrew**
- The app is Hebrew-first: root layout sets `dir="rtl"` and `lang="he"`
- All UI text must be in Hebrew; all code identifiers/filenames in English
- Shadcn animations may need RTL adjustments (e.g., slide directions)

**TypeScript**
- Strict mode is on — never use `any`; use `unknown` with type narrowing instead
- Always use generated Supabase types from `database.types.ts`

**Component patterns**
- Use Server Components for data fetching; Client Components only when interactivity is required
- Forms use React Hook Form + Zod validation
- Domain-specific components live under `src/components/<domain>/`; shared UI primitives in `src/components/ui/` (Shadcn)

**Constants & schemas**
- Category types, domain labels, reminder types, etc. are all defined in `src/lib/constants.ts`
- Add new enums/labels there, not inline in components

## Key Files

| File | Purpose |
|------|---------|
| `src/app/(app)/page.tsx` | Main dashboard — KPIs, reminders, cash flow |
| `src/app/(app)/layout.tsx` | Protected layout, fetches shared server data |
| `src/lib/constants.ts` | All domain enums, category labels, types |
| `src/lib/schemas.ts` | Zod schemas for Supabase data validation |
| `src/lib/utils.ts` | `formatCurrency`, color helpers |
| `src/types/database.types.ts` | Auto-generated Supabase DB types |
| `src/components/Sidebar.tsx` | Main navigation |
