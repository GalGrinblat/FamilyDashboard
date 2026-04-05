import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  currency: z.string(),
  current_balance: z.number(),
  billing_day: z.number().nullable(),
  credit_limit: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PropertySchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['active', 'sold', 'archived']),
  address: z.string().nullable(),
  purchase_price: z.number().nullable(),
  purchase_date: z.string().nullable(),
  estimated_value: z.number().nullable(),
  is_rented: z.boolean(),
  monthly_rent: z.number().nullable(),
  rent_start_date: z.string().nullable(),
  rent_end_date: z.string().nullable(),
  mortgage_payment: z.number().nullable(),
  mortgage_start_date: z.string().nullable(),
  mortgage_end_date: z.string().nullable(),
  attachment_urls: z.array(z.string()).nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const VehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['active', 'sold', 'archived']),
  license_plate: z.string().nullable(),
  year: z.number().nullable(),
  make: z.string().nullable(),
  model: z.string().nullable(),
  estimated_value: z.number().nullable(),
  is_leased: z.boolean(),
  leasing_payment: z.number().nullable(),
  purchase_price: z.number().nullable(),
  purchase_date: z.string().nullable(),
  registration_date: z.string().nullable(),
  insurance_end_date: z.string().nullable(),
  last_service_date: z.string().nullable(),
  last_service_km: z.number().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const VehicleMaintenanceSchema = z.object({
  id: z.string(),
  vehicle_id: z.string(),
  date: z.string(),
  type: z.string(),
  description: z.string().nullable(),
  cost: z.number().nullable(),
  mileage: z.number().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  date: z.string(),
  description: z.string().nullable(),
  merchant: z.string().nullable(),
  account_id: z.string(),
  category_id: z.string().nullable(),
  trip_id: z.string().nullable(),
  recurring_flow_id: z.string().nullable(),
  is_duplicate: z.boolean(),
  original_amount: z.number().nullable(),
  installment_number: z.number(),
  total_installments: z.number(),
  property_id: z.string().nullable(),
  vehicle_id: z.string().nullable(),
  categories: z
    .preprocess(
      (val) => {
        if (Array.isArray(val)) return val[0];
        return val;
      },
      z
        .object({
          name_he: z.string().optional(),
          name_en: z.string().optional(),
          type: z.string(),
          domain: z.string().optional(),
        })
        .nullable(),
    )
    .nullable()
    .default(null),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PolicySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  name: z.string(),
  policy_number: z.string().nullable(),
  type: z.enum(['health', 'property', 'vehicle', 'life']),
  provider: z.string(),
  premium_amount: z.number(),
  premium_frequency: z.enum(['monthly', 'yearly']),
  renewal_date: z.string().nullable(),
  covered_individuals: z.array(z.string()).nullable(),
  property_id: z.string().nullable(),
  vehicle_id: z.string().nullable(),
  document_url: z.string().nullable(),
  subtype: z.string().nullable(),
});

