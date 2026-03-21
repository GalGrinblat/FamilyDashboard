'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { INVESTMENT_ACCOUNT_TYPES, INVESTMENT_ACCOUNT_TYPE_LABELS } from '@/lib/constants';

import type { InvestmentAccountRef } from '@/lib/schemas';

interface PensionDialogProps {
  triggerButton?: React.ReactNode;
  accountToEdit?: InvestmentAccountRef;
}

export function PensionDialog({ triggerButton, accountToEdit }: PensionDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!accountToEdit;
  const [name, setName] = useState(accountToEdit?.name || '');
  const [accountType, setAccountType] = useState<'pension' | 'gemel'>(
    (accountToEdit?.account_type as 'pension' | 'gemel') || 'pension',
  );
  const [currentBalance, setCurrentBalance] = useState(
    accountToEdit?.current_balance?.toString() || '',
  );
  const [broker, setBroker] = useState(accountToEdit?.broker || '');
  const [monthlyContribution, setMonthlyContribution] = useState(
    accountToEdit?.monthly_contribution_ils?.toString() || '',
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      account_type: accountType,
      current_balance: currentBalance ? parseFloat(currentBalance) : null,
      broker: broker || null,
      monthly_contribution_ils: monthlyContribution ? parseFloat(monthlyContribution) : null,
      is_managed: true,
      is_active: true,
    };

    let error;

    if (isEditing && accountToEdit) {
      const { error: updateError } = await supabase
        .from('investment_accounts')
        .update(payload)
        .eq('id', accountToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('investment_accounts').insert(payload);
      error = insertError;
    }

    if (error) {
      console.error('Error saving pension account:', error);
      setErrorMsg('שגיאה בשמירת הקרן');
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="outline" size="sm">
            {isEditing ? <Pencil className="h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {isEditing ? '' : 'הוסף קרן/קופה'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת קרן פנסיה/גמל' : 'הוספת קרן פנסיה/גמל'}</DialogTitle>
          <DialogDescription>
            הזן את שם הקרן והיתרה העדכנית כפי שמופיעה בדוח הרבעוני או באתר הקופה.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם הקופה
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: אלטשולר שחם פנסיה"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="account_type" className="text-right pt-2">
              סוג קופה
            </Label>
            <Select
              value={accountType}
              onValueChange={(v) => setAccountType(v as 'pension' | 'gemel')}
            >
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value={INVESTMENT_ACCOUNT_TYPES.PENSION}>
                  {INVESTMENT_ACCOUNT_TYPE_LABELS[INVESTMENT_ACCOUNT_TYPES.PENSION]}
                </SelectItem>
                <SelectItem value={INVESTMENT_ACCOUNT_TYPES.GEMEL}>
                  {INVESTMENT_ACCOUNT_TYPE_LABELS[INVESTMENT_ACCOUNT_TYPES.GEMEL]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="balance" className="text-right pt-2">
              יתרה עדכנית
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
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="broker" className="text-right pt-2">
              חברה מנהלת
            </Label>
            <Input
              id="broker"
              value={broker}
              onChange={(e) => setBroker(e.target.value)}
              className="col-span-3"
              placeholder="למשל: מיטב, הראל, אלטשולר"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="contribution" className="text-right pt-2">
              הפרשה חודשית
            </Label>
            <Input
              id="contribution"
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(e.target.value)}
              className="col-span-3"
              placeholder="₪"
            />
          </div>
          {errorMsg && <div className="text-destructive text-base text-right mt-1">{errorMsg}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'שומר...' : isEditing ? 'עדכן פרטים' : 'הוסף לנכסים'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
