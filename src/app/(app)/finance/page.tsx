import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PiggyBank, WalletCards, Briefcase, PieChart } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ManageAccountsTab } from "@/components/finance/ManageAccountsTab"
import { IncomeSourcesTab } from "@/components/finance/IncomeSourcesTab"
import { AssetsTable } from "@/components/finance/AssetsTable"
import { PensionTable } from "@/components/finance/PensionTable"
import { Database } from "@/types/database.types"
import { PageHeader } from "@/components/layout/PageHeader"
import { CATEGORY_TYPES, ASSET_TYPES } from "@/lib/constants"

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"]
type RecurringFlowRow = Database["public"]["Tables"]["recurring_flows"]["Row"]
type AssetRow = Database["public"]["Tables"]["assets"]["Row"]

export default async function FinancePage() {
    const supabase = await createClient()

    // Fetch all accounts to display in the new manager
    const { data: rawAccounts, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .order('name', { ascending: true })

    if (accountsError) console.error('Error fetching accounts:', accountsError)
    const accounts = rawAccounts as AccountRow[] || []

    // Fetch Income flows
    const { data: rawIncomeFlows, error: incomeError } = await supabase
        .from('recurring_flows')
        .select('*')
        .eq('type', CATEGORY_TYPES.INCOME)
        .order('name', { ascending: true })

    if (incomeError) console.error('Error fetching income flows:', incomeError)
    const incomeFlows = rawIncomeFlows as RecurringFlowRow[] || []

    // Fetch investment assets (excluding vehicles and pensions)
    const { data: rawAssets, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .not('type', 'in', `("${ASSET_TYPES.VEHICLE}","${ASSET_TYPES.PENSION}")`)
        .eq('status', 'active')
        .order('name', { ascending: true })

    if (assetsError) console.error('Error fetching investment assets:', assetsError)
    const investmentAssets = rawAssets as AssetRow[] || []

    // Fetch Pension assets
    const { data: rawPensions, error: pensionsError } = await supabase
        .from('assets')
        .select('*')
        .eq('type', ASSET_TYPES.PENSION)
        .eq('status', 'active')
        .order('name', { ascending: true })

    if (pensionsError) console.error('Error fetching pension assets:', pensionsError)
    const pensionAssets = rawPensions as AssetRow[] || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <PageHeader title="פיננסים ונכסים" icon={PieChart} />

            <ManageAccountsTab accounts={accounts} />

            <div className="pt-8 w-full border-t border-zinc-100 dark:border-zinc-800 mt-8"></div>

            <Tabs defaultValue="income" className="w-full mt-4" dir="rtl">
                <TabsList className="flex flex-wrap h-auto justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
                    <TabsTrigger value="income">
                        <div className="flex items-center gap-2">
                            <PiggyBank className="w-4 h-4" />
                            מקורות הכנסה
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="investments">
                        <div className="flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            השקעות
                        </div>
                    </TabsTrigger>
                    <TabsTrigger value="pension">
                        <div className="flex items-center gap-2">
                            <WalletCards className="w-4 h-4" />
                            פנסיה וגמל
                        </div>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="income" className="space-y-4">
                    <IncomeSourcesTab incomeFlows={incomeFlows} accounts={accounts} />
                </TabsContent>

                <TabsContent value="investments" className="space-y-4">
                    <AssetsTable assets={investmentAssets} />
                </TabsContent>

                <TabsContent value="pension" className="space-y-4">
                    <PensionTable pensions={pensionAssets} />
                </TabsContent>
            </Tabs>
        </div>
    )
}
