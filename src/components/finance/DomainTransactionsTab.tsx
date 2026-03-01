import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TabsContent } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/server"
import { TransactionsTable, TransactionWithCategory } from "@/components/finance/TransactionsTable"

interface DomainTransactionsTabProps {
    domain: string
    tabValue?: string
    title: string
    description: string
}

export async function DomainTransactionsTab({
    domain,
    tabValue = "transactions",
    title,
    description
}: DomainTransactionsTabProps) {
    const supabase = await createClient()

    const { data: rawTransactions } = await supabase
        .from('transactions')
        .select(`
            id, amount, date, description, merchant, account_id,
            categories!inner ( name_he, name_en, type, domain )
        `)
        .eq('categories.domain', domain)
        .order('date', { ascending: false })

    const transactions = rawTransactions as unknown as TransactionWithCategory[] || []

    return (
        <TabsContent value={tabValue} className="m-0">
            <Card className="border-indigo-100 dark:border-indigo-900 shadow-sm overflow-hidden">
                <CardHeader className="bg-indigo-50/30 dark:bg-indigo-900/10">
                    <CardTitle className="text-indigo-800 dark:text-indigo-300">{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                    <TransactionsTable transactions={transactions} />
                </CardContent>
            </Card>
        </TabsContent>
    )
}
