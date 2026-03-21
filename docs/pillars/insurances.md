# Insurances (ביטוחים)

**Route:** `/insurances`

## Goal

Centralise all insurance policies in one place — health, property, and vehicle. Track premiums, coverage amounts, renewal dates, and which insurer holds each policy.

## Sections

### Policy List

- Cards for each active policy grouped by type (health / property / vehicle).
- Per policy: insurer name, policy number, coverage amount, premium, payment frequency, start date, and renewal/expiry date.

### Coverage Summary

- Aggregate view of total annual premium spend by policy type.

## Key Components

| Component | File |
|-----------|------|
| Policy card | `src/components/insurances/PolicyCard.tsx` |
| Policy dialog (add/edit) | `src/components/insurances/PolicyDialog.tsx` |

## Database Tables

| Table | Usage |
|-------|-------|
| `policies` | Insurance policy records |

## Enums

- `policy_type`: `health` | `property` | `vehicle`
- `policy_frequency`: `monthly` | `quarterly` | `yearly`

## Reminder Integration

Insurance renewal reminders are created in the Planning pillar with `reminder_type = 'insurance'` and linked to a specific policy via `reminder.policy_id`. They surface on the dashboard's upcoming reminders widget.

## Notes

- Recurring premium flows can be linked to a policy in the Liquidity pillar via `recurring_flow.policy_id`, connecting actual cash outflow to the policy record.
