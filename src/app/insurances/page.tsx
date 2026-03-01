import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, HeartPulse, Home, Car as CarIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { TransactionsTable, TransactionWithCategory } from "@/components/finance/TransactionsTable"

export default async function InsurancesPage() {
    const supabase = await createClient()

    // Fetch Insurances Domain Transactions
    const { data: rawTransactions } = await supabase
        .from('transactions')
        .select(`
            id, amount, date, description, merchant, account_id,
            categories!inner ( name_he, name_en, type, domain )
        `)
        .eq('categories.domain', 'insurances')
        .order('date', { ascending: false })

    const transactions = rawTransactions as unknown as TransactionWithCategory[] || []
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Shield className="h-8 w-8 text-zinc-400" />
                    תיק ביטוחים
                </h2>
            </div>

            <p className="text-muted-foreground mt-2 mb-6">
                מרכז שליטה פוליסות ביטוח וכיסויים למשפחה, רכוש ורכבים.
            </p>

            <Tabs defaultValue="health" className="w-full mt-4" dir="rtl">
                <TabsList className="mb-4">
                    <TabsTrigger value="health">בריאות וחיים</TabsTrigger>
                    <TabsTrigger value="property">מבנה ותכולה</TabsTrigger>
                    <TabsTrigger value="vehicle">רכב</TabsTrigger>
                    <TabsTrigger value="transactions" className="bg-indigo-50 data-[state=active]:bg-indigo-100 dark:bg-indigo-900/20 dark:data-[state=active]:bg-indigo-900/40">תנועות והוצאות</TabsTrigger>
                </TabsList>

                <TabsContent value="health" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <HeartPulse className="h-5 w-5 text-rose-500" />
                                קופות חולים וחיים
                            </CardTitle>
                            <CardDescription>ביטוחי בריאות פרטיים, קופות חולים וביטוחי חיים/משכנתא.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                            מעקב פוליסות בריאות יפותח כאן.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="property" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Home className="h-5 w-5 text-emerald-500" />
                                ביטוחי דירה ותכולה
                            </CardTitle>
                            <CardDescription>כיסוי נכסים ומשק הבית.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                            פוליסות ופרטי חברות ביטוח המבנה.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="vehicle" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CarIcon className="h-5 w-5 text-blue-500" />
                                ביטוחי רכב חובה ומקיף
                            </CardTitle>
                            <CardDescription>תאריכי חידוש ומעקב הוצאות ביטוח לרכבים.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                            ניהול ביטוחי צד ג' ומקיף לרכבי המשפחה.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="transactions" className="m-0">
                    <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm overflow-hidden">
                        <CardHeader className="bg-indigo-50/30 dark:bg-indigo-900/10">
                            <CardTitle className="text-indigo-800 dark:text-indigo-300">תנועות והוצאות ביטוחים</CardTitle>
                            <CardDescription>ריכוז הוצאות והפרשות לפוליסות ביטוח במגוון תחומים.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                            <TransactionsTable transactions={transactions} />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
