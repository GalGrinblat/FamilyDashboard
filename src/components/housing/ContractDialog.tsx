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
import { FREQUENCY_TYPES } from '@/lib/constants';
import { Database } from '@/types/database.types';
import { ContractFormSchema, ContractFormData } from '@/lib/schemas';
import { upsertContractAction } from '@/app/(app)/housing/actions';
import type { Resolver } from 'react-hook-form';

type FlowRow = Database['public']['Tables']['recurring_flows']['Row'];

interface ContractDialogProps {
  triggerButton?: React.ReactNode;
  contractToEdit?: FlowRow;
}

export function ContractDialog({ triggerButton, contractToEdit }: ContractDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isEditing = !!contractToEdit;

  const defaultValues: ContractFormData = {
    name: '',
    amount: '' as unknown as number,
    frequency: FREQUENCY_TYPES.MONTHLY,
    end_date: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormData>({
    resolver: zodResolver(ContractFormSchema) as Resolver<ContractFormData>,
    defaultValues,
  });

  const frequency = watch('frequency');

  useEffect(() => {
    if (open && isEditing && contractToEdit) {
      reset({
        name: contractToEdit.name,
        amount: contractToEdit.amount ?? ('' as unknown as number),
        frequency:
          (contractToEdit.frequency as 'monthly' | 'yearly' | 'weekly') ?? FREQUENCY_TYPES.MONTHLY,
        end_date: contractToEdit.end_date ?? null,
      });
    } else if (!open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, contractToEdit, reset]);

  const onSubmit = async (data: ContractFormData) => {
    const result = await upsertContractAction(data, contractToEdit?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'הספק עודכן בהצלחה' : 'הספק נוסף בהצלחה');
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
                <Plus className="mr-2 h-4 w-4" /> הוסף ספק/חוזה
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת פרטי ספק' : 'הוספת ספק/חוזה חדש'}</DialogTitle>
          <DialogDescription>
            הזן את פרטי הספק (חשמל, תמי 4, ארנונה) והסכום החודשי הממוצע.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם הספק
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="name" {...register('name')} placeholder="למשל: תמי 4" />
              {errors.name && <p className="text-base text-rose-500">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="amount" className="text-right pt-2">
              סכום חודשי
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="amount" type="number" {...register('amount')} placeholder="₪" />
              {errors.amount && <p className="text-base text-rose-500">{errors.amount.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="frequency" className="text-right pt-2">
              תדירות
            </Label>
            <Select
              value={frequency}
              onValueChange={(v) => setValue('frequency', v as 'monthly' | 'yearly' | 'weekly')}
            >
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר תדירות" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value={FREQUENCY_TYPES.MONTHLY}>חודשי</SelectItem>
                <SelectItem value={FREQUENCY_TYPES.YEARLY}>שנתי</SelectItem>
                <SelectItem value={FREQUENCY_TYPES.WEEKLY}>שבועי</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="end_date" className="text-right pt-2">
              תאריך סיום
            </Label>
            <Input id="end_date" type="date" {...register('end_date')} className="col-span-3" />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'שומר...' : isEditing ? 'עדכן פרטים' : 'הוסף ספק'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
