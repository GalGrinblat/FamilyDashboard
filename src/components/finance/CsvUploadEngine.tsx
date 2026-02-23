"use client"

import { useState } from "react"
import Papa from "papaparse"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UploadCloud, FileType2, Loader2, CheckCircle2 } from "lucide-react"

export interface ParsedTransactionRow {
    date: string
    amount: number
    description: string
    reference_number?: string
    original_row_data: Record<string, unknown>
}

export function CsvUploadEngine({ onUploadComplete }: { onUploadComplete: (data: ParsedTransactionRow[]) => void }) {
    const [isDragging, setIsDragging] = useState(false)
    const [isParsing, setIsParsing] = useState(false)

    // Handle standard file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            parseCSV(file)
        }
    }

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file && file.type === "text/csv") {
            parseCSV(file)
        } else if (file && file.name.endsWith('.csv')) {
            // some OS environments don't map text/csv properly
            parseCSV(file)
        } else {
            alert("Please upload a valid CSV file (אנא העלה קובץ CSV תקין).")
        }
    }

    const parseCSV = (file: File) => {
        setIsParsing(true)

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                // Determine structure based on headers, mapping to our common format
                const rawRows = results.data as Record<string, unknown>[]

                // We'll refine this heuristic based on exact bank exports later
                const parsedData: ParsedTransactionRow[] = rawRows.map(row => {
                    // Primitive guessing logic - we can enhance this when we get user examples
                    const rowStr = JSON.stringify(row).toLowerCase()

                    // Try to find amount
                    let amountStr = "0"
                    for (const key of Object.keys(row)) {
                        const lKey = key.toLowerCase()
                        if (lKey.includes("סכום") || lKey.includes("amount") || lKey.includes("חיוב")) {
                            amountStr = String(row[key])
                            break
                        }
                    }

                    // Try to find date
                    let dateStr = new Date().toISOString()
                    for (const key of Object.keys(row)) {
                        const lKey = key.toLowerCase()
                        if (lKey.includes("תאריך") || lKey.includes("date")) {
                            dateStr = String(row[key])
                            // Just storing the raw string for now, we'll format it strictly later
                            break
                        }
                    }

                    // Try to find Description / Merchant
                    let descStr = "Unknown Transaction"
                    for (const key of Object.keys(row)) {
                        const lKey = key.toLowerCase()
                        if (lKey.includes("שם בית עסק") || lKey.includes("תיאור") || lKey.includes("merchant") || lKey.includes("description") || lKey.includes("פרטים")) {
                            descStr = String(row[key])
                            break
                        }
                    }

                    return {
                        date: dateStr,
                        amount: parseFloat(amountStr.replace(/[^0-9.-]/g, '')) || 0,
                        description: descStr,
                        original_row_data: row
                    }
                })

                setIsParsing(false)
                onUploadComplete(parsedData)
            },
            error: (error) => {
                console.error("Error parsing CSV:", error)
                alert("אירעה שגיאה בקריאת הקובץ.")
                setIsParsing(false)
            }
        })
    }

    return (
        <Card className="border-dashed border-2 bg-zinc-50 dark:bg-zinc-900/50">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">העלאת קובץ הוצאות (CSV)</CardTitle>
                <CardDescription>גרור קובץ אקסל/CSV מהבנק או חברת האשראי שלך</CardDescription>
            </CardHeader>
            <CardContent>
                <div
                    className={`relative flex flex-col items-center justify-center p-12 text-center rounded-lg border-2 border-dashed transition-colors cursor-pointer
                        ${isDragging ? 'border-primary bg-primary/5' : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'}
                    `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        accept=".csv"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        disabled={isParsing}
                    />

                    {isParsing ? (
                        <div className="flex flex-col items-center space-y-4">
                            <Loader2 className="w-12 h-12 text-primary animate-spin" />
                            <p className="text-sm font-medium">המערכת מנתחת את הנתונים...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center space-y-4">
                            <div className="p-4 rounded-full bg-primary/10 text-primary">
                                <UploadCloud className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-base font-medium">לחץ לבחירת קובץ או גרור לכאן</p>
                                <p className="text-sm text-muted-foreground">תומך בקבצי יצוא מבנקים וכרטיסי אשראי ישראלים</p>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
