'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
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
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const today = new Date().toISOString().split('T')[0];
  const [saleDate, setSaleDate] = useState(today);
  const [quantity, setQuantity] = useState(maxQuantity.toString());
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [fees, setFees] = useState('');

  const proceeds =
    quantity && pricePerUnit
      ? parseFloat(quantity) * parseFloat(pricePerUnit) - (fees ? parseFloat(fees) : 0)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(quantity);
    if (qty > maxQuantity) {
      alert(`לא ניתן למכור יותר מ-${maxQuantity} יחידות מרכישה זו`);
      return;
    }
    setLoading(true);

    const { error } = await supabase.from('portfolio_lots').insert({
      holding_id: holdingId,
      lot_type: 'sell',
      purchase_date: saleDate,
      quantity: qty,
      price_per_unit: parseFloat(pricePerUnit),
      total_cost: proceeds,
      fees: fees ? parseFloat(fees) : 0,
      related_lot_id: relatedLotId,
    });

    setLoading(false);

    if (error) {
      console.error('Error recording sale:', error);
      alert('שגיאה בתיעוד המכירה');
      return;
    }

    setOpen(false);
    setSaleDate(today);
    setQuantity(maxQuantity.toString());
    setPricePerUnit('');
    setFees('');
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
        >
          <TrendingDown className="h-3 w-3 ml-1" />
          מכר
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>מכירה — {ticker}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sale-date" className="text-right">
              תאריך מכירה
            </Label>
            <Input
              id="sale-date"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sale-qty" className="text-right">
              כמות
            </Label>
            <div className="col-span-3 flex flex-col gap-1">
              <Input
                id="sale-qty"
                type="number"
                step="any"
                min="0.0001"
                max={maxQuantity}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                מקסימום: {maxQuantity.toLocaleString('he-IL', { maximumFractionDigits: 4 })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sale-price" className="text-right">
              מחיר מכירה ({currency})
            </Label>
            <Input
              id="sale-price"
              type="number"
              step="any"
              min="0"
              value={pricePerUnit}
              onChange={(e) => setPricePerUnit(e.target.value)}
              className="col-span-3"
              placeholder={`מחיר ב-${currency}`}
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="sale-fees" className="text-right">
              עמלה ({currency})
            </Label>
            <Input
              id="sale-fees"
              type="number"
              step="any"
              min="0"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              className="col-span-3"
              placeholder="0"
            />
          </div>

          {proceeds !== null && (
            <p className="text-sm text-muted-foreground text-left">
              תמורה נטו: {currency === 'ILS' ? '₪' : '$'}
              {proceeds.toLocaleString('he-IL', { maximumFractionDigits: 2 })}
            </p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={loading} variant="destructive">
              {loading ? 'שומר...' : 'תעד מכירה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
