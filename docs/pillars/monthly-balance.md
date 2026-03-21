# Monthly Balance (מאזן חודשי)

**Route:** `/`

## Goal

The dashboard — the entry point after login. Provides a high-level snapshot of the family's financial health for the current month: net worth, upcoming obligations, and cash flow overview.

## Sections

| Section | Description |
|---------|-------------|
| KPI Cards | Total assets, total liabilities, net worth, monthly income vs expense |
| Net Worth Summary | Breakdown of liquid, investment, and real-estate wealth |
| Upcoming Reminders | Next due items from the `reminders` table (payments, car tests, insurance renewals) |
| Cash Flow Overview | Current month income vs expense derived from transactions + recurring flows |

## Key Files

| File | Purpose |
|------|---------|
| `src/app/(app)/page.tsx` | Page Server Component — fetches all dashboard data and renders KPI cards, reminders, cash flow |
| `src/app/(app)/layout.tsx` | Protected layout — pre-fetches categories & accounts passed to all child pages |

## Database Tables

| Table | Usage |
|-------|-------|
| `accounts` | Current balances for bank and credit-card accounts |
| `transactions` | Month-to-date income and expense totals |
| `recurring_flows` | Expected monthly income and fixed expenses |
| `reminders` | Upcoming due dates shown in the reminder widget |
| `investment_accounts` | Non-liquid balances for net worth calculation |
| `properties` | Real estate values for net worth calculation |

## Notes

- This page is a Server Component — all data is fetched at render time; no client-side data calls.
- Net worth = liquid (accounts) + investments + real estate − liabilities (mortgages + credit balances).
- The reminder widget shows only items due within the next 30 days and not yet completed.
