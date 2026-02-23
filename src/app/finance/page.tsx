import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Landmark, TrendingUp } from "lucide-react"

export default function FinancePage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                    <PieChart className="h-8 w-8 text-zinc-400" />
                    פיננסים ונכסים
                </h2>
            </div>

            <p className="text-muted-foreground mt-2 mb-6">
                ריכוז נכסים פיננסיים, הכנסות, קופות גמל והשקעות לטווח ארוך.
            </p>

            <Tabs defaultValue="income" className="w-full mt-4" dir="rtl">
                <TabsList className="mb-4">
                    <TabsTrigger value="income">מקורות הכנסה</TabsTrigger>
                    <TabsTrigger value="investments">השקעות</TabsTrigger>
                    <TabsTrigger value="pension">פנסיה וגמל</TabsTrigger>
                </TabsList>

                <TabsContent value="income" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Landmark className="h-5 w-5 text-emerald-500" />
                                מקורות הכנסה
                            </CardTitle>
                            <CardDescription>מעקב אחר משכורות, קצבאות, והכנסות פסיביות.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                            מודול הכנסות שוטפות ומרכז שליטה בשכר.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="investments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                                תיק השקעות ונכסים
                            </CardTitle>
                            <CardDescription>מניות, קריפטו, ונדל״ן.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                            ממשק ניטור אפיקי השקעה.
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="pension" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>פנסיה וגמל</CardTitle>
                            <CardDescription>קרנות פנסיה, השתלמות וחיסכון לטווח ארוך.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                            ריכוז חסכונות פנסיוניים.
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
