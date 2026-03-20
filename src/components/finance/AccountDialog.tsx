'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
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
import { ACCOUNT_TYPES, ACCOUNT_TYPE_LABELS } from '@/lib/constants';

type AccountRow = Database['public']['Tables']['accounts']['Row'];

export function AccountDialog({
  triggerButton,
  accountToEdit,
}: {
  triggerButton?: React.ReactNode;
  accountToEdit?: AccountRow;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!accountToEdit;

  // Form State
  const [name, setName] = useState(accountToEdit?.name || '');
  const [type, setType] = useState<'bank' | 'credit_card'>(
    accountToEdit?.type || ACCOUNT_TYPES.BANK,
  );
  const [balance, setBalance] = useState(
    accountToEdit?.current_balance ? accountToEdit.current_balance.toString() : '0',
  );

  // Credit Card specific fields
  const [billingDay, setBillingDay] = useState(accountToEdit?.billing_day?.toString() || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const payload = {
      name,
      type,
      current_balance: parseFloat(balance),
      billing_day: type === ACCOUNT_TYPES.CREDIT_CARD && billingDay ? parseInt(billingDay) : null,
    };

    let error;

    if (isEditing && accountToEdit) {
      const { error: updateError } = await supabase
        .from('accounts')
        .update(payload)
        .eq('id', accountToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('accounts').insert(payload);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      console.error('Error saving account:', error);
      setErrorMsg(isEditing ? 'שגיאה בעדכון החשבון' : 'שגיאה בהוספת החשבון');
    } else {
      setOpen(false);
      router.refresh(); // Refresh page data
    }
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
                <Plus className="mr-2 h-4 w-4" />
                הוסף חשבון
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'עריכת חשבון או נכס' : 'הוספת חשבון או נכס פיננסי'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'עדכן את פרטי החשבון והיתרה הנוכחית.'
              : 'הוסף חשבון בנק, כרטיס אשראי, או תיק השקעות למעקב.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם החשבון
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: לאומי עו״ש, מקס אקזקיוטיב"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="type" className="text-right pt-2">
              סוג
            </Label>
            <Select value={type} onValueChange={(v) => setType(v as 'bank' | 'credit_card')}>
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר סוג חשבון" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value={ACCOUNT_TYPES.BANK}>
                  {ACCOUNT_TYPE_LABELS[ACCOUNT_TYPES.BANK]}
                </SelectItem>
                <SelectItem value={ACCOUNT_TYPES.CREDIT_CARD}>
                  {ACCOUNT_TYPE_LABELS[ACCOUNT_TYPES.CREDIT_CARD]}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="balance" className="text-right pt-2">
              יתרה נוכחית
            </Label>
            <Input
              id="balance"
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              className="col-span-3"
              placeholder="₪"
              required
            />
          </div>

          {type === ACCOUNT_TYPES.CREDIT_CARD && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="billingDay" className="text-right pt-2 text-lg">
                יום חיוב בחודש
              </Label>
              <Input
                id="billingDay"
                value={billingDay}
                onChange={(e) => setBillingDay(e.target.value)}
                className="col-span-3"
                placeholder="למשל: 2 או 10 או 15"
              />
            </div>
          )}

          {errorMsg && <div className="text-destructive text-base text-right mt-1">{errorMsg}</div>}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEditing ? 'שמור שינויים' : 'שמור חשבון'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
