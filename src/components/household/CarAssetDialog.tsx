'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
import { VehicleFormSchema, VehicleFormData } from '@/lib/schemas';
import { upsertVehicleAction, markVehicleSoldAction } from '@/app/(app)/transportation/actions';
import type { Resolver } from 'react-hook-form';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];

interface CarAssetDialogProps {
  triggerButton?: React.ReactNode;
  vehicleToEdit?: VehicleRow;
}

export function CarAssetDialog({ triggerButton, vehicleToEdit }: CarAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSelling, setIsSelling] = useState(false);
  const router = useRouter();

  const isEditing = !!vehicleToEdit;

  const defaultValues: VehicleFormData = {
    name: '',
    license_plate: null,
    registration_date: '',
    insurance_end_date: '',
    last_service_date: null,
    last_service_km: null,
    estimated_value: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(VehicleFormSchema) as Resolver<VehicleFormData>,
    defaultValues,
  });

  useEffect(() => {
    if (open && isEditing && vehicleToEdit) {
      reset({
        name: vehicleToEdit.name,
        license_plate: vehicleToEdit.license_plate ?? null,
        registration_date: vehicleToEdit.registration_date ?? '',
        insurance_end_date: vehicleToEdit.insurance_end_date ?? '',
        last_service_date: vehicleToEdit.last_service_date ?? null,
        last_service_km: vehicleToEdit.last_service_km ?? null,
        estimated_value: vehicleToEdit.estimated_value ?? null,
      });
    } else if (!open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, vehicleToEdit, reset]);

  const onSubmit = async (data: VehicleFormData) => {
    const result = await upsertVehicleAction(
      {
        name: data.name,
        license_plate: data.license_plate,
        registration_date: data.registration_date,
        insurance_end_date: data.insurance_end_date,
        last_service_date: data.last_service_date,
        last_service_km: data.last_service_km,
        estimated_value: data.estimated_value,
      },
      vehicleToEdit?.id,
    );
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'פרטי הרכב עודכנו בהצלחה' : 'הרכב נוסף בהצלחה');
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

    setIsSelling(true);
    const result = await markVehicleSoldAction(vehicleToEdit.id);
    setIsSelling(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('הרכב סומן כנמכר');
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
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם הרכב
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="name" {...register('name')} placeholder="למשל: מאזדה 3 שחורה" />
              {errors.name && <p className="text-base text-rose-500">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="license" className="text-right pt-2">
              מספר רישוי
            </Label>
            <Input
              id="license"
              {...register('license_plate')}
              className="col-span-3"
              placeholder="123-45-678"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="registrationDate" className="text-right pt-2 whitespace-nowrap">
              תאריך עלייה לכביש
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="registrationDate"
                type="date"
                {...register('registration_date')}
                className="text-left"
              />
              {errors.registration_date && (
                <p className="text-base text-rose-500">{errors.registration_date.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="insuranceEndDate" className="text-right pt-2 whitespace-nowrap">
              תאריך תפוגת ביטוח
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="insuranceEndDate"
                type="date"
                {...register('insurance_end_date')}
                className="text-left"
              />
              {errors.insurance_end_date && (
                <p className="text-base text-rose-500">{errors.insurance_end_date.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="lastServiceDate" className="text-right pt-2 whitespace-nowrap">
              תאריך טיפול אחרון
            </Label>
            <Input
              id="lastServiceDate"
              type="date"
              {...register('last_service_date')}
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
              {...register('last_service_km')}
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
              {...register('estimated_value')}
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
                disabled={isSelling || isSubmitting}
              >
                {isSelling ? 'מסמן...' : 'סמן רכב כנמכר'}
              </Button>
            ) : (
              <div />
            )}
            <Button
              type="submit"
              disabled={isSubmitting || isSelling}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'שומר...' : isEditing ? 'עדכן את פרטי הרכב' : 'הוסף רכב'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
