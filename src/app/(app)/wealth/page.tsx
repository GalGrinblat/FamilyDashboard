import { createClient } from '@/lib/supabase/server';
import { WealthAccountsTab } from '@/components/wealth/WealthAccountsTab';
import { AssetsTable } from '@/components/wealth/AssetsTable';
import { PensionTable } from '@/components/wealth/PensionTable';
import { InvestmentTab } from '@/components/wealth/investment/InvestmentTab';
import { RsuTab } from '@/components/wealth/investment/rsu/RsuTab';
import { PageHeader } from '@/components/layout/PageHeader';
import { TrendingUp, Briefcase, WalletCards, LineChart, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ASSET_TYPES } from '@/lib/constants';
import { AccountSchema, AssetSchema } from '@/lib/schemas';
import { z } from 'zod';

export default async function WealthPage() {
  const supabase = await createClient();

  // Fetch all data in parallel
  const [{ data: rawAccounts }, { data: rawRealEstate }, { data: rawPensions }] = await Promise.all(
    [
      supabase.from('accounts').select('*').order('name', { ascending: true }),
      supabase
        .from('assets')
        .select('*')
        .eq('type', ASSET_TYPES.REAL_ESTATE)
        .eq('status', 'active')
        .order('name', { ascending: true }),
      supabase
        .from('assets')
        .select('*')
        .eq('type', ASSET_TYPES.PENSION)
        .eq('status', 'active')
        .order('name', { ascending: true }),
    ],
  );

  const accounts = z.array(AccountSchema).parse(rawAccounts || []);
  const realEstateAssets = z.array(AssetSchema).parse(rawRealEstate || []);
  const pensionAssets = z.array(AssetSchema).parse(rawPensions || []);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="הון ונכסים" icon={TrendingUp} />

      <div className="grid gap-4">
        <WealthAccountsTab accounts={accounts} />
      </div>

      <Tabs defaultValue="investments" className="w-full mt-8" dir="rtl">
        <TabsList className="flex flex-wrap h-auto justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
          <TabsTrigger value="investments">
            <div className="flex items-center gap-2">
              <LineChart className="w-4 h-4" />
              השקעות
            </div>
          </TabsTrigger>
          <TabsTrigger value="real_estate">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              נדל״ן
            </div>
          </TabsTrigger>
          <TabsTrigger value="pension">
            <div className="flex items-center gap-2">
              <WalletCards className="w-4 h-4" />
              פנסיה, גמל והשתלמות
            </div>
          </TabsTrigger>
          <TabsTrigger value="rsu">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              RSU
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="investments" className="mt-6">
          <InvestmentTab />
        </TabsContent>

        <TabsContent value="real_estate" className="space-y-4 mt-4">
          <AssetsTable assets={realEstateAssets} />
        </TabsContent>

        <TabsContent value="pension" className="space-y-4 mt-4">
          <PensionTable pensions={pensionAssets} />
        </TabsContent>

        <TabsContent value="rsu" className="space-y-4 mt-4">
          <RsuTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
