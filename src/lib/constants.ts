export const CATEGORY_TYPES = {
  EXPENSE: 'expense',
  INCOME: 'income',
} as const;

export type CategoryType = (typeof CATEGORY_TYPES)[keyof typeof CATEGORY_TYPES];

export const CATEGORY_DOMAINS = {
  GENERAL: 'general',
  HOUSING: 'housing',
  TRANSPORTATION: 'transportation',
  INSURANCES: 'insurances',
  UTILITIES: 'utilities',
  SUPERMARKET: 'supermarket',
  HOBBIES: 'hobbies',
  ENTERTAINMENT: 'entertainment',
  VACATION: 'vacation',
} as const;

export type CategoryDomain = (typeof CATEGORY_DOMAINS)[keyof typeof CATEGORY_DOMAINS];

// Helper labels for UI
export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  [CATEGORY_TYPES.EXPENSE]: 'הוצאה (-)',
  [CATEGORY_TYPES.INCOME]: 'הכנסה (+)',
};

export const CATEGORY_DOMAIN_LABELS: Record<CategoryDomain, string> = {
  [CATEGORY_DOMAINS.GENERAL]: 'כללי (מופיע רק בעו״ש)',
  [CATEGORY_DOMAINS.HOUSING]: 'מגורים ומשק בית',
  [CATEGORY_DOMAINS.TRANSPORTATION]: 'תחבורה ורכבים',
  [CATEGORY_DOMAINS.INSURANCES]: 'ביטוחים',
  [CATEGORY_DOMAINS.UTILITIES]: 'חשבונות (מים, חשמל, גז)',
  [CATEGORY_DOMAINS.SUPERMARKET]: 'סופרמרקט ומכולת',
  [CATEGORY_DOMAINS.HOBBIES]: 'חוגים ופנאי',
  [CATEGORY_DOMAINS.ENTERTAINMENT]: 'בילויים ומסעדות',
  [CATEGORY_DOMAINS.VACATION]: 'חופשות וטיולים',
};

export const CATEGORY_DOMAIN_SHORT_LABELS: Record<CategoryDomain, string> = {
  [CATEGORY_DOMAINS.GENERAL]: 'כללי',
  [CATEGORY_DOMAINS.HOUSING]: 'מגורים',
  [CATEGORY_DOMAINS.TRANSPORTATION]: 'תחבורה',
  [CATEGORY_DOMAINS.INSURANCES]: 'ביטוחים',
  [CATEGORY_DOMAINS.UTILITIES]: 'חשבונות',
  [CATEGORY_DOMAINS.SUPERMARKET]: 'סופר',
  [CATEGORY_DOMAINS.HOBBIES]: 'חוגים',
  [CATEGORY_DOMAINS.ENTERTAINMENT]: 'בילויים',
  [CATEGORY_DOMAINS.VACATION]: 'חופשות',
};

export const REMINDER_TYPES = {
  MAINTENANCE: 'maintenance',
  CAR_TEST: 'car_test',
  INSURANCE: 'insurance',
  PAYMENT_METHOD_CHANGE: 'payment_method_change',
} as const;

export type ReminderType = (typeof REMINDER_TYPES)[keyof typeof REMINDER_TYPES];

export const SYSTEM_REMINDER_TYPES = [
  { value: REMINDER_TYPES.MAINTENANCE, label: 'תחזוקה (Maintenance)' },
  { value: REMINDER_TYPES.CAR_TEST, label: 'טסט לרכב (Car Test)' },
  { value: REMINDER_TYPES.INSURANCE, label: 'ביטוחים (Insurance)' },
];

export const FREQUENCY_TYPES = {
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  WEEKLY: 'weekly', // Adding weekly as it appeared in some grep results
} as const;

export type FrequencyType = (typeof FREQUENCY_TYPES)[keyof typeof FREQUENCY_TYPES];

export const INSURANCE_TYPES = {
  HEALTH: 'health',
  PROPERTY: 'property',
  VEHICLE: 'vehicle',
} as const;

export type InsuranceType = (typeof INSURANCE_TYPES)[keyof typeof INSURANCE_TYPES];

