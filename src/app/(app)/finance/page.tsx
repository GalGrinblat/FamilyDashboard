import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Landmark, TrendingUp } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ManageAccountsTab } from "@/components/finance/ManageAccountsTab"
import { IncomeSourcesTab } from "@/components/finance/IncomeSourcesTab"
import { AssetsTable } from "@/components/finance/AssetsTable"
import { PensionTable } from "@/components/finance/PensionTable"
import { Database } from "@/types/database.types"

type AccountRow = Database["public"]["Tables"]["accounts"]["Row"]
type RecurringFlowRow = Database["public"]["Tables"]["recurring_flows"]["Row"]
type AssetRow = Database["public"]["Tables"]["assets"]["Row"]

export default async function FinancePage() {
    const supabase = await createClient()

    // Fetch all accounts to display in the new manager
    const { data: rawAccounts } = await supabase
        .from('accounts')
        .select('*')
        .order('name', { ascending: true })

    const accounts = rawAccounts as AccountRow[] || []

    // Fetch Income flows
    const { data: rawIncomeFlows } = await supabase
        .from('recurring_flows')
        .select('*')
        .eq('type', 'income')
        .order('name', { ascending: true })

    const incomeFlows = rawIncomeFlows as RecurringFlowRow[] || []

    // Fetch investment assets (excluding vehicles and pensions)
    const { data: rawAssets } = await supabase
        .from('assets')
        .select('*')
        .not('type', 'in', '("vehicle","pension")')
        .order('name', { ascending: true })

    const investmentAssets = rawAssets as AssetRow[] || []

    // Fetch Pension assets
    const { data: rawPensions } = await supabase
        .from('assets')
        .select('*')
        .eq('type', 'pension')
        .order('name', { ascending: true })

    const pensionAssets = rawPensions as AssetRow[] || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <PieChart className="h-8 w-8 text-zinc-400" />
                    פיננסים ונכסים
                </h2>
            </div>

            <ManageAccountsTab accounts={accounts} />

            <div className="pt-8 w-full border-t border-zinc-100 dark:border-zinc-800 mt-8"></div>

            <Tabs defaultValue="income" className="w-full mt-4" dir="rtl">
                <TabsList className="mb-4">
                    <TabsTrigger value="income">מקורות הכנסה</TabsTrigger>
                    <TabsTrigger value="investments">השקעות</TabsTrigger>
                    <TabsTrigger value="pension">פנסיה וגמל</TabsTrigger>
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
