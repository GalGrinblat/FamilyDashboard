'use client';

import { useState, useEffect } from 'react';
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
  FrequencyType,
} from '@/lib/constants';

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
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const supabase = createClient();

  const [name, setName] = useState(policy?.name || '');
  const [provider, setProvider] = useState(policy?.provider || '');
  const [type, setType] = useState<InsuranceType>((policy?.type as InsuranceType) || defaultType);
  const [subtype, setSubtype] = useState(policy?.subtype || '');
  const [premiumAmount, setPremiumAmount] = useState(policy?.premium_amount?.toString() || '');
  const [premiumFrequency, setPremiumFrequency] = useState<FrequencyType>(
    (policy?.premium_frequency as FrequencyType) || FREQUENCY_TYPES.MONTHLY,
  );
  const [renewalDate, setRenewalDate] = useState(policy?.renewal_date || '');
  const [policyNumber, setPolicyNumber] = useState(policy?.policy_number || '');
  const [linkedId, setLinkedId] = useState(policy?.vehicle_id || policy?.property_id || 'none');
  const [file, setFile] = useState<File | null>(null);

  const [vehicles, setVehicles] = useState<
    Pick<Database['public']['Tables']['vehicles']['Row'], 'id' | 'name' | 'license_plate'>[]
  >([]);
  const [properties, setProperties] = useState<
    Pick<Database['public']['Tables']['properties']['Row'], 'id' | 'name'>[]
  >([]);

  useEffect(() => {
    if (type) {
      const subtypeKey = type as keyof typeof INSURANCE_SUBTYPES;
      const validSubtypes = INSURANCE_SUBTYPES[subtypeKey] || [];
      if (!validSubtypes.find((st) => st.value === subtype)) {
        setSubtype('');
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

  const uploadDocument = async () => {
    if (!file) return policy?.document_url || null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${type}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('policies_documents')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return null;
    }

    const { data } = supabase.storage.from('policies_documents').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    let documentUrl = policy?.document_url || null;
    if (file) {
      documentUrl = await uploadDocument();
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('provider', provider);
    formData.append('type', type);
    if (subtype) formData.append('subtype', subtype);
    formData.append('premium_amount', premiumAmount);
    formData.append('premium_frequency', premiumFrequency);
    if (renewalDate) formData.append('renewal_date', renewalDate);
    if (policyNumber) formData.append('policy_number', policyNumber);
    if (documentUrl) formData.append('document_url', documentUrl);

    // Send vehicle_id or property_id based on type
    if (linkedId && linkedId !== 'none') {
      if (type === INSURANCE_TYPES.VEHICLE) {
        formData.append('vehicle_id', linkedId);
      } else if (type === INSURANCE_TYPES.PROPERTY) {
        formData.append('property_id', linkedId);
      }
    }

    let result;
    if (isEditMode) {
      result = await updatePolicyAction(policy.id, formData);
    } else {
      result = await addPolicyAction(formData);
    }

    setLoading(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      onSuccess();
    }
  };

  const subtypeKey = type as keyof typeof INSURANCE_SUBTYPES;
  const subtypeOptions = INSURANCE_SUBTYPES[subtypeKey] || [];

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="type" className="text-right pt-2 text-base md:text-lg">
          סוג הפוליסה
        </Label>
        <Select value={type} onValueChange={(v: InsuranceType) => setType(v)}>
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
          <Select value={subtype} onValueChange={setSubtype}>
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
        <Input
          id="provider"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          className="col-span-3"
          placeholder="הראל, מנורה, מגדל..."
          required
        />
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="name" className="text-right pt-2 text-base md:text-lg">
          שם פוליסה
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="col-span-3"
          placeholder={type === INSURANCE_TYPES.HEALTH ? 'ביטוח בריאות משפחתי מושלם' : ''}
          required
        />
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="premiumAmount" className="text-right pt-2 text-base md:text-lg">
          עלות (₪)
        </Label>
        <Input
          id="premiumAmount"
          type="number"
          value={premiumAmount}
          onChange={(e) => setPremiumAmount(e.target.value)}
          className="col-span-3"
          required
        />
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="premiumFrequency" className="text-right pt-2 text-base md:text-lg">
          תדירות תשלום
        </Label>
        <Select
          value={premiumFrequency}
          onValueChange={(v: FrequencyType) => setPremiumFrequency(v)}
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
        <Input
          id="renewalDate"
          type="date"
          value={renewalDate}
          onChange={(e) => setRenewalDate(e.target.value)}
          className="col-span-3"
        />
      </div>

      <div className="grid grid-cols-4 items-start gap-4">
        <Label htmlFor="policyNumber" className="text-right pt-2 text-base md:text-lg">
          מספר פוליסה (אופציונלי)
        </Label>
        <Input
          id="policyNumber"
          value={policyNumber}
          onChange={(e) => setPolicyNumber(e.target.value)}
          className="col-span-3 text-left"
          dir="ltr"
        />
      </div>

      {type === INSURANCE_TYPES.VEHICLE && vehicles.length > 0 && (
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="linked" className="text-right pt-2 text-base md:text-lg">
            שיוך לרכב (אופציונלי)
          </Label>
          <Select value={linkedId} onValueChange={setLinkedId}>
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
          <Select value={linkedId} onValueChange={setLinkedId}>
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

      {errorMsg && (
        <div className="text-lg font-medium text-destructive mt-2 text-right">{errorMsg}</div>
      )}

      <DialogFooter className="mt-4">
        <Button type="submit" disabled={loading}>
          {loading ? 'שומר...' : isEditMode ? 'שמור פוליסה' : 'הוסף פוליסה'}
        </Button>
      </DialogFooter>
    </form>
  );
}
