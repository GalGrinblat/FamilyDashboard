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
* High-level KPIs, monthly burn rate, and urgent alerts.

### 2. Monthly Balance (מאזן חודשי)
* **Specific Month (חודש ספציפי):** View expected and actual income vs expenses chronologically.
* **General Month (חודש כללי):** View baseline recurring income and budgeting expenses grouped per **Domain**.

### 3. Transactions & Cash Flow (תנועות / עו״ש)
* **Current Month (החודש השוטף):** General spending (Domains like `SUPERMARKET`, `HOBBIES`, `ENTERTAINMENT`).
* **Payment Management (ניהול תשלומים):** Mapping expenses to Bank/Credit Card sources.
* **Expense Engine (מנוע הוצאות):** Upload area for CSV statements to be auto-classified using AI into Categories and **Domains**.

### 4. Finance & Wealth (פיננסים ונכסים)
* **Income Sources (מקורות הכנסה):** Salaries, rent income, etc. (Maps to `INCOME` types).
* **Assets & Investments (השקעות):** Stock portfolios, real estate capital.

### 5. Housing & Household (מגורים ומשק בית)
This area directly corresponds to the **`HOUSING`** and **`UTILITIES`** domains.
* **Contracts & Utilities (חוזים ושירותים):** Track providers for Internet, Electricity, Water.
* **Inventory (תכולה):** Tracking appliances, furniture, and electronics.

### 6. Transportation (תחבורה)
This area corresponds to the **`TRANSPORTATION`** domain (route: `/transportation`).
* **Fleet Overview (צי רכבים):** Vehicle values and details.
* **Maintenance & Licensing (טיפולים ורישוי):** Tracking annual tests, garage visits, and mileage.

### 7. Insurances (ביטוחים)
This area corresponds to the **`INSURANCES`** domain.
* **Health & Life (בריאות וחיים):** Private medical, HMO, life insurance.
* **Property Insurance (ביטוחי מבנה ותכולה):** Home insurances.
* **Vehicle Insurance (ביטוחי רכב):** Mandatory and Comprehensive tracking.

### 8. Planning (תכנון)
* **Periodic Planning (תכנון עיתי):** Visual timeline for renewals (car tests, insurances).
* **Vacation Planning (תכנון חופשות):** Future trips and budgeting (Maps to **`VACATION`** domain).

### 9. Settings (הגדרות)
* **Category Manager:** Management of categories, assigning each to a specific **Type** (Expense/Income) and **Domain** to drive the dashboard's statistics and data grouping.
