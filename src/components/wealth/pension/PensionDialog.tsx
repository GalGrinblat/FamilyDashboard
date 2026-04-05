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
import { PensionFormSchema, PensionFormData } from '@/lib/schemas';
import { upsertPensionAction } from '@/app/(app)/wealth/actions';
import type { Resolver } from 'react-hook-form';

interface PensionDialogProps {
  triggerButton?: React.ReactNode;
  accountToEdit?: InvestmentAccountRef;
}

export function PensionDialog({ triggerButton, accountToEdit }: PensionDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isEditing = !!accountToEdit;

  const defaultValues: PensionFormData = {
    name: '',
    account_type: 'pension',
    current_balance: null,
    broker: null,
    monthly_contribution_ils: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PensionFormData>({
    resolver: zodResolver(PensionFormSchema) as Resolver<PensionFormData>,
    defaultValues,
  });

  const accountType = watch('account_type');

  useEffect(() => {
    if (open && isEditing && accountToEdit) {
      reset({
        name: accountToEdit.name,
        account_type: (accountToEdit.account_type as 'pension' | 'gemel') ?? 'pension',
        current_balance: accountToEdit.current_balance ?? null,
        broker: accountToEdit.broker ?? null,
        monthly_contribution_ils: accountToEdit.monthly_contribution_ils ?? null,
      });
    } else if (!open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, accountToEdit, reset]);

  const onSubmit = async (data: PensionFormData) => {
    const result = await upsertPensionAction(data, accountToEdit?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'הקרן עודכנה בהצלחה' : 'הקרן נוספה בהצלחה');
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
                <Plus className="mr-2 h-4 w-4" /> הוסף קרן/קופה
              </>
            )}
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
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם הקופה
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="name" {...register('name')} placeholder="למשל: אלטשולר שחם פנסיה" />
              {errors.name && <p className="text-base text-rose-500">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="account_type" className="text-right pt-2">
              סוג קופה
            </Label>
            <Select
              value={accountType}
              onValueChange={(v) => setValue('account_type', v as 'pension' | 'gemel')}
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
              {...register('current_balance')}
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
              {...register('broker')}
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
              {...register('monthly_contribution_ils')}
              className="col-span-3"
              placeholder="₪"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isSubmitting ? 'שומר...' : isEditing ? 'עדכן פרטים' : 'הוסף לנכסים'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
