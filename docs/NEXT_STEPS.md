# Next Steps – Prioritized Development Plan

This document outlines the remaining work for the Family Dashboard project, ordered by priority. Priority is determined by user-facing impact, dependency relationships between features, and alignment with the goals defined in `PROJECT_GUIDE.md`.

---

## 🔴 Priority 1 – Complete Partially-Built Pages (High Impact, Low Risk)

These pages have navigation entries, routing, and some tabs already wired up, but specific tabs are currently unimplemented placeholders. Completing them closes obvious product gaps without requiring new architecture.

### 1.1 Finance & Wealth (`/finance`)

| Tab | Status | Work Required |
|-----|--------|---------------|
| Manage Accounts | ✅ Done | — |
| Income Sources (מקורות הכנסה) | ❌ Placeholder | Build `IncomeSources` component. List income records (salary, rent, child benefits) sourced from `recurring_flows` filtered by `INCOME`. Allow add/edit/delete. |
| Assets & Investments (השקעות) | ❌ Placeholder | Build `AssetsTable` component. Display `assets` rows grouped by type (stocks, crypto, real estate). Show estimated value and last-updated date. Allow add/edit/delete. |
| Pension & Savings (פנסיה וגמל) | ❌ Placeholder | Build `PensionTab` component. Track pension/savings fund balances and contribution rates. Store as a new `pension_funds` table or extend `assets`. |

### 1.2 Housing & Household (`/housing`)

| Tab | Status | Work Required |
|-----|--------|---------------|
| Appliances / Furniture / Electronics | ✅ Done | — |
| Transactions | ✅ Done | — |
| Contracts & Utilities (חוזים ושירותים) | ❌ Placeholder | Build `ContractsTab` component. Track service providers (mortgage/rent, internet, electricity, water) with contract end dates, provider name, and monthly cost. A dedicated `contracts` table (or reuse `recurring_flows` + a `provider` field) is recommended. |

### 1.3 Transportation (`/transportation`)

| Tab | Status | Work Required |
|-----|--------|---------------|
| Active Cars / Transactions | ✅ Done | — |
| Maintenance & Licensing (טיפולים ורישוי) | ❌ Placeholder | Build `MaintenanceLog` component. Track garage visits, annual tests (טסט), and mileage per vehicle. Store events in a new `maintenance_events` table linked to the `assets` vehicle row. |

### 1.4 Settings (`/settings`)

| Tab | Status | Work Required |
|-----|--------|---------------|
| Category Manager | ✅ Done | — |
| System Settings (הגדרות מערכת) | ❌ Disabled | Enable tab. Allow users to set: default currency, family name label, notification preferences. Store in a `user_settings` table or Supabase auth metadata. |

---

## 🟠 Priority 2 – Monthly Balance: General Month Tab

The **Specific Month** tab is already implemented. The **General Month** tab (`GeneralMonthTab`) exists as a placeholder and is the primary remaining gap in the Monthly Balance section.

**Work Required:**
- Implement `GeneralMonthTab` component.
- Show conceptual baseline: recurring income vs. budgeted expenses, grouped by **Domain** (using `DOMAIN_LABELS` from `constants.ts`).
- Source data from `recurring_flows` table.
- Display a per-domain breakdown with totals and a net monthly cash flow summary.

---

## 🟡 Priority 3 – Mobile & PWA Readiness

Defined as a core requirement in `PROJECT_GUIDE.md`. Most mobile layout groundwork (Bottom Nav, Global FAB) is in place; the following items are outstanding:

### 3.1 PWA Setup (✅ Done)
- Added `public/manifest.json` with app name, icons, theme color, and `"display": "standalone"`.
- Registered a service worker using `@serwist/next`.
- Enabled offline caching for the App shell and Overview via Serwist. (A Shopping List page is planned for Phase 2 and will need offline caching explicitly checked at that time.)

### 3.2 Swipe Gestures
- Add swipe-to-delete and swipe-to-edit for list items on the **Transactions** and **Shopping List** views on mobile screens.
- Recommended library: `react-swipeable` or a custom touch-handler hook.

### 3.3 Data Tables → Mobile Cards
- Audit all `<Table>` components to ensure they render as **Card lists** on `max-width: 768px`.
- Already partially handled in some components; needs a systematic pass.

### 3.4 Minimum Touch Targets
- Audit all interactive elements (buttons, icons) for a minimum `44×44px` touch target.
- Add `min-h-11 min-w-11` Tailwind classes (or equivalent) where missing.

---

## 🟢 Priority 4 – Expense Engine & AI Classification

The `ExpenseUploader` component exists but the classification pipeline is not yet fully wired up.

**Work Required:**
1. **CSV Parsing:** Accept CSV exports from Israeli banks and credit cards (Hapoalim, Leumi, Max, Cal). Normalize column names per bank format.
2. **Merchant Mapping:** Use the existing `merchant_mappings` table to auto-classify known merchants.
3. **AI Classification:** For unrecognized merchants, call an AI/LLM endpoint (OpenAI / Gemini) to suggest a category. Persist the result in `merchant_mappings` to cache future calls.
4. **Review Step:** Show `ReviewTransactionsTable` so the user can confirm or correct each classification before saving to `transactions`.
5. **Deduplication:** Flag or merge transactions that appear in both bank and credit card exports (match on date + amount + merchant fuzzy match).

---

## 🔵 Priority 5 – Analytics, Charts & Reporting

These features add visibility into trends but are not blocking core CRUD workflows.

| Feature | Description |
|---------|-------------|
| Domain Spending Chart | Bar/pie chart of monthly spend per domain (use `recharts` or `shadcn` Charts). |
| Net Worth Trend | Line chart of net worth over time (snapshot monthly). |
| Budget vs. Actual | Compare budgeted (`recurring_flows`) vs. actual (`transactions`) per domain per month. |
| Annual Summary | Year-to-date income, expenses, and savings rate. |

---

## ⚪ Priority 6 – Advanced Features (Phase 2)

Lower priority items defined in `PROJECT_GUIDE.md` as "Phase 2":

| Feature | Description |
|---------|-------------|
| Multi-currency Support | Automated USD/EUR → ILS conversion for investment assets. Use an exchange-rate API (e.g., `exchangerate.host`). |
| Shopping List | A lightweight grocery/errand list with offline PWA support. |
| Recurring Payment Execution Tracking | Mark recurring flows as "paid" each month and surface overdue items on the Overview dashboard. |
| Family Member Profiles | Support multiple family members with individual income/expense attribution. |
| Push Notifications | Remind users of upcoming reminders (car tests, insurance renewals) via browser push or email. |

---

## Implementation Notes

- **All new UI labels and text must be in Hebrew** (per `PROJECT_GUIDE.md`).
- **All code, file names, and variables must be in English**.
- **Never use `any` in TypeScript** – use `Database['public']['Tables'][...]['Row']` for Supabase payloads.
- **New tables** must have Row Level Security (RLS) enabled before going to production.
- **Server Components** for data fetching, **Client Components** for interactive forms/tabs.