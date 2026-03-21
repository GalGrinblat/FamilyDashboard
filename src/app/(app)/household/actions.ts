'use server';
import { createClient } from '@/lib/supabase/server';
import { HouseholdItemFormData } from '@/lib/schemas';

export async function upsertHouseholdItemAction(
  data: HouseholdItemFormData,
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
    category: data.category,
    purchase_price: data.purchase_price ?? null,
    purchase_date: data.purchase_date || null,
    warranty_expiry: data.warranty_expiry || null,
    serial_number: data.serial_number || null,
    model: data.model || null,
  };

  const { error } = id
    ? await supabase.from('household_items').update(payload).eq('id', id)
    : await supabase.from('household_items').insert(payload);

  if (error) {
    console.error('Error saving household item:', error);
    return { success: false, error: id ? 'שגיאה בעדכון הפריט' : 'שגיאה בהוספת הפריט' };
  }
  return { success: true };
}
