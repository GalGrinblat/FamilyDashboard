export const CATEGORY_TYPES = {
    EXPENSE: 'expense',
    INCOME: 'income',
} as const;

export type CategoryType = typeof CATEGORY_TYPES[keyof typeof CATEGORY_TYPES];

export const CATEGORY_DOMAINS = {
    GENERAL: 'general',
    HOUSING: 'housing',
    VEHICLES: 'vehicles',
    INSURANCES: 'insurances',
} as const;

export type CategoryDomain = typeof CATEGORY_DOMAINS[keyof typeof CATEGORY_DOMAINS];

// Helper labels for UI
export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
    [CATEGORY_TYPES.EXPENSE]: 'הוצאה (-)',
    [CATEGORY_TYPES.INCOME]: 'הכנסה (+)',
};

export const CATEGORY_DOMAIN_LABELS: Record<CategoryDomain, string> = {
    [CATEGORY_DOMAINS.GENERAL]: 'כללי (מופיע רק בעו״ש)',
    [CATEGORY_DOMAINS.HOUSING]: 'מגורים ומשק בית',
    [CATEGORY_DOMAINS.VEHICLES]: 'רכבים ותחבורה',
    [CATEGORY_DOMAINS.INSURANCES]: 'ביטוחים',
};

export const CATEGORY_DOMAIN_SHORT_LABELS: Record<CategoryDomain, string> = {
    [CATEGORY_DOMAINS.GENERAL]: 'כללי',
    [CATEGORY_DOMAINS.HOUSING]: 'מגורים',
    [CATEGORY_DOMAINS.VEHICLES]: 'רכבים',
    [CATEGORY_DOMAINS.INSURANCES]: 'ביטוחים',
};
