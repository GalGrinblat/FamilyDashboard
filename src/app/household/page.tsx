import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

function ItemsTable({ items }: { items: any[] }) {
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                <p>אין פריטים להצגה בקטגוריה זו.</p>
                <Button variant="outline" className="mt-4">
                    <Plus className="ml-2 h-4 w-4" />
                    הוסף פריט חדש
                </Button>
            </div>
        )
    }

    return (
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
    )
}

export default async function HouseholdPage() {
    const supabase = await createClient()

    const { data } = await supabase
        .from('household_items')
        .select('*')
        .order('created_at', { ascending: false })

    const items = data as any[] || []

    // Split into categories
    const appliances = items.filter(i => i.category === 'appliance')
    const furniture = items.filter(i => i.category === 'furniture')
    const electronics = items.filter(i => i.category === 'electronics')

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">משק בית</h2>
                <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    הוסף פריט
                </Button>
            </div>

            <Tabs defaultValue="appliances" className="w-full mt-4" dir="rtl">

                <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
                    <TabsTrigger value="appliances">מכשירי חשמל (Appliances)</TabsTrigger>
                    <TabsTrigger value="furniture">ריהוט (Furniture)</TabsTrigger>
                    <TabsTrigger value="electronics">אלקטרוניקה (Electronics)</TabsTrigger>
                </TabsList>

                <div className="mt-4">
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

                </div>
            </Tabs>

        </div>
    )
}
