import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Car as CarIcon, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AddHouseholdItemDialog } from "@/components/household/AddHouseholdItemDialog"
import { AddCarAssetDialog } from "@/components/household/AddCarAssetDialog"

function ItemsTable({ items }: { items: any[] }) {
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

function CarsTable({ cars, reminders }: { cars: any[], reminders: any[] }) {
    if (!cars || cars.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                <p>אין רכבים רשומים המנוהלים כנכסים במשפחה.</p>
                <AddCarAssetDialog triggerButton={
                    <Button variant="outline" className="mt-4">
                        <Plus className="ml-2 h-4 w-4" />
                        הוסף רכב
                    </Button>
                } />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <Table className="border-t border-zinc-100 dark:border-zinc-800">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-right">שם הרכב</TableHead>
                        <TableHead className="text-right">מספר רישוי</TableHead>
                        <TableHead className="text-right">שנתון</TableHead>
                        <TableHead className="text-right">שווי מוערך (₪)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {cars.map(car => {
                        const metadata = (car.metadata || {}) as any
                        return (
                            <TableRow key={car.id}>
                                <TableCell className="font-medium text-blue-600 dark:text-blue-400 font-semibold">{car.name}</TableCell>
                                <TableCell>{metadata.license_plate || '-'}</TableCell>
                                <TableCell>{metadata.year || '-'}</TableCell>
                                <TableCell className="font-medium">{car.estimated_value ? `₪${car.estimated_value.toLocaleString()}` : '-'}</TableCell>
                            </TableRow>
                        )
                    })}
                </TableBody>
            </Table>

            {/* Display relevant reminders */}
            {reminders && reminders.length > 0 && (
                <div className="px-6 pb-6">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-900 border-b pb-2 dark:text-zinc-100 dark:border-zinc-800">ראדאר התראות צי רכבים</h4>
                    <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                        {reminders.map(r => (
                            <div key={r.id} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                <div className={`p-2 rounded-full ${r.type === 'car_test' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                                    {r.type === 'car_test' ? <CarIcon className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{r.title}</p>
                                    <p className="text-xs text-muted-foreground">תאריך יעד: {new Date(r.due_date).toLocaleDateString("he-IL")}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default async function HouseholdPage() {
    const supabase = await createClient()

    // 1. Fetch household items
    const { data: householdData } = await supabase
        .from('household_items')
        .select('*')
        .order('created_at', { ascending: false })

    const items = householdData as any[] || []
    const appliances = items.filter(i => i.category === 'appliance')
    const furniture = items.filter(i => i.category === 'furniture')
    const electronics = items.filter(i => i.category === 'electronics')

    // 2. Fetch Car Assets
    const { data: assetsData } = await supabase
        .from('assets')
        .select('*')
        .eq('type', 'vehicle')
        .order('created_at', { ascending: false })
    const cars = assetsData as any[] || []

    // 3. Fetch Car alerts (tests / insurance)
    const { data: remindersData } = await supabase
        .from('reminders')
        .select('*')
        .in('type', ['car_test', 'insurance'])
        .eq('is_completed', false)
        .order('due_date', { ascending: true })
    const notifications = remindersData as any[] || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">משק בית ציוד ורכבים</h2>
                <div className="flex gap-2">
                    <AddHouseholdItemDialog />
                    <AddCarAssetDialog />
                </div>
            </div>

            <Tabs defaultValue="cars" className="w-full mt-4" dir="rtl">

                <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
                    <TabsTrigger value="cars" className="bg-blue-50/50 data-[state=active]:bg-blue-100 dark:bg-blue-900/20 dark:data-[state=active]:bg-blue-900/40">רכבים (Cars)</TabsTrigger>
                    <TabsTrigger value="appliances">מכשירי חשמל (Appliances)</TabsTrigger>
                    <TabsTrigger value="furniture">ריהוט (Furniture)</TabsTrigger>
                    <TabsTrigger value="electronics">אלקטרוניקה (Electronics)</TabsTrigger>
                </TabsList>

                <div className="mt-4">

                    <TabsContent value="cars" className="m-0">
                        <Card className="border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden">
                            <CardHeader className="bg-blue-50/30 dark:bg-blue-900/10">
                                <CardTitle className="text-blue-800 dark:text-blue-300">צי רכבים (ניהול נכסים)</CardTitle>
                                <CardDescription>מעקב אחר ערך הרכבים, חיפושים וטסטים, ביטוחים והוצאות משוערות.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-0 pt-0 sm:pt-0">
                                <CarsTable cars={cars} reminders={notifications} />
                            </CardContent>
                        </Card>
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

                </div>
            </Tabs>

        </div>
    )
}
