# Testing Infrastructure

## Overview

The project uses a three-layer testing strategy:

| Layer | Tool | Location |
|---|---|---|
| **Unit** | Vitest + React Testing Library | `src/**/*.test.ts(x)` — co-located with source |
| **Integration** | Vitest + MSW (Mock Service Worker) | `src/**/*.test.tsx` — co-located with component |
| **E2E** | Playwright | `tests/e2e/*.spec.ts` |

---

## Running Tests

```bash
# Unit + integration (fast, no network, no browser)
npm run test

# Watch mode
npm run test:watch

# Coverage report (enforces 70% threshold on lines/functions/branches)
npm run test:coverage

# E2E (auto-starts dev server locally)
npm run test:e2e
```

---

## Key Files

| File | Purpose |
|---|---|
| `vitest.config.ts` | Vitest config: jsdom environment, `@/` path alias, coverage thresholds |
| `playwright.config.ts` | Playwright config: targets `tests/e2e/`, Chromium/Firefox/Safari, auto dev server |
| `tests/setup.ts` | Global test setup: starts MSW server, extends jest-dom matchers, mocks `next/navigation` and `next/headers` |
| `tests/msw/handlers.ts` | Central MSW request handlers mocking the Supabase REST and Auth endpoints |
| `tests/msw/server.ts` | MSW Node server instance (started in `tests/setup.ts`) |
| `.husky/pre-commit` | Runs ESLint + related Vitest tests before every commit |
| `.github/workflows/test.yml` | CI: unit tests on every PR; E2E on main branch push only |

---

## Network Mocking with MSW

Unit and integration tests never hit the real Supabase. [MSW](https://mswjs.io) intercepts HTTP calls at the network layer:

```
Test renders a component
  → component calls Supabase client
    → Supabase client makes HTTP request
      → MSW intercepts and returns fixture data from tests/msw/handlers.ts
```

To override a handler for a specific test:

```ts
import { server } from 'tests/msw/server';
import { http, HttpResponse } from 'msw';

it('handles empty accounts', () => {
  server.use(
    http.get('*/rest/v1/accounts', () => HttpResponse.json([]))
  );
  // ... render and assert
});
```

Handlers reset to defaults automatically after each test.

---

## Next.js Mocks

`tests/setup.ts` provides global vi mocks for:

- `next/navigation` — `useRouter`, `usePathname`, `useSearchParams`, `redirect`
- `next/headers` — `cookies`, `headers`

Server Actions in components must be mocked per-test file:

```ts
vi.mock('@/app/(app)/finance/actions', () => ({
  upsertAccountAction: vi.fn().mockResolvedValue({ success: true }),
}));
```

---

## Coverage

Coverage is collected with `@vitest/coverage-v8` and enforces **70% minimum** on lines, functions, branches, and statements.

```bash
npm run test:coverage
# Opens coverage/index.html for the full report
```

`src/app/**` (Next.js pages/layouts) is excluded from the coverage threshold — those are covered by E2E tests instead.

---

## E2E Tests

E2E tests live in `tests/e2e/` and are completely separate from unit tests.

| File | What it covers |
|---|---|
| `auth.spec.ts` | Redirect for unauthenticated users, login form, invalid credential error |
| `navigation.spec.ts` | Post-login sidebar visibility, routing to each section |
| `workflows.spec.ts` | Finance page load, account dialog open/close |

E2E tests that require authenticated sessions use a `login()` helper and read credentials from environment variables:

```
TEST_USER_EMAIL=...
TEST_USER_PASSWORD=...
```

Set these in a local `.env.test.local` file (gitignored) or as GitHub Secrets for CI.

---

## CI Pipeline

Defined in `.github/workflows/test.yml`:

1. **Every push / PR** → runs lint, type-check, and unit/integration tests; uploads coverage artifact.
2. **Push to `main` only** → also runs Playwright E2E tests in Chromium; uploads report on failure.

Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` as GitHub Secrets for E2E CI runs.

---

## Adding New Tests

### Unit test
Create `src/lib/myfile.test.ts` next to the source file. Use `vi.fn()` for mocks.

### Integration test
Create `src/components/domain/MyComponent.test.tsx`. Mock server actions and override MSW handlers as needed. Use `render`, `screen`, and `userEvent` from React Testing Library.

### E2E test
Create `tests/e2e/myflow.spec.ts`. Use Playwright's `test`/`expect` API. Reuse the `login()` helper from `navigation.spec.ts` for authenticated flows.
