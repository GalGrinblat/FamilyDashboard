"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ParsedTransactionRow } from "./StatementUploadEngine"
import { CheckCircle2, Loader2, PlusCircle } from "lucide-react"
import { CATEGORY_TYPES, CategoryType } from "@/lib/constants"

export interface ClassifiedTransactionRow extends ParsedTransactionRow {
    suggested_category_id: string | null
    is_ai_classified: boolean
    suggested_new_category?: { name_he: string; name_en: string; type: string } | null
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

    // Dialog State
    const [customCategoryDialogIndex, setCustomCategoryDialogIndex] = useState<number | null>(null)
    const [newCategoryName, setNewCategoryName] = useState("")
    const [newCategoryType, setNewCategoryType] = useState<CategoryType>(CATEGORY_TYPES.EXPENSE)

    const handleCategoryChange = (index: number, newCategoryId: string) => {
        if (newCategoryId === "CREATE_CUSTOM") {
            setCustomCategoryDialogIndex(index)
            setNewCategoryName("")
            setNewCategoryType(reviewedRows[index].amount < 0 ? CATEGORY_TYPES.EXPENSE : CATEGORY_TYPES.INCOME)
            return
        }

        const updatedRows = [...reviewedRows]
        // If they select an existing category, it's an override unless they select the "NEW" option itself (which has value="NEW")
        updatedRows[index] = {
            ...updatedRows[index],
            suggested_category_id: newCategoryId === "NEW" || newCategoryId.startsWith("CUSTOM_") ? null : newCategoryId,
            // If they manually fix it, we consider it a user override (not AI anymore)
            is_ai_classified: false,
            // If they changed to an existing category, remove the new suggestion so it doesn't get created
            suggested_new_category: newCategoryId === "NEW" || newCategoryId.startsWith("CUSTOM_") ? updatedRows[index].suggested_new_category : null
        }
        setReviewedRows(updatedRows)
    }

    const handleCreateCustomCategory = () => {
        if (customCategoryDialogIndex === null || !newCategoryName.trim()) return

        const updatedRows = [...reviewedRows]
        updatedRows[customCategoryDialogIndex] = {
            ...updatedRows[customCategoryDialogIndex],
            suggested_category_id: null,
            is_ai_classified: false,
            suggested_new_category: {
                name_he: newCategoryName.trim(),
                name_en: "Custom", // Optional, backend will fallback to name_he if needed
                type: newCategoryType
            }
        }

        setReviewedRows(updatedRows)
        setCustomCategoryDialogIndex(null)
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
                        {reviewedRows.map((row, idx) => {
                            // Determine the selected value for the dropdown
                            let selectedValue = ""
                            if (row.suggested_category_id) {
                                selectedValue = row.suggested_category_id
                            } else if (row.suggested_new_category) {
                                // Differentiate between AI suggested NEW and User Custom NEW by checking logic or just re-using "NEW"
                                // We'll just use "CUSTOM_IDX" as a temporary identifier for the UI selected value so it displays correctly
                                selectedValue = `CUSTOM_${idx}`
                            }

                            return (
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
                                            className={`w-full text-sm border-0 bg-transparent ring-0 focus:ring-0 cursor-pointer ${row.suggested_new_category && !row.is_ai_classified ? 'text-purple-600 dark:text-purple-400 font-bold' :
                                                row.suggested_new_category ? 'text-indigo-600 dark:text-indigo-400 font-bold' :
                                                    row.suggested_category_id ? 'text-emerald-700 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-500 font-bold'
                                                }`}
                                            value={selectedValue}
                                            onChange={(e) => handleCategoryChange(idx, e.target.value)}
                                            dir="rtl"
                                        >
                                            <option value="" disabled>-- בחר קטגוריה --</option>
                                            <option value="CREATE_CUSTOM" className="text-purple-600 font-bold border-b pb-2">
                                                ＋ צור קטגוריה חדשה...
                                            </option>
                                            {row.suggested_new_category && (
                                                <option value={`CUSTOM_${idx}`} className={row.is_ai_classified ? "text-indigo-600 font-bold" : "text-purple-600 font-bold"}>
                                                    ★ {row.is_ai_classified ? "קטגוריה חדשה (AI)" : "מותאם אישית"}: {row.suggested_new_category.name_he}
                                                </option>
                                            )}
                                            {categories.map(cat => (
                                                <option key={cat.id} value={cat.id} className="text-zinc-900 dark:text-zinc-100">
                                                    {cat.name_he}
                                                </option>
                                            ))}
                                        </select>
                                        {row.suggested_new_category && !row.is_ai_classified && (
                                            <span className="text-[10px] text-purple-500 flex items-center gap-1 mt-1 font-medium">
                                                <PlusCircle className="w-3 h-3" />
                                                קטגוריה מותאמת אישית (תיווצר בשמירה)
                                            </span>
                                        )}
                                        {row.suggested_new_category && row.is_ai_classified && (
                                            <span className="text-[10px] text-indigo-500 flex items-center gap-1 mt-1 font-medium">
                                                ✨ בינה מלאכותית מציעה קטגוריה חדשה
                                            </span>
                                        )}
                                        {row.suggested_category_id && row.is_ai_classified && !row.suggested_new_category && (
                                            <span className="text-[10px] text-indigo-500 flex items-center gap-1 mt-1">
                                                ✨ סווג ע״י בינה מלאכותית
                                            </span>
                                        )}
                                        {row.suggested_category_id && !row.is_ai_classified && !row.suggested_new_category && (
                                            <span className="text-[10px] text-emerald-600 flex items-center gap-1 mt-1">
                                                ✓ סווג ע״י המשתמש או מערכת
                                            </span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>

            <Dialog open={customCategoryDialogIndex !== null} onOpenChange={(open) => !open && setCustomCategoryDialogIndex(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>יצירת קטגוריה חדשה</DialogTitle>
                        <DialogDescription>
                            הקטגוריה החדשה תתווסף לרשימת הקטגוריות שלך ותקושר לתנועה זו.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4 pr-1">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">שם הקטגוריה</label>
                            <Input
                                placeholder="לדוגמה: ביטוח בריאות, מסעדות, דלק..."
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleCreateCustomCategory()}
                                dir="rtl"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">סוג פעילות</label>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    type="button"
                                    variant={newCategoryType === CATEGORY_TYPES.EXPENSE ? "default" : "outline"}
                                    className={newCategoryType === CATEGORY_TYPES.EXPENSE ? "bg-red-500 hover:bg-red-600 border-transparent shadow-none" : "border-red-200 text-red-600 hover:bg-red-50"}
                                    onClick={() => setNewCategoryType(CATEGORY_TYPES.EXPENSE)}
                                >
                                    הוצאה
                                </Button>
                                <Button
                                    type="button"
                                    variant={newCategoryType === CATEGORY_TYPES.INCOME ? "default" : "outline"}
                                    className={newCategoryType === CATEGORY_TYPES.INCOME ? "bg-emerald-500 hover:bg-emerald-600 border-transparent shadow-none" : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"}
                                    onClick={() => setNewCategoryType(CATEGORY_TYPES.INCOME)}
                                >
                                    הכנסה
                                </Button>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 justify-end sm:justify-start">
                        <Button variant="outline" onClick={() => setCustomCategoryDialogIndex(null)}>ביטול</Button>
                        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={handleCreateCustomCategory} disabled={!newCategoryName.trim()}>אישור ויצירה</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </Card>
    )
}
