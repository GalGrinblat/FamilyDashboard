'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Trash2 } from 'lucide-react';
import { AssetDialog } from './AssetDialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';
import type { PropertyRef } from '@/lib/schemas';

export function AssetsTable({ properties }: { properties: PropertyRef[] }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם למחוק נכס זה? הפעולה אינה הפיכה.')) return;
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert('שגיאה במחיקת הנכס');
    } else {
      router.refresh();
    }
  };

  const totalValue = properties.reduce((sum, p) => sum + Number(p.estimated_value || 0), 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-500" />
            נדל&quot;ן
          </CardTitle>
          <CardDescription>
            הערכת שווי נכסים כוללת:{' '}
            <span className={`font-semibold ${getAmountColorClass('income')}`} dir="ltr">
              {formatCurrency(totalValue)}
            </span>
          </CardDescription>
        </div>
        <AssetDialog />
      </CardHeader>
      <CardContent>
        {properties.length === 0 ? (
          <div className="text-lg text-muted-foreground py-8 text-center border rounded-md bg-zinc-50 dark:bg-zinc-900/50 mt-4">
            לא הוגדרו נכסי נדל&quot;ן.
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex justify-between items-center text-lg border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0 group"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{property.name}</span>
                  {property.address && (
                    <span className="text-lg text-zinc-500">{property.address}</span>
                  )}
                  {property.monthly_rent && property.monthly_rent > 0 && (
                    <span
                      className={`text-lg font-medium ${getAmountColorClass('income')}`}
                      dir="ltr"
                    >
                      שכירות: {formatCurrency(Number(property.monthly_rent))}
                    </span>
                  )}
                  <span className="text-lg text-muted-foreground mt-1">
                    עודכן לאחרונה:{' '}
                    {new Date(property.updated_at || property.created_at || '').toLocaleDateString(
                      'he-IL',
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-semibold ${getAmountColorClass('income')}`} dir="ltr">
                    {formatCurrency(Number(property.estimated_value))}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <AssetDialog propertyToEdit={property} />
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(property.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
