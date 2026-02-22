import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

function RemindersTable({ items }: { items: any[] }) {
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                <p>אין תזכורות מתוכננות כרגע.</p>
                <Button variant="outline" className="mt-4">
                    <Plus className="ml-2 h-4 w-4" />
                    הוסף תזכורת
                </Button>
            </div>
        )
    }

    return (
        <Table className="border-t border-zinc-100 dark:border-zinc-800">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-right w-1/3">כותרת</TableHead>
                    <TableHead className="text-right">תאריך יעד</TableHead>
                    <TableHead className="text-right">סוג</TableHead>
                    <TableHead className="text-right w-[100px]">סטטוס</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>{item.due_date ? new Date(item.due_date).toLocaleDateString("he-IL") : '-'}</TableCell>
                        <TableCell>
                            {item.type === 'car_test' ? 'טסט לרכב' :
                                item.type === 'insurance' ? 'ביטוח' :
                                    item.type === 'maintenance' ? 'תחזוקה' : item.type}
                        </TableCell>
                        <TableCell>
                            {item.is_completed ?
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">הושלם</span> :
                                <span className="text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">ממתין</span>}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

function TripsTable({ items }: { items: any[] }) {
    if (!items || items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                <p>אין חופשות מתוכננות כרגע.</p>
                <Button variant="outline" className="mt-4">
                    <Plus className="ml-2 h-4 w-4" />
                    הוסף חופשה
                </Button>
            </div>
        )
    }

    return (
        <Table className="border-t border-zinc-100 dark:border-zinc-800">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-right w-1/3">יעד חופשה / שם</TableHead>
                    <TableHead className="text-right">תאריך התחלה</TableHead>
                    <TableHead className="text-right">תאריך סיום</TableHead>
                    <TableHead className="text-right">תקציב</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {items.map(item => (
                    <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.start_date ? new Date(item.start_date).toLocaleDateString("he-IL") : '-'}</TableCell>
                        <TableCell>{item.end_date ? new Date(item.end_date).toLocaleDateString("he-IL") : '-'}</TableCell>
                        <TableCell>{item.budget ? `₪${item.budget.toLocaleString()}` : '-'}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

export default async function PlanningPage() {
    const supabase = await createClient()

    // Fetch Reminders
    const { data: remindersData } = await supabase.from('reminders').select('*').order('due_date', { ascending: true })
    const reminders = remindersData as any[] || []

    // Fetch Trips
    const { data: tripsData } = await supabase.from('trips').select('*').order('start_date', { ascending: true })
    const trips = tripsData as any[] || []

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">תכנון</h2>
                <div className="flex gap-2">
                    <Button variant="outline">
                        <Plus className="ml-2 h-4 w-4" />
                        חופשה חדשה
                    </Button>
                    <Button>
                        <Plus className="ml-2 h-4 w-4" />
                        תזכורת חדשה
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="periodic" className="w-full mt-4" dir="rtl">

                <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
                    <TabsTrigger value="periodic">תכנון עיתי (Periodic)</TabsTrigger>
                    <TabsTrigger value="vacation">תכנון חופשות (Vacations)</TabsTrigger>
                </TabsList>

                <div className="mt-4">
                    <TabsContent value="periodic" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>תכנון עיתי</CardTitle>
                                <CardDescription>לוח שנה למעקב אחר חידושי ביטוח, טסטים לרכב, ותחזוקת הבית.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <RemindersTable items={reminders} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="vacation" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>תכנון חופשות</CardTitle>
                                <CardDescription>תכנון תקציב ותוכניות מסלול לחופשות עתידיות (למשל קיצביל 2026).</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                                <TripsTable items={trips} />
                            </CardContent>
                        </Card>
                    </TabsContent>

                </div>
            </Tabs>

        </div>
    )
}
