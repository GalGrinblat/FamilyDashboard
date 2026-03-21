'use server';
import { createClient } from '@/lib/supabase/server';
import { AccountFormData } from '@/lib/schemas';

export async function upsertAccountAction(
  data: AccountFormData,
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
    type: data.type,
    currency: data.currency,
    current_balance: data.current_balance,
    billing_day: data.type === 'credit_card' && data.billing_day ? data.billing_day : null,
    credit_limit: data.credit_limit ?? null,
  };

  const { error } = id
    ? await supabase.from('accounts').update(payload).eq('id', id)
    : await supabase.from('accounts').insert(payload);

  if (error) {
    console.error('Error saving account:', error);
    return { success: false, error: id ? 'שגיאה בעדכון החשבון' : 'שגיאה בהוספת החשבון' };
  }
  return { success: true };
}
