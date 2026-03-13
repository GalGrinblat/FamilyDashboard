import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  currency: z.string().nullable(),
  current_balance: z.number().nullable(),
  metadata: z.any().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const AssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  estimated_value: z.number().nullable(),
  status: z.string().nullable(),
  metadata: z.any().nullable(),
  attachments: z.any().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const TransactionSchema = z.object({
  id: z.string(),
  amount: z.number(),
  date: z.string(),
  description: z.string().nullable(),
  merchant: z.string().nullable(),
  account_id: z.string().nullable(),
  category_id: z.string().nullable(),
  trip_id: z.string().nullable(),
  recurring_flow_id: z.string().nullable(),
  is_deduplicated: z.boolean().nullable(),
  original_amount: z.number().nullable(),
  installment_number: z.number().nullable(),
  total_installments: z.number().nullable(),
  asset_id: z.string().nullable(),
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
  metadata: z.any().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export const PolicySchema = z.object({
  id: z.string(),
  created_at: z.string(),
  name: z.string(),
  policy_number: z.string().nullable(),
  type: z.string(),
  provider: z.string(),
  premium_amount: z.number(),
  premium_frequency: z.string(),
  renewal_date: z.string().nullable(),
  covered_individuals: z.array(z.string()).nullable(),
  asset_id: z.string().nullable(),
  document_url: z.string().nullable(),
  subtype: z.string().nullable(),
  assets: AssetSchema.nullable().default(null),
});

export const ReminderSchema = z.object({
  id: z.string(),
  title: z.string(),
  due_date: z.string(),
  start_date: z.string().nullable(),
  type: z.string(),
  is_completed: z.boolean().nullable(),
  asset_id: z.string().nullable(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

export type AccountRef = z.infer<typeof AccountSchema>;
export type AssetRef = z.infer<typeof AssetSchema>;
export type TransactionRef = z.infer<typeof TransactionSchema>;
export type PolicyRef = z.infer<typeof PolicySchema>;
export type ReminderRef = z.infer<typeof ReminderSchema>;
