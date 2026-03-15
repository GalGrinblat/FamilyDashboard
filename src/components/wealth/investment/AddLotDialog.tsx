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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { LOT_TYPES, type LotType } from '@/lib/constants';

const LOT_TYPE_LABELS: Record<LotType, string> = {
  buy: 'קנייה',
  sell: 'מכירה',
  rsu_vest: 'התבגרות RSU',
  dividend_reinvest: 'השקעה מחדש של דיבידנד',
};

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
  const [lotType, setLotType] = useState<LotType>(LOT_TYPES.BUY);
  const [purchaseDate, setPurchaseDate] = useState(today);
  const [quantity, setQuantity] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [fees, setFees] = useState('');
  const [notes, setNotes] = useState('');

  const totalCost =
    quantity && pricePerUnit
      ? parseFloat(quantity) * parseFloat(pricePerUnit) + (fees ? parseFloat(fees) : 0)
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('portfolio_lots').insert({
      holding_id: holdingId,
      lot_type: lotType,
      purchase_date: purchaseDate,
      quantity: parseFloat(quantity),
      price_per_unit: parseFloat(pricePerUnit),
      total_cost: totalCost,
      fees: fees ? parseFloat(fees) : 0,
      notes: notes || null,
    });

    setLoading(false);

    if (error) {
      console.error('Error adding lot:', error);
      alert('שגיאה בהוספת הרכישה');
      return;
    }

    setOpen(false);
    setLotType(LOT_TYPES.BUY);
    setPurchaseDate(today);
    setQuantity('');
    setPricePerUnit('');
    setFees('');
    setNotes('');
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
            <Plus className="h-3 w-3 ml-1" /> הוסף רכישה
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת רכישה — {ticker}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lot-type" className="text-right">
              סוג
            </Label>
            <Select value={lotType} onValueChange={(v) => setLotType(v as LotType)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {Object.entries(LOT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
            <p className="text-sm text-muted-foreground text-left">
              סה״כ עלות: {currency === 'ILS' ? '₪' : '$'}
              {totalCost.toLocaleString('he-IL', { maximumFractionDigits: 2 })}
            </p>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lot-notes" className="text-right">
              הערות
            </Label>
            <Input
              id="lot-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="אופציונלי"
            />
          </div>

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
