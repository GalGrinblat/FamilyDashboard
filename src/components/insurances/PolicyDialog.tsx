'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
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
import { addPolicyAction, updatePolicyAction } from '@/app/(app)/insurances/actions';
import {
  INSURANCE_SUBTYPES,
  INSURANCE_TYPES,
  InsuranceType,
  FREQUENCY_TYPES,
} from '@/lib/constants';
import { PolicyFormSchema, PolicyFormData } from '@/lib/schemas';
import type { Resolver } from 'react-hook-form';

type PolicyRow = Database['public']['Tables']['policies']['Row'];

export function PolicyDialog({
  triggerButton,
  defaultType = 'health',
  policy,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: {
  triggerButton?: React.ReactNode;
  defaultType?: InsuranceType;
  policy?: PolicyRow;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setOpen = setControlledOpen || setUncontrolledOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerButton && <DialogTrigger asChild>{triggerButton}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{!!policy ? 'עריכת פוליסה' : 'הוספת פוליסה חדשה'}</DialogTitle>
          <DialogDescription>הזן את נתוני הפוליסה לצורך בקרה מהירה.</DialogDescription>
        </DialogHeader>
        {open && (
          <PolicyForm
            key={policy?.id || 'new'}
            policy={policy}
            defaultType={defaultType}
            onSuccess={() => setOpen(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function PolicyForm({
  policy,
  defaultType,
  onSuccess,
}: {
  policy?: PolicyRow;
  defaultType: InsuranceType;
  onSuccess: () => void;
}) {
  const isEditMode = !!policy;
  const router = useRouter();
  const supabase = createClient();
  const [file, setFile] = useState<File | null>(null);

  const [vehicles, setVehicles] = useState<
    Pick<Database['public']['Tables']['vehicles']['Row'], 'id' | 'name' | 'license_plate'>[]
  >([]);
  const [properties, setProperties] = useState<
    Pick<Database['public']['Tables']['properties']['Row'], 'id' | 'name'>[]
  >([]);

  const defaultValues: PolicyFormData = {
    name: policy?.name ?? '',
    provider: policy?.provider ?? '',
    type: (policy?.type as InsuranceType) ?? defaultType,
    subtype: policy?.subtype ?? null,
    premium_amount: policy?.premium_amount ?? ('' as unknown as number),
    premium_frequency:
      (policy?.premium_frequency as 'monthly' | 'yearly') ?? FREQUENCY_TYPES.MONTHLY,
    renewal_date: policy?.renewal_date ?? null,
    policy_number: policy?.policy_number ?? null,
    linked_id: policy?.vehicle_id ?? policy?.property_id ?? null,
  };

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PolicyFormData>({
    resolver: zodResolver(PolicyFormSchema) as Resolver<PolicyFormData>,
    defaultValues,
  });

  const type = watch('type');
  const subtype = watch('subtype');
  const premiumFrequency = watch('premium_frequency');
  const linkedId = watch('linked_id');

  // Reset subtype when type changes
  useEffect(() => {
    if (type) {
      const subtypeKey = type as keyof typeof INSURANCE_SUBTYPES;
      const validSubtypes = INSURANCE_SUBTYPES[subtypeKey] || [];
      if (!validSubtypes.find((st) => st.value === subtype)) {
        setValue('subtype', null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  useEffect(() => {
    const fetchLinkedAssets = async () => {
      if (type === INSURANCE_TYPES.VEHICLE) {
        const { data } = await supabase
          .from('vehicles')
          .select('id, name, license_plate')
          .eq('status', 'active');
        if (data) setVehicles(data);
      } else if (type === INSURANCE_TYPES.PROPERTY) {
        const { data } = await supabase.from('properties').select('id, name');
        if (data) setProperties(data);
      }
    };
    fetchLinkedAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const ALLOWED_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx'];
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

  const uploadDocument = async (): Promise<string | null> => {
    if (!file) return policy?.document_url || null;

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt)) {
      toast.error('סוג קובץ לא מורשה');
      return null;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('הקובץ גדול מדי (מקסימום 10MB)');
      return null;
    }
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${type}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('policies_documents')
      .upload(filePath, file);

    if (uploadError) {
      if (process.env.NODE_ENV === 'development')
        console.error('Error uploading file:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('policies_documents').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const onSubmit = async (data: PolicyFormData) => {
    let documentUrl = policy?.document_url || null;
    if (file) {
      documentUrl = await uploadDocument();
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('provider', data.provider);
    formData.append('type', data.type);
    if (data.subtype) formData.append('subtype', data.subtype);
    formData.append('premium_amount', String(data.premium_amount));
    formData.append('premium_frequency', data.premium_frequency);
    if (data.renewal_date) formData.append('renewal_date', data.renewal_date);
    if (data.policy_number) formData.append('policy_number', data.policy_number);
    if (documentUrl) formData.append('document_url', documentUrl);

    if (data.linked_id && data.linked_id !== 'none') {
      if (data.type === INSURANCE_TYPES.VEHICLE) {
        formData.append('vehicle_id', data.linked_id);
      } else if (data.type === INSURANCE_TYPES.PROPERTY) {
        formData.append('property_id', data.linked_id);
      }
    }

    const result = isEditMode
      ? await updatePolicyAction(policy.id, formData)
      : await addPolicyAction(formData);

    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success(isEditMode ? 'הפוליסה עודכנה בהצלחה' : 'הפוליסה נוספה בהצלחה');
    onSuccess();
    router.refresh();
  };

  const subtypeKey = type as keyof typeof INSURANCE_SUBTYPES;
  const subtypeOptions = INSURANCE_SUBTYPES[subtypeKey] || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="type" className="text-right pt-2 text-base md:text-lg">
          סוג הפוליסה
        </Label>
        <Select value={type} onValueChange={(v: InsuranceType) => setValue('type', v)}>
          <SelectTrigger className="col-span-3" dir="rtl">
            <SelectValue placeholder="בחר סוג" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value={INSURANCE_TYPES.HEALTH}>בריאות וחיים</SelectItem>
            <SelectItem value={INSURANCE_TYPES.PROPERTY}>מבנה ותכולה (דירה)</SelectItem>
            <SelectItem value={INSURANCE_TYPES.VEHICLE}>רכב (חובה / מקיף)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {subtypeOptions.length > 0 && (
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="subtype" className="text-right pt-2 text-base md:text-lg">
            תת-סוג
          </Label>
          <Select value={subtype ?? ''} onValueChange={(v) => setValue('subtype', v || null)}>
            <SelectTrigger className="col-span-3" dir="rtl">
              <SelectValue placeholder="בחר תת-סוג" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              {subtypeOptions.map((st) => (
                <SelectItem key={st.value} value={st.value}>
                  {st.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="provider" className="text-right pt-2 text-base md:text-lg">
          חברת ביטוח
        </Label>
        <div className="col-span-3 space-y-1">
          <Input id="provider" {...register('provider')} placeholder="הראל, מנורה, מגדל..." />
          {errors.provider && <p className="text-base text-rose-500">{errors.provider.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="name" className="text-right pt-2 text-base md:text-lg">
          שם פוליסה
        </Label>
        <div className="col-span-3 space-y-1">
          <Input
            id="name"
            {...register('name')}
            placeholder={type === INSURANCE_TYPES.HEALTH ? 'ביטוח בריאות משפחתי מושלם' : ''}
          />
          {errors.name && <p className="text-base text-rose-500">{errors.name.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="premiumAmount" className="text-right pt-2 text-base md:text-lg">
          עלות (₪)
        </Label>
        <div className="col-span-3 space-y-1">
          <Input id="premiumAmount" type="number" {...register('premium_amount')} />
          {errors.premium_amount && (
            <p className="text-base text-rose-500">{errors.premium_amount.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="premiumFrequency" className="text-right pt-2 text-base md:text-lg">
          תדירות תשלום
        </Label>
        <Select
          value={premiumFrequency}
          onValueChange={(v: 'monthly' | 'yearly') => setValue('premium_frequency', v)}
        >
          <SelectTrigger className="col-span-3" dir="rtl">
            <SelectValue placeholder="בחר" />
          </SelectTrigger>
          <SelectContent dir="rtl">
            <SelectItem value={FREQUENCY_TYPES.MONTHLY}>חודשי</SelectItem>
            <SelectItem value={FREQUENCY_TYPES.YEARLY}>שנתי</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="renewalDate" className="text-right pt-2 text-base md:text-lg">
          תאריך חידוש
        </Label>
        <Input id="renewalDate" type="date" {...register('renewal_date')} className="col-span-3" />
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="policyNumber" className="text-right pt-2 text-base md:text-lg">
          מספר פוליסה (אופציונלי)
        </Label>
        <Input
          id="policyNumber"
          {...register('policy_number')}
          className="col-span-3 text-left"
          dir="ltr"
        />
      </div>

      {type === INSURANCE_TYPES.VEHICLE && vehicles.length > 0 && (
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="linked" className="text-right pt-2 text-base md:text-lg">
            שיוך לרכב (אופציונלי)
          </Label>
          <Select
            value={linkedId ?? 'none'}
            onValueChange={(v) => setValue('linked_id', v === 'none' ? null : v)}
          >
            <SelectTrigger className="col-span-3" dir="rtl">
              <SelectValue placeholder="ללא שיוך" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="none">ללא שיוך</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.name} {v.license_plate ? `(${v.license_plate})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {type === INSURANCE_TYPES.PROPERTY && properties.length > 0 && (
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="linked" className="text-right pt-2 text-base md:text-lg">
            שיוך לנכס (אופציונלי)
          </Label>
          <Select
            value={linkedId ?? 'none'}
            onValueChange={(v) => setValue('linked_id', v === 'none' ? null : v)}
          >
            <SelectTrigger className="col-span-3" dir="rtl">
              <SelectValue placeholder="ללא שיוך" />
            </SelectTrigger>
            <SelectContent dir="rtl">
              <SelectItem value="none">ללא שיוך</SelectItem>
              {properties.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-4 items-start gap-4 border-t pt-4">
        <Label htmlFor="document" className="text-right pt-2 text-base md:text-lg">
          מסמך הפוליסה
        </Label>
        <div className="col-span-3 space-y-2">
          <Input
            id="document"
            type="file"
            onChange={handleFileChange}
            className="cursor-pointer file:bg-zinc-100 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:text-lg"
          />
          {policy?.document_url && (
            <a
              href={policy.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-blue-500 hover:underline flex items-center gap-1"
            >
              צפה במסמך קיים
            </a>
          )}
        </div>
      </div>

      <DialogFooter className="mt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'שומר...' : isEditMode ? 'שמור פוליסה' : 'הוסף פוליסה'}
        </Button>
      </DialogFooter>
    </form>
  );
}
