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

import { Database } from '@/types/database.types';

type AssetRow = Database['public']['Tables']['assets']['Row'];

interface PensionDialogProps {
  triggerButton?: React.ReactNode;
  assetToEdit?: AssetRow;
}

export function PensionDialog({ triggerButton, assetToEdit }: PensionDialogProps) {
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!assetToEdit;
  const metadata = (assetToEdit?.metadata as Record<string, unknown>) || {};

  const [name, setName] = useState(assetToEdit?.name || '');
  const [pensionType, setPensionType] = useState(
    ((metadata as Record<string, unknown>).pension_type as string) || 'pension_fund',
  );
  const [estimatedValue, setEstimatedValue] = useState(
    assetToEdit?.estimated_value?.toString() || '',
  );
  const [employerPercent, setEmployerPercent] = useState(
    metadata.employer_percent?.toString() || '',
  );
  const [employeePercent, setEmployeePercent] = useState(
    metadata.employee_percent?.toString() || '',
  );
  const [severancePercent, setSeverancePercent] = useState(
    metadata.severance_percent?.toString() || '',
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      type: 'pension',
      estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
      status: 'active',
      metadata: {
        ...metadata,
        pension_type: pensionType,
        employer_percent: employerPercent ? parseFloat(employerPercent) : null,
        employee_percent: employeePercent ? parseFloat(employeePercent) : null,
        severance_percent: severancePercent ? parseFloat(severancePercent) : null,
      },
    };

    let error;

    if (isEditing) {
      // @ts-expect-error: Supabase typing
      const { error: updateError } = await supabase
        .from('assets')
        .update(payload)
        .eq('id', assetToEdit.id);
      error = updateError;
    } else {
      // @ts-expect-error: Supabase typing
      const { error: insertError } = await supabase.from('assets').insert(payload);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      console.error('Error saving pension:', error);
      alert(isEditing ? 'שגיאה בעדכון הקופה' : 'שגיאה בהוספת הקופה');
      return;
    }

    setOpen(false);
    if (!isEditing) {
      setName('');
      setPensionType('pension_fund');
      setEstimatedValue('');
      setEmployerPercent('');
      setEmployeePercent('');
      setSeverancePercent('');
    }
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
                <Plus className="ml-2 h-4 w-4" /> קופה חדשה
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת קופת פנסיה/גמל' : 'הוספת קופת פנסיה/גמל'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'עדכן את יתרת הקופה ואחוזי ההפרשה.'
              : 'הוסף קרן פנסיה, ביטוח מנהלים או קרן השתלמות למעקב סך החסכונות.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right whitespace-nowrap">
              שם הקופה/קרן
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: מקפת קלסיק, אלטשולר שחם"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="pensionType" className="text-right">
              סוג
            </Label>
            <Select value={pensionType} onValueChange={setPensionType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר סוג קופה" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="pension_fund">קרן פנסיה</SelectItem>
                <SelectItem value="managers_insurance">ביטוח מנהלים</SelectItem>
                <SelectItem value="study_fund">קרן השתלמות</SelectItem>
                <SelectItem value="provident_fund">קופת גמל</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              צבירה נוכחית
            </Label>
            <Input
              id="value"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="col-span-3"
              placeholder="₪"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employeePercent" className="text-right text-xs whitespace-nowrap">
              הפרשת עובד (%)
            </Label>
            <Input
              id="employeePercent"
              type="number"
              step="0.01"
              value={employeePercent}
              onChange={(e) => setEmployeePercent(e.target.value)}
              className="col-span-3"
              placeholder="למשל: 6.0"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employerPercent" className="text-right text-xs whitespace-nowrap">
              הפרשת מעסיק (%)
            </Label>
            <Input
              id="employerPercent"
              type="number"
              step="0.01"
              value={employerPercent}
              onChange={(e) => setEmployerPercent(e.target.value)}
              className="col-span-3"
              placeholder="למשל: 6.5"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="severancePercent" className="text-right text-xs whitespace-nowrap">
              הפרשת פיצויים (%)
            </Label>
            <Input
              id="severancePercent"
              type="number"
              step="0.01"
              value={severancePercent}
              onChange={(e) => setSeverancePercent(e.target.value)}
              className="col-span-3"
              placeholder="למשל: 8.33"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEditing ? 'שמור פריט' : 'הוסף קופה'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
