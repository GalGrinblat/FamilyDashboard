"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ParsedTransactionRow } from "./CsvUploadEngine"
import { CheckCircle2, ChevronLeft, Loader2 } from "lucide-react"

export interface ClassifiedTransactionRow extends ParsedTransactionRow {
    suggested_category_id: string | null
    is_ai_classified: boolean
}

interface ReviewTransactionsTableProps {
    rows: ClassifiedTransactionRow[]
    categories: { id: string, name_he: string }[]
    onConfirm: (finalRows: ClassifiedTransactionRow[]) => void
    onCancel: () => void
    isSubmitting: boolean
}

export function ReviewTransactionsTable({ rows, categories, onConfirm, onCancel, isSubmitting }: ReviewTransactionsTableProps) {
    const [reviewedRows, setReviewedRows] = useState<ClassifiedTransactionRow[]>(rows)

    const handleCategoryChange = (index: number, newCategoryId: string) => {
        const updatedRows = [...reviewedRows]
        updatedRows[index] = {
            ...updatedRows[index],
            suggested_category_id: newCategoryId,
            // If they manually fix it, we consider it a user override (not AI anymore)
            is_ai_classified: false
        }
        setReviewedRows(updatedRows)
    }

    const handleConfirmAll = () => {
        onConfirm(reviewedRows)
    }

    return (
        <Card className="border-indigo-100 dark:border-indigo-900/50 shadow-sm">
            <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-t-xl pb-6 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-indigo-700 dark:text-indigo-300">אישור תנועות</CardTitle>
                    <CardDescription>
                        המערכת זיהתה {rows.length} תנועות. אנא ודא שהסיווג תקין לפני השמירה.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                        ביטול
                    </Button>
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleConfirmAll} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                        שמור {rows.length} תנועות למסד הנתונים
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="pt-0 p-0 overflow-x-auto">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                        <TableRow>
                            <TableHead className="text-right w-[120px]">תאריך</TableHead>
                            <TableHead className="text-right">תיאור / בית עסק</TableHead>
                            <TableHead className="text-right w-[150px]">סכום</TableHead>
                            <TableHead className="text-right w-[250px]">קטגוריה (סיווג חכם)</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {reviewedRows.map((row, idx) => (
                            <TableRow key={idx}>
                                <TableCell className="whitespace-nowrap">
                                    {row.date ? new Date(row.date).toLocaleDateString('he-IL') : '-'}
                                </TableCell>
                                <TableCell className="font-medium text-sm">
                                    {row.description}
                                </TableCell>
                                <TableCell className="font-bold text-sm">
                                    <span style={{ direction: 'ltr', display: 'inline-block' }}>₪{row.amount.toLocaleString()}</span>
                                </TableCell>
                                <TableCell>
                                    <select
                                        className={`w-full text-sm border-0 bg-transparent ring-0 focus:ring-0 cursor-pointer ${row.suggested_category_id ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-500 font-bold'
                                            }`}
                                        value={row.suggested_category_id || ""}
                                        onChange={(e) => handleCategoryChange(idx, e.target.value)}
                                        dir="rtl"
                                    >
                                        <option value="" disabled>-- בחר קטגוריה --</option>
                                        {categories.map(cat => (
                                            <option key={cat.id} value={cat.id} className="text-zinc-900 dark:text-zinc-100">
                                                {cat.name_he}
                                            </option>
                                        ))}
                                    </select>
                                    {row.suggested_category_id && row.is_ai_classified && (
                                        <span className="text-[10px] text-indigo-500 flex items-center gap-1 mt-1">
                                            ✨ סווג ע״י בינה מלאכותית
                                        </span>
                                    )}
                                    {row.suggested_category_id && !row.is_ai_classified && (
                                        <span className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
                                            ✓ סווג ע״י חוקיות ממיפוי קודם
                                        </span>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
