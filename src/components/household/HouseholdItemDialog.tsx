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

type HouseholdItemRow = Database['public']['Tables']['household_items']['Row'];

export function HouseholdItemDialog({
  triggerButton,
  forceOpen = false,
  onForceClose,
  itemToEdit,
}: {
  triggerButton?: React.ReactNode;
  forceOpen?: boolean;
  onForceClose?: () => void;
  itemToEdit?: HouseholdItemRow;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!itemToEdit;

  const [prevForceOpen, setPrevForceOpen] = useState(forceOpen);
  if (forceOpen !== prevForceOpen) {
    setPrevForceOpen(forceOpen);
    if (forceOpen) setOpen(true);
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onForceClose) {
      onForceClose();
    }
  };

  // Form State — initialized from itemToEdit when editing
  const [name, setName] = useState(itemToEdit?.name || '');
  const [category, setCategory] = useState(itemToEdit?.category || 'appliance');
  const [purchasePrice, setPurchasePrice] = useState(itemToEdit?.purchase_price?.toString() || '');
  const [purchaseDate, setPurchaseDate] = useState(itemToEdit?.purchase_date || '');
  const [warrantyExpiry, setWarrantyExpiry] = useState(itemToEdit?.warranty_expiry || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      category,
      purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
      purchase_date: purchaseDate || null,
      warranty_expiry: warrantyExpiry || null,
    };

    let error;

    if (isEditing && itemToEdit) {
      const { error: updateError } = await supabase
        .from('household_items')
        .update(payload)
        .eq('id', itemToEdit.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('household_items').insert(payload);
      error = insertError;
    }

    setLoading(false);

    if (error) {
      console.error('Error saving item:', error);
      alert(isEditing ? 'שגיאה בעדכון הפריט' : 'שגיאה בהוספת הפריט');
      return;
    }

    setOpen(false);
    if (onForceClose) onForceClose();

    // Only reset form on insert; edit state is discarded when the component unmounts
    if (!isEditing) {
      setName('');
      setCategory('appliance');
      setPurchasePrice('');
      setPurchaseDate('');
      setWarrantyExpiry('');
    }

    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton ||
          (isEditing ? (
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          ) : (
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              הוסף פריט
            </Button>
          ))}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת פרטי פריט' : 'הוספת פריט חדש'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'עדכן את פרטי הפריט.' : 'הזן את פרטי הפריט לרישום במעקב המשפחתי.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              שם הפריט
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              קטגוריה
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="appliance">מכשירי חשמל (Appliance)</SelectItem>
                <SelectItem value="furniture">ריהוט (Furniture)</SelectItem>
                <SelectItem value="electronics">אלקטרוניקה (Electronics)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              מחיר קנייה
            </Label>
            <Input
              id="price"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="col-span-3"
              placeholder="₪"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="purchase_date" className="text-right">
              תאריך רכישה
            </Label>
            <Input
              id="purchase_date"
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="warranty" className="text-right">
              תום אחריות
            </Label>
            <Input
              id="warranty"
              type="date"
              value={warrantyExpiry}
              onChange={(e) => setWarrantyExpiry(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEditing ? 'עדכן פריט' : 'שמור פריט'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
