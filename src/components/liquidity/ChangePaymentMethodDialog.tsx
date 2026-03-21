'use client';

import { useState } from 'react';
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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard } from 'lucide-react';
import { REMINDER_TYPES } from '@/lib/constants';
import { ChangePaymentMethodFormSchema, ChangePaymentMethodFormData } from '@/lib/schemas';
import { createClient } from '@/lib/supabase/client';

type RecurringFlowRow = Database['public']['Tables']['recurring_flows']['Row'] & {
  accounts?: { name: string } | null;
};

export function ChangePaymentMethodDialog({
  flow,
  accounts,
}: {
  flow: RecurringFlowRow;
  accounts: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = useForm<ChangePaymentMethodFormData>({
    resolver: zodResolver(ChangePaymentMethodFormSchema),
    defaultValues: {
      account_id: '',
    },
  });

  const accountId = watch('account_id');

  const onSubmit = async (data: ChangePaymentMethodFormData) => {
    const targetAccountName =
      accounts.find((a) => a.id === data.account_id)?.name || 'חשבון לא מוכר';

    const { error } = await supabase.from('reminders').insert({
      title: `החלפת אמצעי תשלום עבור ${flow.name} ל-${targetAccountName}`,
      type: REMINDER_TYPES.PAYMENT_METHOD_CHANGE,
      due_date: new Date().toISOString(),
      is_completed: false,
      recurring_flow_id: flow.id,
      target_account_id: data.account_id,
    });

    if (error) {
      if (process.env.NODE_ENV === 'development') console.error('Error creating reminder:', error);
      toast.error('שגיאה ביצירת המשימה');
      return;
    }

    toast.success('המשימה נוצרה בהצלחה');
    setOpen(false);
    reset();
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <CreditCard className="h-4 w-4" />
          <span className="hidden sm:inline">שנה אמצעי תשלום</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>בקשה לשינוי אמצעי תשלום</DialogTitle>
          <DialogDescription>
            פעולה זו תיצור משימה (תזכורת) להחליף את אמצעי התשלום של ההוצאה הקבועה במוסד הפיננסי
            (למשל ספק האינטרנט או הביטוח).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="account" className="text-right pt-2">
              לאיזה חשבון להעביר?
            </Label>
            <Select value={accountId} onValueChange={(v) => setValue('account_id', v)}>
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר חשבון חדש" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {accounts?.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id} disabled={acc.id === flow.account_id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting || !accountId}>
              {isSubmitting ? 'יוצר משימה...' : 'צור משימה לביצוע'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
