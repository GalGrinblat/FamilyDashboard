'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { InsuranceType, FrequencyType } from '@/lib/constants';

export async function addPolicyAction(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const provider = formData.get('provider') as string;
  const type = formData.get('type') as InsuranceType;
  const subtype = formData.get('subtype') as string;
  const premiumAmountStr = formData.get('premium_amount') as string;
  const premiumFrequency = formData.get('premium_frequency') as FrequencyType;
  let renewalDate: string | null = formData.get('renewal_date') as string;
  let policyNumber: string | null = formData.get('policy_number') as string;
  let assetId: string | null = formData.get('asset_id') as string;
  let documentUrl: string | null = formData.get('document_url') as string;

  if (!name || !provider || !type || !premiumAmountStr) {
    return { error: 'כל שדות החובה חייבים להיות מלאים' };
  }

  if (!renewalDate) renewalDate = null;
  if (!policyNumber) policyNumber = null;
  if (assetId === 'none' || !assetId) assetId = null;
  if (!documentUrl) documentUrl = null;

  const payload = {
    name,
    provider,
    type,
    subtype: subtype || null,
    premium_amount: parseFloat(premiumAmountStr),
    premium_frequency: premiumFrequency,
    renewal_date: renewalDate,
    policy_number: policyNumber,
    asset_id: assetId,
    document_url: documentUrl,
  };

  const { error } = await supabase.from('policies').insert(payload);

  if (error) {
    console.error('Error inserting policy:', error);
    return { error: 'שגיאה בהוספת הפוליסה' };
  }

  // Sync with recurring_flows
  const { data: newPolicy } = await supabase
    .from('policies')
    .select('id')
    .eq('name', name)
    .eq('provider', provider)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (newPolicy) {
    await syncPolicyToFlow(
      supabase,
      newPolicy.id,
      name,
      payload.premium_amount,
      premiumFrequency,
    );
  }

  revalidatePath('/insurances');
  return { success: true };
}

export async function updatePolicyAction(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get('name') as string;
  const provider = formData.get('provider') as string;
  const type = formData.get('type') as InsuranceType;
  const subtype = formData.get('subtype') as string;
  const premiumAmountStr = formData.get('premium_amount') as string;
  const premiumFrequency = formData.get('premium_frequency') as FrequencyType;
  let renewalDate: string | null = formData.get('renewal_date') as string;
  let policyNumber: string | null = formData.get('policy_number') as string;
  let assetId: string | null = formData.get('asset_id') as string;
  let documentUrl: string | null = formData.get('document_url') as string;

  if (!name || !provider || !type || !premiumAmountStr) {
    return { error: 'כל שדות החובה חייבים להיות מלאים' };
  }

  if (!renewalDate) renewalDate = null;
  if (!policyNumber) policyNumber = null;
  if (assetId === 'none' || !assetId) assetId = null;
  if (!documentUrl) documentUrl = null;

  const payload = {
    name,
    provider,
    type,
    subtype: subtype || null,
    premium_amount: parseFloat(premiumAmountStr),
    premium_frequency: premiumFrequency,
    renewal_date: renewalDate,
    policy_number: policyNumber,
    asset_id: assetId,
    document_url: documentUrl,
  };

  const { error } = await supabase.from('policies').update(payload).eq('id', id);

  if (error) {
    console.error('Error updating policy:', error);
    return { error: 'שגיאה בעדכון הפוליסה' };
  }

  // Sync with recurring_flows
  await syncPolicyToFlow(supabase, id, name, payload.premium_amount, premiumFrequency);

  revalidatePath('/insurances');
  return { success: true };
}

async function syncPolicyToFlow(
  supabase: Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  policyId: string,
  policyName: string,
  amount: number,
  frequency: string,
) {
  const flowPayload = {
    policy_id: policyId,
    name: `ביטוח: ${policyName}`,
    amount: amount,
    type: 'expense',
    frequency: frequency === 'yearly' ? 'yearly' : 'monthly',
    domain: 'insurances',
    is_active: true,
  };

  const { data: existing } = await supabase
    .from('recurring_flows')
    .select('id')
    .eq('policy_id', policyId)
    .maybeSingle();

  if (existing) {
    await supabase.from('recurring_flows').update(flowPayload).eq('id', existing.id);
  } else {
    await supabase.from('recurring_flows').insert(flowPayload);
  }
}
