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
import { Plus, Pencil } from 'lucide-react';
import { CATEGORY_DOMAINS, CATEGORY_TYPES } from '@/lib/constants';

import { Database } from '@/types/database.types';

type FlowRow = Database['public']['Tables']['recurring_flows']['Row'];

interface ContractDialogProps {
  triggerButton?: React.ReactNode;
  contractToEdit?: FlowRow;
}

export function ContractDialog({ triggerButton, contractToEdit }: ContractDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!contractToEdit;
  const [name, setName] = useState(contractToEdit?.name || '');
  const [amount, setAmount] = useState(contractToEdit?.amount?.toString() || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      amount: parseFloat(amount),
      type: CATEGORY_TYPES.EXPENSE,
      frequency: 'monthly',
      domain: CATEGORY_DOMAINS.HOUSING,
      is_active: true,
    };

    let error;

    if (isEditing && contractToEdit) {
      const { error: updateError } = await supabase
        .from('recurring_flows')
        .update(payload)
        .eq('id', contractToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('recurring_flows').insert(payload);
      error = insertError;
    }

    if (error) {
      console.error('Error saving contract:', error);
      alert('שגיאה בשמירת הספק');
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
            {isEditing ? <Pencil className="h-4 w-4" /> : <Plus className="ml-2 h-4 w-4" />}
            {isEditing ? '' : 'הוסף ספק/חוזה'}
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
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              שם הספק
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: תמי 4"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              סכום חודשי
            </Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
              placeholder="₪"
              required
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? 'שומר...' : isEditing ? 'עדכן פרטים' : 'הוסף ספק'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
