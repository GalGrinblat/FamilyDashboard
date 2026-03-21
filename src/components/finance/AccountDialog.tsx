'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
import { AccountFormSchema, AccountFormData } from '@/lib/schemas';
import { upsertAccountAction } from '@/app/(app)/finance/actions';
import type { Resolver } from 'react-hook-form';

type AccountRow = Database['public']['Tables']['accounts']['Row'];

export function AccountDialog({
  triggerButton,
  accountToEdit,
}: {
  triggerButton?: React.ReactNode;
  accountToEdit?: AccountRow;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isEditing = !!accountToEdit;

  const defaultValues: AccountFormData = {
    name: '',
    type: ACCOUNT_TYPES.BANK,
    currency: 'ILS',
    current_balance: 0,
    billing_day: null,
    credit_limit: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(AccountFormSchema) as Resolver<AccountFormData>,
    defaultValues,
  });

  const type = watch('type');

  useEffect(() => {
    if (open && isEditing && accountToEdit) {
      reset({
        name: accountToEdit.name,
        type: accountToEdit.type as 'bank' | 'credit_card',
        currency: accountToEdit.currency ?? 'ILS',
        current_balance: accountToEdit.current_balance ?? 0,
        billing_day: accountToEdit.billing_day ?? null,
        credit_limit: accountToEdit.credit_limit ?? null,
      });
    } else if (!open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, accountToEdit, reset]);

  const onSubmit = async (data: AccountFormData) => {
    const result = await upsertAccountAction(data, accountToEdit?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'החשבון עודכן בהצלחה' : 'החשבון נוסף בהצלחה');
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
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם החשבון
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="name"
                {...register('name')}
                placeholder="למשל: לאומי עו״ש, מקס אקזקיוטיב"
              />
              {errors.name && <p className="text-base text-rose-500">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="type" className="text-right pt-2">
              סוג
            </Label>
            <Select
              value={type}
              onValueChange={(v) => setValue('type', v as 'bank' | 'credit_card')}
            >
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
            <div className="col-span-3 space-y-1">
              <Input id="balance" type="number" {...register('current_balance')} placeholder="₪" />
              {errors.current_balance && (
                <p className="text-base text-rose-500">{errors.current_balance.message}</p>
              )}
            </div>
          </div>

          {type === ACCOUNT_TYPES.CREDIT_CARD && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="billingDay" className="text-right pt-2 text-lg">
                יום חיוב בחודש
              </Label>
              <Input
                id="billingDay"
                {...register('billing_day')}
                className="col-span-3"
                placeholder="למשל: 2 או 10 או 15"
              />
            </div>
          )}

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : isEditing ? 'שמור שינויים' : 'שמור חשבון'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
