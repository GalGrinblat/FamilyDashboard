# Terminology and Sitemap Documentation

## 1. Terminology

The Family Dashboard application (Family ERP) uses a specific set of terms to organize financial data and categorize transactions. 

### **Domain (שיוך אזור)**
A "Domain" is a high-level logical area or "bucket" in the system that groups related categories and transactions. This represents a distinct aspect of family life and financial management.

The system defines the following Domain values (found in `src/lib/constants.ts`):
* **`GENERAL` (כללי)**: General transactions that do not belong to a specific life aspect. Often shown in general cash flow.
* **`HOUSING` (מגורים ומשק בית)**: Expenses related to rent, mortgage, and home maintenance.
* **`TRANSPORTATION` (תחבורה ורכבים)**: Vehicle-related expenses, fuel, and public transportation.
* **`INSURANCES` (ביטוחים)**: Health, life, home, and vehicle insurance premiums.
* **`UTILITIES` (חשבונות)**: Basic household utility bills (water, electricity, gas, internet).
* **`SUPERMARKET` (סופרמרקט ומכולת)**: Groceries and daily household shopping.
* **`HOBBIES` (חוגים ופנאי)**: Extracurricular activities, courses, and hobbies.
* **`ENTERTAINMENT` (בילויים ומסעדות)**: Dining out, movies, and recreation.
* **`VACATION` (חופשות וטיולים)**: Travel, accommodation, and vacation expenses.

### **Category Type (סוג)**
Transactions and categories are classified by their cash flow direction:
* **`EXPENSE` (הוצאה -)**: Outgoing funds.
* **`INCOME` (הכנסה +)**: Incoming funds.

---

## 2. Application Sitemap

The application uses a Sidebar/Bottom-Navigation structure with tabs categorized by financial domains. The terminology conceptually maps to the structural pages.

### 1. Overview (ראשי)
* **Route:** `/`
* High-level KPIs, monthly burn rate, and urgent alerts.
* **Components:** 
  * Main Dashboard (Net Worth & Burn Rate Cards)
  * Urgent Reminders Grid

### 2. Monthly Balance (מאזן חודשי)
* **Route:** `/monthly-balance`
* **Tabs:**
  * **Specific Month (חודש ספציפי):** View expected and actual income vs expenses chronologically.
    * **Components:** `SpecificMonthTab` (displays `timeline` of historical and expected transactions/overrides).
  * **General Month (חודש כללי):** View baseline recurring income and budgeting expenses grouped per **Domain**.
    * **Components:** `GeneralMonthTab` (Currently un-implemented / placeholder).

### 3. Transactions & Cash Flow (תנועות / עו״ש)
* **Route:** `/transactions`
* **Tabs:**
  * **Budget & Recurring (תקציב ותזרים קבוע):** `RecurringFlowsTable`
  * **Incomes (הכנסות):** `TransactionsTable` (filtered by `INCOME`)
  * **Housing (מגורים):** `TransactionsTable` (filtered by `HOUSING`)
  * **Transportation (תחבורה):** `TransactionsTable` (filtered by `TRANSPORTATION`)
  * **Insurances (ביטוחים):** `TransactionsTable` (filtered by `INSURANCES`)
  * **Utilities (חשבונות):** `TransactionsTable` (filtered by `UTILITIES`)
  * **Supermarket (סופרמרקט):** `TransactionsTable` (filtered by `SUPERMARKET`)
  * **Hobbies (חוגים ופנאי):** `TransactionsTable` (filtered by `HOBBIES`)
  * **Entertainment (בילויים):** `TransactionsTable` (filtered by `ENTERTAINMENT`)
  * **Vacation (חופשות):** `TransactionsTable` (filtered by `VACATION`)
  * **AI Expense Engine (מנוע הוצאות):** `ExpenseUploader` (CSV Upload)

### 4. Finance & Wealth (פיננסים ונכסים)
* **Route:** `/finance`
* **Sub-components:** `ManageAccountsTab` (Global account management at the top)
* **Tabs:**
  * **Income Sources (מקורות הכנסה):** *Unimplemented placeholder*
  * **Assets & Investments (השקעות):** *Unimplemented placeholder*
  * **Pension & Savings (פנסיה וגמל):** *Unimplemented placeholder*

### 5. Housing & Household (מגורים ומשק בית)
* **Route:** `/housing`
* This area directly corresponds to the **`HOUSING`** and **`UTILITIES`** domains.
* **Tabs:**
  * **Contracts & Utilities (חוזים ושירותים):** *Unimplemented placeholder*
  * **Appliances (מכשירי חשמל):** `ItemsTable` (filtered by category='appliance')
  * **Furniture (ריהוט):** `ItemsTable` (filtered by category='furniture')
  * **Electronics (אלקטרוניקה):** `ItemsTable` (filtered by category='electronics')
  * **Transactions (תנועות והוצאות):** `DomainTransactionsTab` (filtered by `HOUSING`)

### 6. Transportation (תחבורה)
* **Route:** `/transportation`
* This area corresponds to the **`TRANSPORTATION`** domain.
* **Tabs:**
  * **Active Cars (רכבים פעילים):** `CarsTable` (also displays reminders and `AddCarAssetDialog`)
  * **Maintenance (טיפולים ותחזוקה):** *Unimplemented placeholder*
  * **Transactions (תנועות והוצאות):** `DomainTransactionsTab` (filtered by `TRANSPORTATION`)

### 7. Insurances (ביטוחים)
* **Route:** `/insurances`
* This area corresponds to the **`INSURANCES`** domain.
* **Tabs:**
  * **Health & Life (בריאות וחיים):** Grid of `PolicyCard` components
  * **Property (מבנה ותכולה):** Grid of `PolicyCard` components
  * **Vehicle (רכב):** Grid of `PolicyCard` components
  * **Transactions (תנועות והוצאות):** `DomainTransactionsTab` (filtered by `INSURANCES`)

### 8. Planning (תכנון)
* **Route:** `/planning`
* **Tabs:**
  * **Periodic Planning (תכנון עיתי):** `RemindersTable`
  * **Vacation Planning (תכנון חופשות):** `TripsTable` (Maps to **`VACATION`** domain conceptually)

### 9. Settings (הגדרות)
* **Route:** `/settings`
* **Tabs:**
  * **Categories (קטגוריות):** `CategoryManager` component
  * **System Settings (הגדרות מערכת):** *Unimplemented placeholder / disabled tab*
