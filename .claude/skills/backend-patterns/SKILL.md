---
name: backend-patterns
description: Backend architecture patterns, API design, database optimization, and server-side best practices for Node.js, Express, and Next.js API routes.
origin: ECC
---

# Backend Development Patterns

Server-side architecture patterns for scalable Next.js applications.

## When to Activate

- Creating new API routes
- Refactoring existing API logic
- Adding authentication middleware
- Implementing caching
- Designing service/repository layers

## Architecture Layers

### Repository Pattern (Data Access)

```typescript
// src/lib/repositories/transactionRepository.ts
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

type Transaction = Database['public']['Tables']['transactions']['Row']

export async function getTransactionsByFamily(
  familyId: string,
  limit = 50,
  cursor?: string
): Promise<Transaction[]> {
  const supabase = await createClient()

  let query = supabase
    .from('transactions')
    .select('id, amount, description, date, category_id')
    .eq('family_id', familyId)
    .order('date', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('id', cursor)  // cursor pagination, not OFFSET
  }

  const { data, error } = await query
  if (error) throw new Error(`Failed to fetch transactions: ${error.message}`)
  return data ?? []
}
```

### Service Layer (Business Logic)

```typescript
// src/lib/services/transactionService.ts
import { getTransactionsByFamily } from '@/lib/repositories/transactionRepository'
import { TransactionSchema } from '@/lib/schemas'

export async function processTransactions(familyId: string) {
  const raw = await getTransactionsByFamily(familyId)
  return raw.map(t => TransactionSchema.parse(t))
}
```

### Middleware Pattern (Next.js API Routes)

```typescript
// src/lib/middleware/withAuth.ts
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export function withAuth(
  handler: (req: NextRequest, userId: string) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(req, user.id)
  }
}

// Usage in route.ts
export const GET = withAuth(async (req, userId) => {
  const data = await processTransactions(userId)
  return NextResponse.json({ data })
})
```

## Database Best Practices

```typescript
// ✅ Select only needed columns — never SELECT *
const { data } = await supabase
  .from('transactions')
  .select('id, amount, description, date')

// ✅ Cursor pagination — never OFFSET on large tables
const { data } = await supabase
  .from('transactions')
  .select('*')
  .gt('id', lastId)   // cursor
  .limit(50)

// ✅ Batch fetches — prevent N+1 queries
// Instead of fetching category per transaction:
const { data: transactions } = await supabase
  .from('transactions')
  .select('*, categories(id, name, color)')   // join in one query

// ✅ Short transactions — never hold locks during API calls
// Keep Supabase mutations atomic; don't mix with external API calls
```

## Caching Pattern

```typescript
// Simple in-memory cache for expensive computations
const cache = new Map<string, { data: unknown; expires: number }>()

export async function getCachedPortfolioValue(familyId: string) {
  const key = `portfolio:${familyId}`
  const cached = cache.get(key)

  if (cached && cached.expires > Date.now()) {
    return cached.data
  }

  const value = await computePortfolioValue(familyId)
  cache.set(key, { data: value, expires: Date.now() + 5 * 60 * 1000 }) // 5 min
  return value
}
```

## Error Handling

```typescript
// Custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

// Centralized handler in API routes
export async function GET(req: NextRequest) {
  try {
    const data = await fetchData()
    return NextResponse.json({ data })
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: err.statusCode }
      )
    }
    // Don't expose internal errors to client
    console.error('Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

## Rate Limiting (Simple)

```typescript
// src/lib/middleware/rateLimit.ts
const requestCounts = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string, limit = 100, windowMs = 60_000): boolean {
  const now = Date.now()
  const record = requestCounts.get(ip)

  if (!record || record.resetAt < now) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (record.count >= limit) return false

  record.count++
  return true
}
```

## Structured Logging

```typescript
// ✅ Structured JSON logging with context
function log(level: 'info' | 'warn' | 'error', message: string, context?: object) {
  console[level](JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
    // Never log: password, token, creditCard, secret
  }))
}
```

## Retry with Exponential Backoff

```typescript
async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === maxAttempts) throw err
      await new Promise(r => setTimeout(r, baseDelayMs * Math.pow(2, attempt - 1)))
    }
  }
  throw new Error('unreachable')
}
```

## API Route Checklist

- [ ] Input validated with Zod before processing
- [ ] Auth verified (Supabase session check)
- [ ] Only necessary DB columns selected
- [ ] Error messages don't expose internals
- [ ] Rate limiting applied
- [ ] Response includes appropriate HTTP status code
- [ ] No `SELECT *` in production queries
- [ ] No N+1 query patterns
