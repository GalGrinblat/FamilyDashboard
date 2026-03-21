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
import { Database } from '@/types/database.types';
import { HouseholdItemFormSchema, HouseholdItemFormData } from '@/lib/schemas';
import { upsertHouseholdItemAction } from '@/app/(app)/household/actions';
import type { Resolver } from 'react-hook-form';

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
  const router = useRouter();

  const isEditing = !!itemToEdit;

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  const defaultValues: HouseholdItemFormData = {
    name: '',
    category: 'appliance',
    purchase_price: null,
    purchase_date: null,
    warranty_expiry: null,
    serial_number: null,
    model: null,
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<HouseholdItemFormData>({
    resolver: zodResolver(HouseholdItemFormSchema) as Resolver<HouseholdItemFormData>,
    defaultValues,
  });

  const category = watch('category');

  useEffect(() => {
    if (open && isEditing && itemToEdit) {
      reset({
        name: itemToEdit.name,
        category: (itemToEdit.category as HouseholdItemFormData['category']) ?? 'appliance',
        purchase_price: itemToEdit.purchase_price ?? null,
        purchase_date: itemToEdit.purchase_date ?? null,
        warranty_expiry: itemToEdit.warranty_expiry ?? null,
        serial_number: null,
        model: null,
      });
    } else if (!open) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEditing, itemToEdit, reset]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onForceClose) {
      onForceClose();
    }
  };

  const onSubmit = async (data: HouseholdItemFormData) => {
    const result = await upsertHouseholdItemAction(data, itemToEdit?.id);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditing ? 'הפריט עודכן בהצלחה' : 'הפריט נוסף בהצלחה');
    setOpen(false);
    if (onForceClose) onForceClose();
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
              <Plus className="mr-2 h-4 w-4" />
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
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="name" className="text-right pt-2">
              שם הפריט
            </Label>
            <div className="col-span-3 space-y-1">
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-base text-rose-500">{errors.name.message}</p>}
            </div>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="category" className="text-right pt-2">
              קטגוריה
            </Label>
            <Select
              value={category}
              onValueChange={(v) => setValue('category', v as HouseholdItemFormData['category'])}
            >
              <SelectTrigger className="col-span-3" dir="rtl">
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                <SelectItem value="appliance">מכשירי חשמל</SelectItem>
                <SelectItem value="furniture">ריהוט</SelectItem>
                <SelectItem value="electronics">אלקטרוניקה</SelectItem>
                <SelectItem value="other">אחר</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="price" className="text-right pt-2">
              מחיר קנייה
            </Label>
            <Input
              id="price"
              type="number"
              {...register('purchase_price')}
              className="col-span-3"
              placeholder="₪"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="purchase_date" className="text-right pt-2">
              תאריך רכישה
            </Label>
            <Input
              id="purchase_date"
              type="date"
              {...register('purchase_date')}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="warranty" className="text-right pt-2">
              תום אחריות
            </Label>
            <Input
              id="warranty"
              type="date"
              {...register('warranty_expiry')}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'שומר...' : isEditing ? 'עדכן פריט' : 'שמור פריט'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
