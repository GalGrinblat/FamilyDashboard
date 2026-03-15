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
import { Plus, Pencil } from 'lucide-react';
import { RSU_TAX_TRACKS, RSU_TAX_TRACK_LABELS, type RsuTaxTrack } from '@/lib/constants';
import type { RsuGrantRef } from '@/lib/schemas';

interface RsuGrantDialogProps {
  investmentAccountId: string;
  grantToEdit?: RsuGrantRef;
  triggerButton?: React.ReactNode;
}

export function RsuGrantDialog({
  investmentAccountId,
  grantToEdit,
  triggerButton,
}: RsuGrantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!grantToEdit;

  const [ticker, setTicker] = useState(grantToEdit?.ticker ?? '');
  const [employer, setEmployer] = useState(grantToEdit?.employer ?? '');
  const [grantDate, setGrantDate] = useState(grantToEdit?.grant_date ?? '');
  const [totalShares, setTotalShares] = useState(grantToEdit?.total_shares?.toString() ?? '');
  const [grantPrice, setGrantPrice] = useState(grantToEdit?.grant_price_usd?.toString() ?? '');
  const [cliffMonths, setCliffMonths] = useState(grantToEdit?.cliff_months?.toString() ?? '12');
  const [vestFrequency, setVestFrequency] = useState(
    grantToEdit?.vest_frequency_months?.toString() ?? '3',
  );
  const [sharesPerVest, setSharesPerVest] = useState(
    grantToEdit?.shares_per_vest?.toString() ?? '',
  );
  const [taxTrack, setTaxTrack] = useState<RsuTaxTrack>(
    (grantToEdit?.tax_track as RsuTaxTrack) ?? RSU_TAX_TRACKS.CAPITAL_GAINS,
  );
  const [notes, setNotes] = useState(grantToEdit?.notes ?? '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      investment_account_id: investmentAccountId,
      ticker: ticker.toUpperCase().trim(),
      employer: employer || null,
      grant_date: grantDate,
      total_shares: parseFloat(totalShares),
      grant_price_usd: grantPrice ? parseFloat(grantPrice) : null,
      cliff_months: cliffMonths ? parseInt(cliffMonths) : 12,
      vest_frequency_months: vestFrequency ? parseInt(vestFrequency) : 3,
      shares_per_vest: sharesPerVest ? parseFloat(sharesPerVest) : null,
      tax_track: taxTrack,
      notes: notes || null,
      is_active: true,
    };

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase
        .from('rsu_grants')
        .update(payload)
        .eq('id', grantToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('rsu_grants').insert(payload);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      console.error('Error saving RSU grant:', error);
      alert(isEditing ? 'שגיאה בעדכון המענק' : 'שגיאה בהוספת המענק');
      return;
    }

    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant={isEditing ? 'ghost' : 'default'} size={isEditing ? 'icon' : 'default'}>
            {isEditing ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <>
                <Plus className="ml-2 h-4 w-4" /> הוסף מענק RSU
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת מענק RSU' : 'הוספת מענק RSU חדש'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-ticker" className="text-right">
              טיקר
            </Label>
            <Input
              id="rsu-ticker"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              className="col-span-3 uppercase"
              placeholder="GOOGL, MSFT, AAPL"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-employer" className="text-right">
              מעסיק
            </Label>
            <Input
              id="rsu-employer"
              value={employer}
              onChange={(e) => setEmployer(e.target.value)}
              className="col-span-3"
              placeholder="למשל: Google LLC"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-grant-date" className="text-right">
              תאריך מענק
            </Label>
            <Input
              id="rsu-grant-date"
              type="date"
              value={grantDate}
              onChange={(e) => setGrantDate(e.target.value)}
              className="col-span-3"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-total" className="text-right">
              סה״כ מניות
            </Label>
            <Input
              id="rsu-total"
              type="number"
              step="any"
              value={totalShares}
              onChange={(e) => setTotalShares(e.target.value)}
              className="col-span-3"
              placeholder="400"
              required
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-grant-price" className="text-right">
              מחיר מענק ($)
            </Label>
            <Input
              id="rsu-grant-price"
              type="number"
              step="any"
              value={grantPrice}
              onChange={(e) => setGrantPrice(e.target.value)}
              className="col-span-3"
              placeholder="FMV ביום המענק"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-cliff" className="text-right">
              Cliff (חודשים)
            </Label>
            <Input
              id="rsu-cliff"
              type="number"
              value={cliffMonths}
              onChange={(e) => setCliffMonths(e.target.value)}
              className="col-span-3"
              placeholder="12"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-freq" className="text-right">
              תדירות התבגרות
            </Label>
            <Select value={vestFrequency} onValueChange={setVestFrequency}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="1">חודשי</SelectItem>
                <SelectItem value="3">רבעוני</SelectItem>
                <SelectItem value="12">שנתי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-per-vest" className="text-right">
              מניות להתבגרות
            </Label>
            <Input
              id="rsu-per-vest"
              type="number"
              step="any"
              value={sharesPerVest}
              onChange={(e) => setSharesPerVest(e.target.value)}
              className="col-span-3"
              placeholder="כמות קבועה לאירוע"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-tax-track" className="text-right">
              מסלול מס
            </Label>
            <Select value={taxTrack} onValueChange={(v) => setTaxTrack(v as RsuTaxTrack)}>
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {Object.entries(RSU_TAX_TRACK_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-notes" className="text-right">
              הערות
            </Label>
            <Input
              id="rsu-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="אופציונלי"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEditing ? 'שמור שינויים' : 'הוסף מענק'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
