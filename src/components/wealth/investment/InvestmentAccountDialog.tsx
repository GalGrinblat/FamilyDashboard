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
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil } from 'lucide-react';
import { INVESTMENT_ACCOUNT_TYPES, INVESTMENT_ACCOUNT_TYPE_LABELS } from '@/lib/constants';
import type { InvestmentAccountRef } from '@/lib/schemas';
import { InvestmentAccountFormSchema, InvestmentAccountFormData } from '@/lib/schemas';
import { upsertInvestmentAccountAction } from '@/app/(app)/wealth/actions';
import type { Resolver } from 'react-hook-form';

interface InvestmentAccountDialogProps {
  triggerButton?: React.ReactNode;
  accountToEdit?: InvestmentAccountRef;
}

export function InvestmentAccountDialog({
  triggerButton,
  accountToEdit,
}: InvestmentAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isEditing = !!accountToEdit;

  const defaultValues: InvestmentAccountFormData = {
    name: '',
    account_type: INVESTMENT_ACCOUNT_TYPES.BROKERAGE,
    broker: null,
    management_fee_percent: null,
    is_managed: false,
    current_balance: null,
    tax_eligible_date: null,
    monthly_contribution_ils: null,
    notes: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<InvestmentAccountFormData>({
    resolver: zodResolver(InvestmentAccountFormSchema) as Resolver<InvestmentAccountFormData>,
    defaultValues,
  });

  const accountType = watch('account_type');
  const isManaged = watch('is_managed');
  const monthlyContribution = watch('monthly_contribution_ils');

  const isHistalmut = accountType === INVESTMENT_ACCOUNT_TYPES.HISTALMUT;
  const isGemel = accountType === INVESTMENT_ACCOUNT_TYPES.GEMEL;

  useEffect(() => {
    if (open && isEditing && accountToEdit) {
      reset({
        name: accountToEdit.name,
        account_type: accountToEdit.account_type as InvestmentAccountFormData['account_type'],
        broker: accountToEdit.broker ?? null,
        management_fee_percent: accountToEdit.management_fee_percent ?? null,
        is_managed: accountToEdit.is_managed,
        current_balance: accountToEdit.current_balance ?? null,
        tax_eligible_date: accountToEdit.tax_eligible_date ?? null,
        monthly_contribution_ils: accountToEdit.monthly_contribution_ils ?? null,
        notes: accountToEdit.notes ?? null,
      });
    } else if (!open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, accountToEdit, reset]);

  const onSubmit = async (data: InvestmentAccountFormData) => {
    const result = await upsertInvestmentAccountAction(data, accountToEdit?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'חשבון ההשקעות עודכן בהצלחה' : 'חשבון ההשקעות נוסף בהצלחה');
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
                <Plus className="mr-2 h-4 w-4" /> הוסף חשבון השקעות
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת חשבון השקעות' : 'הוספת חשבון השקעות'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="inv-name" className="text-right pt-2">
              שם החשבון
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="inv-name"
                {...register('name')}
                placeholder="למשל: IBI - תיק מניות, קרן השתלמות מיטב"
              />
              {errors.name && <p className="text-base text-rose-500">{errors.name.message}</p>}
            </div>
          </div>

          {/* Account type */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="inv-type" className="text-right pt-2">
              סוג חשבון
            </Label>
            <Select
              value={accountType}
              onValueChange={(v) =>
                setValue('account_type', v as InvestmentAccountFormData['account_type'])
              }
            >
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {Object.entries(INVESTMENT_ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Broker */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="broker" className="text-right pt-2">
              ברוקר / בית השקעות
            </Label>
            <Input
              id="broker"
              {...register('broker')}
              className="col-span-3"
              placeholder="למשל: IBI, מיטב, Interactive Brokers"
            />
          </div>

          {/* Management fee */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="mgmt-fee" className="text-right pt-2">
              דמי ניהול (%)
            </Label>
            <Input
              id="mgmt-fee"
              type="number"
              step="0.01"
              min="0"
              max="10"
              {...register('management_fee_percent')}
              className="col-span-3"
              placeholder="למשל: 0.5"
            />
          </div>

          {/* Managed vs self-directed */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="is-managed" className="text-right pt-2">
              ניהול
            </Label>
            <div className="col-span-3 flex items-center gap-3">
              <Switch
                id="is-managed"
                checked={isManaged}
                onCheckedChange={(v) => setValue('is_managed', v)}
              />
              <span className="text-lg text-muted-foreground">
                {isManaged ? 'מנוהל (בית השקעות קובע)' : 'עצמאי / IRA (אני בוחר ניירות)'}
              </span>
            </div>
          </div>

          {/* Current balance — only for managed accounts */}
          {isManaged && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="balance" className="text-right pt-2">
                יתרה נוכחית (₪)
              </Label>
              <Input
                id="balance"
                type="number"
                {...register('current_balance')}
                className="col-span-3"
                placeholder="₪"
              />
            </div>
          )}

          {/* Histalmut / Gemel contribution */}
          {(isHistalmut || isGemel) && (
            <div className="border-t pt-3 mt-1">
              <p className="text-base font-semibold text-blue-700 dark:text-blue-400 mb-3">
                📊 פרטי מס
              </p>
              <div className="grid gap-3">
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="monthly-contrib" className="text-right pt-2 text-base">
                    הפקדה חודשית (₪)
                  </Label>
                  <div className="col-span-3 space-y-1">
                    <Input
                      id="monthly-contrib"
                      type="number"
                      {...register('monthly_contribution_ils')}
                      placeholder="₪ סה״כ (מעסיק + עובד)"
                    />
                    {isHistalmut && monthlyContribution && Number(monthlyContribution) > 1571 && (
                      <p className="text-base text-amber-600 dark:text-amber-400">
                        ⚠️ חלק מהרווחים יחויב במס 25% (מעל תקרת ₪1,571/חודש)
                      </p>
                    )}
                  </div>
                </div>

                {isHistalmut && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="eligible-date" className="text-right pt-2 text-base">
                      תאריך זכאות (6 שנים)
                    </Label>
                    <div className="col-span-3 space-y-1">
                      <Input id="eligible-date" type="date" {...register('tax_eligible_date')} />
                      <p className="text-base text-muted-foreground">
                        לאחר תאריך זה, רווחים על החלק שבתוך תקרת הפטור יהיו פטורים ממס
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="inv-notes" className="text-right pt-2">
              הערות
            </Label>
            <Input
              id="inv-notes"
              {...register('notes')}
              className="col-span-3"
              placeholder="אופציונלי"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : isEditing ? 'שמור שינויים' : 'הוסף חשבון'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
