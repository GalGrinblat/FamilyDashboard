import { z } from "zod";

export const AccountSchema = z.object({
  current_balance: z.number().nullable(),
});

export const AssetSchema = z.object({
  estimated_value: z.number().nullable(),
});

export const TransactionSchema = z.object({
  amount: z.number(),
  categories: z.union([
    z.object({ type: z.string() }),
    z.array(z.object({ type: z.string() }))
  ]).nullable(),
});

export const ReminderSchema = z.object({
  id: z.string(),
  title: z.string(),
  due_date: z.string(),
  type: z.string(),
  is_completed: z.boolean().nullable(),
});

export type AccountRef = z.infer<typeof AccountSchema>;
export type AssetRef = z.infer<typeof AssetSchema>;
export type TransactionRef = z.infer<typeof TransactionSchema>;
export type ReminderRef = z.infer<typeof ReminderSchema>;
