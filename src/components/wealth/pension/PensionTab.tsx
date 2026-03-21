import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { InvestmentAccountSchema } from '@/lib/schemas';
import { PensionSummaryKpis } from './PensionSummaryKpis';
import { PensionTable } from './PensionTable';

export async function PensionTab() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('investment_accounts')
    .select('*')
    .in('account_type', ['pension', 'gemel'])
    .eq('is_active', true)
    .order('name', { ascending: true });

  const pensions = z.array(InvestmentAccountSchema).parse(data ?? []);

  return (
    <div className="space-y-4">
      <PensionSummaryKpis pensions={pensions} />
      <PensionTable pensions={pensions} />
    </div>
  );
}
