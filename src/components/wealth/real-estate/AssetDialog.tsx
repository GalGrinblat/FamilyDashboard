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
import { AssetMetadata, RealEstateMetadata, VehicleMetadata } from '@/types/wealth';

type AssetRow = Database['public']['Tables']['assets']['Row'];
type AssetInsert = Database['public']['Tables']['assets']['Insert'];
type FlowInsert = Database['public']['Tables']['recurring_flows']['Insert'];

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

  const re = metadata as RealEstateMetadata;
  const ve = metadata as VehicleMetadata;

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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'עריכת נכס' : 'הוספת נכס חדש'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'עדכן את שווי הנכס או את סיווגו כדי לשמור על תמונת מצב עדכנית.'
              : 'הוסף מנייה, קרן, מטבע קריפטו או נדל״ן כדי לעקוב אחר השווי הכולל.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Name */}
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

          {/* Type */}
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

          {/* Estimated Value */}
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

          {/* Real Estate fields */}
          {type === ASSET_TYPES.REAL_ESTATE && (
            <>
              {/* Address */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right text-base">
                  כתובת
                </Label>
                <Input
                  id="address"
                  value={re?.address || ''}
                  onChange={(e) => setMetadata({ ...metadata, address: e.target.value })}
                  className="col-span-3"
                  placeholder="רחוב, עיר"
                />
              </div>

              {/* --- Rent section --- */}
              <div className="col-span-4 border-t pt-3 mt-1">
                <p className="text-base font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1">
                  📥 שכירות (הכנסה)
                </p>
                <div className="grid gap-3">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rent" className="text-right text-base">
                      סכום חודשי
                    </Label>
                    <Input
                      id="rent"
                      type="number"
                      value={re?.monthly_rent || ''}
                      onChange={(e) => setMetadata({ ...metadata, monthly_rent: e.target.value })}
                      className="col-span-3"
                      placeholder="₪"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rent-start" className="text-right text-base">
                      תחילת חוזה
                    </Label>
                    <Input
                      id="rent-start"
                      type="date"
                      value={re?.rent_start_date || ''}
                      onChange={(e) =>
                        setMetadata({ ...metadata, rent_start_date: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="rent-end" className="text-right text-base">
                      סיום חוזה
                    </Label>
                    <div className="col-span-3 space-y-1">
                      <Input
                        id="rent-end"
                        type="date"
                        value={re?.rent_end_date || ''}
                        onChange={(e) =>
                          setMetadata({ ...metadata, rent_end_date: e.target.value })
                        }
                      />
                      {re?.rent_end_date && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          📅 תזכורת חידוש תיווצר אוטומטית 3 חודשים לפני סיום החוזה
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* --- Mortgage section --- */}
              <div className="col-span-4 border-t pt-3 mt-1">
                <p className="text-base font-semibold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-1">
                  🏦 משכנתא (הוצאה)
                </p>
                <div className="grid gap-3">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mortgage" className="text-right text-base">
                      החזר חודשי
                    </Label>
                    <Input
                      id="mortgage"
                      type="number"
                      value={re?.mortgage_payment || ''}
                      onChange={(e) =>
                        setMetadata({ ...metadata, mortgage_payment: e.target.value })
                      }
                      className="col-span-3"
                      placeholder="₪"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mortgage-start" className="text-right text-base">
                      תחילת משכנתא
                    </Label>
                    <Input
                      id="mortgage-start"
                      type="date"
                      value={re?.mortgage_start_date || ''}
                      onChange={(e) =>
                        setMetadata({ ...metadata, mortgage_start_date: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="mortgage-end" className="text-right text-base">
                      סיום משכנתא
                    </Label>
                    <Input
                      id="mortgage-end"
                      type="date"
                      value={re?.mortgage_end_date || ''}
                      onChange={(e) =>
                        setMetadata({ ...metadata, mortgage_end_date: e.target.value })
                      }
                      className="col-span-3"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Vehicle fields */}
          {type === ASSET_TYPES.VEHICLE && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="leasing" className="text-right text-base">
                תשלום ליסינג/הלוואה
              </Label>
              <Input
                id="leasing"
                type="number"
                value={ve?.leasing_payment || ''}
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

// Helper to sync recurring flows for an asset
async function syncAssetFlows(
  supabase: SupabaseClient<Database>,
  assetId: string,
  assetName: string,
  metadata: AssetMetadata,
  type: string,
) {
  if (!metadata) return;
  const re = metadata as RealEstateMetadata;
  const ve = metadata as VehicleMetadata;
  const flowsToUpsert: Array<FlowInsert> = [];

  if (type === ASSET_TYPES.REAL_ESTATE) {
    if (re.monthly_rent && parseFloat(re.monthly_rent.toString()) > 0) {
      flowsToUpsert.push({
        asset_id: assetId,
        name: `${assetName} (שכירות)`,
        amount: parseFloat(re.monthly_rent.toString()),
        type: 'income',
        frequency: 'monthly',
        domain: 'housing',
        is_active: true,
        start_date: re.rent_start_date || null,
        end_date: re.rent_end_date || null,
      });
    }
    if (re.mortgage_payment && parseFloat(re.mortgage_payment.toString()) > 0) {
      flowsToUpsert.push({
        asset_id: assetId,
        name: `${assetName} (משכנתא)`,
        amount: parseFloat(re.mortgage_payment.toString()),
        type: 'expense',
        frequency: 'monthly',
        domain: 'housing',
        is_active: true,
        start_date: re.mortgage_start_date || null,
        end_date: re.mortgage_end_date || null,
      });
    }
  }

  if (type === ASSET_TYPES.VEHICLE) {
    if (ve.leasing_payment && parseFloat(ve.leasing_payment.toString()) > 0) {
      flowsToUpsert.push({
        asset_id: assetId,
        name: `${assetName} (ליסינג/מימון)`,
        amount: parseFloat(ve.leasing_payment.toString()),
        type: 'expense',
        frequency: 'monthly',
        domain: 'transportation',
        is_active: true,
      });
    }
  }

  // Upsert each flow by asset_id + name
  for (const flow of flowsToUpsert) {
    const { data: existing } = await supabase
      .from('recurring_flows')
      .select('id')
      .eq('asset_id', assetId)
      .eq('name', flow.name as string)
      .maybeSingle();

    if (existing) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { asset_id: _aid, ...updatePayload } = flow;
      await supabase.from('recurring_flows').update(updatePayload).eq('id', existing.id);
    } else {
      await supabase.from('recurring_flows').insert(flow);
    }
  }

  // Auto-reminder: 3 months before rent contract end date
  if (type === ASSET_TYPES.REAL_ESTATE && re.rent_end_date) {
    const endDate = new Date(re.rent_end_date);
    const reminderDate = new Date(endDate);
    reminderDate.setMonth(reminderDate.getMonth() - 3);

    const reminderTitle = `חידוש חוזה שכירות – ${assetName}`;

    // Check if a reminder with this title already exists for this asset
    const { data: existingReminder } = await supabase
      .from('reminders')
      .select('id')
      .eq('title', reminderTitle)
      .maybeSingle();

    const reminderPayload = {
      title: reminderTitle,
      due_date: reminderDate.toISOString().split('T')[0],
      type: 'other' as const,
      is_completed: false,
      notes: `חוזה השכירות של ${assetName} מסתיים בתאריך ${endDate.toLocaleDateString('he-IL')}. יש לחדש או לסיים את החוזה.`,
    };

    if (existingReminder) {
      await supabase.from('reminders').update(reminderPayload).eq('id', existingReminder.id);
    } else {
      await supabase.from('reminders').insert(reminderPayload);
    }
  }
}
