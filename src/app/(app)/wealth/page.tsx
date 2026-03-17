import { InvestmentTab } from '@/components/wealth/investment/InvestmentTab';
import { RsuTab } from '@/components/wealth/rsu/RsuTab';
import { RealEstateTab } from '@/components/wealth/real-estate/RealEstateTab';
import { PensionTab } from '@/components/wealth/pension/PensionTab';
import { PageHeader } from '@/components/layout/PageHeader';
import { TrendingUp, Briefcase, WalletCards, LineChart, Award } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function WealthPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="הון ונכסים" icon={TrendingUp} />

      <Tabs defaultValue="investments" className="w-full" dir="rtl">
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

        <TabsContent value="investments" className="mt-4">
          <InvestmentTab />
        </TabsContent>

        <TabsContent value="real_estate" className="mt-4">
          <RealEstateTab />
        </TabsContent>

        <TabsContent value="pension" className="mt-4">
          <PensionTab />
        </TabsContent>

        <TabsContent value="rsu" className="mt-4">
          <RsuTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
