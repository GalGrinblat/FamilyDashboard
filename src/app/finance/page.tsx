import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { TransactionsTable } from "@/components/finance/TransactionsTable"
import { ExpenseUploader } from "@/components/finance/ExpenseUploader"

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

    const transactions = rawTransactions as any[] || []

    // Map categories to Tabs visually. For a real app, we would map `categories.parent_id` to these buckets.
    // Here we'll do a simple mock filter based on existence of data to feed the tables.
    const incomes = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.type : t.categories?.type) === 'income')
    const generalExpenses = transactions.filter(t => (Array.isArray(t.categories) ? t.categories[0]?.type : t.categories?.type) === 'expense')

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">פיננסים</h2>
            </div>

            <Tabs defaultValue="income" className="w-full mt-4" dir="rtl">

                <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
                    <TabsTrigger value="income">הכנסות</TabsTrigger>
                    <TabsTrigger value="assets">נכסים והשקעות</TabsTrigger>
                    <TabsTrigger value="housing">מגורים</TabsTrigger>
                    <TabsTrigger value="health">בריאות</TabsTrigger>
                    <TabsTrigger value="car">רכב</TabsTrigger>
                    <TabsTrigger value="sports">ספורט וחוגים</TabsTrigger>
                    <TabsTrigger value="supermarket">סופרמרקט</TabsTrigger>
                    <TabsTrigger value="vacation">חופשות</TabsTrigger>
                    <TabsTrigger value="payments">ניהול תשלומים</TabsTrigger>
                    <TabsTrigger value="ai_engine" className="bg-zinc-200 dark:bg-zinc-700">מנוע הוצאות (AI)</TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    <TabsContent value="income" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>הכנסות</CardTitle>
                                <CardDescription>מעקב אחר משכורות, הכנסות משכר דירה, וקצבאות.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={incomes} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="assets" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>נכסים והשקעות</CardTitle>
                                <CardDescription>תיק מניות, קריפטו, וסטטוס נדל״ן.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                                מעקב שווי נקי ונכסים. משיכת API ממערכות סחר חיצוניות.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="housing" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>מגורים</CardTitle>
                                <CardDescription>שכירות/משכנתא, חשמל, מים, ארנונה, אינטרנט ותמי4.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                {/* Normally we would filter by 'housing' related category IDs here */}
                                <TransactionsTable transactions={generalExpenses} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="health" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>בריאות</CardTitle>
                                <CardDescription>ביטוחי בריאות, קופת חולים, וביטוחי חיים.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={[]} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="car" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>רכב</CardTitle>
                                <CardDescription>דלק, טסט לרכב, ביטוח, טיפולים וחניה.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={[]} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="sports" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>ספורט וחוגים</CardTitle>
                                <CardDescription>מעקב הוצאות באולינג, חוגי ילדים ופנאי.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={[]} />
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
                                <TransactionsTable transactions={[]} />
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
                                <TransactionsTable transactions={[]} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>ניהול תשלומים</CardTitle>
                                <CardDescription>פירוט תנועות מיפוי מולטי-בנק וכרטיסי אשראי.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TransactionsTable transactions={transactions} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Engine Tab with specific UI */}
                    <TabsContent value="ai_engine" className="m-0">
                        <ExpenseUploader />
                    </TabsContent>

                </div>
            </Tabs>

        </div>
    )
}
