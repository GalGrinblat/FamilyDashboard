'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { AddLotFormSchema, AddLotFormData } from '@/lib/schemas';
import { addLotAction } from '@/app/(app)/wealth/actions';
import type { Resolver } from 'react-hook-form';

interface AddLotDialogProps {
  holdingId: string;
  ticker: string;
  currency: string;
  triggerButton?: React.ReactNode;
}

export function AddLotDialog({ holdingId, ticker, currency, triggerButton }: AddLotDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const defaultValues: AddLotFormData = {
    purchase_date: today,
    quantity: '' as unknown as number,
    price_per_unit: '' as unknown as number,
    fees: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddLotFormData>({
    resolver: zodResolver(AddLotFormSchema) as Resolver<AddLotFormData>,
    defaultValues,
  });

  const quantity = watch('quantity');
  const pricePerUnit = watch('price_per_unit');
  const fees = watch('fees');

  const totalCost =
    quantity && pricePerUnit
      ? Number(quantity) * Number(pricePerUnit) + (fees ? Number(fees) : 0)
      : null;

  const onSubmit = async (data: AddLotFormData) => {
    const result = await addLotAction(holdingId, {
      purchase_date: data.purchase_date,
      quantity: data.quantity,
      price_per_unit: data.price_per_unit,
      fees: data.fees ?? 0,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('הרכישה נוספה בהצלחה');
    setOpen(false);
    reset(defaultValues);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-base">
            <Plus className="h-3 w-3 mr-1" /> קנייה
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>רכישה — {ticker}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="lot-date" className="text-right pt-2">
              תאריך
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="lot-date" type="date" {...register('purchase_date')} />
              {errors.purchase_date && (
                <p className="text-base text-rose-500">{errors.purchase_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="lot-qty" className="text-right pt-2">
              כמות
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="lot-qty"
                type="number"
                step="any"
                min="0"
                {...register('quantity')}
                placeholder="מספר מניות / יחידות"
              />
              {errors.quantity && (
                <p className="text-base text-rose-500">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="lot-price" className="text-right pt-2">
              מחיר ליחידה ({currency})
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="lot-price"
                type="number"
                step="any"
                min="0"
                {...register('price_per_unit')}
                placeholder={`מחיר ב-${currency}`}
              />
              {errors.price_per_unit && (
                <p className="text-base text-rose-500">{errors.price_per_unit.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="lot-fees" className="text-right pt-2">
              עמלה ({currency})
            </Label>
            <Input
              id="lot-fees"
              type="number"
              step="any"
              min="0"
              {...register('fees')}
              className="col-span-3"
              placeholder="0"
            />
          </div>

          {totalCost !== null && (
            <p className="text-lg text-muted-foreground text-left">
              סה״כ: {currency === 'ILS' ? '₪' : '$'}
              {totalCost.toLocaleString('he-IL', { maximumFractionDigits: 2 })}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : 'הוסף רכישה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
