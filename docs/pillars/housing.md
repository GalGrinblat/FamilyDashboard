# Housing (מגורים)

**Route:** `/housing`

## Goal

Manage the family's property portfolio, contracts (rent, service agreements), and household inventory (appliances, furniture, electronics) including warranty tracking.

## Tabs

### Properties

- List of owned and rented properties with address, purchase/rental value, and status (`active` | `sold` | `rented`).
- Each property is linked to recurring flows (mortgage, rent income, utilities) in the Liquidity pillar.

### Contracts (חוזים)

- Tracks service and rental agreements: supplier/landlord name, monthly cost, start and end dates.
- Useful for knowing when contracts are up for renewal.

### Household Items (פריטים ביתיים)

- Inventory of appliances, furniture, and electronics.
- Per item: category, purchase date, purchase price, warranty expiry, and notes.
- Category enum covers: appliances, furniture, electronics, HVAC, plumbing, and other.

## Key Components

| Component | File |
|-----------|------|
| Contracts tab | `src/components/housing/ContractsTab.tsx` |
| Contract dialog (add/edit) | `src/components/housing/ContractDialog.tsx` |
| Household items table | `src/components/housing/ItemsTable.tsx` |
| Item dialog (add/edit) | `src/components/housing/HouseholdItemDialog.tsx` |

## Database Tables

| Table | Usage |
|-------|-------|
| `properties` | Property records (shared with Wealth > Real Estate) |
| `household_items` | Appliance and furniture inventory |

## Enums

- `asset_status`: `active` | `sold` | `rented`
- `household_item_category`: appliances, furniture, electronics, and additional home categories (see `src/lib/constants.ts`)

## Notes

- The `properties` table is shared between this pillar and the Wealth > Real Estate sub-page. Housing focuses on the operational view (contracts, inventory); Wealth focuses on financial value (equity, mortgage balance).
- Warranty expiry dates on household items feed into the Planning pillar's reminder system.
