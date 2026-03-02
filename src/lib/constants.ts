export const CATEGORY_TYPES = {
    EXPENSE: 'expense',
    INCOME: 'income',
} as const;

export type CategoryType = typeof CATEGORY_TYPES[keyof typeof CATEGORY_TYPES];

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

export type CategoryDomain = typeof CATEGORY_DOMAINS[keyof typeof CATEGORY_DOMAINS];

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
