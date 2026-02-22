import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HouseholdPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">משק בית</h2>
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
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                                טבלת מעקב מכשירי חשמל תופיע כאן.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="furniture" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>ריהוט</CardTitle>
                                <CardDescription>מעקב אחר ספות, מיטות, שולחנות וארונות.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                                טבלת מעקב ריהוט תופיע כאן.
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="electronics" className="m-0">
                        <Card>
                            <CardHeader>
                                <CardTitle>אלקטרוניקה</CardTitle>
                                <CardDescription>מחשבים, טלוויזיות, קונסולות וציוד נלווה.</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 flex items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                                טבלת מעקב אלקטרוניקה תופיע כאן.
                            </CardContent>
                        </Card>
                    </TabsContent>

                </div>
            </Tabs>

        </div>
    )
}
