'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
import { Plus } from 'lucide-react';

import { Database } from '@/types/database.types';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
type ReminderInsert = Database['public']['Tables']['reminders']['Insert'];

interface CarAssetDialogProps {
  triggerButton?: React.ReactNode;
  vehicleToEdit?: VehicleRow;
}

export function CarAssetDialog({ triggerButton, vehicleToEdit }: CarAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!vehicleToEdit;

  const [name, setName] = useState(vehicleToEdit?.name || '');
  const [estimatedValue, setEstimatedValue] = useState(
    vehicleToEdit?.estimated_value?.toString() || '',
  );
  const [licensePlate, setLicensePlate] = useState(vehicleToEdit?.license_plate || '');
  const [registrationDate, setRegistrationDate] = useState(vehicleToEdit?.registration_date || '');
  const [insuranceEndDate, setInsuranceEndDate] = useState(vehicleToEdit?.insurance_end_date || '');
  const [lastServiceDate, setLastServiceDate] = useState(vehicleToEdit?.last_service_date || '');
  const [lastServiceKm, setLastServiceKm] = useState(
    vehicleToEdit?.last_service_km?.toString() || '',
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const year = registrationDate ? new Date(registrationDate).getFullYear() : undefined;

    const payload = {
      name,
      status: 'active' as const,
      estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
      license_plate: licensePlate || null,
      year: year || null,
      registration_date: registrationDate || null,
      insurance_end_date: insuranceEndDate || null,
      last_service_date: lastServiceDate || null,
      last_service_km: lastServiceKm ? parseInt(lastServiceKm) : null,
    };

    let savedVehicleId = vehicleToEdit?.id;
    let error;

    if (isEditing && vehicleToEdit) {
      const { error: updateError } = await supabase
        .from('vehicles')
        .update(payload)
        .eq('id', vehicleToEdit.id);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from('vehicles')
        .insert(payload)
        .select()
        .single();
      error = insertError;
      if (data) savedVehicleId = data.id;
    }

    if (error || !savedVehicleId) {
      console.error('Error saving vehicle:', error);
      setErrorMsg('שגיאה בשמירת הרכב');
      setLoading(false);
      return;
    }

    // Delete old uncompleted reminders for this vehicle before recreating
    if (isEditing && vehicleToEdit) {
      await supabase
        .from('reminders')
        .delete()
        .eq('vehicle_id', vehicleToEdit.id)
        .eq('is_completed', false)
        .in('type', ['car_test', 'insurance', 'maintenance']);
    }

    // Auto-generate reminders
    const remindersToInsert: ReminderInsert[] = [];

    if (registrationDate) {
      const regDate = new Date(registrationDate);
      const today = new Date();
      const nextTest = new Date(today.getFullYear(), regDate.getMonth(), regDate.getDate());
      if (nextTest < today) {
        nextTest.setFullYear(today.getFullYear() + 1);
      }
      nextTest.setMonth(nextTest.getMonth() - 1);
      remindersToInsert.push({
        title: `טסט שנתי: ${name}`,
        due_date: nextTest.toISOString().split('T')[0],
        type: 'car_test' as const,
        vehicle_id: savedVehicleId,
      });
    }

    if (insuranceEndDate) {
      const insDate = new Date(insuranceEndDate);
      insDate.setMonth(insDate.getMonth() - 1);
      remindersToInsert.push({
        title: `חידוש ביטוח: ${name}`,
        due_date: insDate.toISOString().split('T')[0],
        type: 'insurance' as const,
        vehicle_id: savedVehicleId,
      });
    }

    const baseServiceDate = lastServiceDate
      ? new Date(lastServiceDate)
      : registrationDate
        ? new Date(registrationDate)
        : null;
    if (baseServiceDate) {
      const nextService = new Date(baseServiceDate);
      nextService.setFullYear(nextService.getFullYear() + 1);
      nextService.setDate(nextService.getDate() - 7);
      remindersToInsert.push({
        title: `טיפול תקופתי: ${name}`,
        due_date: nextService.toISOString().split('T')[0],
        type: 'maintenance' as const,
        vehicle_id: savedVehicleId,
      });
    }

    if (remindersToInsert.length > 0) {
      const { error: remError } = await supabase.from('reminders').insert(remindersToInsert);
      if (remError) {
        console.error('Error inserting reminders:', remError);
      }
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  const handleMarkAsSold = async () => {
    if (!isEditing || !vehicleToEdit) return;
    if (
      !confirm(
        `האם אתה בטוח שברצונך לסמן את הרכב "${vehicleToEdit.name}" כנמכר? פעולה זו תעביר אותו לארכיון.`,
      )
    )
      return;

    setLoading(true);
    const { error } = await supabase
      .from('vehicles')
      .update({ status: 'sold' })
      .eq('id', vehicleToEdit.id);

    if (error) {
      console.error('Error archiving car:', error);
      setErrorMsg('שגיאה בארכוב הרכב');
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            הוסף רכב
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת פרטי רכב' : 'הוספת רכב חדש'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'עדכן את פרטי הרכב, ביטוחים וטיפולים, או סמן אותו כנמכר כדי להסירו מהתצוגה.'
              : 'הזן את פרטי הרכב. רכבים משפיעים על השווי הנקי (Net Worth) של המשפחה.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם הרכב
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: מאזדה 3 שחורה"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="license" className="text-right pt-2">
              מספר רישוי
            </Label>
            <Input
              id="license"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              className="col-span-3"
              placeholder="123-45-678"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="registrationDate" className="text-right pt-2 whitespace-nowrap">
              תאריך עלייה לכביש
            </Label>
            <Input
              id="registrationDate"
              type="date"
              value={registrationDate}
              onChange={(e) => setRegistrationDate(e.target.value)}
              className="col-span-3 text-left"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="insuranceEndDate" className="text-right pt-2 whitespace-nowrap">
              תאריך תפוגת ביטוח
            </Label>
            <Input
              id="insuranceEndDate"
              type="date"
              value={insuranceEndDate}
              onChange={(e) => setInsuranceEndDate(e.target.value)}
              className="col-span-3 text-left"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="lastServiceDate" className="text-right pt-2 whitespace-nowrap">
              תאריך טיפול אחרון
            </Label>
            <Input
              id="lastServiceDate"
              type="date"
              value={lastServiceDate}
              onChange={(e) => setLastServiceDate(e.target.value)}
              className="col-span-3 text-left"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="lastServiceKm" className="text-right pt-2 whitespace-nowrap">
              ק״מ בטיפול אחרון
            </Label>
            <Input
              id="lastServiceKm"
              type="number"
              value={lastServiceKm}
              onChange={(e) => setLastServiceKm(e.target.value)}
              className="col-span-3"
              placeholder="למשל: 45000"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="value" className="text-right pt-2">
              שווי נוכחי מוערך
            </Label>
            <Input
              id="value"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="col-span-3"
              placeholder="₪"
            />
          </div>
          {errorMsg && <div className="text-destructive text-base text-right mt-1">{errorMsg}</div>}
          <DialogFooter className="flex items-center justify-between sm:justify-between pt-2">
            {isEditing ? (
              <Button
                type="button"
                variant="destructive"
                className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40"
                onClick={handleMarkAsSold}
                disabled={loading}
              >
                סמן רכב כנמכר
              </Button>
            ) : (
              <div />
            )}
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'שומר...' : isEditing ? 'עדכן את פרטי הרכב' : 'הוסף רכב'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
