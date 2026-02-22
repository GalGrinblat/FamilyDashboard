"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud } from "lucide-react"

export default function FinancePage() {
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
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                                טבלת מעקב הכנסות תופיע כאן.
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
                                מעקב שווי נקי ונכסים.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ... other standard tabs ... */}
                    <TabsContent value="housing" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>מגורים</CardTitle>
                                <CardDescription>שכירות/משכנתא, חשמל, מים, ארנונה, אינטרנט ותמי4.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                                טבלת הוצאות מבוססות מגורים.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="health" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>בריאות</CardTitle>
                                <CardDescription>ביטוחי בריאות, קופת חולים, וביטוחי חיים.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                                מעקב תשלומים ותשלומי ביטוח חיים.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="car" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>רכב</CardTitle>
                                <CardDescription>דלק, טסט לרכב, ביטוח, טיפולים וחניה.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                                הוצאות רכב שוטפות.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* AI Engine Tab with specific UI */}
                    <TabsContent value="ai_engine" className="m-0">
                        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm">
                            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-t-xl pb-6">
                                <CardTitle className="text-indigo-700 dark:text-indigo-300">מנוע AI לסיווג הוצאות</CardTitle>
                                <CardDescription>
                                    העלה כאן קבצי Excel/CSV מהבנק או מאתר חברת האשראי לסיווג חכם של הוצאות.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/20 transition-colors hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40">
                                    <div className="bg-white dark:bg-zinc-900 p-4 rounded-full shadow-sm mb-4">
                                        <UploadCloud className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-1">גרור קובץ CSV לכאן</h3>
                                    <p className="text-sm text-muted-foreground mb-6">או בחר קובץ מהמחשב</p>

                                    <div className="flex items-center gap-2">
                                        <Input id="data-file" type="file" className="hidden" />
                                        <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900/50" onClick={() => document.getElementById('data-file')?.click()}>
                                            בחר קובץ
                                        </Button>
                                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                            התחל סיווג
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                </div>
            </Tabs>

        </div>
    )
}
