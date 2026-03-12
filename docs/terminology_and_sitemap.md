# Terminology and Sitemap Documentation

## 1. Terminology

The Family Dashboard application (Family ERP) uses a specific set of terms to organize financial data and categorize transactions. 

#### **Domain (שיוך אזור)**
A "Domain" is a high-level logical area or "bucket" in the system that groups related categories and transactions.

The system defines the following Domain values (found in `src/lib/constants.ts`):
* **`GENERAL` (כללי)**: General transactions and cash flow.
* **`HOUSING` (מגורים ומשק בית)**: Rent, mortgage, and home maintenance.
* **`TRANSPORTATION` (תחבורה ורכבים)**: Fuel, maintenance, and public transport.
* **`INSURANCES` (ביטוחים)**: Health, life, and asset premiums.
* **`UTILITIES` (חשבונות)**: Electricity, water, gas, internet.
* **`SUPERMARKET` (סופרמרקט ומכולת)**: Daily groceries.
* **`HOBBIES` (חוגים ופנאי)**: Extracurriculars and learning.
* **`ENTERTAINMENT` (בילויים ומסעדות)**: Leisure and dining.
* **`VACATION` (חופשות וטיולים)**: Travel and trips.

---

## 2. Application Sitemap

The application is organized into four primary financial pillars, supported by life-aspect domains.

### 1. Monthly Balance (מאזן חודשי)
* **Route:** `/monthly-balance`
* **Goal:** A dashboard layer that correlates **Liquidity** and **Transactions** to provide burnout projections.

### 2. Daily Liquidity (עו״ש ותזרים)
* **Route:** `/liquidity`
* **Goal:** Manage day-to-day cash availability and recurring obligations.
* **Components:**
  * **Manage Accounts:** Bank and Credit Card balances.
  * **Budget & Recurring:** Expected income and fixed expenses (Recurring Flows).

### 3. Transaction Hub (יומן תנועות)
* **Route:** `/transactions`
* **Goal:** Data entry, classification, and audit log.
* **Components:**
  * **AI Expense Engine:** CSV/Statement uploader.
  * **Review Queue:** Pending transactions awaiting confirmation.
  * **Global Search:** History of all past transactions.

### 4. Wealth & Assets (הון ונכסים)
* **Route:** `/wealth`
* **Goal:** Long-term net worth tracking and strategic growth.
* **Components:**
  * **Investment Accounts:** Non-liquid balances (Brokerage, Savings).
  * **Portfolio:** Stocks, Crypto, Real Estate, and Vehicle values.
  * **Retirement:** Pensions and Study Funds.

### 5. Life Aspects (Domains)
* **Housing (`/housing`)**: Property management, appliances, and electronics.
* **Transportation (`/transportation`)**: Vehicle list and maintenance log.
* **Insurances (`/insurances`)**: Active policies and coverage.
* **Planning (`/planning`)**: Periodic reminders and trip budgeting.

### 8. Planning (תכנון)
* **Route:** `/planning`
* **Tabs:**
  * **Periodic Planning (תכנון עיתי):** `RemindersTable`

### 9. Settings (הגדרות)
* **Route:** `/settings`
* **Tabs:**
  * **Categories (קטגוריות):** `CategoryManager` component
  * **System Settings (הגדרות מערכת):** *Unimplemented placeholder / disabled tab*
