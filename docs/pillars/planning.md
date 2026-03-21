# Planning (תכנון)

**Route:** `/planning`

## Goal

Forward-looking life planning: a visual calendar of upcoming events, periodic reminders for obligations, financial savings goals, and trip budgeting.

## Tabs

### Calendar (לוח שנה)

- Monthly calendar view showing all reminders and trip dates.
- Click a day to see all events; click an event to open its detail/edit dialog.

### Reminders (תזכורות)

- Table of all reminders sorted by due date.
- Each reminder has: title, type, due date, recurrence frequency, and an optional link to a vehicle, policy, or property.
- Mark as complete or delete from the row actions menu.
- Overdue reminders are highlighted.

### Goals (יעדים)

- Financial savings goals with a target amount, target date, current saved amount, and category.
- Progress bar shows current vs target.
- Goal categories: `emergency_fund` | `down_payment` | `vacation` | `education` | `other`

### Trips (טיולים)

- Trip list with destination, travel dates, and total budget.
- Each trip has a detail page at `/planning/trips/[id]` showing per-category budget breakdown and actual spend (linked transactions tagged with `trip_id`).

## Key Components

| Component | File |
|-----------|------|
| Calendar tab | `src/components/planning/CalendarTab.tsx` |
| Reminders table | `src/components/planning/RemindersTable.tsx` |
| Reminder row actions | `src/components/planning/ReminderRowActions.tsx` |
| Reminder dialog (add/edit) | `src/components/planning/ReminderDialog.tsx` |
| Goals tab | `src/components/planning/GoalsTab.tsx` |
| Trip dialog (add/edit) | `src/components/planning/TripDialog.tsx` |
| Trip detail page | `src/app/(app)/planning/trips/[id]/page.tsx` |

## Database Tables

| Table | Usage |
|-------|-------|
| `reminders` | Reminder records with due dates and recurrence |
| `financial_goals` | Savings goal records |
| `trips` | Trip records with budget |
| `transactions` | Tagged with `trip_id` for actual vs budget comparison |

## Enums

- `reminder_type`: `maintenance` | `car_test` | `insurance` | `payment_method_change`
- `goal_category`: `emergency_fund` | `down_payment` | `vacation` | `education` | `other`

## Notes

- Reminders can be linked to a `vehicle_id`, `policy_id`, or `property_id` for contextual navigation.
- Trip transactions: when uploading statements in the Transaction Hub, transactions can be tagged with a `trip_id` to track holiday spend against the trip budget.
- The Calendar tab aggregates both reminders and trip date ranges into a single view.
