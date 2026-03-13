'use server';

import { createClient } from '@/lib/supabase/server';

// Fetch necessary data for the Monthly Balance view
export async function getMonthlyBalanceData(monthStart: Date, monthEnd: Date) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  // 1. Fetch Accounts (to get base balance and CC metadata)
  const { data: accounts, error: accountsError } = await supabase.from('accounts').select('*');
  if (accountsError) throw new Error('Failed to fetch accounts');

  // 2. Fetch Transactions for the specific month
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select(
      `
            *,
            account:accounts(id, name, type)
        `,
    )
    .gte('date', monthStart.toISOString())
    .lte('date', monthEnd.toISOString());
  if (transactionsError) throw new Error('Failed to fetch transactions');

  // 3. Fetch Recurring Flows (active ones)
  const { data: recurringFlows, error: rFlowsError } = await supabase
    .from('recurring_flows')
    .select('*')
    .eq('is_active', true);
  if (rFlowsError) throw new Error('Failed to fetch recurring flows');

  // 4. Fetch Monthly Overrides for the specific month
  const monthYearStr = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`;
  const { data: overrides, error: overridesError } = await supabase
    .from('monthly_overrides')
    .select('*')
    .eq('month_year', monthYearStr);
  if (overridesError) throw new Error('Failed to fetch monthly overrides');

  return {
    accounts,
    transactions,
    recurringFlows,
    overrides,
  };
}

// Server Action to save an inline override amount
export async function upsertMonthlyOverride(
  recurring_flow_id: string,
  month_year: string,
  amount: number,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase.from('monthly_overrides').upsert(
    {
      month_year,
      recurring_flow_id,
      override_amount: amount,
    },
    { onConflict: 'month_year,recurring_flow_id' },
  );

  if (error) {
    console.error('Error upserting override:', error);
    throw new Error('Failed to save override');
  }
}
