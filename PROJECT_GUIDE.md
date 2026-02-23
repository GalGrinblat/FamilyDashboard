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

## TypeScript
- **Strict Typing**: NEVER use the `any` type under any circumstances.
- **Defined Types**: ALWAYS use strictly defined types or interfaces for variables, function parameters, and return types.
- **Supabase**: When working with database payloads, always import and use the strictly generated types from the `Database` schema (e.g., `Database['public']['Tables']['table_name']['Row']`).
- **Unknown Data**: If the exact shape of data is truly unknown at runtime, use the `unknown` type and employ type-narrowing/validation before use, but prefer explicitly mapping the expected structure.

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
- High-level KPIs: Monthly burn rate, net worth summary, and urgent upcoming alerts.

### 2. Transactions & Cash Flow (תנועות / עו״ש)
- **Current Month (החודש השוטף):** General spending (Supermarket, Vacations, Hobbies) and tracking the execution of monthly payments.
- **Payment Management (ניהול תשלומים):** Mapping expenses to Bank/Credit Card sources.
- **Expense Engine (מנוע הוצאות):** CSV upload area for automated AI classification.

### 3. Finance & Wealth (פיננסים ונכסים)
- **Income Sources (מקורות הכנסה):** Salaries, rent income, child benefits.
- **Assets & Investments (השקעות):** Stock portfolios, crypto, real estate capital.

### 4. Housing & Household (מגורים ומשק בית)
- **Contracts & Utilities (חוזים ושירותים):** Mortgage/Rent tracking, Internet, Electricity, Water providers.
- **Inventory (תכולה):** Appliances, Furniture, Electronics tracking.

### 5. Vehicles (רכבים)
- **Fleet Overview (צי רכבים):** Vehicle values and details.
- **Maintenance & Licensing (טיפולים ורישוי):** Tracking annual tests (טסט), garage visits, and mileage.

### 6. Insurances (ביטוחים)
- **Health & Life (בריאות וחיים):** HMO, private medical, life insurance.
- **Property Insurance (ביטוחי מבנה ותכולה):** Home insurances.
- **Vehicle Insurance (ביטוחי רכב):** Mandatory (חובה) and Comprehensive (מקיף) tracking.

### 7. Planning (תכנון)
- **Periodic Planning (תכנון עיתי):** Visual timeline for insurance renewals, car tests, and home maintenance.
- **Vacation Planning (תכנון חופשות):** Budgeting and itinerary planning for future trips.

### 8. Settings (הגדרות)
- **Category Manager:** Customizing transaction classification and AI rules.

## 💾 Database Schema (Supabase)
- **Tables:** `categories`, `accounts`, `trips`, `transactions`, `assets`, `household_items`, `reminders`, `merchant_mappings`.
- **Security:** Implement Row Level Security (RLS) so users only see their family's data.
- **Optimization:** Add a mapping table for merchants to cache AI classifications.

## 🚀 Advanced Features (Phase 2)
- **Currency Handling:** Automated conversion from USD/EUR to ILS for investments.
- **Deduplication:** Logic to merge identical transactions appearing in both Bank and Credit Card exports.