# Next Steps – Prioritized Development Plan

This document outlines the remaining work for the Family Dashboard project, ordered by priority. Priority is determined by user-facing impact and alignment with the goals defined in `PROJECT_GUIDE.md`.

---

## ✅ Recent Achievements (Completed)

Recent major milestones achieved in the 4-pillar financial architecture:

- **4-Pillar Reorganization**: Split the monolithic Finance domain into **Liquidity**, **Transactions**, **Wealth**, and **Monthly Balance**.
- **Real Estate Tracking**: Added dedicated support for real estate assets with address and monthly rent metadata.
- **Liquidity & Wealth Domains**: Fully implemented accounts management, recurring incomes, assets, and pension tracking.
- **Monthly Balance**: Completed both "Specific Month" and "General Month" (conceptual/budget) views.
- **Auxiliary Domains**: Implemented Housing (Appliances, Contracts) and Transportation (Cars, Maintenance Logs).
- **Settings**: Fully functional Category Manager and System Settings (stored in User Metadata).
- **RTL Polish**: Adjusted UI elements (dialog close buttons, mobile actions) for consistent Hebrew Right-to-Left alignment.

---

## 🔴 Priority 1 – Analytics, Charts & Reporting (High Visibility)

Now that core data entry works across all domains, the focus shifts to visualization and insights.

| Feature                   | Description                                                                  | Status     |
| ------------------------- | ---------------------------------------------------------------------------- | ---------- |
| **Domain Spending Chart** | Bar/pie chart of monthly spend per domain (using `recharts`).                | ❌ Planned |
| **Net Worth Trend**       | Line chart of net worth over time (snapshot monthly).                        | ❌ Planned |
| **Budget vs. Actual**     | Compare budgeted (`recurring_flows`) vs. actual (`transactions`) per domain. | ❌ Planned |
| **Annual Summary**        | Year-to-date income, expenses, and savings rate dashboard.                   | ❌ Planned |

---

## 🔴 Priority 2 – Expense Engine & AI Refinement

The initial uploader works, but needs production-grade stability and smarts.

1. **Merchant Mapping Logic**: Enhance the existing `merchant_mappings` table to support regex or fuzzy matching.
2. **AI Categorization**: Improve the prompt for LLM classification to better handle localized Hebrew merchant names.
3. **Internal Deduplication**: Automatically detect and flag duplicate transactions (e.g., same amount/date from both bank and card exports).
4. **Bulk Confirmation**: UI improvements for the review table to allow "Select All" or "Confirm Domain" actions.

---

## 🟠 Priority 3 – Mobile UX & PWA Polish

Groundwork is done; polish for "standalone" usage is required.

1. **Swipe Gestures**: Add swipe-to-delete and swipe-to-edit for list items on Transactions and Tables.
2. **Mobile Card Audit**: Continue systematic transformation of remaining large tables into native-feeling mobile cards.
3. **Touch Targets**: Final audit for `44×44px` minimum targets on all interactive elements.
4. **Offline Mode**: Verify specific page caching (like Transactions) for spotty connectivity usage.

---

## 🟡 Priority 4 – Advanced Features (Phase 2)

Future-looking features to expand the app's utility.

| Feature               | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| **Multi-currency**    | Automated USD/EUR → ILS conversion for investment assets (via API).        |
| **Shopping List**     | A lightweight grocery/errand list with offline support.                    |
| **Payment Reminders** | Browser/Email notifications for upcoming test/licensing/contract renewals. |
| **Family Profiles**   | Multi-user support with shared vs. individual attribution.                 |

---

## 📜 Implementation Guardrails

- **Language Policy**: UI labels in Hebrew, Code/Docs in English.
- **Type Safety**: No `any`– strict use of Supabase generated types.
- **Security**: Mandatory RLS on all new tables.
- **Performance**: Use Server Components for high-volume data fetching.
  ty (RLS) enabled before going to production.
- **Server Components** for data fetching, **Client Components** for interactive forms/tabs.
