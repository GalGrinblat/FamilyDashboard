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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { ASSET_CLASSES, ASSET_CLASS_LABELS } from '@/lib/constants';
import { isValidTicker } from '@/lib/stock-prices';
import { AddHoldingFormSchema, AddHoldingFormData } from '@/lib/schemas';
import { upsertHoldingAction } from '@/app/(app)/wealth/actions';
import type { Resolver } from 'react-hook-form';

interface AddHoldingDialogProps {
  investmentAccountId: string;
  triggerButton?: React.ReactNode;
}

export function AddHoldingDialog({ investmentAccountId, triggerButton }: AddHoldingDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const defaultValues: AddHoldingFormData = {
    ticker: '',
    name: null,
    asset_class: ASSET_CLASSES.STOCK,
    currency: 'USD',
    purchase_date: today,
    quantity: '' as unknown as number,
    price_per_unit: '' as unknown as number,
    fees: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddHoldingFormData>({
    resolver: zodResolver(AddHoldingFormSchema) as Resolver<AddHoldingFormData>,
    defaultValues,
  });

  const assetClass = useWatch({ control, name: 'asset_class' });
  const currency = useWatch({ control, name: 'currency' });
  const quantity = useWatch({ control, name: 'quantity' });
  const pricePerUnit = useWatch({ control, name: 'price_per_unit' });
  const fees = useWatch({ control, name: 'fees' });

  const totalCost =
    quantity && pricePerUnit
      ? Number(quantity) * Number(pricePerUnit) + (fees ? Number(fees) : 0)
      : null;

  const onSubmit = async (data: AddHoldingFormData) => {
    const normalizedTicker = data.ticker.toUpperCase().trim();
    if (!isValidTicker(normalizedTicker)) {
      setError('ticker', {
        message: 'סימול לא תקין. השתמש באותיות, ספרות, נקודות ומקפים בלבד (לדוגמה: AAPL, TEVA.TA).',
      });
      return;
    }

    const result = await upsertHoldingAction(
      investmentAccountId,
      normalizedTicker,
      data.name || null,
      data.asset_class,
      data.currency,
      {
        purchase_date: data.purchase_date,
        quantity: data.quantity,
        price_per_unit: data.price_per_unit,
        fees: data.fees ?? 0,
      },
    );

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('נייר הערך נוסף בהצלחה');
    setOpen(false);
    reset(defaultValues);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-3 w-3" /> הוסף נייר ערך
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת נייר ערך</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Holding details */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="ticker" className="text-right pt-2">
              טיקר
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="ticker"
                {...register('ticker')}
                className="uppercase"
                placeholder="למשל: AAPL, TEVA.TA, BTC-USD"
              />
              {errors.ticker && <p className="text-base text-rose-500">{errors.ticker.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="holding-name" className="text-right pt-2">
              שם (אופציונלי)
            </Label>
            <Input
              id="holding-name"
              {...register('name')}
              className="col-span-3"
              placeholder="למשל: Apple Inc."
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="asset-class" className="text-right pt-2">
              סוג נייר
            </Label>
            <Select value={assetClass} onValueChange={(v) => setValue('asset_class', v)}>
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {Object.entries(ASSET_CLASS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="currency" className="text-right pt-2">
              מטבע
            </Label>
            <Select value={currency} onValueChange={(v) => setValue('currency', v)}>
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="USD">USD (דולר)</SelectItem>
                <SelectItem value="ILS">ILS (שקל)</SelectItem>
                <SelectItem value="EUR">EUR (אירו)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />
          <p className="text-lg font-medium">רכישה ראשונה</p>

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
              מחיר ליחידה
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
              עמלה
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
              סה״כ עלות: {currency === 'ILS' ? '₪' : '$'}
              {totalCost.toLocaleString('he-IL', { maximumFractionDigits: 2 })}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : 'הוסף'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
