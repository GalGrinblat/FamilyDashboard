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
import { Plus } from 'lucide-react';

interface AddLotDialogProps {
  holdingId: string;
  ticker: string;
  currency: string;
  triggerButton?: React.ReactNode;
}

export function AddLotDialog({ holdingId, ticker, currency, triggerButton }: AddLotDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const today = new Date().toISOString().split('T')[0];
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [fees, setFees] = useState('');

  const totalCost =
    quantity && pricePerUnit
      ? parseFloat(quantity) * parseFloat(pricePerUnit) + (fees ? parseFloat(fees) : 0)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('portfolio_lots').insert({
      holding_id: holdingId,
      lot_type: 'buy',
      purchase_date: purchaseDate,
      quantity: parseFloat(quantity),
      price_per_unit: parseFloat(pricePerUnit),
      total_cost: totalCost,
      fees: fees ? parseFloat(fees) : 0,
    });

    setLoading(false);

    if (error) {
      console.error('Error adding lot:', error);
      alert('שגיאה בהוספת הרכישה');
      return;
    }

    setOpen(false);
    setPurchaseDate(today);
    setQuantity('');
    setPricePerUnit('');
    setFees('');
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-base">
            <Plus className="h-3 w-3 ml-1" /> קנייה
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>רכישה — {ticker}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lot-date" className="text-right">
              תאריך
            </Label>
            <Input
              id="lot-date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lot-qty" className="text-right">
              כמות
            </Label>
            <Input
              id="lot-qty"
              type="number"
              step="any"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="col-span-3"
              placeholder="מספר מניות / יחידות"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lot-price" className="text-right">
              מחיר ליחידה ({currency})
            </Label>
            <Input
              id="lot-price"
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
            <Label htmlFor="lot-fees" className="text-right">
              עמלה ({currency})
            </Label>
            <Input
              id="lot-fees"
              type="number"
              step="any"
              min="0"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
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
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : 'הוסף רכישה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
