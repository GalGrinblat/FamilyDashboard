'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { addReminderAction, updateReminderAction } from '@/app/(app)/planning/actions';
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
import { SYSTEM_REMINDER_TYPES, REMINDER_TYPES } from '@/lib/constants';
import { Database } from '@/types/database.types';
import { ReminderFormSchema, ReminderFormData } from '@/lib/schemas';

type ReminderRow = Database['public']['Tables']['reminders']['Row'];

export function ReminderDialog({
  triggerButton,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  reminder,
  customTypes = [],
}: {
  triggerButton?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  reminder?: ReminderRow;
  customTypes?: string[];
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{!!reminder ? 'עריכת תזכורת' : 'הוספת תזכורת עיתית'}</DialogTitle>
          <DialogDescription>
            {!!reminder ? 'עדכן את פרטי התזכורת.' : 'הזן משימה עם תאריך יעד שיופיע בלוח השנה.'}
          </DialogDescription>
        </DialogHeader>
        {open && (
          <ReminderForm
            key={reminder?.id || 'new'}
            reminder={reminder}
            customTypes={customTypes}
            onSuccess={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReminderForm({
  reminder,
  customTypes,
  onSuccess,
}: {
  reminder?: ReminderRow;
  customTypes: string[];
  onSuccess: () => void;
}) {
  const isEditMode = !!reminder;
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReminderFormData>({
    resolver: zodResolver(ReminderFormSchema),
    defaultValues: {
      title: reminder?.title ?? '',
      type: reminder?.type ?? REMINDER_TYPES.MAINTENANCE,
      due_date: reminder?.due_date ?? '',
      start_date: reminder?.start_date ?? null,
    },
  });

  const type = watch('type');

  const onSubmit = async (data: ReminderFormData) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('type', data.type);
    formData.append('due_date', data.due_date);
    if (data.start_date) formData.append('start_date', data.start_date);

    const result = isEditMode
      ? await updateReminderAction(reminder.id, formData)
      : await addReminderAction(formData);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditMode ? 'התזכורת עודכנה בהצלחה' : 'התזכורת נוספה בהצלחה');
    onSuccess();
    router.refresh();
  };

  const allTypes = [...SYSTEM_REMINDER_TYPES, ...customTypes.map((t) => ({ value: t, label: t }))];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="title" className="text-right pt-2">
          תיאור משימה
        </Label>
        <div className="col-span-3 space-y-1">
          <Input
            id="title"
            {...register('title')}
            placeholder="למשל: לחדש ביטוח רכב"
            autoComplete="off"
          />
          {errors.title && <p className="text-base text-rose-500">{errors.title.message}</p>}
        </div>
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="type" className="text-right pt-2">
          סוג
        </Label>
        <Select value={type} onValueChange={(v) => setValue('type', v)}>
          <SelectTrigger className="col-span-3" id="type" dir="rtl">
            <SelectValue placeholder="בחר סוג" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            {allTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="start_date" className="text-right pt-2 leading-tight">
          תאריך תזכורת (אופציונלי)
        </Label>
        <Input
          id="start_date"
          type="date"
          {...register('start_date')}
          className="col-span-3"
          autoComplete="off"
        />
      </div>
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="due_date" className="text-right pt-2">
          תאריך יעד
        </Label>
        <div className="col-span-3 space-y-1">
          <Input id="due_date" type="date" {...register('due_date')} autoComplete="off" />
          {errors.due_date && <p className="text-base text-rose-500">{errors.due_date.message}</p>}
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'שומר...' : isEditMode ? 'שמור שינויים' : 'שמור תזכורת'}
        </Button>
      </DialogFooter>
    </form>
  );
}
