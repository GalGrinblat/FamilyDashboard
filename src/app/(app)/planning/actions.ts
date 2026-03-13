'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function addReminderAction(formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const dueDate = formData.get('due_date') as string;

  if (!title || !type || !dueDate) {
    return { error: 'כל השדות חייבים להיות מלאים' };
  }

  const startDate = formData.get('start_date') as string;

  const payload = {
    title,
    type,
    due_date: dueDate,
    start_date: startDate || null,
    is_completed: false,
  };

  // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
  const { error } = await supabase.from('reminders').insert(payload);

  if (error) {
    console.error('Error inserting reminder:', error);
    return { error: 'שגיאה בהוספת התזכורת' };
  }

  revalidatePath('/planning');
  return { success: true };
}

export async function updateReminderAction(id: string, formData: FormData) {
  const supabase = await createClient();

  const title = formData.get('title') as string;
  const type = formData.get('type') as string;
  const dueDate = formData.get('due_date') as string;
  const startDate = formData.get('start_date') as string;

  if (!title || !type || !dueDate) {
    return { error: 'חובה למלא כותרת, סוג ותאריך יעד' };
  }

  const payload = {
    title,
    type,
    due_date: dueDate,
    start_date: startDate || null,
    // we don't update is_completed here
  };

  // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
  const { error } = await supabase.from('reminders').update(payload).eq('id', id);

  if (error) {
    console.error('Error updating reminder:', error);
    return { error: 'שגיאה בעדכון התזכורת' };
  }

  revalidatePath('/planning');
  return { success: true };
}

export async function toggleReminderCompletionAction(id: string, isCompleted: boolean) {
  const supabase = await createClient();

  // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
  const { error } = await supabase
    .from('reminders')
    .update({ is_completed: isCompleted })
    .eq('id', id);

  if (error) {
    console.error('Error toggling completion:', error);
    return { error: 'שגיאה בעדכון סטטוס' };
  }

  revalidatePath('/planning');
  return { success: true };
}

export async function addTripAction(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const startDate = formData.get('start_date') as string;
  const endDate = formData.get('end_date') as string;
  const budgetStr = formData.get('budget') as string;

  if (!name) {
    return { error: 'שם החופשה הינו חובה' };
  }

  const payload = {
    name,
    start_date: startDate || null,
    end_date: endDate || null,
    budget: budgetStr ? parseFloat(budgetStr) : null,
  };

  // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
  const { error } = await supabase.from('trips').insert(payload);

  if (error) {
    console.error('Error inserting trip:', error);
    return { error: 'שגיאה בהוספת החופשה' };
  }

  revalidatePath('/planning');
  return { success: true };
}
