'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RealEstateMetadata } from '@/types/wealth';
import { TrendingUp, Building2, Bitcoin, LineChart, Trash2 } from 'lucide-react';
import { AssetDialog } from './AssetDialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ASSET_TYPES, ASSET_TYPE_LABELS, AssetType } from '@/lib/constants';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';
import type { AssetRef } from '@/lib/schemas';

export function AssetsTable({ assets }: { assets: AssetRef[] }) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם למחוק נכס זה? הפעולה אינה הפיכה.')) return;
    const { error } = await supabase.from('assets').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert('שגיאה במחיקת הנכס');
    } else {
      router.refresh();
    }
  };

  const typeIcons: Record<string, React.ReactNode> = {
    [ASSET_TYPES.STOCK]: <LineChart className="h-4 w-4 text-blue-500" />,
    [ASSET_TYPES.CRYPTO]: <Bitcoin className="h-4 w-4 text-orange-500" />,
    [ASSET_TYPES.REAL_ESTATE]: <Building2 className="h-4 w-4 text-emerald-500" />,
    [ASSET_TYPES.OTHER]: <TrendingUp className="h-4 w-4 text-zinc-500" />,
  };

  const typeLabels = ASSET_TYPE_LABELS;

  const totalValue = assets.reduce((sum, a) => sum + Number(a.estimated_value || 0), 0);

  // Grouping assets
  const grouped = assets.reduce(
    (acc, asset) => {
      const t = asset.type || ASSET_TYPES.OTHER;
      if (!acc[t]) acc[t] = [];
      acc[t].push(asset);
      return acc;
    },
    {} as Record<string, AssetRef[]>,
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" />
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
        {assets.length === 0 ? (
          <div className="text-lg text-muted-foreground py-8 text-center border rounded-md bg-zinc-50 dark:bg-zinc-900/50 mt-4">
            לא הוגדרו נכסים מניבים פיננסיים.
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {Object.entries(grouped).map(([type, list]) => (
              <div key={type} className="space-y-3">
                <h4 className="text-lg font-semibold flex items-center gap-2 text-zinc-800 dark:text-zinc-200 border-b pb-1">
                  {typeIcons[type] || typeIcons[ASSET_TYPES.OTHER]}
                  {typeLabels[type as AssetType] || typeLabels[ASSET_TYPES.OTHER]}
                </h4>
                <div className="space-y-3 pl-2 pr-2">
                  {list.map((asset) => (
                    <div
                      key={asset.id}
                      className="flex justify-between items-center text-lg border-b border-zinc-100 dark:border-zinc-800 pb-2 last:border-0 last:pb-0 group"
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{asset.name}</span>
                        {asset.type === ASSET_TYPES.REAL_ESTATE && asset.metadata && (
                          <div className="flex flex-col gap-0.5 mt-0.5">
                            {(asset.metadata as RealEstateMetadata)?.address && (
                              <span className="text-[10px] text-zinc-500">
                                {(asset.metadata as RealEstateMetadata).address}
                              </span>
                            )}
                            {(asset.metadata as RealEstateMetadata)?.monthly_rent && (
                              <span
                                className={`text-[10px] font-medium ${getAmountColorClass('income')}`}
                                dir="ltr"
                              >
                                שכירות:{' '}
                                {formatCurrency(
                                  Number((asset.metadata as RealEstateMetadata).monthly_rent),
                                )}
                              </span>
                            )}
                          </div>
                        )}
                        <span className="text-[10px] text-muted-foreground mt-1">
                          עודכן לאחרונה:{' '}
                          {new Date(asset.updated_at || asset.created_at || '').toLocaleDateString(
                            'he-IL',
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span
                          className={`font-semibold ${getAmountColorClass('income')}`}
                          dir="ltr"
                        >
                          {formatCurrency(Number(asset.estimated_value))}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <AssetDialog assetToEdit={asset} />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(asset.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
