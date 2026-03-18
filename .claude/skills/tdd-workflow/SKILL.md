---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests.
origin: ECC
---

# Test-Driven Development Workflow

This skill ensures all code development follows TDD principles with comprehensive test coverage.

## When to Activate

- Writing new features or functionality
- Fixing bugs or issues
- Refactoring existing code
- Adding API endpoints
- Creating new components

## Core Principles

### 1. Tests BEFORE Code
ALWAYS write tests first, then implement code to make tests pass.

### 2. Coverage Requirements
- Minimum 80% coverage (unit + integration + E2E)
- All edge cases covered
- Error scenarios tested
- Boundary conditions verified

### 3. Test Types

#### Unit Tests
- Individual functions and utilities
- Component logic
- Pure functions
- Helpers and utilities

#### Integration Tests
- API endpoints
- Database operations
- Service interactions
- External API calls

#### E2E Tests (Playwright)
- Critical user flows
- Complete workflows
- Browser automation
- UI interactions

## TDD Workflow Steps

### Step 1: Write User Journeys
```
As a [role], I want to [action], so that [benefit]

Example:
As a user, I want to add a transaction,
so that I can track my family's expenses.
```

### Step 2: Generate Test Cases
For each user journey, create comprehensive test cases:

```typescript
describe('TransactionService', () => {
  it('creates transaction with valid data', async () => { })
  it('rejects transaction with negative amount', async () => { })
  it('rejects transaction with missing category', async () => { })
  it('handles database errors gracefully', async () => { })
})
```

### Step 3: Run Tests (They Should Fail)
```bash
npm test
# Tests should fail - we haven't implemented yet
```

### Step 4: Implement Code
Write minimal code to make tests pass.

### Step 5: Run Tests Again
```bash
npm test
# Tests should now pass
```

### Step 6: Refactor
Improve code quality while keeping tests green.

### Step 7: Verify Coverage
```bash
npm run test:coverage
# Verify 80%+ coverage achieved
```

## Testing Patterns

### Unit Test Pattern (Jest/Vitest)
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### API Integration Test Pattern
```typescript
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/transactions', () => {
  it('returns transactions successfully', async () => {
    const request = new NextRequest('http://localhost/api/transactions')
    const response = await GET(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.data).toBeDefined()
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('returns 401 for unauthenticated requests', async () => {
    const request = new NextRequest('http://localhost/api/transactions')
    const response = await GET(request)
    expect(response.status).toBe(401)
  })
})
```

### E2E Test Pattern (Playwright)
```typescript
import { test, expect } from '@playwright/test'

test('user can add a transaction', async ({ page }) => {
  await page.goto('/transactions')
  await page.click('[data-testid="add-transaction-btn"]')
  await page.fill('[data-testid="amount-input"]', '150')
  await page.fill('[data-testid="description-input"]', 'Test transaction')
  await page.click('[data-testid="save-btn"]')
  await expect(page.locator('text=Test transaction')).toBeVisible()
})
```

## Test File Organization

```
src/
├── components/
│   └── TransactionCard/
│       ├── TransactionCard.tsx
│       └── TransactionCard.test.tsx
├── app/
│   └── api/
│       └── transactions/
│           ├── route.ts
│           └── route.test.ts
└── e2e/
    ├── transactions.spec.ts
    └── auth.spec.ts
```

## Mocking External Services

### Supabase Mock
```typescript
jest.mock('@/lib/supabase/client', () => ({
  createBrowserClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [{ id: '1', amount: 100, description: 'Test' }],
          error: null,
        })),
      })),
    })),
  })),
}))
```

### Gemini API Mock
```typescript
jest.mock('@google/genai', () => ({
  GoogleGenerativeAI: jest.fn(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn(() => Promise.resolve({
        response: { text: () => 'מזון' },
      })),
    })),
  })),
}))
```

## Coverage Configuration

```json
// jest.config.js or package.json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## Common Testing Mistakes

### ❌ WRONG: Testing Implementation Details
```typescript
expect(component.state.count).toBe(5)
```

### ✅ CORRECT: Test User-Visible Behavior
```typescript
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### ❌ WRONG: Tests Depending on Each Other
```typescript
test('creates user', () => { /* modifies shared state */ })
test('updates same user', () => { /* depends on above */ })
```

### ✅ CORRECT: Independent Tests
```typescript
test('creates user', () => {
  const user = buildTestUser()
  // isolated
})
```

## Best Practices

1. **Write Tests First** — Always TDD
2. **One Assert Per Test** — Focus on single behavior
3. **Descriptive Test Names** — `it('returns 401 when not authenticated')`
4. **Arrange-Act-Assert** — Clear test structure
5. **Mock External Dependencies** — Isolate unit tests
6. **Test Edge Cases** — null, undefined, empty, max values
7. **Test Error Paths** — Not just happy paths
8. **Keep Tests Fast** — Unit tests < 50ms each
9. **Clean Up After Tests** — No side effects
10. **Review Coverage Reports** — Identify gaps

---

**Remember**: "Tests are not optional. They are the safety net that enables confident refactoring, rapid development, and production reliability."
