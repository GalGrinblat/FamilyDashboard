# Daily Liquidity (עו״ש ותזרים)

**Route:** `/liquidity`

## Goal

Manage day-to-day cash availability. Track bank and credit-card balances, define the family's recurring budget, and project how those flows translate into monthly and yearly cash position.

## Tabs

### 1. Accounts (חשבונות)

- Lists all bank accounts and credit cards with current balances.
- Actions: add, edit, delete accounts; update current balance.
- Credit cards show billing day, credit limit, and utilisation.

### 2. Budget & Recurring (תזרים קבוע)

- Manages `recurring_flows` — the predictable income and expense items (salary, rent, subscriptions).
- Per-flow: name, amount, frequency (weekly / monthly / yearly), category, linked account, and optional link to a property or vehicle.
- Monthly overrides: a specific month's amount can be overridden without changing the base recurring flow.
- One-off items: single-month expenses/income added via `monthly_one_offs`.

### 3. Monthly Projection (תחזית חודשית)

- Builds a forward projection for the current (or selected) month using recurring flows + one-offs.
- Shows expected closing balance per account after all obligations clear.

### 4. Cash Flow Forecast (תחזית שנתית)

- Yearly view — month-by-month cash flow forecast based on recurring flows.
- Helps identify months with expected shortfalls before they arrive.

## Key Components

| Component | File |
|-----------|------|
| Accounts tab | `src/components/liquidity/LiquidityAccountsTab.tsx` |
| Recurring flows table | `src/components/liquidity/RecurringFlowsTable.tsx` |
| Monthly projection | `src/components/liquidity/MonthlyProjectionTab.tsx` |
| Yearly forecast | `src/components/liquidity/CashFlowForecastTab.tsx` |
| Account dialog (add/edit) | `src/components/liquidity/AccountDialog.tsx` |
| Change payment method | `src/components/liquidity/ChangePaymentMethodDialog.tsx` |

## Database Tables

| Table | Usage |
|-------|-------|
| `accounts` | Bank and credit-card records |
| `recurring_flows` | Budget line items (income + expense) |
| `monthly_overrides` | Per-month amount overrides for a recurring flow |
| `monthly_one_offs` | Single-month ad-hoc income/expense entries |

## Enums

- `account_type`: `bank` | `credit_card`
- `flow_type`: `income` | `expense`
- `flow_frequency`: `weekly` | `monthly` | `yearly`
