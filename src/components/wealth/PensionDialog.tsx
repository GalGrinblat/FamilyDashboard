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
import { ASSET_TYPES } from '@/lib/constants';

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
  const [name, setName] = useState(assetToEdit?.name || '');
  const [estimatedValue, setEstimatedValue] = useState(
    assetToEdit?.estimated_value?.toString() || '',
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      type: ASSET_TYPES.PENSION,
      estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
      status: 'active',
      metadata: {},
    };

    let error;

    if (isEditing && assetToEdit) {
      const { error: updateError } = await supabase
        .from('assets')
        .update(payload)
        .eq('id', assetToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('assets').insert(payload);
      error = insertError;
    }

    if (error) {
      console.error('Error saving pension asset:', error);
      alert('שגיאה בשמירת הקרן');
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
            {isEditing ? '' : 'הוסף קרן/קופה'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת קרן פנסיה/השתלמות' : 'הוספת קרן פנסיה/השתלמות'}</DialogTitle>
          <DialogDescription>
            הזן את שם הקרן והיתרה העדכנית כפי שמופיעה בדוח הרבעוני או באתר הקופה.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              שם הקופה
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: אלטשולר שחם פנסיה"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              יתרה עדכנית
            </Label>
            <Input
              id="value"
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              className="col-span-3"
              placeholder="₪"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'שומר...' : isEditing ? 'עדכן פרטים' : 'הוסף לנכסים'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
