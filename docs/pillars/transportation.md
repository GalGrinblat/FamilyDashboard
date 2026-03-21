# Transportation (תחבורה)

**Route:** `/transportation`

## Goal

Track the family's vehicle fleet — current values, status, and maintenance history. Integrates with the Planning pillar for car-test (טסט) reminders.

## Tabs

### Vehicles (רכבים)

- List of owned vehicles with type (car, motorcycle, etc.), make/model, year, current estimated value, and status (`active` | `sold`).
- Each vehicle can be linked to recurring flows in the Liquidity pillar (fuel, insurance payments).

### Maintenance Log (תחזוקה)

- Log of service events per vehicle: date, mileage, service type, cost, and notes.
- Provides a full maintenance history for each vehicle.

## Key Components

| Component | File |
|-----------|------|
| Vehicle dialog (add/edit) | `src/components/transportation/CarAssetDialog.tsx` |

## Database Tables

| Table | Usage |
|-------|-------|
| `vehicles` | Vehicle records (type, model, value, status) |
| `reminders` | Car-test due dates linked to specific vehicles |

## Reminder Integration

Car-test (`car_test`) reminders are created in the Planning pillar and linked to a vehicle via `reminder.vehicle_id`. They appear on the dashboard's upcoming reminders widget.

## Enums

- `asset_status`: `active` | `sold`
- `reminder_type` (relevant values): `car_test` | `maintenance`
