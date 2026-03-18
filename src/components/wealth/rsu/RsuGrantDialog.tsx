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
import { Plus, Pencil } from 'lucide-react';
import { RSU_TAX_TRACKS, RSU_TAX_TRACK_LABELS, type RsuTaxTrack } from '@/lib/constants';
import { generateVestSchedule } from '@/lib/rsu-schedule';
import { isValidTicker } from '@/lib/stock-prices';
import type { RsuGrantRef } from '@/lib/schemas';

interface RsuGrantDialogProps {
  investmentAccountId: string;
  grantToEdit?: RsuGrantRef;
  triggerButton?: React.ReactNode;
  defaultEmployer?: string;
}

export function RsuGrantDialog({
  investmentAccountId,
  grantToEdit,
  triggerButton,
  defaultEmployer,
}: RsuGrantDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!grantToEdit;

  const [ticker, setTicker] = useState(grantToEdit?.ticker ?? '');
  const [employer, setEmployer] = useState(grantToEdit?.employer ?? defaultEmployer ?? '');
  const [grantDate, setGrantDate] = useState(grantToEdit?.grant_date ?? '');
  const [totalShares, setTotalShares] = useState(grantToEdit?.total_shares?.toString() ?? '');
  const [grantPrice, setGrantPrice] = useState(grantToEdit?.grant_price_usd?.toString() ?? '');
  const [cliffMonths, setCliffMonths] = useState(grantToEdit?.cliff_months?.toString() ?? '12');
  const [vestFrequency, setVestFrequency] = useState(
    grantToEdit?.vest_frequency_months?.toString() ?? '3',
  );
  const [taxTrack, setTaxTrack] = useState<RsuTaxTrack>(
    (grantToEdit?.tax_track as RsuTaxTrack) ?? RSU_TAX_TRACKS.CAPITAL_GAINS,
  );
  const [notes, setNotes] = useState(grantToEdit?.notes ?? '');

  // Vest amount: fixed shares vs percentage
  const [vestMode, setVestMode] = useState<'shares' | 'percent'>(
    grantToEdit?.vest_percentage != null ? 'percent' : 'shares',
  );
  const [sharesPerVest, setSharesPerVest] = useState(
    grantToEdit?.shares_per_vest?.toString() ?? '',
  );
  const [vestPercentage, setVestPercentage] = useState(
    grantToEdit?.vest_percentage?.toString() ?? '',
  );

  // Cliff vest override
  const [hasCliffOverride, setHasCliffOverride] = useState(
    grantToEdit != null &&
      (grantToEdit.cliff_vest_shares != null || grantToEdit.cliff_vest_percentage != null),
  );
  const [cliffMode, setCliffMode] = useState<'shares' | 'percent'>(
    grantToEdit?.cliff_vest_percentage != null ? 'percent' : 'shares',
  );
  const [cliffVestShares, setCliffVestShares] = useState(
    grantToEdit?.cliff_vest_shares?.toString() ?? '',
  );
  const [cliffVestPercentage, setCliffVestPercentage] = useState(
    grantToEdit?.cliff_vest_percentage?.toString() ?? '',
  );

  // Live schedule preview (create mode only)
  const schedulePreview =
    !isEditing && totalShares && grantDate && cliffMonths && vestFrequency
      ? generateVestSchedule({
          grant_date: grantDate,
          total_shares: parseFloat(totalShares) || 0,
          cliff_months: parseInt(cliffMonths) || 12,
          vest_frequency_months: parseInt(vestFrequency) || 3,
          shares_per_vest:
            vestMode === 'shares' && sharesPerVest ? parseFloat(sharesPerVest) : null,
          vest_percentage:
            vestMode === 'percent' && vestPercentage ? parseFloat(vestPercentage) : null,
          cliff_vest_shares:
            hasCliffOverride && cliffMode === 'shares' && cliffVestShares
              ? parseFloat(cliffVestShares)
              : null,
          cliff_vest_percentage:
            hasCliffOverride && cliffMode === 'percent' && cliffVestPercentage
              ? parseFloat(cliffVestPercentage)
              : null,
        })
      : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrorMsg('');
    const normalizedTicker = ticker.toUpperCase().trim();
    if (!isValidTicker(normalizedTicker)) {
      setErrorMsg('סימול לא תקין. השתמש באותיות, ספרות, נקודות ומקפים בלבד (לדוגמה: AAPL, MSFT).');
      return;
    }

    setLoading(true);
    const grantPriceUsd = grantPrice ? parseFloat(grantPrice) : null;

    const payload = {
      investment_account_id: investmentAccountId,
      ticker: normalizedTicker,
      employer: employer || null,
      grant_date: grantDate,
      total_shares: parseFloat(totalShares),
      grant_price_usd: grantPriceUsd,
      cliff_months: cliffMonths ? parseInt(cliffMonths) : 12,
      vest_frequency_months: vestFrequency ? parseInt(vestFrequency) : 3,
      shares_per_vest: vestMode === 'shares' && sharesPerVest ? parseFloat(sharesPerVest) : null,
      vest_percentage: vestMode === 'percent' && vestPercentage ? parseFloat(vestPercentage) : null,
      cliff_vest_shares:
        hasCliffOverride && cliffMode === 'shares' && cliffVestShares
          ? parseFloat(cliffVestShares)
          : null,
      cliff_vest_percentage:
        hasCliffOverride && cliffMode === 'percent' && cliffVestPercentage
          ? parseFloat(cliffVestPercentage)
          : null,
      tax_track: taxTrack,
      notes: notes || null,
      is_active: true,
    };

    if (isEditing) {
      const { error } = await supabase.from('rsu_grants').update(payload).eq('id', grantToEdit.id);
      setLoading(false);
      if (error) {
        console.error('Error updating RSU grant:', error);
        setErrorMsg('שגיאה בעדכון המענק');
        return;
      }
    } else {
      const { data: newGrant, error: grantError } = await supabase
        .from('rsu_grants')
        .insert(payload)
        .select('id')
        .single();

      if (grantError || !newGrant) {
        console.error('Error inserting RSU grant:', grantError);
        setErrorMsg('שגיאה בהוספת המענק');
        setLoading(false);
        return;
      }

      const grantId = newGrant.id;

      if (schedulePreview && schedulePreview.length > 0 && grantPriceUsd != null) {
        // Ensure holding exists
        const { data: existingHolding } = await supabase
          .from('portfolio_holdings')
          .select('id')
          .eq('investment_account_id', investmentAccountId)
          .eq('ticker', normalizedTicker)
          .maybeSingle();

        let holdingId: string;

        if (existingHolding) {
          holdingId = existingHolding.id;
        } else {
          const { data: newHolding, error: holdingError } = await supabase
            .from('portfolio_holdings')
            .insert({
              investment_account_id: investmentAccountId,
              ticker: normalizedTicker,
              asset_class: 'stock',
              currency: 'USD',
              is_active: true,
            })
            .select('id')
            .single();

          if (holdingError || !newHolding) {
            console.error('Error creating holding:', holdingError);
            setErrorMsg('המענק נוסף אך שגיאה ביצירת הנייר ערך');
            setLoading(false);
            router.refresh();
            return;
          }
          holdingId = newHolding.id;
        }

        // Create lot + vest for each scheduled event
        for (const item of schedulePreview) {
          const { data: lot, error: lotError } = await supabase
            .from('portfolio_lots')
            .insert({
              holding_id: holdingId,
              lot_type: 'rsu_vest',
              purchase_date: item.vest_date,
              quantity: item.shares_vested,
              price_per_unit: grantPriceUsd,
              total_cost: item.shares_vested * grantPriceUsd,
              fees: 0,
            })
            .select('id')
            .single();

          if (lotError || !lot) {
            console.error('Error creating lot:', lotError);
            continue;
          }

          await supabase.from('rsu_vests').insert({
            grant_id: grantId,
            vest_date: item.vest_date,
            shares_vested: item.shares_vested,
            linked_lot_id: lot.id,
          });
        }
      }

      setLoading(false);
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
                <Plus className="mr-2 h-4 w-4" /> הוסף מענק RSU
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto" dir="rtl">
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
              תדירות הבשלה
            </Label>
            <Select value={vestFrequency} onValueChange={setVestFrequency}>
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="1">חודשי</SelectItem>
                <SelectItem value="3">רבעוני</SelectItem>
                <SelectItem value="12">שנתי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />
          <p className="text-lg font-medium">כמות הבשלה רגילה</p>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">סוג</Label>
            <div className="col-span-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={vestMode === 'shares' ? 'default' : 'outline'}
                onClick={() => setVestMode('shares')}
              >
                כמות קבועה
              </Button>
              <Button
                type="button"
                size="sm"
                variant={vestMode === 'percent' ? 'default' : 'outline'}
                onClick={() => setVestMode('percent')}
              >
                אחוז מהמענק
              </Button>
            </div>
          </div>

          {vestMode === 'shares' ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rsu-per-vest" className="text-right">
                מניות להבשלה
              </Label>
              <Input
                id="rsu-per-vest"
                type="number"
                step="any"
                value={sharesPerVest}
                onChange={(e) => setSharesPerVest(e.target.value)}
                className="col-span-3"
                placeholder="כמות לאירוע"
                required={vestMode === 'shares'}
              />
            </div>
          ) : (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rsu-vest-pct" className="text-right">
                אחוז להבשלה
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="rsu-vest-pct"
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  value={vestPercentage}
                  onChange={(e) => setVestPercentage(e.target.value)}
                  placeholder="25"
                  required={vestMode === 'percent'}
                />
                <span className="text-lg text-muted-foreground">%</span>
              </div>
            </div>
          )}

          <Separator />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="cliff-override"
              checked={hasCliffOverride}
              onChange={(e) => setHasCliffOverride(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="cliff-override" className="cursor-pointer font-normal">
              הבשלה ראשונה (Cliff) שונה מהרגיל
            </Label>
          </div>

          {hasCliffOverride && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">סוג</Label>
                <div className="col-span-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={cliffMode === 'shares' ? 'default' : 'outline'}
                    onClick={() => setCliffMode('shares')}
                  >
                    כמות קבועה
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={cliffMode === 'percent' ? 'default' : 'outline'}
                    onClick={() => setCliffMode('percent')}
                  >
                    אחוז מהמענק
                  </Button>
                </div>
              </div>

              {cliffMode === 'shares' ? (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cliff-shares" className="text-right">
                    מניות ב-Cliff
                  </Label>
                  <Input
                    id="cliff-shares"
                    type="number"
                    step="any"
                    value={cliffVestShares}
                    onChange={(e) => setCliffVestShares(e.target.value)}
                    className="col-span-3"
                    placeholder="כמות לאירוע ראשון"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cliff-pct" className="text-right">
                    אחוז ב-Cliff
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      id="cliff-pct"
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      value={cliffVestPercentage}
                      onChange={(e) => setCliffVestPercentage(e.target.value)}
                      placeholder="25"
                    />
                    <span className="text-lg text-muted-foreground">%</span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Schedule preview */}
          {!isEditing && schedulePreview && schedulePreview.length > 0 && (
            <div className="rounded-md bg-muted/40 p-3 text-base space-y-1">
              <p className="font-medium text-muted-foreground">
                תצוגה מקדימה — {schedulePreview.length} אירועי הבשלה
              </p>
              <div className="space-y-0.5 max-h-32 overflow-y-auto">
                {schedulePreview.map((item, i) => (
                  <div key={i} className="flex justify-between text-muted-foreground">
                    <span>{new Date(item.vest_date).toLocaleDateString('he-IL')}</span>
                    <span>{item.shares_vested.toLocaleString('he-IL')} מניות</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rsu-tax-track" className="text-right">
              מסלול מס
            </Label>
            <Select value={taxTrack} onValueChange={(v) => setTaxTrack(v as RsuTaxTrack)}>
              <SelectTrigger className="col-span-3" dir="rtl">
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

          {errorMsg && <div className="text-destructive text-base text-right mt-1">{errorMsg}</div>}
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
