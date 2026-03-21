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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Database } from '@/types/database.types';
import { MaintenanceFormSchema, MaintenanceFormData } from '@/lib/schemas';
import { upsertMaintenanceAction } from '@/app/(app)/transportation/actions';
import type { Resolver } from 'react-hook-form';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];

interface AddMaintenanceDialogProps {
  cars: VehicleRow[];
}

export function MaintenanceDialog({ cars }: AddMaintenanceDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const defaultValues: MaintenanceFormData = {
    vehicle_id: cars.length > 0 ? cars[0].id : '',
    date: today,
    type: 'garage',
    description: '',
    mileage: null,
    cost: '' as unknown as number,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MaintenanceFormData>({
    resolver: zodResolver(MaintenanceFormSchema) as Resolver<MaintenanceFormData>,
    defaultValues,
  });

  const vehicleId = watch('vehicle_id');
  const type = watch('type');

  useEffect(() => {
    if (!open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onSubmit = async (data: MaintenanceFormData) => {
    const result = await upsertMaintenanceAction({
      vehicle_id: data.vehicle_id,
      date: data.date,
      type: data.type,
      description: data.description,
      cost: data.cost,
      mileage: data.mileage,
      notes: null,
    });
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('הטיפול נשמר בהצלחה');
    setOpen(false);
    router.refresh();
  };

  if (cars.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> גיליון טיפול
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>תיעוד טיפול או אירוע</DialogTitle>
          <DialogDescription>הוסף רשומת טיפול מוסך, טסט שנתי או אירוע תחזוקה.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="car_id" className="text-right pt-2">
              רכב
            </Label>
            <Select value={vehicleId} onValueChange={(v) => setValue('vehicle_id', v)}>
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר רכב" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {cars.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="date" className="text-right pt-2">
              תאריך
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="date" type="date" {...register('date')} className="text-left" />
              {errors.date && <p className="text-base text-rose-500">{errors.date.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="type" className="text-right pt-2">
              סוג אירוע
            </Label>
            <Select value={type} onValueChange={(v) => setValue('type', v)}>
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="garage">טיפול מוסך (תחזוקה)</SelectItem>
                <SelectItem value="test">טסט (רישוי שנתי)</SelectItem>
                <SelectItem value="insurance">חידוש ביטוח</SelectItem>
                <SelectItem value="repair">תיקון תקלה / תאונה</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="desc" className="text-right pt-2">
              תיאור קצר
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="desc"
                {...register('description')}
                placeholder="למשל: טיפול 15,000, החלפת בלמים"
              />
              {errors.description && (
                <p className="text-base text-rose-500">{errors.description.message}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="mileage" className="text-right pt-2 text-base">
              ק״מ (אופציונלי)
            </Label>
            <Input
              id="mileage"
              type="number"
              {...register('mileage')}
              className="col-span-3"
              placeholder="למשל: 45000"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="cost" className="text-right pt-2">
              עלות (₪)
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="cost" type="number" {...register('cost')} placeholder="עלות הטיפול" />
              {errors.cost && <p className="text-base text-rose-500">{errors.cost.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : 'שמור טיפול'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
