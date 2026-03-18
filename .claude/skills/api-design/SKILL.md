---
name: api-design
description: REST API design patterns including resource naming, status codes, pagination, filtering, error responses, versioning, and rate limiting for production APIs.
origin: ECC
---

# REST API Design Patterns

Consistent conventions for designing developer-friendly API endpoints.

## When to Activate

- Designing new API endpoints
- Reviewing existing API contracts
- Implementing error handling
- Adding pagination or filtering
- Planning API versioning

## Resource Naming

```
# Nouns, plural, lowercase, kebab-case
GET    /api/v1/transactions
GET    /api/v1/transactions/:id
POST   /api/v1/transactions
PATCH  /api/v1/transactions/:id
DELETE /api/v1/transactions/:id

# Nested resources
GET    /api/v1/accounts/:id/transactions

# Actions (use verbs only when CRUD doesn't fit)
POST   /api/v1/transactions/:id/classify
POST   /api/v1/transactions/batch
```

## HTTP Methods

| Method | Semantics | Idempotent |
|--------|-----------|------------|
| GET | Retrieve, no side effects | Yes |
| POST | Create, trigger actions | No |
| PUT | Full replace | Yes |
| PATCH | Partial update | No |
| DELETE | Remove resource | Yes |

## Status Codes

```
200 OK              — Successful GET, PATCH, DELETE
201 Created         — Successful POST (include Location header)
204 No Content      — Successful DELETE with no body
400 Bad Request     — Malformed request, invalid JSON
401 Unauthorized    — Missing or invalid authentication
403 Forbidden       — Authenticated but lacks permission
404 Not Found       — Resource doesn't exist
409 Conflict        — Duplicate resource
422 Unprocessable   — Semantically invalid data (Zod validation failure)
429 Too Many Requests — Rate limit exceeded
500 Internal Error  — Unexpected server error
```

## Response Structure

### Success (single resource)
```json
{
  "data": {
    "id": "uuid",
    "amount": 150.00,
    "description": "סופרמרקט"
  }
}
```

### Success (collection)
```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "uuid-of-last-item",
    "hasMore": true
  }
}
```

### Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "amount", "message": "Must be a positive number" }
    ]
  }
}
```

## Pagination

### Cursor-based (for large datasets like transactions)
```typescript
// Request
GET /api/v1/transactions?cursor=<last-id>&limit=50

// Implementation
const { data } = await supabase
  .from('transactions')
  .select('*')
  .lt('id', cursor ?? 'ffffffff')  // before cursor
  .order('id', { ascending: false })
  .limit(limit)

// Response
{
  "data": [...],
  "pagination": {
    "nextCursor": data[data.length - 1]?.id,
    "hasMore": data.length === limit
  }
}
```

### Offset-based (for small datasets like categories)
```typescript
// Request
GET /api/v1/categories?page=2&pageSize=20

// Response
{
  "data": [...],
  "pagination": {
    "page": 2,
    "pageSize": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

## Filtering & Sorting

```
# Filtering
GET /api/v1/transactions?categoryId=uuid&minAmount=100&maxAmount=500

# Date range
GET /api/v1/transactions?from=2024-01-01&to=2024-12-31

# Sorting (prefix - for descending)
GET /api/v1/transactions?sort=-date,amount
```

## Next.js Route Implementation

```typescript
// src/app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const QuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  categoryId: z.string().uuid().optional(),
})

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })
    }

    const params = QuerySchema.safeParse(
      Object.fromEntries(req.nextUrl.searchParams)
    )
    if (!params.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid query params', details: params.error.issues } },
        { status: 422 }
      )
    }

    const { cursor, limit, categoryId } = params.data

    let query = supabase
      .from('transactions')
      .select('id, amount, description, date, category_id')
      .order('date', { ascending: false })
      .limit(limit)

    if (cursor) query = query.lt('id', cursor)
    if (categoryId) query = query.eq('category_id', categoryId)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({
      data,
      pagination: {
        nextCursor: data[data.length - 1]?.id,
        hasMore: data.length === limit,
      },
    })
  } catch (err) {
    console.error('GET /api/transactions failed:', err)
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 }
    )
  }
}
```

## Versioning Strategy

- Version in URL path: `/api/v1/...`
- Maintain backwards compatibility within a major version
- Breaking changes require new version: `/api/v2/...`
- Deprecate old versions with `Sunset` response header

## Rate Limiting Headers

```typescript
return NextResponse.json(data, {
  headers: {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': '95',
    'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + 60),
  },
})
```

## API Design Checklist

- [ ] URLs use nouns, plural, kebab-case
- [ ] Correct HTTP method for each operation
- [ ] Appropriate status codes returned
- [ ] Consistent response envelope (`{ data }` or `{ error }`)
- [ ] Pagination for collection endpoints
- [ ] Input validated with Zod
- [ ] Auth verified before processing
- [ ] Error messages don't expose internals
- [ ] Rate limiting applied
- [ ] API versioned in URL
