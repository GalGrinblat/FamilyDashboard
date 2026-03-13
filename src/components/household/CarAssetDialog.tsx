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

type AssetRow = Database['public']['Tables']['assets']['Row'];

interface AddCarAssetDialogProps {
  triggerButton?: React.ReactNode;
  assetToEdit?: AssetRow;
}

export function CarAssetDialog({ triggerButton, assetToEdit }: AddCarAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form State
  // Form State (seeded if editing)
  const isEditing = !!assetToEdit;
  const [metadata] = useState<Record<string, unknown>>(
    (assetToEdit?.metadata as Record<string, unknown>) || {},
  );

  const [name, setName] = useState(assetToEdit?.name || '');
  const [estimatedValue, setEstimatedValue] = useState(
    assetToEdit?.estimated_value?.toString() || '',
  );
  const [licensePlate, setLicensePlate] = useState(
    ((metadata as Record<string, unknown>).license_plate as string) || '',
  );
  const [registrationDate, setRegistrationDate] = useState(
    ((metadata as Record<string, unknown>).registration_date as string) || '',
  );
  const [insuranceEndDate, setInsuranceEndDate] = useState(
    ((metadata as Record<string, unknown>).insurance_end_date as string) || '',
  );
  const [lastServiceDate, setLastServiceDate] = useState(
    ((metadata as Record<string, unknown>).last_service_date as string) || '',
  );
  const [lastServiceKm, setLastServiceKm] = useState(
    ((metadata as Record<string, unknown>).last_service_km as number | null)?.toString() || '',
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const productionYear = registrationDate
      ? new Date(registrationDate as string).getFullYear().toString()
      : '';

    const payload = {
      name,
      type: 'vehicle',
      status: 'active',
      estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
      metadata: {
        license_plate: licensePlate,
        year: productionYear,
        registration_date: registrationDate || null,
        insurance_end_date: insuranceEndDate || null,
        last_service_date: lastServiceDate || null,
        last_service_km: lastServiceKm ? parseInt(lastServiceKm) : null,
      },
    };

    let insertedAsset;

    if (isEditing) {
      // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
      const { data, error: assetError } = await supabase
        .from('assets')
        .update(payload)
        .eq('id', assetToEdit.id)
        .select()
        .single();
      if (assetError || !data) {
        console.error('Error updating car asset:', assetError);
        alert('שגיאה בעדכון הרכב');
        setLoading(false);
        return;
      }
      insertedAsset = data;

      // In an editing scenario, to prevent duplicate reminders, we would ideally wipe the old uncompleted ones or UPSERT them.
      // For simplicity in this version, we'll clear out pending auto-generated reminders for this asset and recreate them.
      await supabase
        .from('reminders')
        .delete()
        .eq('asset_id', assetToEdit.id)
        .eq('is_completed', false)
        .in('type', ['car_test', 'insurance', 'maintenance']);
    } else {
      // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
      const { data, error: assetError } = await supabase
        .from('assets')
        .insert(payload)
        .select()
        .single();
      if (assetError || !data) {
        console.error('Error inserting car asset:', assetError);
        alert('שגיאה בהוספת הרכב');
        setLoading(false);
        return;
      }
      insertedAsset = data;
    }

    const assetId = (insertedAsset as AssetRow).id;

    // Auto-generate reminders
    const remindersToInsert = [];

    if (registrationDate) {
      const regDate = new Date(registrationDate as string);
      const today = new Date();
      const nextTest = new Date(today.getFullYear(), regDate.getMonth(), regDate.getDate());
      if (nextTest < today) {
        nextTest.setFullYear(today.getFullYear() + 1);
      }
      // 1 month prior
      nextTest.setMonth(nextTest.getMonth() - 1);
      remindersToInsert.push({
        title: `טסט שנתי: ${name}`,
        due_date: nextTest.toISOString().split('T')[0],
        type: 'car_test',
        asset_id: assetId,
      });
    }

    if (insuranceEndDate) {
      const insDate = new Date(insuranceEndDate as string);
      // 1 month prior
      insDate.setMonth(insDate.getMonth() - 1);
      remindersToInsert.push({
        title: `חידוש ביטוח: ${name}`,
        due_date: insDate.toISOString().split('T')[0],
        type: 'insurance',
        asset_id: assetId,
      });
    }

    const baseServiceDate = lastServiceDate
      ? new Date(lastServiceDate as string)
      : registrationDate
        ? new Date(registrationDate as string)
        : null;
    if (baseServiceDate) {
      const nextService = new Date(baseServiceDate);
      nextService.setFullYear(nextService.getFullYear() + 1);
      nextService.setDate(nextService.getDate() - 7); // 1 week prior
      remindersToInsert.push({
        title: `טיפול תקופתי: ${name}`,
        due_date: nextService.toISOString().split('T')[0],
        type: 'maintenance',
        asset_id: assetId,
      });
    }

    if (remindersToInsert.length > 0) {
      // @ts-expect-error: Supabase generic schema mapping forces never for bulk inserts
      const { error: remError } = await supabase.from('reminders').insert(remindersToInsert);
      if (remError) {
        console.error('Error inserting reminders:', remError);
      }
    }

    setLoading(false);

    setOpen(false);
    // Reset form
    setName('');
    setEstimatedValue('');
    setLicensePlate('');
    setRegistrationDate('');
    setInsuranceEndDate('');
    setLastServiceDate('');
    setLastServiceKm('');
    // Refresh the page data
    router.refresh();
  };

  const handleMarkAsSold = async () => {
    if (!isEditing || !assetToEdit) return;
    if (
      !confirm(
        `האם אתה בטוח שברצונך לסמן את הרכב "${assetToEdit.name}" כנמכר? פעולה זו תעביר אותו לארכיון.`,
      )
    )
      return;

    setLoading(true);
    // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
    const { error } = await supabase
      .from('assets')
      .update({ status: 'sold' })
      .eq('id', assetToEdit.id);

    if (error) {
      console.error('Error archiving car:', error);
      alert('שגיאה בארכוב הרכב');
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
            <Plus className="ml-2 h-4 w-4" />
            הוסף רכב
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת פרטי רכב' : 'הוספת רכב חדש (נכס)'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'עדכן את פרטי הרכב, ביטוחים וטיפולים, או סמן אותו כנמכר כדי להסירו מהתצוגה.'
              : 'הזן את פרטי הרכב. רכבים מנוהלים כנכסים שמשפיעים על השווי הנקי (Net Worth) של המשפחה.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="license" className="text-right">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="registrationDate" className="text-right whitespace-nowrap">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="insuranceEndDate" className="text-right whitespace-nowrap">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastServiceDate" className="text-right whitespace-nowrap">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastServiceKm" className="text-right whitespace-nowrap">
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
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
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
              <div /> // Spacer
            )}
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'שומר...' : isEditing ? 'עדכן את פרטי הרכב' : 'הוסף רכב כנכס'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
