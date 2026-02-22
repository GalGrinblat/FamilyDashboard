"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadCloud } from "lucide-react"

export function ExpenseUploader() {
    return (
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
    )
}
