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
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { ASSET_CLASSES, ASSET_CLASS_LABELS, type AssetClass } from '@/lib/constants';
import { isValidTicker } from '@/lib/stock-prices';

interface AddHoldingDialogProps {
  investmentAccountId: string;
  triggerButton?: React.ReactNode;
}

export function AddHoldingDialog({ investmentAccountId, triggerButton }: AddHoldingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const today = new Date().toISOString().split('T')[0];

  // Holding fields
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>(ASSET_CLASSES.STOCK);
  const [currency, setCurrency] = useState('USD');

  // First lot fields
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

    setErrorMsg('');
    const normalizedTicker = ticker.toUpperCase().trim();
    if (!isValidTicker(normalizedTicker)) {
      setErrorMsg(
        'סימול לא תקין. השתמש באותיות, ספרות, נקודות ומקפים בלבד (לדוגמה: AAPL, TEVA.TA).',
      );
      return;
    }

    setLoading(true);

    // Check if holding already exists for this ticker in this account
    const { data: existing } = await supabase
      .from('portfolio_holdings')
      .select('id')
      .eq('investment_account_id', investmentAccountId)
      .eq('ticker', normalizedTicker)
      .maybeSingle();

    let holdingId: string;

    if (existing) {
      holdingId = existing.id;
    } else {
      const { data: newHolding, error: holdingError } = await supabase
        .from('portfolio_holdings')
        .insert({
          investment_account_id: investmentAccountId,
          ticker: normalizedTicker,
          name: name || null,
          asset_class: assetClass,
          currency,
          is_active: true,
        })
        .select('id')
        .single();

      if (holdingError || !newHolding) {
        console.error('Error adding holding:', holdingError);
        setErrorMsg('שגיאה בהוספת נייר הערך');
        setLoading(false);
        return;
      }
      holdingId = newHolding.id;
    }

    // Insert the first lot
    if (quantity && pricePerUnit) {
      const { error: lotError } = await supabase.from('portfolio_lots').insert({
        holding_id: holdingId,
        lot_type: 'buy',
        purchase_date: purchaseDate,
        quantity: parseFloat(quantity),
        price_per_unit: parseFloat(pricePerUnit),
        total_cost: totalCost,
        fees: fees ? parseFloat(fees) : 0,
      });

      if (lotError) {
        console.error('Error adding lot:', lotError);
        setErrorMsg('נייר הערך נוסף אך שגיאה בהוספת הרכישה');
      }
    }

    setLoading(false);
    setOpen(false);
    setTicker('');
    setName('');
    setAssetClass(ASSET_CLASSES.STOCK);
    setCurrency('USD');
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
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-3 w-3" /> הוסף נייר ערך
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת נייר ערך</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Holding details */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="ticker" className="text-right pt-2">
              טיקר
            </Label>
            <Input
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="col-span-3 uppercase"
              placeholder="למשל: AAPL, TEVA.TA, BTC-USD"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="holding-name" className="text-right pt-2">
              שם (אופציונלי)
            </Label>
            <Input
              id="holding-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: Apple Inc."
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="asset-class" className="text-right pt-2">
              סוג נייר
            </Label>
            <Select value={assetClass} onValueChange={(v) => setAssetClass(v as AssetClass)}>
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
            <Select value={currency} onValueChange={setCurrency}>
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
            <Input
              id="lot-date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="lot-qty" className="text-right pt-2">
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

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="lot-price" className="text-right pt-2">
              מחיר ליחידה
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

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="lot-fees" className="text-right pt-2">
              עמלה
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
              סה״כ עלות: {currency === 'ILS' ? '₪' : '$'}
              {totalCost.toLocaleString('he-IL', { maximumFractionDigits: 2 })}
            </p>
          )}

          {errorMsg && <div className="text-destructive text-base text-right mt-1">{errorMsg}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : 'הוסף'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
