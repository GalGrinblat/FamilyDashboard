import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { PropertySchema } from '@/lib/schemas';
import { RealEstateSummaryKpis } from './RealEstateSummaryKpis';
import { AssetsTable } from './AssetsTable';

export async function RealEstateTab() {
  const supabase = await createClient();

  const { data } = await supabase.from('properties').select('*').order('name', { ascending: true });

  const properties = z.array(PropertySchema).parse(data ?? []);

  return (
    <div className="space-y-4">
      <RealEstateSummaryKpis properties={properties} />
      <AssetsTable properties={properties} />
    </div>
  );
}
