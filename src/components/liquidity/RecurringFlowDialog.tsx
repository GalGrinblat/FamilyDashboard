'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Database } from '@/types/database.types';
import {
  CATEGORY_TYPES,
  CATEGORY_DOMAINS,
  CATEGORY_DOMAIN_LABELS,
  FREQUENCY_TYPES,
  CategoryDomain,
} from '@/lib/constants';
import { RecurringFlowFormSchema, RecurringFlowFormData } from '@/lib/schemas';
import { upsertRecurringFlowAction } from '@/app/(app)/liquidity/actions';
import type { Resolver } from 'react-hook-form';

type RecurringFlowRow = Database['public']['Tables']['recurring_flows']['Row'] & {
  categories?: { domain: string | null } | null;
};

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

export function RecurringFlowDialog({
  triggerButton,
  flowToEdit,
  accounts,
}: {
  triggerButton?: React.ReactNode;
  flowToEdit?: RecurringFlowRow;
  accounts?: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const isEditing = !!flowToEdit;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RecurringFlowFormData>({
    resolver: zodResolver(RecurringFlowFormSchema) as Resolver<RecurringFlowFormData>,
    defaultValues: {
      name: '',
      amount: 0,
      type: CATEGORY_TYPES.INCOME,
      frequency: FREQUENCY_TYPES.MONTHLY,
      account_id: null,
      category_id: null,
      start_date: null,
      end_date: null,
    },
  });

  // Extra state for the domain selector (maps to category_id on submit)
  const [selectedDomain, setSelectedDomain] = useState<string>(CATEGORY_DOMAINS.GENERAL);

  useEffect(() => {
    if (open && isEditing && flowToEdit) {
      reset({
        name: flowToEdit.name || '',
        amount: flowToEdit.amount ?? 0,
        type: (flowToEdit.type as 'income' | 'expense') ?? CATEGORY_TYPES.INCOME,
        frequency:
          (flowToEdit.frequency as 'monthly' | 'yearly' | 'weekly') ?? FREQUENCY_TYPES.MONTHLY,
        account_id: flowToEdit.account_id ?? null,
        category_id: flowToEdit.category_id ?? null,
        start_date: flowToEdit.start_date ?? null,
        end_date: flowToEdit.end_date ?? null,
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedDomain(flowToEdit.categories?.domain ?? CATEGORY_DOMAINS.GENERAL);
    }
  }, [open, isEditing, flowToEdit, reset]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset({
        name: '',
        amount: 0,
        type: CATEGORY_TYPES.INCOME,
        frequency: FREQUENCY_TYPES.MONTHLY,
        account_id: null,
        category_id: null,
        start_date: null,
        end_date: null,
      });
      setSelectedDomain(CATEGORY_DOMAINS.GENERAL);
    }
  };

  const onSubmit = async (data: RecurringFlowFormData) => {
    const result = await upsertRecurringFlowAction(
      { ...data, domain: selectedDomain },
      flowToEdit?.id,
    );
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'התזרים עודכן בהצלחה' : 'תזרים קבוע נוסף בהצלחה');
    setOpen(false);
    router.refresh();
  };

  const typeValue = useWatch({ control, name: 'type' });
  const frequencyValue = useWatch({ control, name: 'frequency' });
  const accountIdValue = useWatch({ control, name: 'account_id' });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant={isEditing ? 'ghost' : 'default'} size={isEditing ? 'icon' : 'default'}>
            {isEditing ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                הוסף תזרים קבוע
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת תזרים קבוע' : 'הוספת תזרים קבוע'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'עדכן את פרטי התזרים הקיים. השינוי ישפיע על התחזיות העתידיות.'
              : 'הגדר הכנסה או הוצאה קבועה (כגון משכורת, שכר דירה, או ארנונה) לצורך תחזית ומעקב חריגות.'}
          </DialogDescription>
          {isEditing &&
            (flowToEdit?.property_id || flowToEdit?.vehicle_id || flowToEdit?.policy_id) && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-base">
                תזרים זה מנוהל באופן אוטומטי על ידי {flowToEdit.policy_id ? 'פוליסת ביטוח' : 'נכס'}.
                שינויים ידניים כאן עלולים להידרס בעדכון הבא של המקור.
              </div>
            )}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם התזרים
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="name" {...register('name')} placeholder="למשל: משכורת - גל" />
              {errors.name && <p className="text-base text-rose-500">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="type" className="text-right pt-2">
              סוג
            </Label>
            <Select
              value={typeValue}
              onValueChange={(val) => setValue('type', val as 'income' | 'expense')}
            >
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר סוג" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value={CATEGORY_TYPES.INCOME}>הכנסה קבועה (+)</SelectItem>
                <SelectItem value={CATEGORY_TYPES.EXPENSE}>הוצאה קבועה (-)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="amount" className="text-right pt-2">
              סכום צפוי
            </Label>
            <div className="col-span-3 space-y-1">
              <Input
                id="amount"
                type="number"
                step="0.01"
                {...register('amount')}
                placeholder="₪"
              />
              {errors.amount && <p className="text-base text-rose-500">{errors.amount.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="freq" className="text-right pt-2">
              תדירות
            </Label>
            <Select
              value={frequencyValue}
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
            <Label htmlFor="domain" className="text-right pt-2">
              ענף
            </Label>
            <Select value={selectedDomain} onValueChange={(v) => setSelectedDomain(v)}>
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר ענף" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {Object.values(CATEGORY_DOMAINS).map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {CATEGORY_DOMAIN_LABELS[domain as CategoryDomain]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="start_date" className="text-right pt-2">
              תאריך התחלה
            </Label>
            <Input id="start_date" type="date" {...register('start_date')} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="end_date" className="text-right pt-2">
              תאריך סיום
            </Label>
            <Input id="end_date" type="date" {...register('end_date')} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="account" className="text-right pt-2">
              אמצעי תשלום
            </Label>
            <Select
              value={accountIdValue ?? 'none'}
              onValueChange={(v) => setValue('account_id', v === 'none' ? null : v)}
            >
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר חשבון (אופציונלי)" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="none">ללא אמצעי תשלום</SelectItem>
                {accounts?.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : isEditing ? 'שמור שינויים' : 'שמור תזרים'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
