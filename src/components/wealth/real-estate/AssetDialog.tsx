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
import { Plus, Pencil } from 'lucide-react';
import type { PropertyRef } from '@/lib/schemas';
import { PropertyFormSchema, PropertyFormData } from '@/lib/schemas';
import { upsertPropertyAction } from '@/app/(app)/wealth/actions';
import type { Resolver } from 'react-hook-form';

interface AssetDialogProps {
  triggerButton?: React.ReactNode;
  propertyToEdit?: PropertyRef;
}

export function AssetDialog({ triggerButton, propertyToEdit }: AssetDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isEditing = !!propertyToEdit;

  const defaultValues: PropertyFormData = {
    name: '',
    status: 'active',
    address: null,
    purchase_price: null,
    purchase_date: null,
    estimated_value: null,
    is_rented: false,
    monthly_rent: null,
    rent_start_date: null,
    rent_end_date: null,
    mortgage_payment: null,
    mortgage_start_date: null,
    mortgage_end_date: null,
    notes: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormData>({
    resolver: zodResolver(PropertyFormSchema) as Resolver<PropertyFormData>,
    defaultValues,
  });

  const rentEndDate = watch('rent_end_date');

  useEffect(() => {
    if (open && isEditing && propertyToEdit) {
      reset({
        name: propertyToEdit.name,
        status: propertyToEdit.status,
        address: propertyToEdit.address ?? null,
        purchase_price: propertyToEdit.purchase_price ?? null,
        purchase_date: propertyToEdit.purchase_date ?? null,
        estimated_value: propertyToEdit.estimated_value ?? null,
        is_rented: propertyToEdit.is_rented,
        monthly_rent: propertyToEdit.monthly_rent ?? null,
        rent_start_date: propertyToEdit.rent_start_date ?? null,
        rent_end_date: propertyToEdit.rent_end_date ?? null,
        mortgage_payment: propertyToEdit.mortgage_payment ?? null,
        mortgage_start_date: propertyToEdit.mortgage_start_date ?? null,
        mortgage_end_date: propertyToEdit.mortgage_end_date ?? null,
        notes: propertyToEdit.notes ?? null,
      });
    } else if (!open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, propertyToEdit, reset]);

  const onSubmit = async (data: PropertyFormData) => {
    const result = await upsertPropertyAction(data, propertyToEdit?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'הנכס עודכן בהצלחה' : 'הנכס נוסף בהצלחה');
    setOpen(false);
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
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם הנכס
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="name" {...register('name')} placeholder="למשל: דירה בחיפה" />
              {errors.name && <p className="text-base text-rose-500">{errors.name.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="value" className="text-right pt-2">
              שווי מוערך
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="value" type="number" {...register('estimated_value')} placeholder="₪" />
              {errors.estimated_value && (
                <p className="text-base text-rose-500">{errors.estimated_value.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="address" className="text-right pt-2 text-base">
              כתובת
            </Label>
            <Input
              id="address"
              {...register('address')}
              className="col-span-3"
              placeholder="רחוב, עיר"
            />
          </div>

          {/* Rent section */}
          <div className="border-t pt-3 mt-1">
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
                  {...register('monthly_rent')}
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
                  {...register('rent_start_date')}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="rent-end" className="text-right pt-2 text-base">
                  סיום חוזה
                </Label>
                <div className="col-span-3 space-y-1">
                  <Input id="rent-end" type="date" {...register('rent_end_date')} />
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
          <div className="border-t pt-3 mt-1">
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
                  {...register('mortgage_payment')}
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
                  {...register('mortgage_start_date')}
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
                  {...register('mortgage_end_date')}
                  className="col-span-3"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : isEditing ? 'שמור שינויים' : 'הוסף נכס'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