export const ReminderSchema = z.object({
  id: z.string(),
  title: z.string(),
  due_date: z.string(),
  start_date: z.string().nullable(),
  type: z.string(),
  is_completed: z.boolean().nullable(),
  is_recurring: z.boolean(),
  recurrence_frequency: z.string().nullable(),
  vehicle_id: z.string().nullable(),
  property_id: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type AccountRef = z.infer<typeof AccountSchema>;
export type PropertyRef = z.infer<typeof PropertySchema>;
export type VehicleRef = z.infer<typeof VehicleSchema>;
export type VehicleMaintenanceRef = z.infer<typeof VehicleMaintenanceSchema>;
export type TransactionRef = z.infer<typeof TransactionSchema>;
export type PolicyRef = z.infer<typeof PolicySchema>;
export type ReminderRef = z.infer<typeof ReminderSchema>;

// ─── Investment schemas ────────────────────────────────────────────────────

export const InvestmentAccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  account_type: z.string(),
  broker: z.string().nullable(),
  management_fee_percent: z.number().nullable(),
  is_managed: z.boolean(),
  current_balance: z.number().nullable(),
  tax_eligible_date: z.string().nullable(),
  monthly_contribution_ils: z.number().nullable(),
  is_active: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PortfolioHoldingSchema = z.object({
  id: z.string(),
  investment_account_id: z.string(),
  ticker: z.string(),
  asset_class: z.string(),
  name: z.string().nullable(),
  currency: z.string(),
  is_active: z.boolean(),
  underlying_index: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PortfolioLotSchema = z.object({
  id: z.string(),
  holding_id: z.string(),
  lot_type: z.string(),
  purchase_date: z.string(),
  quantity: z.number(),
  price_per_unit: z.number(),
  total_cost: z.number().nullable(),
  fees: z.number().nullable(),
  related_lot_id: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const RsuGrantSchema = z.object({
  id: z.string(),
  investment_account_id: z.string(),
  ticker: z.string(),
  employer: z.string().nullable(),
  grant_date: z.string(),
  total_shares: z.number(),
  grant_price_usd: z.number().nullable(),
  cliff_months: z.number().nullable(),
  vest_frequency_months: z.number().nullable(),
  shares_per_vest: z.number().nullable(),
  vest_percentage: z.number().nullable(),
  cliff_vest_shares: z.number().nullable(),
  cliff_vest_percentage: z.number().nullable(),
  tax_track: z.string(),
  is_active: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const RsuVestSchema = z.object({
  id: z.string(),
  grant_id: z.string(),
  vest_date: z.string(),
  shares_vested: z.number(),
  linked_lot_id: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PortfolioSnapshotSchema = z.object({
  id: z.string(),
  investment_account_id: z.string(),
  snapshot_date: z.string(),
  total_value_ils: z.number(),
  total_cost_basis_ils: z.number().nullable(),
  unrealized_gain_ils: z.number().nullable(),
  usd_ils_rate: z.number().nullable(),
  created_at: z.string().nullable(),
});

// ─── Form schemas (for React Hook Form mutations) ──────────────────────────

export const RecurringFlowFormSchema = z.object({
  name: z.string().min(1, 'נדרש שם לתזרים'),
  amount: z.coerce.number().positive('יש להזין סכום חיובי'),
  type: z.enum(['income', 'expense']),
  frequency: z.enum(['monthly', 'yearly', 'weekly']),
  account_id: z.string().nullable().optional(),
  category_id: z.string().nullable().optional(),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
});
export type RecurringFlowFormData = z.infer<typeof RecurringFlowFormSchema>;

export const HouseholdItemFormSchema = z.object({
  name: z.string().min(1, 'נדרש שם לפריט'),
  category: z.enum(['appliance', 'furniture', 'electronics', 'other']),
  purchase_price: z.coerce.number().positive().nullable().optional(),
  purchase_date: z.string().nullable().optional(),
  warranty_expiry: z.string().nullable().optional(),
  serial_number: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
});
export type HouseholdItemFormData = z.infer<typeof HouseholdItemFormSchema>;

export const PolicyFormSchema = z.object({
  name: z.string().min(1, 'נדרש שם לפוליסה'),
  provider: z.string().min(1, 'נדרשת חברת ביטוח'),
  type: z.enum(['health', 'property', 'vehicle', 'life']),
  subtype: z.string().nullable().optional(),
  premium_amount: z.coerce.number().positive('נדרש סכום חיובי'),
  premium_frequency: z.enum(['monthly', 'yearly']),
  renewal_date: z.string().nullable().optional(),
  policy_number: z.string().nullable().optional(),
  linked_id: z.string().nullable().optional(),
});
export type PolicyFormData = z.infer<typeof PolicyFormSchema>;

export const VehicleFormSchema = z.object({
  name: z.string().min(1, 'נדרש שם לרכב'),
  license_plate: z.string().nullable().optional(),
  registration_date: z.string().min(1, 'נדרש תאריך עלייה לכביש'),
  insurance_end_date: z.string().min(1, 'נדרש תאריך תפוגת ביטוח'),
  last_service_date: z.string().nullable().optional(),
  last_service_km: z.coerce.number().int().positive().nullable().optional(),
  estimated_value: z.coerce.number().positive().nullable().optional(),
});
export type VehicleFormData = z.infer<typeof VehicleFormSchema>;

export const PropertyFormSchema = z.object({
  name: z.string().min(1, 'נדרש שם לנכס'),
  status: z.enum(['active', 'sold', 'archived']),
  address: z.string().nullable().optional(),
  purchase_price: z.coerce.number().positive().nullable().optional(),
  purchase_date: z.string().nullable().optional(),
  estimated_value: z.coerce.number().positive().nullable().optional(),
  is_rented: z.boolean(),
  monthly_rent: z.coerce.number().positive().nullable().optional(),
  rent_start_date: z.string().nullable().optional(),
  rent_end_date: z.string().nullable().optional(),
  mortgage_payment: z.coerce.number().positive().nullable().optional(),
  mortgage_start_date: z.string().nullable().optional(),
  mortgage_end_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type PropertyFormData = z.infer<typeof PropertyFormSchema>;

export const PensionFormSchema = z.object({
  name: z.string().min(1, 'נדרש שם'),
  account_type: z.enum(['pension', 'gemel']),
  current_balance: z.coerce.number().min(0).nullable().optional(),
  broker: z.string().nullable().optional(),
  monthly_contribution_ils: z.coerce.number().min(0).nullable().optional(),
});
export type PensionFormData = z.infer<typeof PensionFormSchema>;

export const AccountFormSchema = z.object({
  name: z.string().min(1, 'נדרש שם'),
  type: z.enum(['bank', 'credit_card']),
  currency: z.string().min(1),
  current_balance: z.coerce.number(),
  billing_day: z.coerce.number().int().min(1).max(31).nullable().optional(),
  credit_limit: z.coerce.number().min(0).nullable().optional(),
});
export type AccountFormData = z.infer<typeof AccountFormSchema>;

export const ContractFormSchema = z.object({
  name: z.string().min(1, 'נדרש שם לספק'),
  amount: z.coerce.number().positive('יש להזין סכום חיובי'),
  frequency: z.enum(['monthly', 'yearly', 'weekly']),
  end_date: z.string().nullable().optional(),
});
export type ContractFormData = z.infer<typeof ContractFormSchema>;

export const ReminderFormSchema = z.object({
  title: z.string().min(1, 'נדרש תיאור למשימה'),
  type: z.string().min(1, 'נדרש סוג'),
  due_date: z.string().min(1, 'נדרש תאריך יעד'),
  start_date: z.string().nullable().optional(),
});
export type ReminderFormData = z.infer<typeof ReminderFormSchema>;

export const TripFormSchema = z.object({
  name: z.string().min(1, 'נדרש שם לחופשה'),
  start_date: z.string().nullable().optional(),
  end_date: z.string().nullable().optional(),
  budget: z.coerce.number().positive().nullable().optional(),
});
export type TripFormData = z.infer<typeof TripFormSchema>;

export const MaintenanceFormSchema = z.object({
  vehicle_id: z.string().min(1, 'נדרש לבחור רכב'),
  date: z.string().min(1, 'נדרש תאריך'),
  type: z.string().min(1, 'נדרש סוג אירוע'),
  description: z.string().min(1, 'נדרש תיאור'),
  mileage: z.coerce.number().int().positive().nullable().optional(),
  cost: z.coerce.number().positive('נדרשת עלות חיובית'),
});
export type MaintenanceFormData = z.infer<typeof MaintenanceFormSchema>;

export const InvestmentAccountFormSchema = z.object({
  name: z.string().min(1, 'נדרש שם לחשבון'),
  account_type: z.enum(['brokerage', 'histalmut', 'rsu', 'gemel', 'pension']),
  broker: z.string().nullable().optional(),
  management_fee_percent: z.coerce.number().min(0).max(10).nullable().optional(),
  is_managed: z.boolean(),
  current_balance: z.coerce.number().min(0).nullable().optional(),
  tax_eligible_date: z.string().nullable().optional(),
  monthly_contribution_ils: z.coerce.number().min(0).nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type InvestmentAccountFormData = z.infer<typeof InvestmentAccountFormSchema>;

export const AddHoldingFormSchema = z.object({
  ticker: z.string().min(1, 'נדרש טיקר'),
  name: z.string().nullable().optional(),
  asset_class: z.string().min(1),
  currency: z.string().min(1),
  purchase_date: z.string().min(1, 'נדרש תאריך'),
  quantity: z.coerce.number().positive('נדרשת כמות חיובית'),
  price_per_unit: z.coerce.number().positive('נדרש מחיר חיובי'),
  fees: z.coerce.number().min(0).nullable().optional(),
  underlying_index: z.string().nullable().optional(),
});
export type AddHoldingFormData = z.infer<typeof AddHoldingFormSchema>;

export const AddLotFormSchema = z.object({
  purchase_date: z.string().min(1, 'נדרש תאריך'),
  quantity: z.coerce.number().positive('נדרשת כמות חיובית'),
  price_per_unit: z.coerce.number().positive('נדרש מחיר חיובי'),
  fees: z.coerce.number().min(0).nullable().optional(),
});
export type AddLotFormData = z.infer<typeof AddLotFormSchema>;

export const SellLotFormSchema = z.object({
  sale_date: z.string().min(1, 'נדרש תאריך'),
  quantity: z.coerce.number().positive('נדרשת כמות חיובית'),
  price_per_unit: z.coerce.number().positive('נדרש מחיר חיובי'),
  fees: z.coerce.number().min(0).nullable().optional(),
});
export type SellLotFormData = z.infer<typeof SellLotFormSchema>;

export const RsuGrantFormSchema = z.object({
  ticker: z.string().min(1, 'נדרש טיקר'),
  employer: z.string().nullable().optional(),
  grant_date: z.string().min(1, 'נדרש תאריך מענק'),
  total_shares: z.coerce.number().positive('נדרש מספר מניות'),
  grant_price_usd: z.coerce.number().positive().nullable().optional(),
  cliff_months: z.coerce.number().int().min(0).nullable().optional(),
  vest_frequency_months: z.coerce.number().int().positive().nullable().optional(),
  tax_track: z.string().min(1),
  notes: z.string().nullable().optional(),
  vest_mode: z.enum(['shares', 'percent']),
  shares_per_vest: z.coerce.number().positive().nullable().optional(),
  vest_percentage: z.coerce.number().positive().nullable().optional(),
  has_cliff_override: z.boolean(),
  cliff_mode: z.enum(['shares', 'percent']),
  cliff_vest_shares: z.coerce.number().positive().nullable().optional(),
  cliff_vest_percentage: z.coerce.number().positive().nullable().optional(),
});
export type RsuGrantFormData = z.infer<typeof RsuGrantFormSchema>;

export const RsuVestFormSchema = z.object({
  vest_date: z.string().min(1, 'נדרש תאריך'),
  shares_vested: z.coerce.number().positive('נדרשת כמות חיובית'),
  fmv_at_vest: z.coerce.number().positive('נדרש FMV חיובי'),
  notes: z.string().nullable().optional(),
});
export type RsuVestFormData = z.infer<typeof RsuVestFormSchema>;

export const ChangePaymentMethodFormSchema = z.object({
  account_id: z.string().min(1, 'נדרש לבחור חשבון'),
});
export type ChangePaymentMethodFormData = z.infer<typeof ChangePaymentMethodFormSchema>;

export const GoalFormSchema = z.object({
  title: z.string().min(1, 'נדרש כותרת ליעד'),
  category: z.enum(['emergency_fund', 'down_payment', 'vacation', 'education', 'other']),
  target_amount: z.coerce.number().positive('נדרש סכום יעד חיובי'),
  current_amount: z.coerce.number().min(0).optional(),
  target_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});
export type GoalFormData = z.infer<typeof GoalFormSchema>;

export type InvestmentAccountRef = z.infer<typeof InvestmentAccountSchema>;
export type PortfolioHoldingRef = z.infer<typeof PortfolioHoldingSchema>;
export type PortfolioLotRef = z.infer<typeof PortfolioLotSchema>;
export type RsuGrantRef = z.infer<typeof RsuGrantSchema>;
export type RsuVestRef = z.infer<typeof RsuVestSchema>;
export type PortfolioSnapshotRef = z.infer<typeof PortfolioSnapshotSchema>;
