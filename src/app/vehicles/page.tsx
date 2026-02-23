import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus, Car as CarIcon, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { AddCarAssetDialog } from "@/components/household/AddCarAssetDialog"
import { Database } from "@/types/database.types"

type AssetRow = Database['public']['Tables']['assets']['Row']
type ReminderRow = Database['public']['Tables']['reminders']['Row']

function CarsTable({ cars, reminders }: { cars: AssetRow[], reminders: ReminderRow[] }) {
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
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {cars.map(car => {
                            const metadata = (car.metadata || {}) as { license_plate?: string; year?: string }
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
            </div>

            {/* Mobile View */}
            <div className="md:hidden flex flex-col space-y-3 p-4 pt-2">
                {cars.map(car => {
                    const metadata = (car.metadata || {}) as { license_plate?: string; year?: string }
                    return (
                        <div key={car.id} className="flex flex-col space-y-2 p-4 rounded-xl border border-blue-100 bg-white shadow-sm dark:border-blue-900/30 dark:bg-zinc-950">
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
                        </div>
                    )
                })}
            </div>

            {/* Display relevant reminders */}
            {reminders && reminders.length > 0 && (
                <div className="px-4 md:px-6 pb-6">
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

export default async function VehiclesPage() {
    const supabase = await createClient()

    // 1. Fetch Car Assets
    const { data: assetsData } = await supabase
        .from('assets')
        .select('*')
        .eq('type', 'vehicle')
        .order('created_at', { ascending: false })
    const cars = (assetsData as AssetRow[]) || []

    // 2. Fetch Car alerts (tests / insurance)
    const { data: remindersData } = await supabase
        .from('reminders')
        .select('*')
        .in('type', ['car_test', 'insurance'])
        .eq('is_completed', false)
        .order('due_date', { ascending: true })
    const notifications = (remindersData as ReminderRow[]) || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <CarIcon className="h-8 w-8 text-zinc-400" />
                    ניהול צי רכבים
                </h2>
                <div className="flex gap-2">
                    <AddCarAssetDialog />
                </div>
            </div>

            <Tabs defaultValue="cars" className="w-full mt-4" dir="rtl">
                <TabsList className="mb-4">
                    <TabsTrigger value="cars">רכבים פעילים</TabsTrigger>
                    <TabsTrigger value="maintenance">טיפולים ותחזוקה</TabsTrigger>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>יומן תחזוקה וטיפולים</CardTitle>
                            <CardDescription>מעקב אחרי זמני טיפול, החלפת מצבר, וצמיגים מיועד להיבנות כאן.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                            רכיב היסטוריית טיפולים יפותח בהמשך.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
