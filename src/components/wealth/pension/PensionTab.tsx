import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { AssetSchema } from '@/lib/schemas';
import { ASSET_TYPES } from '@/lib/constants';
import { PensionSummaryKpis } from './PensionSummaryKpis';
import { PensionTable } from './PensionTable';

export async function PensionTab() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('assets')
    .select('*')
    .eq('type', ASSET_TYPES.PENSION)
    .eq('status', 'active')
    .order('name', { ascending: true });

  const pensions = z.array(AssetSchema).parse(data ?? []);

  return (
    <div className="space-y-4">
      <PensionSummaryKpis pensions={pensions} />
      <PensionTable pensions={pensions} />
    </div>
  );
}
