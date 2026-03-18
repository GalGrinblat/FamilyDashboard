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
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil } from 'lucide-react';
import {
  INVESTMENT_ACCOUNT_TYPES,
  INVESTMENT_ACCOUNT_TYPE_LABELS,
  type InvestmentAccountType,
} from '@/lib/constants';
import type { InvestmentAccountRef } from '@/lib/schemas';

interface InvestmentAccountDialogProps {
  triggerButton?: React.ReactNode;
  accountToEdit?: InvestmentAccountRef;
}

export function InvestmentAccountDialog({
  triggerButton,
  accountToEdit,
}: InvestmentAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!accountToEdit;

  const [name, setName] = useState(accountToEdit?.name ?? '');
  const [accountType, setAccountType] = useState<InvestmentAccountType>(
    (accountToEdit?.account_type as InvestmentAccountType) ?? INVESTMENT_ACCOUNT_TYPES.BROKERAGE,
  );
  const [broker, setBroker] = useState(accountToEdit?.broker ?? '');
  const [managementFee, setManagementFee] = useState(
    accountToEdit?.management_fee_percent?.toString() ?? '',
  );
  const [isManaged, setIsManaged] = useState(accountToEdit?.is_managed ?? false);
  const [currentBalance, setCurrentBalance] = useState(
    accountToEdit?.current_balance?.toString() ?? '',
  );
  const [histalmutEligibleDate, setHistalmutEligibleDate] = useState(
    accountToEdit?.histalmut_eligible_date ?? '',
  );
  const [monthlyContribution, setMonthlyContribution] = useState(
    accountToEdit?.monthly_contribution_ils?.toString() ?? '',
  );
  const [notes, setNotes] = useState(accountToEdit?.notes ?? '');

  const isHistalmut = accountType === INVESTMENT_ACCOUNT_TYPES.HISTALMUT;
  const isGemel = accountType === INVESTMENT_ACCOUNT_TYPES.GEMEL_LEHASHKAA;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const payload = {
      name,
      account_type: accountType,
      broker: broker || null,
      management_fee_percent: managementFee ? parseFloat(managementFee) : null,
      is_managed: isManaged,
      current_balance: isManaged && currentBalance ? parseFloat(currentBalance) : null,
      histalmut_eligible_date: isHistalmut && histalmutEligibleDate ? histalmutEligibleDate : null,
      monthly_contribution_ils:
        (isHistalmut || isGemel) && monthlyContribution ? parseFloat(monthlyContribution) : null,
      notes: notes || null,
      is_active: true,
    };

    let error;
    if (isEditing) {
      const { error: updateError } = await supabase
        .from('investment_accounts')
        .update(payload)
        .eq('id', accountToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('investment_accounts').insert(payload);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      console.error('Error saving investment account:', error);
      setErrorMsg(isEditing ? 'שגיאה בעדכון חשבון ההשקעות' : 'שגיאה בהוספת חשבון ההשקעות');
      setLoading(false);
      return;
    }

    setOpen(false);
    if (!isEditing) {
      setName('');
      setAccountType(INVESTMENT_ACCOUNT_TYPES.BROKERAGE);
      setBroker('');
      setManagementFee('');
      setIsManaged(false);
      setCurrentBalance('');
      setHistalmutEligibleDate('');
      setMonthlyContribution('');
      setNotes('');
    }
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
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Name */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="inv-name" className="text-right pt-2">
              שם החשבון
            </Label>
            <Input
              id="inv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: IBI - תיק מניות, קרן השתלמות מיטב"
              required
            />
          </div>

          {/* Account type */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="inv-type" className="text-right pt-2">
              סוג חשבון
            </Label>
            <Select
              value={accountType}
              onValueChange={(v) => setAccountType(v as InvestmentAccountType)}
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
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
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
              value={managementFee}
              onChange={(e) => setManagementFee(e.target.value)}
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
              <Switch id="is-managed" checked={isManaged} onCheckedChange={setIsManaged} />
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
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
                className="col-span-3"
                placeholder="₪"
              />
            </div>
          )}

          {/* Histalmut / Gemel contribution */}
          {(isHistalmut || isGemel) && (
            <div className="col-span-4 border-t pt-3 mt-1">
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
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                      placeholder="₪ סה״כ (מעסיק + עובד)"
                    />
                    {isHistalmut &&
                      monthlyContribution &&
                      parseFloat(monthlyContribution) > 1571 && (
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
                      <Input
                        id="eligible-date"
                        type="date"
                        value={histalmutEligibleDate}
                        onChange={(e) => setHistalmutEligibleDate(e.target.value)}
                      />
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
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3"
              placeholder="אופציונלי"
            />
          </div>

          {errorMsg && <div className="text-destructive text-base text-right mt-1">{errorMsg}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEditing ? 'שמור שינויים' : 'הוסף חשבון'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
