# Tools (כלים)

Route: `/tools`

Financial tools for tax calculations and reporting — tailored for the Israeli tax system.

## Sub-Tools

### 1. Salary Calculator (`/tools/salary`)

Bruto-to-Neto calculator for salaried employees in Israel.

**Inputs:** Gross monthly salary (₪), credit points (default 2.25).

**Outputs (fully transparent):**
- Income tax — per-bracket breakdown with rates, thresholds, and clause references (§121)
- National Insurance (Bituach Leumi) — reduced/full rate tiers (חוק הביטוח הלאומי §336)
- Health Tax — reduced/full rate tiers (חוק ביטוח בריאות ממלכתי §14)
- Pension employee contribution — 6% (צו הרחבה 2017)
- Net salary

**Data source:** `src/lib/tax-constants.ts` (updated annually).

---

### 2. Capital Gains Tax — Interactive Brokers (`/tools/capital-gains`)

Calculate capital gains tax on foreign securities traded through IBKR.

**Flow:**
1. Upload IBKR Activity Statement CSV
2. App fetches historical USD/ILS rates from Bank of Israel SDMX API
3. Matches sells to buys using FIFO
4. Displays per-trade table with BOI rates and ILS equivalents
5. Export results as CSV for accountant / Form 1325

**Data sources:**
- Exchange rates: `https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0/RER_USD_ILS` (free, no auth)
- Tax rate: 25% (§91 לפקודת מס הכנסה)
- API client: `src/lib/boi-exchange-rate.ts`

---

### 3. Annual Tax Report Guide — Form 1301 (`/tools/tax-report`)

Interactive checklist and walkthrough for filing the Israeli annual income tax return.

**Sections:**
1. **Document Checklist** — 106, 867, 280, IBKR statement, §46 receipts, mortgage interest — each with legal clause reference
2. **IBKR Integration** — link to the capital gains tool for generating Form 1325 data
3. **Filing Walkthrough** — 7-step accordion from registration to submission
4. **External Links** — gov.il, shaam.gov.il, ITA guides

**State:** Checklist progress persisted in `localStorage`.

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/tax-constants.ts` | Yearly tax brackets, rates, and legal references |
| `src/lib/boi-exchange-rate.ts` | Bank of Israel exchange rate API client |
| `src/components/tools/salary/SalaryCalculator.tsx` | Salary calculator component |
| `src/components/tools/capital-gains/CapitalGainsCalculator.tsx` | IBKR capital gains calculator |
| `src/components/tools/tax-report/TaxReportGuide.tsx` | Tax report guide component |
