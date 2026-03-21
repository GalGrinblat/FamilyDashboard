# Transaction Hub (יומן תנועות)

**Route:** `/transactions`

## Goal

The data-entry and audit layer. Upload bank/credit-card statements, let AI classify transactions automatically, review and confirm the results, then search the full transaction history.

## Tabs

### 1. Upload — AI Expense Engine (העלאת קובץ)

- User uploads a CSV exported from their bank or credit-card provider.
- `StatementUploadEngine` parses the CSV with PapaParse and normalises columns.
- The parsed rows are sent to `POST /api/classify` (Gemini 2.5 Flash).
- The endpoint:
  1. Checks `merchant_mappings` for cached category assignments.
  2. Sends uncached merchants to Gemini with the full category list as context.
  3. Returns structured results: DB matched / AI matched / unmapped / duplicates.
- User sees a summary and proceeds to the Review Queue.

### 2. Review Queue (תור לאישור)

- Displays pending transactions returned from the classification step.
- User can accept the AI-suggested category, change it, or mark a transaction as duplicate.
- Confirming sends the batch to the `transactions` table and caches any new merchant mappings.

### 3. History / Global Search (היסטוריה)

- Full paginated view of all committed transactions.
- Filter by date range, account, category, domain, or free-text merchant search.
- Displays totals for the filtered set.

## Key Components

| Component | File |
|-----------|------|
| CSV upload interface | `src/components/transactions/ExpenseUploader.tsx` |
| Statement parser | `src/components/transactions/StatementUploadEngine.tsx` |
| Review table | `src/components/transactions/ReviewTransactionsTable.tsx` |
| Transaction history | `src/components/transactions/TransactionsTable.tsx` |
| Domain filter tab | `src/components/transactions/DomainTransactionsTab.tsx` |

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/classify` | POST | AI classification via Gemini 2.5 Flash |
| `/api/transactions/batch` | POST | Batch-commit reviewed transactions |

## Database Tables

| Table | Usage |
|-------|-------|
| `transactions` | Committed transaction ledger |
| `merchant_mappings` | Classification cache (raw merchant string → category) |
| `categories` | Available categories passed to AI as context |

## Transaction Fields

Key fields on each transaction: `account_id`, `category_id`, `trip_id` (optional), `amount`, `date`, `merchant`, `is_duplicate`.

## Deduplication Logic

Transactions within ±2 days of each other with the same amount are flagged as potential duplicates (common when the same charge appears in both bank and credit-card exports).

## Notes

- If `GEMINI_API_KEY` is absent or empty, the classification endpoint returns all transactions as unmapped — no error is thrown.
- The `merchant_mappings` cache means repeat merchants are classified instantly without a Gemini call.
