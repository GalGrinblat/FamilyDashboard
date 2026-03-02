import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { TransactionsTable } from "@/components/finance/TransactionsTable"
import { ExpenseUploader } from "@/components/finance/ExpenseUploader"
import { AddRecurringFlowDialog } from "@/components/finance/AddRecurringFlowDialog"
import { Database } from "@/types/database.types"
import { TransactionWithCategory } from "@/components/finance/TransactionsTable"
import { CATEGORY_TYPES, CATEGORY_DOMAINS } from "@/lib/constants"
type FlowRow = Database['public']['Tables']['recurring_flows']['Row']

function RecurringFlowsTable({ flows }: { flows: FlowRow[] }) {
    if (!flows || flows.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                <p>לא הוגדרו תזרימים קבועים במערכת (משכורות, הוצאות ליבה).</p>
                <AddRecurringFlowDialog triggerButton={
                    <Button variant="outline" className="mt-4">
                        <Plus className="ml-2 h-4 w-4" />
                        הוסף תזרים קבוע
                    </Button>
                } />
            </div>
        )
    }

    return (
        <div className="w-full">
            {/* Desktop View */}
            <div className="hidden md:block">
                <Table className="border-t border-zinc-100 dark:border-zinc-800">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">שם התזרים</TableHead>
                            <TableHead className="text-right">סוג</TableHead>
                            <TableHead className="text-right">תדירות</TableHead>
                            <TableHead className="text-right">תאריך קרוב</TableHead>
                            <TableHead className="text-right">סכום צפוי</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {flows.map(flow => (
                            <TableRow key={flow.id}>
                                <TableCell className="font-medium">{flow.name}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${flow.type === CATEGORY_TYPES.INCOME ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' : 'bg-rose-50 text-rose-700 ring-rose-600/10 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/20'
                                        }`}>
                                        {flow.type === 'income' ? 'הכנסה' : 'הוצאה'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {flow.frequency === 'monthly' ? 'חודשי' : flow.frequency === 'yearly' ? 'שנתי' : 'שבועי'}
                                </TableCell>
                                <TableCell>{flow.next_date ? new Date(flow.next_date).toLocaleDateString("he-IL") : '-'}</TableCell>
                                <TableCell className={`font-semibold ${flow.type === CATEGORY_TYPES.INCOME ? 'text-emerald-600 dark:text-emerald-400' : ''}`}>
                                    {flow.type === CATEGORY_TYPES.EXPENSE ? '-' : '+'}₪{flow.amount.toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    <AddRecurringFlowDialog flowToEdit={flow} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex flex-col space-y-3 p-4 pt-2">
                {flows.map(flow => (
                    <div key={flow.id} className="flex flex-col space-y-3 p-4 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950 relative">
                        <div className="absolute top-2 right-2">
                            <AddRecurringFlowDialog flowToEdit={flow} />
                        </div>
                        <div className="flex justify-between items-start pt-2">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">{flow.name}</span>
                            <span className={`font-semibold ${flow.type === CATEGORY_TYPES.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                {flow.type === CATEGORY_TYPES.EXPENSE ? '-' : '+'}₪{flow.amount.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${flow.type === CATEGORY_TYPES.INCOME ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20' : 'bg-rose-50 text-rose-700 ring-rose-600/10 dark:bg-rose-400/10 dark:text-rose-400 dark:ring-rose-400/20'}`}>
                                {flow.type === CATEGORY_TYPES.INCOME ? 'הכנסה' : 'הוצאה'}
                            </span>
                            <span>•</span>
                            <span>{flow.frequency === 'monthly' ? 'חודשי' : flow.frequency === 'yearly' ? 'שנתי' : 'שבועי'}</span>
                            <span>•</span>
                            <span>{flow.next_date ? new Date(flow.next_date).toLocaleDateString("he-IL") : '-'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default async function FinancePage() {
    const supabase = await createClient()

    // Fetch all transactions with categories
    const { data: rawTransactions } = await supabase
        .from('transactions')
        .select(`
            id, amount, date, description, merchant, account_id,
            categories ( name_he, name_en, type )
        `)
        .order('date', { ascending: false })

    const transactions = rawTransactions as TransactionWithCategory[] || []
    // Fetch all categories to feed the Uploader drop-down map
    const { data: rawCategories } = await supabase
        .from('categories')
        .select('id, name_he, domain')
        .order('name_he', { ascending: true })

    const dbCategories = rawCategories || []

    // Fetch accounts to feed the ExpenseUploader
    const { data: rawAccounts } = await supabase
        .from('accounts')
        .select('id, name')
        .order('name', { ascending: true })

    const dbAccounts = rawAccounts || []

    // Fetch recurring flows
    const { data: recurringFlows } = await supabase
        .from('recurring_flows')
        .select('*')
        .order('created_at', { ascending: false })
    const flows = recurringFlows || []


    // Map categories to Tabs visually. For a real app, we would map `categories.parent_id` to these buckets.
    // Here we'll do a simple mock filter based on existence of data to feed the tables.
    const incomes = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.type : t.categories?.type) === CATEGORY_TYPES.INCOME)
    const generalExpenses = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.type : t.categories?.type) === CATEGORY_TYPES.EXPENSE)

    const housingExpenses = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) === CATEGORY_DOMAINS.HOUSING)
    const transportationExpenses = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) === CATEGORY_DOMAINS.TRANSPORTATION)
    const insuranceExpenses = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) === CATEGORY_DOMAINS.INSURANCES)
    const utilitiesExpenses = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) === CATEGORY_DOMAINS.UTILITIES)
    const supermarketExpenses = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) === CATEGORY_DOMAINS.SUPERMARKET)
    const hobbiesExpenses = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) === CATEGORY_DOMAINS.HOBBIES)
    const entertainmentExpenses = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) === CATEGORY_DOMAINS.ENTERTAINMENT)
    const vacationExpenses = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) === CATEGORY_DOMAINS.VACATION)

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">פיננסים</h2>
                <AddRecurringFlowDialog />
            </div>

            <Tabs defaultValue="budget" className="w-full mt-4" dir="rtl">

                <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
                    <TabsTrigger value="budget" className="bg-indigo-50/50 data-[state=active]:bg-indigo-100 dark:bg-indigo-900/20 dark:data-[state=active]:bg-indigo-900/40">תקציב ותזרים קבוע (Budget)</TabsTrigger>
                    <TabsTrigger value="income">הכנסות</TabsTrigger>
                    <TabsTrigger value="housing">מגורים</TabsTrigger>
                    <TabsTrigger value="car">תחבורה</TabsTrigger>
                    <TabsTrigger value="insurances">ביטוחים</TabsTrigger>
                    <TabsTrigger value="utilities">חשבונות</TabsTrigger>
                    <TabsTrigger value="supermarket">סופרמרקט</TabsTrigger>
                    <TabsTrigger value="hobbies">חוגים ופנאי</TabsTrigger>
                    <TabsTrigger value="entertainment">בילויים</TabsTrigger>
                    <TabsTrigger value="vacation">חופשות</TabsTrigger>
                    <TabsTrigger value="ai_engine" className="bg-zinc-200 dark:bg-zinc-700">מנוע הוצאות (AI)</TabsTrigger>
                </TabsList>

                <div className="mt-4">

                    <TabsContent value="budget" className="m-0">
                        <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm overflow-hidden">
                            <CardHeader className="bg-indigo-50/30 dark:bg-indigo-900/10">
                                <CardTitle className="text-indigo-800 dark:text-indigo-300">תקציב ותזרים קבוע (Expected)</CardTitle>
                                <CardDescription>מעקב אחר משכורות יציבות, תשלומי שכירות, ארנונה והוצאות קשיחות. אלגוריתם ה-AI מחבר תנועות עו״ש ישירות לכאן.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-0 pt-0 sm:pt-0">
                                <RecurringFlowsTable flows={flows} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="income" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>הכנסות</CardTitle>
                                <CardDescription>מעקב וסיווג אוטומטי של תנועות הכנסה בעו״ש.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={incomes} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="insurances" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>ביטוחים</CardTitle>
                                <CardDescription>ביטוחי בריאות, רכב, דירה וחיים.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={insuranceExpenses} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="utilities" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>חשבונות (Utilities)</CardTitle>
                                <CardDescription>תשלומי מים, חשמל, גז וארנונה.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={utilitiesExpenses} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="supermarket" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>סופרמרקט</CardTitle>
                                <CardDescription>הוצאות מזון ומוצרי צריכה בסיסיים.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={supermarketExpenses} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="hobbies" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>חוגים ופנאי</CardTitle>
                                <CardDescription>מעקב הוצאות ספורט וחוגי ילדים.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={hobbiesExpenses} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="entertainment" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>בילויים ומסעדות</CardTitle>
                                <CardDescription>מעקב הוצאות בילויים, מסעדות וברים.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={entertainmentExpenses} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="vacation" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>חופשות</CardTitle>
                                <CardDescription>סיווג הוצאות לטיולים ומעקב מול התקציב שהוגדר ב׳תכנון׳.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={vacationExpenses} />
                            </CardContent>
                        </Card>
                    </TabsContent>


                    {/* AI Engine Tab with specific UI */}
                    <TabsContent value="ai_engine" className="m-0">
                        <ExpenseUploader categories={dbCategories} accounts={dbAccounts} />
                    </TabsContent>

                </div>
            </Tabs>

        </div>
    )
}
