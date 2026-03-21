'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { addTripAction } from '@/app/(app)/planning/actions';
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
import { TripFormSchema, TripFormData } from '@/lib/schemas';
import type { Resolver } from 'react-hook-form';

export function TripDialog({ triggerButton }: { triggerButton?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const defaultValues: TripFormData = {
    name: '',
    start_date: null,
    end_date: null,
    budget: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TripFormData>({
    resolver: zodResolver(TripFormSchema) as Resolver<TripFormData>,
    defaultValues,
  });

  const onSubmit = async (data: TripFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.start_date) formData.append('start_date', data.start_date);
    if (data.end_date) formData.append('end_date', data.end_date);
    if (data.budget) formData.append('budget', String(data.budget));

    const result = await addTripAction(formData);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success('החופשה נוספה בהצלחה');
    setOpen(false);
    reset(defaultValues);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            חופשה חדשה
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>תכנון חופשה חדשה</DialogTitle>
          <DialogDescription>פתח תיקיית מסע חדש למעקב אחר תקציב והוצאות.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="trip_name" className="text-right pt-2">
              שם החופשה
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="trip_name"
                {...register('name')}
                placeholder="למשל: סקי 2026"
                autoComplete="off"
              />
              {errors.name && <p className="text-base text-rose-500">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="start_date" className="text-right pt-2">
              תאריך התחלה
            </Label>
            <Input
              id="start_date"
              type="date"
              {...register('start_date')}
              className="col-span-3"
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="end_date" className="text-right pt-2">
              תאריך חזרה
            </Label>
            <Input
              id="end_date"
              type="date"
              {...register('end_date')}
              className="col-span-3"
              autoComplete="off"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="trip_budget" className="text-right pt-2">
              תקציב משוער
            </Label>
            <Input
              id="trip_budget"
              type="number"
              inputMode="decimal"
              {...register('budget')}
              className="col-span-3"
              placeholder="₪"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'פותח תיק מסע...' : 'צור חופשה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
