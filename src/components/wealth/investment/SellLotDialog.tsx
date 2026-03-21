'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
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
import { TrendingDown } from 'lucide-react';
import { SellLotFormSchema, SellLotFormData } from '@/lib/schemas';
import { sellLotAction } from '@/app/(app)/wealth/actions';
import type { Resolver } from 'react-hook-form';

interface SellLotDialogProps {
  holdingId: string;
  relatedLotId: string;
  maxQuantity: number;
  ticker: string;
  currency: string;
}

export function SellLotDialog({
  holdingId,
  relatedLotId,
  maxQuantity,
  ticker,
  currency,
}: SellLotDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const defaultValues: SellLotFormData = {
    sale_date: today,
    quantity: maxQuantity,
    price_per_unit: '' as unknown as number,
    fees: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SellLotFormData>({
    resolver: zodResolver(SellLotFormSchema) as Resolver<SellLotFormData>,
    defaultValues,
  });

  const quantity = useWatch({ control, name: 'quantity' });
  const pricePerUnit = useWatch({ control, name: 'price_per_unit' });
  const fees = useWatch({ control, name: 'fees' });

  const proceeds =
    quantity && pricePerUnit
      ? Number(quantity) * Number(pricePerUnit) - (fees ? Number(fees) : 0)
      : null;

  const onSubmit = async (data: SellLotFormData) => {
    if (data.quantity > maxQuantity) {
      setError('quantity', {
        message: `לא ניתן למכור יותר מ-${maxQuantity} יחידות מרכישה זו`,
      });
      return;
    }

    const result = await sellLotAction(holdingId, relatedLotId, {
      sale_date: data.sale_date,
      quantity: data.quantity,
      price_per_unit: data.price_per_unit,
      fees: data.fees ?? 0,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('המכירה תועדה בהצלחה');
    setOpen(false);
    reset({ ...defaultValues, quantity: maxQuantity });
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-base text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
        >
          <TrendingDown className="h-3 w-3 mr-1" />
          מכר
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>מכירה — {ticker}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="sale-date" className="text-right pt-2">
              תאריך מכירה
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="sale-date" type="date" {...register('sale_date')} />
              {errors.sale_date && (
                <p className="text-base text-rose-500">{errors.sale_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="sale-qty" className="text-right pt-2">
              כמות
            </Label>
            <div className="col-span-3 flex flex-col gap-1">
              <Input
                id="sale-qty"
                type="number"
                step="any"
                min="0.0001"
                max={maxQuantity}
                {...register('quantity')}
              />
              {errors.quantity ? (
                <p className="text-base text-rose-500">{errors.quantity.message}</p>
              ) : (
                <p className="text-base text-muted-foreground">
                  מקסימום: {maxQuantity.toLocaleString('he-IL', { maximumFractionDigits: 4 })}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="sale-price" className="text-right pt-2">
              מחיר מכירה ({currency})
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="sale-price"
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
            <Label htmlFor="sale-fees" className="text-right pt-2">
              עמלה ({currency})
            </Label>
            <Input
              id="sale-fees"
              type="number"
              step="any"
              min="0"
              {...register('fees')}
              className="col-span-3"
              placeholder="0"
            />
          </div>

          {proceeds !== null && (
            <p className="text-lg text-muted-foreground text-left">
              תמורה נטו: {currency === 'ILS' ? '₪' : '$'}
              {proceeds.toLocaleString('he-IL', { maximumFractionDigits: 2 })}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting} variant="destructive">
              {isSubmitting ? 'שומר...' : 'תעד מכירה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
