"use client"

import { useState } from "react"
import { StatementUploadEngine, ParsedTransactionRow } from "@/components/finance/StatementUploadEngine"
import { ReviewTransactionsTable, ClassifiedTransactionRow } from "@/components/finance/ReviewTransactionsTable"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function ExpenseUploader({ categories }: { categories: { id: string, name_he: string }[] }) {
    const [isClassifying, setIsClassifying] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [classifiedRows, setClassifiedRows] = useState<ClassifiedTransactionRow[] | null>(null)
    const [activeAssets, setActiveAssets] = useState<{ id: string, name: string }[]>([])
    const supabase = createClient()

    useEffect(() => {
        const fetchAssets = async () => {
            const { data } = await supabase
                .from('assets')
                .select('id, name')
                .eq('status', 'active')
            if (data) setActiveAssets(data)
        }
        fetchAssets()
    }, [supabase])

    const handleUploadComplete = async (data: ParsedTransactionRow[]) => {
        setIsClassifying(true)
        try {
            const res = await fetch("/api/classify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            })

            if (!res.ok) throw new Error("Classification failed")

            const payload = await res.json()
            setClassifiedRows(payload.results || [])
        } catch (err) {
            console.error(err)
            alert("אירעה שגיאה בשרת הסיווג (API Error).")
        } finally {
            setIsClassifying(false)
        }
    }

    const handleReset = () => {
        setClassifiedRows(null)
    }

    const handleConfirm = async (finalRows: ClassifiedTransactionRow[]) => {
        setIsSubmitting(true)
        try {
            const res = await fetch("/api/transactions/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalRows)
            })

            if (!res.ok) throw new Error("Failed to save transactions")

            alert("תנועות נשמרו בהצלחה במסד הנתונים!")
            handleReset()
            // In a real app we'd trigger a router.refresh() here so the UI tables see the new data
        } catch (error) {
            console.error(error)
            alert("שגיאה בשמירת התנועות לרשומות הבסיס.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            {!classifiedRows ? (
                <div className="relative">
                    <StatementUploadEngine onUploadComplete={handleUploadComplete} />
                    {isClassifying && (
                        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl border border-indigo-200 dark:border-indigo-800">
                            <div className="bg-white dark:bg-zinc-900 shadow-lg px-8 py-6 rounded-2xl flex flex-col items-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <h3 className="font-semibold text-lg">המנוע החכם סורק את התנועות...</h3>
                                <p className="text-sm text-muted-foreground mt-1">מצליב נתונים מול בסיס הנתונים ו-AI</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <ReviewTransactionsTable
                    rows={classifiedRows}
                    categories={categories}
                    activeAssets={activeAssets}
                    onConfirm={handleConfirm}
                    onCancel={handleReset}
                    isSubmitting={isSubmitting}
                />
            )}
        </div>
    )
}
