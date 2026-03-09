import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Car as CarIcon, ShieldCheck, Wrench } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AddCarAssetDialog } from "@/components/household/AddCarAssetDialog"
import { Database } from "@/types/database.types"
import { MaintenanceLog } from "@/components/transportation/MaintenanceLog"
import { DomainTransactionsTab } from "@/components/finance/DomainTransactionsTab"
import { CATEGORY_DOMAINS } from "@/lib/constants"

type AssetRow = Database['public']['Tables']['assets']['Row']
type ReminderRow = Database['public']['Tables']['reminders']['Row']

interface CarAssetWithCost extends AssetRow {
    total_spent: number
}

function CarsTable({ cars, reminders }: { cars: CarAssetWithCost[], reminders: ReminderRow[] }) {
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
            {/* Desktop View */}
            <div className="hidden md:block">
                <Table className="border-t border-zinc-100 dark:border-zinc-800">
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">שם הרכב</TableHead>
                            <TableHead className="text-right">מספר רישוי</TableHead>
                            <TableHead className="text-right">שנתון</TableHead>
                            <TableHead className="text-right">שווי מוערך (₪)</TableHead>
                            <TableHead className="text-right">השקעה מצטברת בהוצאות (₪)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cars.map(car => {
                            const metadata = (car.metadata || {}) as { license_plate?: string; year?: string }
                            return (
                                <AddCarAssetDialog
                                    key={car.id}
                                    assetToEdit={car}
                                    triggerButton={
                                        <TableRow className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                            <TableCell className="font-medium text-blue-600 dark:text-blue-400 font-semibold">{car.name}</TableCell>
                                            <TableCell>{metadata.license_plate || '-'}</TableCell>
                                            <TableCell>{metadata.year || '-'}</TableCell>
                                            <TableCell className="font-medium">{car.estimated_value ? `₪${car.estimated_value.toLocaleString()}` : '-'}</TableCell>
                                            <TableCell className="font-semibold text-rose-500">{car.total_spent > 0 ? `₪${car.total_spent.toLocaleString()}` : '₪0'}</TableCell>
                                        </TableRow>
                                    }
                                />
                            )
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex flex-col space-y-3 p-4 pt-2">
                {cars.map(car => {
                    const metadata = (car.metadata || {}) as { license_plate?: string; year?: string }
                    return (
                        <AddCarAssetDialog
                            key={car.id}
                            assetToEdit={car}
                            triggerButton={
                                <div className="flex flex-col space-y-2 p-4 rounded-xl border border-blue-100 bg-white shadow-sm dark:border-blue-900/30 dark:bg-zinc-950 cursor-pointer hover:border-blue-300 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <span className="font-semibold text-blue-700 dark:text-blue-400 text-lg">{car.name}</span>
                                        <span className="font-bold">{car.estimated_value ? `₪${car.estimated_value.toLocaleString()}` : '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-600 dark:text-zinc-400">
                                        <span className="flex items-center gap-1">
                                            <span className="font-medium text-zinc-500">מספר רישוי:</span> {metadata.license_plate || '-'}
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <span className="font-medium text-zinc-500">שנתון:</span> {metadata.year || '-'}
                                        </span>
                                    </div>
                                    <div className="pt-1 text-sm text-rose-500 dark:text-rose-400 font-medium">
                                        סך הוצאות מצטבר: {car.total_spent > 0 ? `₪${car.total_spent.toLocaleString()}` : '₪0'}
                                    </div>
                                </div>
                            }
                        />
                    )
                })}
            </div>

            {/* Display relevant reminders */}
            {
                reminders && reminders.length > 0 && (
                    <div className="px-4 md:px-6 pb-6">
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-zinc-900 border-b pb-2 dark:text-zinc-100 dark:border-zinc-800">ראדאר התראות צי רכבים</h4>
                        <div className="grid gap-2 grid-cols-1 md:grid-cols-2">
                            {reminders.map(r => (
                                <div key={r.id} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-900 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                    <div className={`p-2 rounded-full ${r.type === 'car_test' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : r.type === 'insurance' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                                        {r.type === 'car_test' ? <CarIcon className="w-4 h-4" /> : r.type === 'insurance' ? <ShieldCheck className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{r.title}</p>
                                        <p className="text-xs text-muted-foreground">תאריך יעד: {new Date(r.due_date).toLocaleDateString("he-IL")}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default async function TransportationPage() {
    const supabase = await createClient()

    // 1. Fetch active Car Assets exclusively
    const { data: assetsData } = await supabase
        .from('assets')
        .select(`
            *,
            transactions ( amount )
        `)
        .eq('type', 'vehicle')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

    // Process accumulated transactions
    const cars: CarAssetWithCost[] = (assetsData || []).map((car: any) => {
        const total = (car.transactions || []).reduce((sum: number, tx: any) => sum + (Number(tx.amount) || 0), 0)
        return {
            ...car,
            total_spent: total
        }
    })

    // 2. Fetch Car alerts (tests / insurance)
    const { data: remindersData } = await supabase
        .from('reminders')
        .select('*')
        .in('type', ['car_test', 'insurance', 'maintenance'])
        .eq('is_completed', false)
        .order('due_date', { ascending: true })
    const notifications = (remindersData as ReminderRow[]) || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <CarIcon className="h-8 w-8 text-zinc-400" />
                    תחבורה וניהול צי רכבים
                </h2>
                <div className="flex gap-2">
                    <AddCarAssetDialog />
                </div>
            </div>

            <Tabs defaultValue="cars" className="w-full mt-4" dir="rtl">
                <TabsList className="mb-4">
                    <TabsTrigger value="cars">רכבים פעילים</TabsTrigger>
                    <TabsTrigger value="maintenance">טיפולים ותחזוקה</TabsTrigger>
                    <TabsTrigger value="transactions" className="bg-indigo-50 data-[state=active]:bg-indigo-100 dark:bg-indigo-900/20 dark:data-[state=active]:bg-indigo-900/40">תנועות והוצאות</TabsTrigger>
                </TabsList>

                <TabsContent value="cars" className="m-0">
                    <Card className="border-blue-100 dark:border-blue-900 shadow-sm overflow-hidden">
                        <CardHeader className="bg-blue-50/30 dark:bg-blue-900/10">
                            <CardTitle className="text-blue-800 dark:text-blue-300">הנכסים המוטוריים במשפחה</CardTitle>
                            <CardDescription>מעקב אחר ערך הרכבים, חיפושים וטסטים.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0 sm:p-0 pt-0 sm:pt-0">
                            <CarsTable cars={cars} reminders={notifications} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-4">
                    <MaintenanceLog cars={cars} />
                </TabsContent>

                <DomainTransactionsTab
                    domain={CATEGORY_DOMAINS.TRANSPORTATION}
                    title="תנועות והוצאות תחבורה ורכבים"
                    description="ריכוז הוצאות והכנסות תחת קטגוריות המשויכות לחניה, דלק, תחבורה ציבורית, טיפולים וביטוחים רכובים."
                />
            </Tabs>
        </div>
    )
}
