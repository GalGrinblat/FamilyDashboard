'use server';
import { createClient } from '@/lib/supabase/server';
import { ContractFormData } from '@/lib/schemas';
import { CATEGORY_TYPES } from '@/lib/constants';

export async function upsertContractAction(
  data: ContractFormData,
  id?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  const payload = {
    name: data.name,
    amount: data.amount,
    type: CATEGORY_TYPES.EXPENSE,
    frequency: data.frequency,
    end_date: data.end_date || null,
    is_active: true,
  };

  const { error } = id
    ? await supabase.from('recurring_flows').update(payload).eq('id', id)
    : await supabase.from('recurring_flows').insert(payload);

  if (error) {
    console.error('Error saving contract:', error);
    return { success: false, error: 'שגיאה בשמירת הספק' };
  }
  return { success: true };
}
