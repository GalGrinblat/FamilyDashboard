# Settings (הגדרות)

**Route:** `/settings`

## Goal

System configuration. Currently covers category management — the taxonomy that drives transaction classification, AI suggestions, and domain-level analytics.

## Tabs

### Categories (קטגוריות)

- Full CRUD for the `categories` table via the `CategoryManager` component.
- Per category: Hebrew name, English name, type (`expense` | `income`), domain, parent category (for sub-categories), and sort order.
- Changes here cascade immediately to:
  - AI classification (Gemini receives the updated category list on the next upload)
  - `merchant_mappings` cache (existing mappings remain; new uploads use updated categories)
  - Analytics domain grouping

### System Settings (הגדרות מערכת)

- Placeholder tab — not yet implemented.

## Key Components

| Component | File |
|-----------|------|
| Category manager | `src/components/settings/CategoryManager.tsx` |

## Database Tables

| Table | Usage |
|-------|-------|
| `categories` | Category taxonomy |

## Enums

- `category_type`: `expense` | `income`
- `category_domain`: `general` | `housing` | `transportation` | `insurances` | `utilities` | `supermarket` | `hobbies` | `entertainment` | `vacation`

## Notes

- The `categories` table is pre-fetched in the root `(app)/layout.tsx` and passed down to all pages as props, so category lookups are always available without additional fetches.
- Parent/child relationships (`parent_id`) allow two-level category hierarchies (e.g., "Food" → "Supermarket", "Restaurants").
- `sort_order` controls display order in dropdowns and classification dialogs.