export const INSURANCE_SUBTYPES = {
  health: [
    { value: 'shaban', label: 'שב"ן (קופת חולים)' },
    { value: 'private', label: 'פרטי' },
    { value: 'critical_illness', label: 'מחלות קשות' },
    { value: 'life', label: 'חיים' },
  ],
  property: [
    { value: 'structure', label: 'מבנה' },
    { value: 'contents', label: 'תכולה' },
  ],
  vehicle: [
    { value: 'comprehensive', label: 'מקיף' },
    { value: 'mandatory', label: 'חובה' },
    { value: 'third_party', label: "צד ג'" },
  ],
};

export const ACCOUNT_TYPES = {
  BANK: 'bank',
  CREDIT_CARD: 'credit_card',
} as const;

export type AccountType = (typeof ACCOUNT_TYPES)[keyof typeof ACCOUNT_TYPES];

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  [ACCOUNT_TYPES.BANK]: 'חשבון עו״ש (בנק)',
  [ACCOUNT_TYPES.CREDIT_CARD]: 'כרטיס אשראי',
};

// ─── Investment Accounts ───────────────────────────────────────────────────

export const INVESTMENT_ACCOUNT_TYPES = {
  BROKERAGE: 'brokerage',
  HISTALMUT: 'histalmut',
  RSU: 'rsu',
  GEMEL: 'gemel',
  PENSION: 'pension',
} as const;

export type InvestmentAccountType =
  (typeof INVESTMENT_ACCOUNT_TYPES)[keyof typeof INVESTMENT_ACCOUNT_TYPES];

export const INVESTMENT_ACCOUNT_TYPE_LABELS: Record<InvestmentAccountType, string> = {
  [INVESTMENT_ACCOUNT_TYPES.BROKERAGE]: 'תיק השקעות / ברוקר',
  [INVESTMENT_ACCOUNT_TYPES.HISTALMUT]: 'קרן השתלמות',
  [INVESTMENT_ACCOUNT_TYPES.RSU]: 'RSU (מניות עובד)',
  [INVESTMENT_ACCOUNT_TYPES.GEMEL]: 'קופת גמל',
  [INVESTMENT_ACCOUNT_TYPES.PENSION]: 'קרן פנסיה',
};

// ─── Portfolio Holdings ────────────────────────────────────────────────────

export const ASSET_CLASSES = {
  STOCK: 'stock',
  ETF: 'etf',
  CRYPTO: 'crypto',
  BOND: 'bond',
  FUND: 'fund',
  OTHER: 'other',
} as const;

export type AssetClass = (typeof ASSET_CLASSES)[keyof typeof ASSET_CLASSES];

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  [ASSET_CLASSES.STOCK]: 'מניה',
  [ASSET_CLASSES.ETF]: 'קרן סל (ETF)',
  [ASSET_CLASSES.CRYPTO]: 'קריפטו',
  [ASSET_CLASSES.BOND]: 'אג״ח',
  [ASSET_CLASSES.FUND]: 'קרן נאמנות',
  [ASSET_CLASSES.OTHER]: 'אחר',
};

// ─── RSU ──────────────────────────────────────────────────────────────────

export const RSU_TAX_TRACKS = {
  CAPITAL_GAINS: 'capital_gains', // Section 102 — tax on sale; 25% gain if ≥2y from grant
  INCOME: 'income', // Full FMV taxed as income on sale
} as const;

export type RsuTaxTrack = (typeof RSU_TAX_TRACKS)[keyof typeof RSU_TAX_TRACKS];

export const RSU_TAX_TRACK_LABELS: Record<RsuTaxTrack, string> = {
  [RSU_TAX_TRACKS.CAPITAL_GAINS]: 'סעיף 102 — מסלול רווחי הון',
  [RSU_TAX_TRACKS.INCOME]: 'מסלול הכנסה (לא 102)',
};

// ─── Portfolio Lots ────────────────────────────────────────────────────────

export const LOT_TYPES = {
  BUY: 'buy',
  SELL: 'sell',
  RSU_VEST: 'rsu_vest',
  DIVIDEND_REINVEST: 'dividend_reinvest',
} as const;

export type LotType = (typeof LOT_TYPES)[keyof typeof LOT_TYPES];

// ─── Tax constants (Israeli law) ──────────────────────────────────────────

export const HISTALMUT_MONTHLY_CEILING_ILS = 1571;

export const TAX_RATES = {
  CAPITAL_GAINS: 0.25, // regular brokerage, gemel (before 60), histalmut above ceiling
  GEMEL_AFTER_60: 0.15, // gemel for investors aged 60+
  MARGINAL_INCOME: 0.47, // RSU: income component at vest/sale, and gains < 2y from grant
} as const;
