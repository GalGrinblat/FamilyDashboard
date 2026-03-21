'use server';
import { createClient } from '@/lib/supabase/server';

export async function upsertVehicleAction(
  data: {
    name: string;
    license_plate?: string | null;
    registration_date?: string | null;
    insurance_end_date?: string | null;
    last_service_date?: string | null;
    last_service_km?: number | null;
    estimated_value?: number | null;
  },
  id?: string,
): Promise<{ success: true; vehicleId: string } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  const year = data.registration_date ? new Date(data.registration_date).getFullYear() : null;
  const payload = {
    name: data.name,
    status: 'active' as const,
    estimated_value: data.estimated_value ?? null,
    license_plate: data.license_plate || null,
    year: year || null,
    registration_date: data.registration_date || null,
    insurance_end_date: data.insurance_end_date || null,
    last_service_date: data.last_service_date || null,
    last_service_km: data.last_service_km ?? null,
  };

  let vehicleId = id;

  if (id) {
    const { error } = await supabase.from('vehicles').update(payload).eq('id', id);
    if (error) {
      console.error('Error updating vehicle:', error);
      return { success: false, error: 'שגיאה בעדכון הרכב' };
    }
  } else {
    const { data: newVehicle, error } = await supabase
      .from('vehicles')
      .insert(payload)
      .select('id')
      .single();
    if (error || !newVehicle) {
      console.error('Error inserting vehicle:', error);
      return { success: false, error: 'שגיאה בהוספת הרכב' };
    }
    vehicleId = newVehicle.id;
  }

  // Delete old uncompleted reminders and recreate
  if (id) {
    await supabase
      .from('reminders')
      .delete()
      .eq('vehicle_id', id)
      .eq('is_completed', false)
      .in('type', ['car_test', 'insurance', 'maintenance']);
  }

  const remindersToInsert: Array<{
    title: string;
    due_date: string;
    type: 'car_test' | 'insurance' | 'maintenance';
    vehicle_id: string;
  }> = [];

  if (data.registration_date && vehicleId) {
    const regDate = new Date(data.registration_date);
    const today = new Date();
    const nextTest = new Date(today.getFullYear(), regDate.getMonth(), regDate.getDate());
    if (nextTest < today) nextTest.setFullYear(today.getFullYear() + 1);
    nextTest.setMonth(nextTest.getMonth() - 1);
    remindersToInsert.push({
      title: `טסט שנתי: ${data.name}`,
      due_date: nextTest.toISOString().split('T')[0],
      type: 'car_test' as const,
      vehicle_id: vehicleId,
    });
  }

  if (data.insurance_end_date && vehicleId) {
    const insDate = new Date(data.insurance_end_date);
    insDate.setMonth(insDate.getMonth() - 1);
    remindersToInsert.push({
      title: `חידוש ביטוח: ${data.name}`,
      due_date: insDate.toISOString().split('T')[0],
      type: 'insurance' as const,
      vehicle_id: vehicleId,
    });
  }

  const baseServiceDate = data.last_service_date
    ? new Date(data.last_service_date)
    : data.registration_date
      ? new Date(data.registration_date)
      : null;
  if (baseServiceDate && vehicleId) {
    const nextService = new Date(baseServiceDate);
    nextService.setFullYear(nextService.getFullYear() + 1);
    nextService.setDate(nextService.getDate() - 7);
    remindersToInsert.push({
      title: `טיפול תקופתי: ${data.name}`,
      due_date: nextService.toISOString().split('T')[0],
      type: 'maintenance' as const,
      vehicle_id: vehicleId,
    });
  }

  if (remindersToInsert.length > 0) {
    await supabase.from('reminders').insert(remindersToInsert);
  }

  return { success: true, vehicleId: vehicleId! };
}

export async function markVehicleSoldAction(
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  const { error } = await supabase.from('vehicles').update({ status: 'sold' }).eq('id', id);
  if (error) return { success: false, error: 'שגיאה בארכוב הרכב' };
  return { success: true };
}

export async function upsertMaintenanceAction(
  data: {
    vehicle_id: string;
    date: string;
    type: string;
    description?: string | null;
    cost?: number | null;
    mileage?: number | null;
    notes?: string | null;
  },
  id?: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: 'לא מאומת' };

  const payload = {
    vehicle_id: data.vehicle_id,
    date: data.date,
    type: data.type,
    description: data.description || null,
    cost: data.cost ?? null,
    mileage: data.mileage ?? null,
    notes: data.notes || null,
  };

  const { error } = id
    ? await supabase.from('vehicle_maintenance').update(payload).eq('id', id)
    : await supabase.from('vehicle_maintenance').insert(payload);

  if (error) {
    console.error('Error saving maintenance:', error);
    return { success: false, error: 'שגיאה בשמירת הטיפול' };
  }

  if (data.mileage) {
    await supabase
      .from('vehicles')
      .update({ last_service_km: data.mileage, last_service_date: data.date })
      .eq('id', data.vehicle_id);
  }

  return { success: true };
}
