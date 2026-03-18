'use server';

import { createClient } from '@/lib/supabase/server';

// Fetch necessary data for the Monthly Projection view
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

  // 5. Compute reconstructed start balance for this month
  const today = new Date();
  const bankAccounts = (accounts ?? []).filter((a) => a.type === 'checking' || a.type === 'bank');
  const totalCurrentBalance = bankAccounts.reduce((s, a) => s + (a.current_balance ?? 0), 0);
  const bankAccountIds = bankAccounts.map((a) => a.id);

  let computedStartBalance = totalCurrentBalance;

  if (monthStart <= today) {
    const { data: adjustTxns } = await supabase
      .from('transactions')
      .select('amount, category:categories(type)')
      .in('account_id', bankAccountIds.length > 0 ? bankAccountIds : ['__none__'])
      .gte('date', monthStart.toISOString())
      .lte('date', today.toISOString());

    const delta = (adjustTxns ?? []).reduce((s, t) => {
      const catType = (t.category as { type: string } | null)?.type;
      return s + (catType === 'income' ? Number(t.amount) : -Number(t.amount));
    }, 0);
    computedStartBalance = totalCurrentBalance - delta;
  } else {
    const fullMonthsAhead = Math.round(
      (monthStart.getFullYear() - today.getFullYear()) * 12 +
        (monthStart.getMonth() - today.getMonth()),
    );
    const netMonthly = (recurringFlows ?? []).reduce((s, f) => {
      const m =
        f.frequency === 'yearly'
          ? Number(f.amount) / 12
          : f.frequency === 'weekly'
            ? (Number(f.amount) * 52) / 12
            : Number(f.amount);
      return f.type === 'income' ? s + m : s - m;
    }, 0);
    computedStartBalance = totalCurrentBalance + netMonthly * fullMonthsAhead;
  }

  // 6. Fetch one-off items for this month
  const { data: oneOffs, error: oneOffsError } = await supabase
    .from('monthly_one_offs')
    .select('*')
    .eq('month_year', monthYearStr);
  if (oneOffsError) throw new Error('Failed to fetch one-off items');

  return {
    accounts,
    transactions,
    recurringFlows,
    overrides,
    oneOffs,
    computedStartBalance,
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

// Server Action to add a one-off item to a specific month's projection
export async function addMonthlyOneOff(
  month_year: string,
  title: string,
  amount: number,
  type: string,
  day_of_month: number,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase.from('monthly_one_offs').insert({
    user_id: user.id,
    month_year,
    title,
    amount,
    type,
    day_of_month,
  });

  if (error) {
    console.error('Error adding one-off:', error);
    throw new Error('Failed to add one-off item');
  }
}

// Server Action to delete a one-off item
export async function deleteMonthlyOneOff(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const { error } = await supabase.from('monthly_one_offs').delete().eq('id', id);

  if (error) {
    console.error('Error deleting one-off:', error);
    throw new Error('Failed to delete one-off item');
  }
}

// Server Action to complete a payment method change reminder
export async function completePaymentMethodChange(
  reminderId: string,
  flowId: string,
  targetAccountId: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) throw new Error('Unauthorized');

  const [{ error: flowError }, { error: reminderError }] = await Promise.all([
    supabase.from('recurring_flows').update({ account_id: targetAccountId }).eq('id', flowId),
    supabase.from('reminders').update({ is_completed: true }).eq('id', reminderId),
  ]);

  if (flowError || reminderError) {
    console.error('Error completing payment method change:', flowError ?? reminderError);
    throw new Error('Failed to complete payment method change');
  }
}
