# Wealth & Assets (הון ונכסים)

**Routes:** `/wealth` (overview) and sub-pages below

## Goal

Long-term net worth tracking and strategic wealth management. Covers liquid investments, real estate, retirement vehicles, and employee equity — each with Israeli tax nuances built in.

## Sub-Pages

### Overview — `/wealth`

Summary of total wealth broken down by category: investments, real estate, pension/Gemel, and RSU.

### Investments — `/wealth/investments`

Brokerage and Histalmut accounts.

- **Accounts:** Brokerage (taxable) and Histalmut (tax-advantaged study fund) account records.
- **Holdings:** Individual stocks, ETFs, and crypto positions per account.
- **Portfolio lots:** Purchase lots with cost basis, purchase date, and lot type (buy / sell / RSU vest / dividend reinvest) for accurate capital gains calculation.
- **Snapshots:** Periodic portfolio valuations stored in `portfolio_snapshots` for historical charting.
- **Histalmut ceiling:** Monthly employee/employer contribution ceiling is ₪1,571 (stored in `src/lib/constants.ts`).

### Real Estate — `/wealth/real-estate`

Properties and their associated mortgages.

- Property records with purchase price, current estimated value, mortgage balance, and rental income.
- Net equity per property (value − mortgage) feeds the net worth calculation on the dashboard.

### Pension & Gemel — `/wealth/pension`

Pension funds and Gemel Lehashkaa (investment Gemel) accounts.

- Account balances, monthly contributions (employee + employer + self-employed).
- Tax benefit: Gemel withdrawals after age 60 taxed at 15% (constant in `src/lib/constants.ts`).

### RSU — `/wealth/rsu`

Employee Stock Unit grants and vesting schedules.

- **Grants:** Each RSU grant with grant date, total units, cliff, and vesting frequency.
- **Vests:** Individual vesting events with price-at-vest for tax calculation.
- **Section 102:** Israeli capital gains track (25%) vs income track (47% marginal) selector per grant.

## Key Components

Wealth components live under `src/components/wealth/` and its sub-directories. Key areas:
- Investment account list and holding tables
- Portfolio lot manager
- RSU grant and vest managers
- Pension account cards

## Database Tables

| Table | Usage |
|-------|-------|
| `investment_accounts` | Brokerage, Histalmut, RSU, Gemel, Pension account records |
| `portfolio_holdings` | Individual positions per account |
| `portfolio_lots` | Purchase / sell lots with cost basis |
| `portfolio_snapshots` | Historical portfolio valuations |
| `rsu_grants` | RSU grant records |
| `rsu_vests` | Vesting events |
| `properties` | Real estate (also used by Housing pillar) |

## Enums

- `investment_account_type`: `brokerage` | `histalmut` | `rsu` | `gemel` | `pension`
- `portfolio_lot_type`: `buy` | `sell` | `rsu_vest` | `dividend_reinvest`

## Israeli Tax Constants (`src/lib/constants.ts`)

| Constant | Value |
|----------|-------|
| Capital gains tax rate | 25% |
| Gemel withdrawal tax (60+) | 15% |
| Marginal income tax (top bracket) | 47% |
| Histalmut monthly ceiling | ₪1,571 |
