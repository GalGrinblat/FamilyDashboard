# Analytics (אנליטיקס)

**Route:** `/analytics`

## Goal

Visualise historical financial patterns. Compare actual spending against the budget, track cash flow trends over time, and break down spend by domain.

## Charts

### Budget vs Actual (תקציב מול בפועל)

- Side-by-side bar chart per category comparing the budgeted amount (from `recurring_flows`) against actual spend (from `transactions`) for a selected month.
- Highlights over-budget categories in red.

### Cash Flow Trend (מגמת תזרים)

- Line or bar chart showing monthly net cash flow (income − expenses) over a rolling 12-month window.
- Helps identify seasonal patterns and months with consistent deficits.

### Domain Spending (הוצאות לפי שיוך)

- Pie/donut or bar chart breaking total spend down by domain (Housing, Transportation, Supermarket, Entertainment, etc.) for a selected period.
- Allows quick identification of the largest spending categories.

## Key Components

| Component | File |
|-----------|------|
| Budget vs actual chart | `src/components/analytics/BudgetVsActual.tsx` |
| Cash flow trend chart | `src/components/analytics/CashFlowTrendChart.tsx` |
| Domain spending chart | `src/components/analytics/DomainSpendingChart.tsx` |

## Database Tables

| Table | Usage |
|-------|-------|
| `transactions` | Actual spend data |
| `recurring_flows` | Budget baseline for comparison |
| `categories` | Category and domain metadata for grouping |

## Notes

- All data is fetched server-side on the analytics page; charts are rendered client-side with Recharts.
- The domain breakdown maps categories to their `domain` field (defined in `src/lib/constants.ts`).
