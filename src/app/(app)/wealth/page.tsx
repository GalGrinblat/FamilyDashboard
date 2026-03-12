import { createClient } from "@/lib/supabase/server";
import { WealthAccountsTab } from "@/components/wealth/WealthAccountsTab";
import { AssetsTable } from "@/components/wealth/AssetsTable";
import { PensionTable } from "@/components/wealth/PensionTable";
import { PageHeader } from "@/components/layout/PageHeader";
import { TrendingUp, Briefcase, WalletCards } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database } from "@/types/database.types";
import { ASSET_TYPES } from "@/lib/constants";

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"];
type AssetRow = Database["public"]["Tables"]["assets"]["Row"];

export default async function WealthPage() {
    const supabase = await createClient();

    // Fetch investment accounts
    const { data: rawAccounts } = await supabase
        .from('accounts')
        .select('*')
        .order('name', { ascending: true });

    const accounts = rawAccounts as AccountRow[] || [];

    // Fetch investment assets (Stocks, Crypto, Other)
    const { data: rawAssets } = await supabase
        .from('assets')
        .select('*')
        .not('type', 'in', `("${ASSET_TYPES.VEHICLE}","${ASSET_TYPES.PENSION}","${ASSET_TYPES.REAL_ESTATE}")`)
        .eq('status', 'active')
        .order('name', { ascending: true });

    const investmentAssets = rawAssets as AssetRow[] || [];

    // Fetch Real Estate assets
    const { data: rawRealEstate } = await supabase
        .from('assets')
        .select('*')
        .eq('type', ASSET_TYPES.REAL_ESTATE)
        .eq('status', 'active')
        .order('name', { ascending: true });

    const realEstateAssets = rawRealEstate as AssetRow[] || [];

    // Fetch Pension assets
    const { data: rawPensions } = await supabase
        .from('assets')
        .select('*')
        .eq('type', ASSET_TYPES.PENSION)
        .eq('status', 'active')
        .order('name', { ascending: true });

    const pensionAssets = rawPensions as AssetRow[] || [];

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
                            <Briefcase className="w-4 h-4" />
                            השקעות (Stocks/Crypto)
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
                </TabsList>

                <TabsContent value="investments" className="space-y-4 mt-4">
                    <AssetsTable assets={investmentAssets} />
                </TabsContent>

                <TabsContent value="real_estate" className="space-y-4 mt-4">
                    <AssetsTable assets={realEstateAssets} />
                </TabsContent>

                <TabsContent value="pension" className="space-y-4 mt-4">
                    <PensionTable pensions={pensionAssets} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
