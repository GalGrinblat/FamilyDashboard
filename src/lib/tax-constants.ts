// ─── Israeli Tax Constants ────────────────────────────────────────────────
// Updated annually from the official ITA guide (חוברת שנתית של רשות המסים).
// All monetary values are MONTHLY unless noted otherwise.
// ──────────────────────────────────────────────────────────────────────────

export const TAX_YEAR = 2025;

// ─── Income Tax Brackets (מדרגות מס הכנסה) ─────────────────────────────
// Source: פקודת מס הכנסה, סעיף 121
// Monthly thresholds = annual ÷ 12
export interface TaxBracket {
  /** Inclusive lower monthly bound (₪) */
  from: number;
  /** Inclusive upper monthly bound (₪) — Infinity for the last bracket */
  to: number;
  /** Marginal rate (decimal, e.g. 0.10 = 10%) */
  rate: number;
  /** Hebrew label for display */
  label: string;
  /** Tax ordinance reference */
  clause: string;
}

export const INCOME_TAX_BRACKETS: TaxBracket[] = [
  { from: 0, to: 7_010, rate: 0.1, label: 'מדרגה 1', clause: 'סעיף 121(א)(1)' },
  { from: 7_011, to: 10_060, rate: 0.14, label: 'מדרגה 2', clause: 'סעיף 121(א)(2)' },
  { from: 10_061, to: 16_150, rate: 0.2, label: 'מדרגה 3', clause: 'סעיף 121(א)(3)' },
  { from: 16_151, to: 22_440, rate: 0.31, label: 'מדרגה 4', clause: 'סעיף 121(א)(4)' },
  { from: 22_441, to: 46_690, rate: 0.35, label: 'מדרגה 5', clause: 'סעיף 121(א)(5)' },
  { from: 46_691, to: 60_130, rate: 0.47, label: 'מדרגה 6', clause: 'סעיף 121(א)(6)' },
  {
    from: 60_131,
    to: Infinity,
    rate: 0.5,
    label: 'מדרגה 7 (מס יסף)',
    clause: 'סעיפים 121(א) + 121ב',
  },
];

// ─── Tax Credit Points (נקודות זיכוי) ──────────────────────────────────
// Source: סעיף 36א לפקודת מס הכנסה
export const CREDIT_POINT_MONTHLY_VALUE = 242; // ₪ per point per month (2025)
export const DEFAULT_CREDIT_POINTS = 2.25; // base for Israeli resident

// ─── National Insurance — Bituach Leumi (ביטוח לאומי) ──────────────────
// Source: חוק הביטוח הלאומי, סעיף 336
// Rates for salaried employees (not self-employed)
export interface TieredRate {
  /** Monthly threshold separating reduced/full rates (₪) */
  threshold: number;
  /** Rate below or at the threshold */
  reducedRate: number;
  /** Rate above the threshold */
  fullRate: number;
  /** Maximum monthly salary subject to deduction (₪) */
  ceiling: number;
  /** Hebrew description */
  label: string;
  /** Legal reference */
  clause: string;
}

export const BITUACH_LEUMI: TieredRate = {
  threshold: 7_122,
  reducedRate: 0.035, // 3.50%
  fullRate: 0.12, // 12.00%
  ceiling: 49_030,
  label: 'ביטוח לאומי',
  clause: 'חוק הביטוח הלאומי, סעיף 336',
};

// ─── Health Tax (מס בריאות) ────────────────────────────────────────────
// Source: חוק ביטוח בריאות ממלכתי, סעיף 14
export const HEALTH_TAX: TieredRate = {
  threshold: 7_122,
  reducedRate: 0.031, // 3.10%
  fullRate: 0.05, // 5.00%
  ceiling: 49_030,
  label: 'מס בריאות',
  clause: 'חוק ביטוח בריאות ממלכתי, סעיף 14',
};

// ─── Pension (פנסיה) ──────────────────────────────────────────────────
// Source: צו הרחבה לביטוח פנסיוני מקיף 2017
export const PENSION = {
  employeeRate: 0.06, // 6.00%
  employerPensionRate: 0.065, // 6.50%
  employerSeveranceRate: 0.06, // 6.00%
  clause: 'צו הרחבה לביטוח פנסיוני מקיף 2017',
  label: 'פנסיה — חלק עובד',
} as const;

// ─── Capital Gains Tax ────────────────────────────────────────────────
// Source: סעיף 91 לפקודת מס הכנסה
export const CAPITAL_GAINS_TAX_RATE = 0.25; // 25%
export const CAPITAL_GAINS_CLAUSE = 'סעיף 91 לפקודת מס הכנסה';
