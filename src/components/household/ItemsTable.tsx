'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Trash2 } from 'lucide-react';
import { Database } from '@/types/database.types';
import { HouseholdItemDialog } from './HouseholdItemDialog';
import { formatCurrency } from '@/lib/utils';

type HouseholdItemRow = Database['public']['Tables']['household_items']['Row'];

function getWarrantyStatus(d: string | null): 'expired' | 'expiring' | 'ok' | 'none' {
  if (!d) return 'none';
  const expiry = new Date(d);
  if (expiry < new Date()) return 'expired';
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  return expiry <= soon ? 'expiring' : 'ok';
}

export function ItemsTable({ items }: { items: HouseholdItemRow[] }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם למחוק פריט זה?')) return;
    const { error } = await supabase.from('household_items').delete().eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === 'development') console.error(error);
      alert('שגיאה במחיקת הפריט');
      return;
    }
    router.refresh();
  };

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
        <p>אין פריטים להצגה בקטגוריה זו.</p>
        <HouseholdItemDialog
          triggerButton={
            <Button variant="outline" className="mt-4">
              <Plus className="ml-2 h-4 w-4" />
              הוסף פריט חדש
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <Table className="border-t border-zinc-100 dark:border-zinc-800">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם הפריט</TableHead>
              <TableHead className="text-right">תאריך רכישה</TableHead>
              <TableHead className="text-right">מחיר</TableHead>
              <TableHead className="text-right">תום אחריות</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const warrantyStatus = getWarrantyStatus(item.warranty_expiry);
              const warrantyColorClass =
                warrantyStatus === 'expired'
                  ? 'text-red-500 font-semibold'
                  : warrantyStatus === 'expiring'
                    ? 'text-amber-500 font-semibold'
                    : '';
              return (
                <TableRow key={item.id} className="group">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {item.purchase_date
                      ? new Date(item.purchase_date).toLocaleDateString('he-IL')
                      : '-'}
                  </TableCell>
                  <TableCell dir="ltr">
                    {item.purchase_price ? formatCurrency(item.purchase_price) : '-'}
                  </TableCell>
                  <TableCell className={warrantyColorClass}>
                    {item.warranty_expiry
                      ? new Date(item.warranty_expiry).toLocaleDateString('he-IL')
                      : '-'}
                    {warrantyStatus === 'expired' && ' (פגה)'}
                    {warrantyStatus === 'expiring' && ' (פג בקרוב)'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                      <HouseholdItemDialog itemToEdit={item} />
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col space-y-3 p-4 pt-2">
        {items.map((item) => {
          const warrantyStatus = getWarrantyStatus(item.warranty_expiry);
          const warrantyColorClass =
            warrantyStatus === 'expired'
              ? 'text-red-500 font-semibold'
              : warrantyStatus === 'expiring'
                ? 'text-amber-500 font-semibold'
                : '';
          return (
            <div
              key={item.id}
              className="flex flex-col space-y-2 p-4 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
                  {item.name}
                </span>
                <span className="font-medium" dir="ltr">
                  {item.purchase_price ? formatCurrency(item.purchase_price) : '-'}
                </span>
              </div>
              <div className="flex flex-col gap-1 text-lg text-zinc-600 dark:text-zinc-400 mt-1">
                <div className="flex justify-between">
                  <span>תאריך רכישה:</span>
                  <span>
                    {item.purchase_date
                      ? new Date(item.purchase_date).toLocaleDateString('he-IL')
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>תום אחריות:</span>
                  <span className={warrantyColorClass}>
                    {item.warranty_expiry
                      ? new Date(item.warranty_expiry).toLocaleDateString('he-IL')
                      : '-'}
                    {warrantyStatus === 'expired' && ' (פגה)'}
                    {warrantyStatus === 'expiring' && ' (פג בקרוב)'}
                  </span>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <HouseholdItemDialog itemToEdit={item} />
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
