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

export const REMINDER_TYPES = {
    MAINTENANCE: 'maintenance',
    CAR_TEST: 'car_test',
    INSURANCE: 'insurance',
} as const;

export type ReminderType = typeof REMINDER_TYPES[keyof typeof REMINDER_TYPES];

export const SYSTEM_REMINDER_TYPES = [
    { value: REMINDER_TYPES.MAINTENANCE, label: 'תחזוקה (Maintenance)' },
    { value: REMINDER_TYPES.CAR_TEST, label: 'טסט לרכב (Car Test)' },
    { value: REMINDER_TYPES.INSURANCE, label: 'ביטוחים (Insurance)' },
]

export const FREQUENCY_TYPES = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    WEEKLY: 'weekly', // Adding weekly as it appeared in some grep results
} as const;

export type FrequencyType = typeof FREQUENCY_TYPES[keyof typeof FREQUENCY_TYPES];

export const INSURANCE_TYPES = {
    HEALTH: 'health',
    PROPERTY: 'property',
    VEHICLE: 'vehicle',
} as const;

export type InsuranceType = typeof INSURANCE_TYPES[keyof typeof INSURANCE_TYPES];

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
        { value: 'third_party', label: 'צד ג\'' },
    ]
}
