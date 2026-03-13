'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';
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
import { ASSET_TYPES, ASSET_TYPE_LABELS } from '@/lib/constants';

import { Database, Json } from '@/types/database.types';
import { AssetMetadata, RealEstateMetadata } from '@/types/wealth';

type AssetRow = Database['public']['Tables']['assets']['Row'];
type AssetInsert = Database['public']['Tables']['assets']['Insert'];

interface AssetDialogProps {
  triggerButton?: React.ReactNode;
  assetToEdit?: AssetRow;
}

export function AssetDialog({ triggerButton, assetToEdit }: AssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const isEditing = !!assetToEdit;

  const [name, setName] = useState(assetToEdit?.name || '');
  const [type, setType] = useState(assetToEdit?.type || ASSET_TYPES.STOCK);
  const [estimatedValue, setEstimatedValue] = useState(
    assetToEdit?.estimated_value?.toString() || '',
  );
  const [metadata, setMetadata] = useState<AssetMetadata>(
    (assetToEdit?.metadata as AssetMetadata) || ({} as AssetMetadata),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload: AssetInsert = {
      name,
      type,
      estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
      status: 'active',
      metadata: type === ASSET_TYPES.REAL_ESTATE ? (metadata as Json) : null,
    };

    let error;
    let savedAssetId = assetToEdit?.id;

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('assets')
        .update(payload)
        .eq('id', assetToEdit.id);
      error = updateError;
    } else {
      const { data, error: insertError } = await supabase
        .from('assets')
        .insert(payload)
        .select()
        .single();
      error = insertError;
      if (data) savedAssetId = data.id;
    }

    if (!error && savedAssetId) {
      await syncAssetFlows(supabase, savedAssetId, name, metadata, type);
    }

    setLoading(false);

    if (error) {
      console.error('Error saving asset:', error);
      alert(isEditing ? 'שגיאה בעדכון הנכס' : 'שגיאה בהוספת הנכס');
      return;
    }

    setOpen(false);
    if (!isEditing) {
      setName('');
      setType(ASSET_TYPES.STOCK);
      setEstimatedValue('');
      setMetadata({});
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
                <Plus className="ml-2 h-4 w-4" /> הוסף נכס
              </>
            )}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת נכס' : 'הוספת נכס חדש'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'עדכן את שווי הנכס או את סיווגו כדי לשמור על תמונת מצב עדכנית.'
              : 'הוסף מנייה, קרן, מטבע קריפטו או נדל״ן כדי לעקוב אחר השווי הכולל.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              שם הנכס
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="למשל: תיק השקעות IBI, דירה בחיפה"
              required
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              סוג
            </Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="בחר סוג נכס" />
              </SelectTrigger>
              <SelectContent dir="rtl">
                {Object.entries(ASSET_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="value" className="text-right">
              שווי מעודכן
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

          {type === ASSET_TYPES.REAL_ESTATE && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right text-xs">
                  כתובת
                </Label>
                <Input
                  id="address"
                  value={(metadata as RealEstateMetadata)?.address || ''}
                  onChange={(e) => setMetadata({ ...metadata, address: e.target.value })}
                  className="col-span-3"
                  placeholder="רחוב, עיר"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rent" className="text-right text-xs">
                  שכירות חודשית
                </Label>
                <Input
                  id="rent"
                  type="number"
                  value={(metadata as RealEstateMetadata)?.monthly_rent || ''}
                  onChange={(e) => setMetadata({ ...metadata, monthly_rent: e.target.value })}
                  className="col-span-3"
                  placeholder="₪"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="mortgage" className="text-right text-xs">
                  החזר משכנתא
                </Label>
                <Input
                  id="mortgage"
                  type="number"
                  value={(metadata as RealEstateMetadata)?.mortgage_payment || ''}
                  onChange={(e) => setMetadata({ ...metadata, mortgage_payment: e.target.value })}
                  className="col-span-3"
                  placeholder="₪"
                />
              </div>
            </>
          )}

          {type === ASSET_TYPES.VEHICLE && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leasing" className="text-right text-xs">
                תשלום ליסינג/הלוואה
              </Label>
              <Input
                id="leasing"
                type="number"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                value={(metadata as any)?.leasing_payment || ''}
                onChange={(e) => setMetadata({ ...metadata, leasing_payment: e.target.value })}
                className="col-span-3"
                placeholder="₪"
              />
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? 'שומר...' : isEditing ? 'שמור פריט' : 'הוסף נכס'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper to sync recurring flows
async function syncAssetFlows(
  supabase: SupabaseClient<Database>,
  assetId: string,
  assetName: string,
  metadata: AssetMetadata,
  type: string,
) {
  if (!metadata) return;
  const flowsToUpsert = [];

  if (type === ASSET_TYPES.REAL_ESTATE) {
    if (metadata.monthly_rent && parseFloat(metadata.monthly_rent.toString()) > 0) {
      flowsToUpsert.push({
        asset_id: assetId,
        name: `${assetName} (שכירות)`,
        amount: parseFloat(metadata.monthly_rent.toString()),
        type: 'expense',
        frequency: 'monthly',
        domain: 'housing',
        is_active: true,
      });
    }
    if (metadata.mortgage_payment && parseFloat(metadata.mortgage_payment.toString()) > 0) {
      flowsToUpsert.push({
        asset_id: assetId,
        name: `${assetName} (משכנתא)`,
        amount: parseFloat(metadata.mortgage_payment.toString()),
        type: 'expense',
        frequency: 'monthly',
        domain: 'housing',
        is_active: true,
      });
    }
  }

  if (type === ASSET_TYPES.VEHICLE) {
    if (metadata.leasing_payment && parseFloat(metadata.leasing_payment.toString()) > 0) {
      flowsToUpsert.push({
        asset_id: assetId,
        name: `${assetName} (ליסינג/מימון)`,
        amount: parseFloat(metadata.leasing_payment.toString()),
        type: 'expense',
        frequency: 'monthly',
        domain: 'transportation',
        is_active: true,
      });
    }
  }

  // Delete existing flows for this asset that are not in the new list
  // (Simplified: we just delete and re-insert or upsert by name/asset_id)
  // For safety, let's use a more robust upsert if we had a unique constraint,
  // but here we'll just manage them manually.

  for (const flow of flowsToUpsert) {
    const { data: existing } = await supabase
      .from('recurring_flows')
      .select('id')
      .eq('asset_id', assetId)
      .eq('name', flow.name)
      .maybeSingle();

    if (existing) {
      await supabase.from('recurring_flows').update(flow).eq('id', existing.id);
    } else {
      await supabase.from('recurring_flows').insert(flow);
    }
  }
}
