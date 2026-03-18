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
import type { RsuGrantRef } from '@/lib/schemas';

interface RsuVestDialogProps {
  grant: RsuGrantRef;
  triggerButton?: React.ReactNode;
}

export function RsuVestDialog({ grant, triggerButton }: RsuVestDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const today = new Date().toISOString().split('T')[0];
  const [vestDate, setVestDate] = useState(today);
  const [sharesVested, setSharesVested] = useState(grant.shares_per_vest?.toString() ?? '');
  const [fmvAtVest, setFmvAtVest] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // 1. Find the holding for this grant's ticker in the account
    const { data: holding } = await supabase
      .from('portfolio_holdings')
      .select('id')
      .eq('investment_account_id', grant.investment_account_id)
      .eq('ticker', grant.ticker)
      .maybeSingle();

    let holdingId = holding?.id;

    // 2. If no holding exists yet for this ticker, create one
    if (!holdingId) {
      const { data: newHolding, error: holdingError } = await supabase
        .from('portfolio_holdings')
        .insert({
          investment_account_id: grant.investment_account_id,
          ticker: grant.ticker,
          asset_class: 'stock',
          currency: 'USD',
          is_active: true,
        })
        .select('id')
        .single();

      if (holdingError || !newHolding) {
        console.error('Error creating holding:', holdingError);
        setErrorMsg('שגיאה ביצירת נייר הערך');
        setLoading(false);
        return;
      }
      holdingId = newHolding.id;
    }

    // 3. Create a portfolio lot for the vested shares
    // For Section 102: cost basis = grant_price (not FMV at vest)
    // For income track: cost basis = FMV at vest
    const costBasisPerShare =
      grant.tax_track === 'capital_gains'
        ? (grant.grant_price_usd ?? parseFloat(fmvAtVest))
        : parseFloat(fmvAtVest);

    const sharesVestedNum = parseFloat(sharesVested);

    const { data: lot, error: lotError } = await supabase
      .from('portfolio_lots')
      .insert({
        holding_id: holdingId,
        lot_type: 'rsu_vest',
        purchase_date: vestDate,
        quantity: sharesVestedNum,
        price_per_unit: costBasisPerShare,
        total_cost: sharesVestedNum * costBasisPerShare,
        fees: 0,
        notes: notes || null,
      })
      .select('id')
      .single();

    if (lotError || !lot) {
      console.error('Error creating lot:', lotError);
      setErrorMsg('שגיאה ברישום ההתבגרות');
      setLoading(false);
      return;
    }

    // 4. Create the rsu_vest record
    const { error: vestError } = await supabase.from('rsu_vests').insert({
      grant_id: grant.id,
      vest_date: vestDate,
      shares_vested: sharesVestedNum,
      fmv_at_vest: parseFloat(fmvAtVest),
      linked_lot_id: lot.id,
      notes: notes || null,
    });

    setLoading(false);

    if (vestError) {
      console.error('Error creating vest record:', vestError);
      setErrorMsg('שגיאה ברישום ההתבגרות');
      setLoading(false);
      return;
    }

    setOpen(false);
    setVestDate(today);
    setSharesVested(grant.shares_per_vest?.toString() ?? '');
    setFmvAtVest('');
    setNotes('');
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            <Plus className="mr-1 h-3 w-3" /> רשום התבגרות
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>רישום אירוע התבגרות — {grant.ticker}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="vest-date" className="text-right pt-2">
              תאריך
            </Label>
            <Input
              id="vest-date"
              type="date"
              value={vestDate}
              onChange={(e) => setVestDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="vest-shares" className="text-right pt-2">
              מניות שהתבגרו
            </Label>
            <Input
              id="vest-shares"
              type="number"
              step="any"
              value={sharesVested}
              onChange={(e) => setSharesVested(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="vest-fmv" className="text-right pt-2">
              FMV ביום ההתבגרות ($)
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="vest-fmv"
                type="number"
                step="any"
                value={fmvAtVest}
                onChange={(e) => setFmvAtVest(e.target.value)}
                placeholder="מחיר השוק ביום ההתבגרות"
                required
              />
              <p className="text-base text-muted-foreground">
                {grant.tax_track === 'capital_gains'
                  ? 'עלות הבסיס לצורך מס תחושב לפי מחיר המענק ($' +
                    (grant.grant_price_usd ?? '—') +
                    ')'
                  : 'עלות הבסיס תחושב לפי ה-FMV הנוכחי (מסלול הכנסה)'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="vest-notes" className="text-right pt-2">
              הערות
            </Label>
            <Input
              id="vest-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="אופציונלי"
            />
          </div>

          {errorMsg && <div className="text-destructive text-base text-right mt-1">{errorMsg}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : 'רשום התבגרות'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
