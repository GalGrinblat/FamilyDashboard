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
import { ASSET_CLASSES, ASSET_CLASS_LABELS, type AssetClass } from '@/lib/constants';

interface AddHoldingDialogProps {
  investmentAccountId: string;
  triggerButton?: React.ReactNode;
}

export function AddHoldingDialog({ investmentAccountId, triggerButton }: AddHoldingDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [assetClass, setAssetClass] = useState<AssetClass>(ASSET_CLASSES.STOCK);
  const [currency, setCurrency] = useState('USD');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('portfolio_holdings').insert({
      investment_account_id: investmentAccountId,
      ticker: ticker.toUpperCase().trim(),
      name: name || null,
      asset_class: assetClass,
      currency,
      is_active: true,
    });

    setLoading(false);

    if (error) {
      console.error('Error adding holding:', error);
      if (error.code === '23505') {
        alert(`הטיקר ${ticker.toUpperCase()} כבר קיים בחשבון זה`);
      } else {
        alert('שגיאה בהוספת הנייר ערך');
      }
      return;
    }

    setOpen(false);
    setTicker('');
    setName('');
    setAssetClass(ASSET_CLASSES.STOCK);
    setCurrency('USD');
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <Plus className="ml-1 h-3 w-3" /> הוסף נייר ערך
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>הוספת נייר ערך לחשבון</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="ticker" className="text-right">
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="holding-name" className="text-right">
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="asset-class" className="text-right">
              סוג נייר
            </Label>
            <Select value={assetClass} onValueChange={(v) => setAssetClass(v as AssetClass)}>
              <SelectTrigger className="col-span-3">
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

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="currency" className="text-right">
              מטבע
            </Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="USD">USD (דולר)</SelectItem>
                <SelectItem value="ILS">ILS (שקל)</SelectItem>
                <SelectItem value="EUR">EUR (אירו)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'מוסיף...' : 'הוסף נייר ערך'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
