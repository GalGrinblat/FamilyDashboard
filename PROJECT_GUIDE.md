# Project: Family Operations Dashboard (Family ERP)

## 🎯 Purpose
A comprehensive family management system for tracking finances, assets, insurances, and life planning. The system must support Hebrew (RTL) natively while maintaining high-end security and automated data processing.

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database/Auth:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS + Shadcn/ui
- **Icons:** Lucide-react
- **Localization:** RTL Support (Hebrew UI)

## 📏 Development Rules (Critical)
1. **RTL First:** The root layout must have `dir="rtl"` and `lang="he"`. All UI components (Sidebar, Tabs, Tables) must be mirrored for Hebrew.
2. **Naming Conventions:** All file names, variables, and logic must be in **English**. All UI labels, buttons, and display text must be in **Hebrew**.
3. **Architecture:** Use Server Components for data fetching and Client Components for interactive UI (forms, tabs, uploads).
4. **Shadcn/ui:** Use Shadcn for the base components, ensuring they are adjusted for RTL (check animation directions).

## 📱 Mobile & PWA Strategy
1. **Responsive Design:** - Use a **Bottom Navigation Bar** for mobile (`max-width: 768px`) and a **Sidebar** for desktop.
   - Convert all Data Tables into **Mobile Cards** on small screens.
2. **Touch-First UI:**
   - Ensure all buttons have a minimum touch target of 44x44px.
   - Implement "Swipe to Delete" or "Swipe to Edit" for list items (Shopping List/Transactions).
3. **PWA Features:**
   - Implement a `manifest.json` and service workers for "Add to Home Screen" support.
   - Use `next-pwa` or similar to enable basic offline caching for the "Shopping List" and "Overview" tabs.
4. **Quick Entry:**
   - Add a Global Floating Action Button (FAB) on mobile for "Quick Add" (Expense/Inventory item).
   
## 🗺 Application Sitemap & Navigation

### 1. Overview (ראשי)
- Monthly burn rate, net worth summary, and urgent alerts (upcoming car tests/insurance renewals).

### 2. Finance (פיננסים) - Sub-tabs:
- **Income (הכנסות):** Salaries, rent income, child benefits.
- **Assets & Investments (נכסים והשקעות):** Stock portfolio, crypto, real estate status.
- **Housing (מגורים):** Rent/Mortgage, Utilities (Electricity, Water, Arnona, Internet, Tami4).
- **Health (בריאות):** Medical insurance, HMO (Kupat Holim), Life insurance.
- **Car (רכב):** Fuel, annual test (test), insurance, maintenance, parking.
- **Sports & Hobbies (ספורט וחוגים):** Bowling stats/gear, Inna's classes, Oren's classes.
- **Supermarket (סופרמרקט):** Grocery spending tracking.
- **Vacation Expenses (חופשות):** Actual spending on past/current trips.
- **Payment Management (ניהול תשלומים):** Mapping expenses to sources (Bank/Credit Card).
- **Expense Engine (מנוע הוצאות):** CSV upload area for automated AI classification.

### 3. Household (משק בית)
- **Appliances (מכשירי חשמל):** Tracking of household items.
- **Furniture (ריהוט):** Tracking of household items.
- **Electronics (אלקטרוניקה):** Tracking of household items.

### 4. Planning (תכנון) - Sub-sections:
- **Periodic Planning (תכנון עיתי):** Calendar for car tests, insurance renewals, home maintenance.
- **Vacation Planning (תכנון חופשות):** Budgeting and itinerary planning for future trips.

## 💾 Database Schema (Supabase)
- **Tables:** `categories`, `accounts`, `trips`, `transactions`, `assets`, `household_items`, `reminders`, `merchant_mappings`.
- **Security:** Implement Row Level Security (RLS) so users only see their family's data.
- **Optimization:** Add a mapping table for merchants to cache AI classifications.

## 🚀 Advanced Features (Phase 2)
- **Currency Handling:** Automated conversion from USD/EUR to ILS for investments.
- **Deduplication:** Logic to merge identical transactions appearing in both Bank and Credit Card exports.