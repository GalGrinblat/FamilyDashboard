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
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CreditCard } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;

    setLoading(true);

    const targetAccountName =
      accounts.find((a) => a.id === selectedAccountId)?.name || 'חשבון לא מוכר';

    // Create a new reminder
    const { error } = await supabase
      .from('reminders')
      // @ts-expect-error: Supabase TS
      .insert({
        title: `החלפת אמצעי תשלום עבור ${flow.name} ל-${targetAccountName}`,
        type: 'finance',
        due_date: new Date().toISOString(),
        is_completed: false,
      });

    setLoading(false);

    if (error) {
      console.error('Error creating reminder:', error);
      alert('שגיאה ביצירת המשימה');
    } else {
      setOpen(false);
      router.refresh();
      setSelectedAccountId('');
    }
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
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="account" className="text-right">
              לאיזה חשבון להעביר?
            </Label>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId} required>
              <SelectTrigger className="col-span-3">
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
            <Button type="submit" disabled={loading || !selectedAccountId}>
              {loading ? 'יוצר משימה...' : 'צור משימה לביצוע'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
