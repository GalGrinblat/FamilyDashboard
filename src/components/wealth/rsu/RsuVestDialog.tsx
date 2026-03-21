'use client';

import { useState } from 'react';
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
import { Plus } from 'lucide-react';
import type { RsuGrantRef } from '@/lib/schemas';
import { RsuVestFormSchema, RsuVestFormData } from '@/lib/schemas';
import { recordRsuVestAction } from '@/app/(app)/wealth/actions';
import type { Resolver } from 'react-hook-form';

interface RsuVestDialogProps {
  grant: RsuGrantRef;
  triggerButton?: React.ReactNode;
}

export function RsuVestDialog({ grant, triggerButton }: RsuVestDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const today = new Date().toISOString().split('T')[0];

  const defaultValues: RsuVestFormData = {
    vest_date: today,
    shares_vested: grant.shares_per_vest ?? ('' as unknown as number),
    fmv_at_vest: '' as unknown as number,
    notes: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RsuVestFormData>({
    resolver: zodResolver(RsuVestFormSchema) as Resolver<RsuVestFormData>,
    defaultValues,
  });

  const onSubmit = async (data: RsuVestFormData) => {
    const result = await recordRsuVestAction(
      {
        id: grant.id,
        investment_account_id: grant.investment_account_id,
        ticker: grant.ticker,
        tax_track: grant.tax_track,
        grant_price_usd: grant.grant_price_usd,
      },
      {
        vest_date: data.vest_date,
        shares_vested: data.shares_vested,
        fmv_at_vest: data.fmv_at_vest,
        notes: data.notes || null,
      },
    );

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success('ההתבגרות נרשמה בהצלחה');
    setOpen(false);
    reset(defaultValues);
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
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="vest-date" className="text-right pt-2">
              תאריך
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="vest-date" type="date" {...register('vest_date')} />
              {errors.vest_date && (
                <p className="text-base text-rose-500">{errors.vest_date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="vest-shares" className="text-right pt-2">
              מניות שהתבגרו
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="vest-shares" type="number" step="any" {...register('shares_vested')} />
              {errors.shares_vested && (
                <p className="text-base text-rose-500">{errors.shares_vested.message}</p>
              )}
            </div>
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
                {...register('fmv_at_vest')}
                placeholder="מחיר השוק ביום ההתבגרות"
              />
              {errors.fmv_at_vest && (
                <p className="text-base text-rose-500">{errors.fmv_at_vest.message}</p>
              )}
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
              {...register('notes')}
              className="col-span-3"
              placeholder="אופציונלי"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : 'רשום התבגרות'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
