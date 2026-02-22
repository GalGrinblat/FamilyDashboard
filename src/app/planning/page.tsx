import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PlanningPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">תכנון</h2>
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
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                                לוח שנה וממשק תזכורות יופיעו כאן.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="vacation" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>תכנון חופשות</CardTitle>
                                <CardDescription>תכנון תקציב ותוכניות מסלול לחופשות עתידיות (למשל קיצביל 2026).</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                                ממשק ניהול ומעקב תקציבי לחופשות יופיע כאן.
                            </CardContent>
                        </Card>
                    </TabsContent>

                </div>
            </Tabs>

        </div>
    )
}
