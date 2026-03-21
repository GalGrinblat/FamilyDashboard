# Tech Stack

## Framework & Language

| | |
|--|--|
| **Next.js** | 16.1.6 — App Router, Server Components, Turbopack dev bundler |
| **React** | 19 |
| **TypeScript** | 5, strict mode (`"strict": true`) — never use `any` |
| **Node.js** | Serverless-ready (Vercel Edge/Node runtime) |

Two route groups:
- `(app)/` — protected pages, rendered inside the Sidebar + MobileNav + GlobalFAB layout
- `(auth)/` — public login page

## Database & Auth

| | |
|--|--|
| **Supabase** | PostgreSQL with Row Level Security (RLS) on every table |
| **Auth** | Google OAuth via Supabase Auth; whitelist enforced via `authorized_users` table |
| **Generated types** | `src/types/database.types.ts` — always import these, never use raw table name strings |
| **Zod schemas** | `src/lib/schemas.ts` — validate Supabase rows before use |

Supabase clients:
- `src/lib/supabase/server.ts` — Server Components and API routes
- `src/lib/supabase/client.ts` — Client Components (mutations only)

## Data Fetching Pattern

No external state management library. The pattern is:
1. **Server Components** fetch data directly via the server Supabase client
2. The root `(app)/layout.tsx` pre-fetches shared data (categories, accounts) passed as props
3. **Client Components** call the browser Supabase client for mutations, then call `router.refresh()` to invalidate and re-render server state

## Styling

| | |
|--|--|
| **Tailwind CSS** | v4 — utility-first CSS |
| **Shadcn/ui** | Component library built on Radix UI primitives (`src/components/ui/`) |
| **Lucide React** | 0.575 — icon library |
| **Font** | Google Font "Assistant" — Hebrew-optimized |
| **RTL** | Root layout sets `dir="rtl"` and `lang="he"`; all Shadcn animations reviewed for RTL direction |

Minimum font size is `text-base` (16 px). Never use `text-xs` or `text-sm`.

## Forms & Validation

| | |
|--|--|
| **React Hook Form** | 7.71 — all forms use `useForm` |
| **Zod** | 4.3 — schema validation, integrated with RHF via `@hookform/resolvers/zod` |
| **Pattern** | All forms live in modal dialogs; submit calls Supabase mutation, then closes dialog and calls `router.refresh()` |

## Charts

**Recharts** 3.8 — used in Analytics and dashboard projections.

## Notifications

**Sonner** 2.0.7 — toast notifications for mutation success/error feedback.

## PWA

**Serwist** 9.5.6 (service worker wrapper).
- Configured in `next.config.ts`; disabled automatically in development
- Entry point: `src/app/sw.ts`
- Provides offline caching for core views; mobile-first with bottom navigation

## AI — Transaction Classification

**Google Gemini 2.5 Flash** via `@google/genai`.

Flow:
1. User uploads a bank CSV via `ExpenseUploader`
2. `POST /api/classify` checks `merchant_mappings` table for cached results
3. Uncached merchants are sent to Gemini with existing categories as context
4. Gemini returns structured JSON (category match or new category suggestion)
5. Deduplication logic flags transactions appearing within ±2 days with the same amount
6. Results include stats: DB matched / AI matched / unmapped / duplicates

Fallback: if `GEMINI_API_KEY` is absent, unmapped transactions are returned without classification.

## CSV / Excel

| | |
|--|--|
| **PapaParse** | 5.5.3 — client-side CSV parsing |
| **XLSX** | 0.18.5 — Excel export |

## Date Utilities

**date-fns** 4.1.0 — date formatting and arithmetic.

## Security Headers

Configured in `next.config.ts`:

```
Strict-Transport-Security   max-age=63072000; includeSubDomains; preload
X-Frame-Options             SAMEORIGIN
X-Content-Type-Options      nosniff
Referrer-Policy             strict-origin-when-cross-origin
Content-Security-Policy     (script-src self + unsafe-eval for Next.js)
Permissions-Policy          camera=(), microphone=(), geolocation=()
```

## Key Config Files

| File | Purpose |
|------|---------|
| `next.config.ts` | Serwist PWA, Turbopack, security headers, bundle optimizations |
| `tsconfig.json` | TypeScript strict mode, path aliases (`@/*` → `src/*`) |
| `src/lib/constants.ts` | All domain enums, category labels, reminder types, insurance subtypes, tax constants |
| `src/lib/schemas.ts` | Zod schemas for every Supabase table row |
| `src/types/database.types.ts` | Auto-generated Supabase TypeScript definitions (1 300+ lines) |
