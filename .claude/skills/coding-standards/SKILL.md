---
name: coding-standards
description: Universal coding standards, best practices, and patterns for TypeScript, JavaScript, React, and Node.js development.
origin: ECC
---

# Coding Standards & Best Practices

Universal coding standards for TypeScript, JavaScript, React, and Node.js projects.

## Core Principles

1. **Readability First** — Code exists to be understood by humans; clear naming matters more than brevity
2. **KISS** — Simplest solution that works; avoid over-engineering
3. **DRY** — Extract duplicated logic into reusable functions
4. **YAGNI** — Build features only when needed; don't anticipate future requirements

## Naming Conventions

```typescript
// Variables & functions: camelCase, descriptive
const marketSearchQuery = 'electronics'      // ✅
const q = 'electronics'                      // ❌

// Functions: verb-noun
fetchTransactions()    // ✅
transactions()         // ❌

// Components: PascalCase
TransactionCard        // ✅
transactionCard        // ❌

// Files: PascalCase for components, camelCase for utilities
TransactionCard.tsx    // ✅
formatCurrency.ts      // ✅

// Constants: SCREAMING_SNAKE_CASE
const MAX_TRANSACTION_AMOUNT = 1_000_000

// Types/Interfaces: PascalCase, descriptive
interface Transaction { ... }
type CategoryType = 'income' | 'expense'
```

## TypeScript

```typescript
// ✅ Explicit types on public interfaces
interface Transaction {
  id: string
  amount: number
  description: string
  date: string
}

// ❌ Never use `any`
function process(data: any) { ... }

// ✅ Use `unknown` with type narrowing
function process(data: unknown) {
  if (typeof data === 'object' && data !== null) { ... }
}

// ✅ Use optional chaining and nullish coalescing
const amount = transaction?.amount ?? 0

// ✅ Prefer const; use let only when reassignment needed
const items = fetchItems()
```

## Immutability

```typescript
// ❌ Mutation
user.name = 'New Name'
items.push(newItem)

// ✅ Spread operators
const updatedUser = { ...user, name: 'New Name' }
const updatedItems = [...items, newItem]

// ✅ Array methods that return new arrays
const filtered = items.filter(i => i.active)
const mapped = items.map(i => ({ ...i, processed: true }))
```

## Error Handling

```typescript
// ✅ Comprehensive try-catch with meaningful messages
async function fetchTransactions() {
  try {
    const { data, error } = await supabase.from('transactions').select('*')
    if (error) throw new Error(`Failed to fetch transactions: ${error.message}`)
    return data
  } catch (err) {
    console.error('fetchTransactions failed:', err)
    throw err
  }
}

// ✅ Parallel async operations
const [transactions, categories] = await Promise.all([
  fetchTransactions(),
  fetchCategories(),
])
```

## React Components

```typescript
// ✅ Functional components with TypeScript interfaces
interface TransactionCardProps {
  transaction: Transaction
  onEdit: (id: string) => void
}

export function TransactionCard({ transaction, onEdit }: TransactionCardProps) {
  return (...)
}

// ✅ Custom hooks for reusable logic
function useTransactions(accountId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  // ...
  return { transactions, loading, error }
}

// ✅ Functional state updates
setCount(prev => prev + 1)

// ❌ Stale closure trap
setCount(count + 1)
```

## File Organization

```
src/
├── app/               # Next.js routes
├── components/
│   ├── ui/            # Shadcn primitives
│   └── <domain>/      # Domain-specific components
├── lib/
│   ├── constants.ts   # All enums and labels
│   ├── schemas.ts     # Zod schemas
│   ├── utils.ts       # Pure utility functions
│   └── supabase/      # DB client config
└── types/             # TypeScript type definitions
```

## Comments

```typescript
// ✅ Explain WHY, not what
// Using cursor pagination instead of offset to avoid performance degradation
// on large transaction datasets (>10k rows)
const { data } = await supabase
  .from('transactions')
  .select('*')
  .gt('id', lastId)
  .limit(50)

// ❌ Explain what (the code already says this)
// Loop through transactions
for (const t of transactions) { ... }
```

## Anti-Patterns to Avoid

| Anti-Pattern | Fix |
|---|---|
| Functions > 50 lines | Split into smaller functions |
| Nesting > 4 levels | Extract functions, use early returns |
| Magic numbers | Use named constants in `constants.ts` |
| `any` type | Use `unknown` with type narrowing |
| Inline Zod schemas | Move to `lib/schemas.ts` |
| `console.log` in components | Remove before commit |
| TODO without ticket | Add issue reference |

## Testing (AAA Pattern)

```typescript
describe('formatCurrency', () => {
  it('formats positive amounts in NIS', () => {
    // Arrange
    const amount = 1234.56

    // Act
    const result = formatCurrency(amount)

    // Assert
    expect(result).toBe('₪1,234.56')
  })
})
```

## Performance

- Memoize expensive computations with `useMemo`
- Lazy-load heavy components with `next/dynamic`
- Select only necessary Supabase columns (never `SELECT *`)
- Use `Promise.all` for independent async operations
