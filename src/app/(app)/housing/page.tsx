import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Sofa } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AddHouseholdItemDialog } from "@/components/household/AddHouseholdItemDialog"
import { Database } from "@/types/database.types"
import { ContractsTab } from "@/components/housing/ContractsTab"
import { DomainTransactionsTab } from "@/components/finance/DomainTransactionsTab"
import { CATEGORY_DOMAINS } from "@/lib/constants"

type HouseholdItemRow = Database['public']['Tables']['household_items']['Row']

function ItemsTable({ items }: { items: HouseholdItemRow[] }) {
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                <p>אין פריטים להצגה בקטגוריה זו.</p>
                <AddHouseholdItemDialog triggerButton={
                    <Button variant="outline" className="mt-4">
                        <Plus className="ml-2 h-4 w-4" />
                        הוסף פריט חדש
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
                            <TableHead className="text-right">שם הפריט</TableHead>
                            <TableHead className="text-right">תאריך רכישה</TableHead>
                            <TableHead className="text-right">מחיר</TableHead>
                            <TableHead className="text-right">תום אחריות</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.map(item => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell>{item.purchase_date ? new Date(item.purchase_date).toLocaleDateString("he-IL") : '-'}</TableCell>
                                <TableCell>{item.purchase_price ? `₪${item.purchase_price.toLocaleString()}` : '-'}</TableCell>
                                <TableCell>{item.warranty_expiry ? new Date(item.warranty_expiry).toLocaleDateString("he-IL") : '-'}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex flex-col space-y-3 p-4 pt-2">
                {items.map(item => (
                    <div key={item.id} className="flex flex-col space-y-2 p-4 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                        <div className="flex justify-between items-start">
                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">{item.name}</span>
                            <span className="font-medium">{item.purchase_price ? `₪${item.purchase_price.toLocaleString()}` : '-'}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                            <div className="flex justify-between">
                                <span>תאריך רכישה:</span>
                                <span>{item.purchase_date ? new Date(item.purchase_date).toLocaleDateString("he-IL") : '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>תום אחריות:</span>
                                <span>{item.warranty_expiry ? new Date(item.warranty_expiry).toLocaleDateString("he-IL") : '-'}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default async function HousingPage() {
    const supabase = await createClient()

    // 1. Fetch household items
    const { data: householdData } = await supabase
        .from('household_items')
        .select('*')
        .order('created_at', { ascending: false })

    const items = (householdData as HouseholdItemRow[]) || []
    const appliances = items.filter(i => i.category === 'appliance')
    const furniture = items.filter(i => i.category === 'furniture')
    const electronics = items.filter(i => i.category === 'electronics')

    // 2. Fetch contracts
    const { data: rawContracts } = await supabase
        .from('recurring_flows')
        .select('*')
        .in('domain', ['housing', 'utilities'])
        .eq('type', 'expense')
        .order('name', { ascending: true })

    const contracts = (rawContracts as Database['public']['Tables']['recurring_flows']['Row'][]) || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <Sofa className="h-8 w-8 text-zinc-400" />
                    מגורים ומשק בית
                </h2>
                <div className="flex gap-2">
                    <AddHouseholdItemDialog />
                </div>
            </div>

            <Tabs defaultValue="utilities" className="w-full mt-4" dir="rtl">
                <TabsList className="mb-4">
                    <TabsTrigger value="utilities">חוזים ושירותים</TabsTrigger>
                    <TabsTrigger value="appliances">מכשירי חשמל</TabsTrigger>
                    <TabsTrigger value="furniture">ריהוט</TabsTrigger>
                    <TabsTrigger value="electronics">אלקטרוניקה</TabsTrigger>
                    <TabsTrigger value="transactions" className="bg-indigo-50 data-[state=active]:bg-indigo-100 dark:bg-indigo-900/20 dark:data-[state=active]:bg-indigo-900/40">תנועות והוצאות</TabsTrigger>
                </TabsList>

                <TabsContent value="utilities" className="space-y-4">
                    <ContractsTab contracts={contracts} />
                </TabsContent>

                <TabsContent value="appliances" className="m-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>מכשירי חשמל</CardTitle>
                            <CardDescription>מעקב אחר מקרר, מכונת כביסה, תנור ועוד.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                            <ItemsTable items={appliances} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="furniture" className="m-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>ריהוט</CardTitle>
                            <CardDescription>מעקב אחר ספות, מיטות, שולחנות וארונות.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                            <ItemsTable items={furniture} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="electronics" className="m-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>אלקטרוניקה</CardTitle>
                            <CardDescription>מחשבים, טלוויזיות, קונסולות וציוד נלווה.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                            <ItemsTable items={electronics} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <DomainTransactionsTab
                    domain={CATEGORY_DOMAINS.HOUSING}
                    title="תנועות בחשבון"
                    description="ריכוז הוצאות והכנסות תחת קטגוריות המשויכות למגורים (שכירות, ארנונה, חשמל וכו׳)."
                />

            </Tabs>
        </div>
    )
}
