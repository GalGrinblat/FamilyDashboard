import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { AssetSchema } from '@/lib/schemas';
import { ASSET_TYPES } from '@/lib/constants';
import { RealEstateSummaryKpis } from './RealEstateSummaryKpis';
import { AssetsTable } from './AssetsTable';

export async function RealEstateTab() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('assets')
    .select('*')
    .eq('type', ASSET_TYPES.REAL_ESTATE)
    .eq('status', 'active')
    .order('name', { ascending: true });

  const assets = z.array(AssetSchema).parse(data ?? []);

  return (
    <div className="space-y-4">
      <RealEstateSummaryKpis assets={assets} />
      <AssetsTable assets={assets} />
    </div>
  );
}
