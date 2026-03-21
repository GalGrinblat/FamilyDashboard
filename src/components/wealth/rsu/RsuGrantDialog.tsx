'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
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
import { Plus, Pencil } from 'lucide-react';
import { RSU_TAX_TRACKS, RSU_TAX_TRACK_LABELS, type RsuTaxTrack } from '@/lib/constants';
import { generateVestSchedule } from '@/lib/rsu-schedule';
import { isValidTicker } from '@/lib/stock-prices';
import type { RsuGrantRef } from '@/lib/schemas';
import { RsuGrantFormSchema, RsuGrantFormData } from '@/lib/schemas';
import { upsertRsuGrantAction } from '@/app/(app)/wealth/actions';
import type { Resolver } from 'react-hook-form';

interface RsuGrantDialogProps {
  investmentAccountId?: string;
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
  const router = useRouter();

  const isEditing = !!grantToEdit;

  const defaultValues: RsuGrantFormData = {
    ticker: grantToEdit?.ticker ?? '',
    employer: grantToEdit?.employer ?? defaultEmployer ?? null,
    grant_date: grantToEdit?.grant_date ?? '',
    total_shares: grantToEdit?.total_shares ?? ('' as unknown as number),
    grant_price_usd: grantToEdit?.grant_price_usd ?? null,
    cliff_months: grantToEdit?.cliff_months ?? 12,
    vest_frequency_months: grantToEdit?.vest_frequency_months ?? 3,
    tax_track: grantToEdit?.tax_track ?? RSU_TAX_TRACKS.CAPITAL_GAINS,
    notes: grantToEdit?.notes ?? null,
    vest_mode: grantToEdit?.vest_percentage != null ? 'percent' : 'shares',
    shares_per_vest: grantToEdit?.shares_per_vest ?? null,
    vest_percentage: grantToEdit?.vest_percentage ?? null,
    has_cliff_override:
      grantToEdit != null &&
      (grantToEdit.cliff_vest_shares != null || grantToEdit.cliff_vest_percentage != null),
    cliff_mode: grantToEdit?.cliff_vest_percentage != null ? 'percent' : 'shares',
    cliff_vest_shares: grantToEdit?.cliff_vest_shares ?? null,
    cliff_vest_percentage: grantToEdit?.cliff_vest_percentage ?? null,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RsuGrantFormData>({
    resolver: zodResolver(RsuGrantFormSchema) as Resolver<RsuGrantFormData>,
    defaultValues,
  });

  const grantDate = watch('grant_date');
  const totalShares = watch('total_shares');
  const cliffMonths = watch('cliff_months');
  const vestFrequencyMonths = watch('vest_frequency_months');
  const vestMode = watch('vest_mode');
  const sharesPerVest = watch('shares_per_vest');
  const vestPercentage = watch('vest_percentage');
  const hasCliffOverride = watch('has_cliff_override');
  const cliffMode = watch('cliff_mode');
  const cliffVestShares = watch('cliff_vest_shares');
  const cliffVestPercentage = watch('cliff_vest_percentage');
  const taxTrack = watch('tax_track');

  useEffect(() => {
    if (open && isEditing && grantToEdit) {
      reset({
        ticker: grantToEdit.ticker,
        employer: grantToEdit.employer ?? null,
        grant_date: grantToEdit.grant_date,
        total_shares: grantToEdit.total_shares,
        grant_price_usd: grantToEdit.grant_price_usd ?? null,
        cliff_months: grantToEdit.cliff_months ?? 12,
        vest_frequency_months: grantToEdit.vest_frequency_months ?? 3,
        tax_track: grantToEdit.tax_track,
        notes: grantToEdit.notes ?? null,
        vest_mode: grantToEdit.vest_percentage != null ? 'percent' : 'shares',
        shares_per_vest: grantToEdit.shares_per_vest ?? null,
        vest_percentage: grantToEdit.vest_percentage ?? null,
        has_cliff_override:
          grantToEdit.cliff_vest_shares != null || grantToEdit.cliff_vest_percentage != null,
        cliff_mode: grantToEdit.cliff_vest_percentage != null ? 'percent' : 'shares',
        cliff_vest_shares: grantToEdit.cliff_vest_shares ?? null,
        cliff_vest_percentage: grantToEdit.cliff_vest_percentage ?? null,
      });
    } else if (!open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, grantToEdit, reset]);

  // Live schedule preview (create mode only)
  const schedulePreview =
    !isEditing && totalShares && grantDate && cliffMonths && vestFrequencyMonths
      ? generateVestSchedule({
          grant_date: grantDate,
          total_shares: Number(totalShares) || 0,
          cliff_months: Number(cliffMonths) || 12,
          vest_frequency_months: Number(vestFrequencyMonths) || 3,
          shares_per_vest: vestMode === 'shares' && sharesPerVest ? Number(sharesPerVest) : null,
          vest_percentage: vestMode === 'percent' && vestPercentage ? Number(vestPercentage) : null,
          cliff_vest_shares:
            hasCliffOverride && cliffMode === 'shares' && cliffVestShares
              ? Number(cliffVestShares)
              : null,
          cliff_vest_percentage:
            hasCliffOverride && cliffMode === 'percent' && cliffVestPercentage
              ? Number(cliffVestPercentage)
              : null,
        })
      : null;

  const onSubmit = async (data: RsuGrantFormData) => {
    const normalizedTicker = data.ticker.toUpperCase().trim();
    if (!isValidTicker(normalizedTicker)) {
      setError('ticker', {
        message: 'סימול לא תקין. השתמש באותיות, ספרות, נקודות ומקפים בלבד (לדוגמה: AAPL, MSFT).',
      });
      return;
    }

    const result = await upsertRsuGrantAction(
      {
        investment_account_id: investmentAccountId,
        ticker: normalizedTicker,
        employer: data.employer || null,
        grant_date: data.grant_date,
        total_shares: data.total_shares,
        grant_price_usd: data.grant_price_usd ?? null,
        cliff_months: Number(data.cliff_months) || 12,
        vest_frequency_months: Number(data.vest_frequency_months) || 3,
        shares_per_vest:
          data.vest_mode === 'shares' && data.shares_per_vest ? Number(data.shares_per_vest) : null,
        vest_percentage:
          data.vest_mode === 'percent' && data.vest_percentage
            ? Number(data.vest_percentage)
            : null,
        cliff_vest_shares:
          data.has_cliff_override && data.cliff_mode === 'shares' && data.cliff_vest_shares
            ? Number(data.cliff_vest_shares)
            : null,
        cliff_vest_percentage:
          data.has_cliff_override && data.cliff_mode === 'percent' && data.cliff_vest_percentage
            ? Number(data.cliff_vest_percentage)
            : null,
        tax_track: data.tax_track,
        notes: data.notes || null,
        schedulePreview: schedulePreview ?? null,
      },
      grantToEdit?.id,
    );

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'המענק עודכן בהצלחה' : 'המענק נוסף בהצלחה');
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
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="rsu-ticker" className="text-right pt-2">
              טיקר
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="rsu-ticker"
                {...register('ticker')}
                className="uppercase"
                placeholder="GOOGL, MSFT, AAPL"
              />
              {errors.ticker && <p className="text-base text-rose-500">{errors.ticker.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="rsu-employer" className="text-right pt-2">
              מעסיק
            </Label>
            <Input
              id="rsu-employer"
              {...register('employer')}
              className="col-span-3"
              placeholder="למשל: Google LLC"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="rsu-grant-date" className="text-right pt-2">
              תאריך מענק
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="rsu-grant-date" type="date" {...register('grant_date')} />
              {errors.grant_date && (
                <p className="text-base text-rose-500">{errors.grant_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="rsu-total" className="text-right pt-2">
              סה״כ מניות
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="rsu-total"
                type="number"
                step="any"
                {...register('total_shares')}
                placeholder="400"
              />
              {errors.total_shares && (
                <p className="text-base text-rose-500">{errors.total_shares.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="rsu-grant-price" className="text-right pt-2">
              מחיר מענק ($)
            </Label>
            <Input
              id="rsu-grant-price"
              type="number"
              step="any"
              {...register('grant_price_usd')}
              className="col-span-3"
              placeholder="FMV ביום המענק"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="rsu-cliff" className="text-right pt-2">
              Cliff (חודשים)
            </Label>
            <Input
              id="rsu-cliff"
              type="number"
              {...register('cliff_months')}
              className="col-span-3"
              placeholder="12"
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="rsu-freq" className="text-right pt-2">
              תדירות הבשלה
            </Label>
            <Select
              value={String(vestFrequencyMonths)}
              onValueChange={(v) => setValue('vest_frequency_months', Number(v))}
            >
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

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">סוג</Label>
            <div className="col-span-3 flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={vestMode === 'shares' ? 'default' : 'outline'}
                onClick={() => setValue('vest_mode', 'shares')}
              >
                כמות קבועה
              </Button>
              <Button
                type="button"
                size="sm"
                variant={vestMode === 'percent' ? 'default' : 'outline'}
                onClick={() => setValue('vest_mode', 'percent')}
              >
                אחוז מהמענק
              </Button>
            </div>
          </div>

          {vestMode === 'shares' ? (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="rsu-per-vest" className="text-right pt-2">
                מניות להבשלה
              </Label>
              <Input
                id="rsu-per-vest"
                type="number"
                step="any"
                {...register('shares_per_vest')}
                className="col-span-3"
                placeholder="כמות לאירוע"
              />
            </div>
          ) : (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="rsu-vest-pct" className="text-right pt-2">
                אחוז להבשלה
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="rsu-vest-pct"
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  {...register('vest_percentage')}
                  placeholder="25"
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
              onChange={(e) => setValue('has_cliff_override', e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="cliff-override" className="cursor-pointer font-normal">
              הבשלה ראשונה (Cliff) שונה מהרגיל
            </Label>
          </div>

          {hasCliffOverride && (
            <>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">סוג</Label>
                <div className="col-span-3 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={cliffMode === 'shares' ? 'default' : 'outline'}
                    onClick={() => setValue('cliff_mode', 'shares')}
                  >
                    כמות קבועה
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={cliffMode === 'percent' ? 'default' : 'outline'}
                    onClick={() => setValue('cliff_mode', 'percent')}
                  >
                    אחוז מהמענק
                  </Button>
                </div>
              </div>

              {cliffMode === 'shares' ? (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="cliff-shares" className="text-right pt-2">
                    מניות ב-Cliff
                  </Label>
                  <Input
                    id="cliff-shares"
                    type="number"
                    step="any"
                    {...register('cliff_vest_shares')}
                    className="col-span-3"
                    placeholder="כמות לאירוע ראשון"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="cliff-pct" className="text-right pt-2">
                    אחוז ב-Cliff
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <Input
                      id="cliff-pct"
                      type="number"
                      step="any"
                      min="0"
                      max="100"
                      {...register('cliff_vest_percentage')}
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

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="rsu-tax-track" className="text-right pt-2">
              מסלול מס
            </Label>
            <Select value={taxTrack} onValueChange={(v) => setValue('tax_track', v as RsuTaxTrack)}>
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

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="rsu-notes" className="text-right pt-2">
              הערות
            </Label>
            <Input
              id="rsu-notes"
              {...register('notes')}
              className="col-span-3"
              placeholder="אופציונלי"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : isEditing ? 'שמור שינויים' : 'הוסף מענק'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
