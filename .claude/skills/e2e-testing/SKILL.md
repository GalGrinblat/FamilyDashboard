---
name: e2e-testing
description: Playwright E2E testing patterns, Page Object Model, configuration, CI/CD integration, artifact management, and flaky test strategies.
origin: ECC
---

# E2E Testing Patterns

Comprehensive Playwright patterns for building stable, fast, and maintainable E2E test suites.

## Test File Organization

```
tests/
├── e2e/
│   ├── auth/
│   │   ├── login.spec.ts
│   │   └── logout.spec.ts
│   ├── features/
│   │   ├── transactions.spec.ts
│   │   ├── liquidity.spec.ts
│   │   └── portfolio.spec.ts
│   └── api/
│       └── endpoints.spec.ts
├── fixtures/
│   ├── auth.ts
│   └── data.ts
└── playwright.config.ts
```

## Page Object Model (POM)

```typescript
import { Page, Locator } from '@playwright/test'

export class TransactionsPage {
  readonly page: Page
  readonly addButton: Locator
  readonly transactionCards: Locator
  readonly amountInput: Locator

  constructor(page: Page) {
    this.page = page
    this.addButton = page.locator('[data-testid="add-transaction-btn"]')
    this.transactionCards = page.locator('[data-testid="transaction-card"]')
    this.amountInput = page.locator('[data-testid="amount-input"]')
  }

  async goto() {
    await this.page.goto('/transactions')
    await this.page.waitForLoadState('networkidle')
  }

  async getTransactionCount() {
    return await this.transactionCards.count()
  }

  async addTransaction(amount: string, description: string) {
    await this.addButton.click()
    await this.amountInput.fill(amount)
    await this.page.locator('[data-testid="description-input"]').fill(description)
    await this.page.locator('[data-testid="save-btn"]').click()
    await this.page.waitForLoadState('networkidle')
  }
}
```

## Test Structure

```typescript
import { test, expect } from '@playwright/test'
import { TransactionsPage } from '../../pages/TransactionsPage'

test.describe('Transactions', () => {
  let transactionsPage: TransactionsPage

  test.beforeEach(async ({ page }) => {
    transactionsPage = new TransactionsPage(page)
    await transactionsPage.goto()
  })

  test('should display transaction list', async ({ page }) => {
    const count = await transactionsPage.getTransactionCount()
    expect(count).toBeGreaterThan(0)
  })

  test('should add a new transaction', async ({ page }) => {
    const before = await transactionsPage.getTransactionCount()
    await transactionsPage.addTransaction('150', 'סופרמרקט')
    const after = await transactionsPage.getTransactionCount()
    expect(after).toBe(before + 1)
    await expect(page.locator('text=סופרמרקט')).toBeVisible()
  })

  test('should handle empty state', async ({ page }) => {
    // Test with no transactions
    await expect(page.locator('[data-testid="empty-state"]')).toBeVisible()
  })
})
```

## Playwright Configuration

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-results.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
})
```

## Flaky Test Prevention

### Race Conditions
```typescript
// ❌ Bad: assumes element is ready
await page.click('[data-testid="button"]')

// ✅ Good: auto-wait locator
await page.locator('[data-testid="button"]').click()
```

### Network Timing
```typescript
// ❌ Bad: arbitrary timeout
await page.waitForTimeout(5000)

// ✅ Good: wait for specific condition
await page.waitForResponse(resp =>
  resp.url().includes('/api/transactions') && resp.status() === 200
)
```

### Animation Timing
```typescript
// ✅ Good: wait for stability before clicking
await page.locator('[data-testid="menu-item"]').waitFor({ state: 'visible' })
await page.waitForLoadState('networkidle')
await page.locator('[data-testid="menu-item"]').click()
```

### Quarantine Flaky Tests
```typescript
test('flaky: complex filter', async ({ page }) => {
  test.fixme(true, 'Flaky - Issue #123')
  // test code...
})

test.skip(process.env.CI, 'Flaky in CI - Issue #123')
```

## CI/CD Integration

```yaml
# .github/workflows/e2e.yml
name: E2E Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
        env:
          BASE_URL: ${{ vars.STAGING_URL }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Financial Flow Testing

```typescript
test('user can view transaction history', async ({ page }) => {
  // Skip on production — real data
  test.skip(process.env.NODE_ENV === 'production', 'Skip on production')

  await page.goto('/transactions')

  // Verify transactions loaded
  const cards = page.locator('[data-testid="transaction-card"]')
  await expect(cards.first()).toBeVisible()

  // Verify amount formatting (Hebrew RTL)
  const amount = cards.first().locator('[data-testid="amount"]')
  await expect(amount).toContainText('₪')
})

test('user can filter by category', async ({ page }) => {
  await page.goto('/transactions')
  await page.locator('[data-testid="category-filter"]').click()
  await page.locator('[data-testid="category-food"]').click()
  await page.waitForResponse(resp => resp.url().includes('/api/transactions'))

  // Verify all visible transactions are food category
  const categories = page.locator('[data-testid="transaction-category"]')
  const count = await categories.count()
  for (let i = 0; i < count; i++) {
    await expect(categories.nth(i)).toContainText('מזון')
  }
})
```

## RTL Testing Notes

This app is Hebrew-first (RTL). When writing selectors:
- Prefer `data-testid` attributes over position-based selectors
- Test Hebrew text content: `await expect(el).toContainText('הוסף עסקה')`
- Verify RTL layout doesn't break interactions

## Checklist Before Adding E2E Tests

- [ ] `data-testid` attributes added to interactive elements
- [ ] Page Object Model created for the page
- [ ] Critical user flows identified
- [ ] Happy path test written
- [ ] Error state test written
- [ ] Empty state test written
- [ ] Tests pass locally with `npx playwright test`
- [ ] CI workflow updated
