---
name: nextjs-turbopack
description: Next.js 16+ and Turbopack — incremental bundling, FS caching, dev speed, and when to use Turbopack vs webpack.
origin: ECC
---

# Next.js 16+ and Turbopack

## Overview

Next.js 16+ uses Turbopack by default for local development — an incremental bundler written in Rust that significantly speeds up dev startup and hot module replacement (HMR).

## When to Activate

- Diagnosing slow dev server startup
- Investigating HMR performance
- Configuring build optimizations
- Upgrading Next.js versions
- Evaluating Turbopack vs webpack

## Turbopack vs Webpack

| | Turbopack (default) | Webpack (opt-in) |
|---|---|---|
| Dev cold start | 5–14x faster | Baseline |
| HMR | Very fast (incremental) | Slower |
| Production builds | Next.js 16+ | Always webpack |
| FS caching | Built-in | Manual config |
| Plugin ecosystem | Growing | Mature |
| Config compatibility | Subset of webpack | Full |

**Use Turbopack** (default) for all local development.

**Fall back to webpack** only if you have webpack-specific plugins not yet supported by Turbopack:

```json
// package.json
{
  "scripts": {
    "dev": "next dev",                    // Turbopack (default)
    "dev:webpack": "next dev --turbo=false"  // webpack fallback
  }
}
```

## How Turbopack Works

Turbopack achieves speed through **file-system caching**:

- On first run: builds and caches each module
- On restart: reuses cached modules that haven't changed
- On file change: only rebuilds the changed module and its dependents

Result: restarts are near-instant for large projects.

## Configuration (`next.config.ts`)

```typescript
import type { NextConfig } from 'next'

const config: NextConfig = {
  // Turbopack config (Next.js 16+)
  turbopack: {
    // Custom module resolution
    resolveAlias: {
      '@/components': './src/components',
    },

    // Custom file extensions
    resolveExtensions: ['.ts', '.tsx', '.js', '.jsx'],
  },

  // These apply to both Turbopack and webpack
  experimental: {
    // Enable Bundle Analyzer (Next.js 16.1+)
    // Run: ANALYZE=true npm run build
  },
}

export default config
```

## Bundle Analysis (Next.js 16.1+)

```bash
# Install analyzer
npm install --save-dev @next/bundle-analyzer

# Run analysis
ANALYZE=true npm run build
```

This opens an interactive treemap showing bundle size by package — useful for identifying large dependencies to code-split.

## Performance Tips

### Code Splitting

```typescript
// Lazy-load heavy components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/analytics/HeavyChart'), {
  loading: () => <div>Loading...</div>,
  ssr: false,  // client-only if it uses browser APIs
})
```

### Avoid Barrel Files

```typescript
// ❌ Barrel imports pull in everything
import { Button, Input, Select } from '@/components/ui'

// ✅ Direct imports — only the module you need
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
```

### Parallel Data Fetching (Server Components)

```typescript
// ❌ Sequential — slow waterfall
const transactions = await fetchTransactions()
const categories = await fetchCategories()

// ✅ Parallel — both start simultaneously
const [transactions, categories] = await Promise.all([
  fetchTransactions(),
  fetchCategories(),
])
```

## Troubleshooting

### Slow startup despite Turbopack

```bash
# Clear Turbopack cache
rm -rf .next
npm run dev
```

### TypeScript errors slowing down HMR

Turbopack transpiles TypeScript without type-checking during dev. Type errors don't block HMR — run `tsc --noEmit` separately for type checking.

### Module not found errors

Check `turbopack.resolveAlias` in `next.config.ts` matches your `tsconfig.json` path aliases.

### Turbopack unsupported feature

Use the webpack fallback: `next dev --turbo=false`

## Resources

- [Turbopack docs](https://nextjs.org/docs/app/api-reference/turbopack)
- [Next.js 16 release notes](https://nextjs.org/blog/next-16)
- [Bundle Analyzer](https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer)
