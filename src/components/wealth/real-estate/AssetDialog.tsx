'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Pencil } from 'lucide-react';

import { Database } from '@/types/database.types';
import type { PropertyRef } from '@/lib/schemas';

type PropertyInsert = Database['public']['Tables']['properties']['Insert'];
type FlowInsert = Database['public']['Tables']['recurring_flows']['Insert'];

interface AssetDialogProps {
  triggerButton?: React.ReactNode;
  propertyToEdit?: PropertyRef;
}

export function AssetDialog({ triggerButton, propertyToEdit }: AssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!propertyToEdit;

  const [name, setName] = useState(propertyToEdit?.name || '');
  const [estimatedValue, setEstimatedValue] = useState(
    propertyToEdit?.estimated_value?.toString() || '',
  );
  const [address, setAddress] = useState(propertyToEdit?.address || '');
  const [monthlyRent, setMonthlyRent] = useState(propertyToEdit?.monthly_rent?.toString() || '');
  const [rentStartDate, setRentStartDate] = useState(propertyToEdit?.rent_start_date || '');
  const [rentEndDate, setRentEndDate] = useState(propertyToEdit?.rent_end_date || '');
  const [mortgagePayment, setMortgagePayment] = useState(
    propertyToEdit?.mortgage_payment?.toString() || '',
  );
  const [mortgageStartDate, setMortgageStartDate] = useState(
    propertyToEdit?.mortgage_start_date || '',
  );
  const [mortgageEndDate, setMortgageEndDate] = useState(propertyToEdit?.mortgage_end_date || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const payload: PropertyInsert = {
      name,
      estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
      status: 'active',
      address: address || null,
      monthly_rent: monthlyRent ? parseFloat(monthlyRent) : null,
      rent_start_date: rentStartDate || null,
      rent_end_date: rentEndDate || null,
      is_rented: !!monthlyRent && parseFloat(monthlyRent) > 0,
      mortgage_payment: mortgagePayment ? parseFloat(mortgagePayment) : null,
      mortgage_start_date: mortgageStartDate || null,
      mortgage_end_date: mortgageEndDate || null,
    };

    let error;
    let savedPropertyId = propertyToEdit?.id;

    if (isEditing && propertyToEdit) {
      const { error: updateError } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', propertyToEdit.id);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from('properties')
        .insert(payload)
        .select()
        .single();
      error = insertError;
      if (data) savedPropertyId = data.id;
    }

    if (!error && savedPropertyId) {
      await syncPropertyFlows(
        supabase,
        savedPropertyId,
        name,
        monthlyRent,
        rentStartDate,
        rentEndDate,
        mortgagePayment,
        mortgageStartDate,
        mortgageEndDate,
      );
    }

    setLoading(false);

    if (error) {
      console.error('Error saving property:', error);
      setErrorMsg(isEditing ? 'שגיאה בעדכון הנכס' : 'שגיאה בהוספת הנכס');
      return;
    }

    setOpen(false);
    if (!isEditing) {
      setName('');
      setEstimatedValue('');
      setAddress('');
      setMonthlyRent('');
      setRentStartDate('');
      setRentEndDate('');
      setMortgagePayment('');
      setMortgageStartDate('');
      setMortgageEndDate('');
    }
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant={isEditing ? 'ghost' : 'default'} size={isEditing ? 'icon' : 'default'}>
            {isEditing ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" /> הוסף נכס
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת נכס נדל״ן' : 'הוספת נכס נדל״ן'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'עדכן את שווי הנכס ופרטיו כדי לשמור על תמונת מצב עדכנית.'
              : 'הוסף נכס נדל״ן כדי לעקוב אחר השווי, שכירות ומשכנתא.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם הנכס
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: דירה בחיפה"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="value" className="text-right pt-2">
              שווי מוערך
            </Label>
            <Input
              id="value"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="col-span-3"
              placeholder="₪"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="address" className="text-right pt-2 text-base">
              כתובת
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="col-span-3"
              placeholder="רחוב, עיר"
            />
          </div>

          {/* Rent section */}
          <div className="col-span-4 border-t pt-3 mt-1">
            <p className="text-base font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1">
              📥 שכירות (הכנסה)
            </p>
            <div className="grid gap-3">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="rent" className="text-right pt-2 text-base">
                  סכום חודשי
                </Label>
                <Input
                  id="rent"
                  type="number"
                  value={monthlyRent}
                  onChange={(e) => setMonthlyRent(e.target.value)}
                  className="col-span-3"
                  placeholder="₪"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="rent-start" className="text-right pt-2 text-base">
                  תחילת חוזה
                </Label>
                <Input
                  id="rent-start"
                  type="date"
                  value={rentStartDate}
                  onChange={(e) => setRentStartDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="rent-end" className="text-right pt-2 text-base">
                  סיום חוזה
                </Label>
                <div className="col-span-3 space-y-1">
                  <Input
                    id="rent-end"
                    type="date"
                    value={rentEndDate}
                    onChange={(e) => setRentEndDate(e.target.value)}
                  />
                  {rentEndDate && (
                    <p className="text-base text-emerald-600 dark:text-emerald-400">
                      📅 תזכורת חידוש תיווצר אוטומטית 3 חודשים לפני סיום החוזה
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mortgage section */}
          <div className="col-span-4 border-t pt-3 mt-1">
            <p className="text-base font-semibold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-1">
              🏦 משכנתא (הוצאה)
            </p>
            <div className="grid gap-3">
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="mortgage" className="text-right pt-2 text-base">
                  החזר חודשי
                </Label>
                <Input
                  id="mortgage"
                  type="number"
                  value={mortgagePayment}
                  onChange={(e) => setMortgagePayment(e.target.value)}
                  className="col-span-3"
                  placeholder="₪"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="mortgage-start" className="text-right pt-2 text-base">
                  תחילת משכנתא
                </Label>
                <Input
                  id="mortgage-start"
                  type="date"
                  value={mortgageStartDate}
                  onChange={(e) => setMortgageStartDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="mortgage-end" className="text-right pt-2 text-base">
                  סיום משכנתא
                </Label>
                <Input
                  id="mortgage-end"
                  type="date"
                  value={mortgageEndDate}
                  onChange={(e) => setMortgageEndDate(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
          </div>

          {errorMsg && <div className="text-destructive text-base text-right mt-1">{errorMsg}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEditing ? 'שמור שינויים' : 'הוסף נכס'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

async function syncPropertyFlows(
  supabase: SupabaseClient<Database>,
  propertyId: string,
  propertyName: string,
  monthlyRent: string,
  rentStartDate: string,
  rentEndDate: string,
  mortgagePayment: string,
  mortgageStartDate: string,
  mortgageEndDate: string,
) {
  const flowsToUpsert: Array<FlowInsert> = [];

  if (monthlyRent && parseFloat(monthlyRent) > 0) {
    flowsToUpsert.push({
      property_id: propertyId,
      name: `${propertyName} (שכירות)`,
      amount: parseFloat(monthlyRent),
      type: 'income',
      frequency: 'monthly',
      is_active: true,
      start_date: rentStartDate || null,
      end_date: rentEndDate || null,
    });
  }

  if (mortgagePayment && parseFloat(mortgagePayment) > 0) {
    flowsToUpsert.push({
      property_id: propertyId,
      name: `${propertyName} (משכנתא)`,
      amount: parseFloat(mortgagePayment),
      type: 'expense',
      frequency: 'monthly',
      is_active: true,
      start_date: mortgageStartDate || null,
      end_date: mortgageEndDate || null,
    });
  }

  for (const flow of flowsToUpsert) {
    const { data: existing } = await supabase
      .from('recurring_flows')
      .select('id')
      .eq('property_id', propertyId)
      .eq('name', flow.name as string)
      .maybeSingle();

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { property_id: _pid, ...updatePayload } = flow;
      await supabase.from('recurring_flows').update(updatePayload).eq('id', existing.id);
    } else {
      await supabase.from('recurring_flows').insert(flow);
    }
  }

  // Auto-reminder: 3 months before rent contract end date
  if (rentEndDate) {
    const endDate = new Date(rentEndDate);
    const reminderDate = new Date(endDate);
    reminderDate.setMonth(reminderDate.getMonth() - 3);

    const reminderTitle = `חידוש חוזה שכירות – ${propertyName}`;

    const { data: existingReminder } = await supabase
      .from('reminders')
      .select('id')
      .eq('title', reminderTitle)
      .maybeSingle();

    const reminderPayload = {
      title: reminderTitle,
      due_date: reminderDate.toISOString().split('T')[0],
      type: 'maintenance' as const,
      is_completed: false,
      property_id: propertyId,
    };

    if (existingReminder) {
      await supabase.from('reminders').update(reminderPayload).eq('id', existingReminder.id);
    } else {
      await supabase.from('reminders').insert(reminderPayload);
    }
  }
}
