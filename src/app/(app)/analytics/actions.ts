'use server';

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type TransactionWithCategory = Database['public']['Tables']['transactions']['Row'] & {
  categories:
    | Pick<Database['public']['Tables']['categories']['Row'], 'name_he' | 'type' | 'domain'>
    | Pick<Database['public']['Tables']['categories']['Row'], 'name_he' | 'type' | 'domain'>[]
    | null;
};
type RecurringFlow = Database['public']['Tables']['recurring_flows']['Row'] & {
  categories?: { domain: string | null } | null;
};

export async function getAnalyticsData() {
  const supabase = await createClient();

  // Base current date
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-11

  // Fetch all transactions for the last 6 full months + current month
  const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1);

  const { data: rawTransactions } = await supabase
    .from('transactions')
    .select(
      `
            id, amount, date,
            categories ( name_he, type, domain )
        `,
    )
    .gte('date', sixMonthsAgo.toISOString())
    .order('date', { ascending: true });

  const transactions = (rawTransactions as unknown as TransactionWithCategory[]) || [];

  // Fetch recurring flows for budget vs actual
  const { data: rawFlows } = await supabase
    .from('recurring_flows')
    .select('*, categories(domain)')
    .eq('is_active', true);

  const recurringFlows = (rawFlows as unknown as RecurringFlow[]) || [];

  // Fetch simple net worth
  const [{ data: accounts }, { data: properties }, { data: vehicles }, { data: pension }] =
    await Promise.all([
      supabase.from('accounts').select('current_balance'),
      supabase.from('properties').select('estimated_value'),
      supabase.from('vehicles').select('estimated_value').eq('status', 'active'),
      supabase
        .from('investment_accounts')
        .select('current_balance')
        .in('account_type', ['pension', 'gemel'])
        .eq('is_active', true)
        .eq('is_managed', true),
    ]);

  const totalCash = (accounts || []).reduce(
    (acc, curr) => acc + (Number(curr.current_balance) || 0),
    0,
  );
  const totalProperties = (properties || []).reduce(
    (acc, curr) => acc + (Number(curr.estimated_value) || 0),
    0,
  );
  const totalVehicles = (vehicles || []).reduce(
    (acc, curr) => acc + (Number(curr.estimated_value) || 0),
    0,
  );
  const totalPension = (pension || []).reduce(
    (acc, curr) => acc + (Number(curr.current_balance) || 0),
    0,
  );
  const currentNetWorth = totalCash + totalProperties + totalVehicles + totalPension;

  return { transactions, recurringFlows, currentNetWorth, currentYear, currentMonth };
}
