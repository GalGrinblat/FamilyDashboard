"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORY_TYPES, CATEGORY_DOMAINS, CATEGORY_DOMAIN_SHORT_LABELS, CategoryDomain } from "@/lib/constants"
import { Progress } from "@/components/ui/progress"

export function BudgetVsActual({ transactions, recurringFlows }: { transactions: any[], recurringFlows: any[] }) { // eslint-disable-line @typescript-eslint/no-explicit-any
    const data = useMemo(() => {
        const now = new Date()
        const currentMonthTransactions = transactions.filter(t => {
            const date = new Date(t.date)
            return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
        })

        const expenses = currentMonthTransactions.filter(t => {
            const catType = Array.isArray(t.categories) ? t.categories[0]?.type : t.categories?.type
            return catType === CATEGORY_TYPES.EXPENSE
        })

        const recurringExpenses = recurringFlows.filter(f => f.type === CATEGORY_TYPES.EXPENSE)

        // Group by Domain
        const domains = Object.values(CATEGORY_DOMAINS)
        const summary = domains.map(domain => {
            // Actual spent in domain
            const actual = expenses
                .filter(t => {
                    // Attempt to use merchant_mappings if available, otherwise fallback to categories
                    const merchantDomain = (t.merchant_mappings as any)?.category_domains?.name as string | undefined // eslint-disable-line @typescript-eslint/no-explicit-any
                    const categoryDomain = Array.isArray(t.categories) ? (t.categories as any[])[0]?.domain : (t.categories as any)?.domain // eslint-disable-line @typescript-eslint/no-explicit-any
                    const d = merchantDomain || categoryDomain

                    return d === domain || (!d && domain === CATEGORY_DOMAINS.GENERAL)
                })
                .reduce((sum, t) => sum + Math.abs(t.amount as number), 0)

            // Budget allocated to domain
            const budget = recurringExpenses
                .filter(f => f.domain === domain || (!f.domain && domain === CATEGORY_DOMAINS.GENERAL))
                .reduce((sum, f) => sum + f.amount, 0)

            return {
                domain,
                actual,
                budget,
                label: CATEGORY_DOMAIN_SHORT_LABELS[domain as CategoryDomain] || domain
            }
        }).filter(item => item.budget > 0 || item.actual > 0)
            .sort((a, b) => b.budget - a.budget)

        return summary
    }, [transactions, recurringFlows])

    if (data.length === 0) {
        return (
            <Card className="shadow-sm border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-8 text-center h-[350px]">
                <p className="text-muted-foreground">לא הוגדרו תזרימי הוצאה קבועים לשמש כתקציב.</p>
            </Card>
        )
    }

    return (
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle>תקציב מול ביצוע (חודש נוכחי)</CardTitle>
                <CardDescription>כמה הוצאת בפועל ביחס לתקציב שהוגדר בתזרים</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {data.map(item => {
                        // Calculate percentage, cap at 100 for proper progress bar rendering but allow logical overflow
                        const pct = item.budget > 0 ? (item.actual / item.budget) * 100 : 100
                        const isOverBudget = item.actual > item.budget

                        return (
                            <div key={item.domain} className="space-y-2">
                                <div className="flex justify-between items-end text-sm">
                                    <div className="font-semibold">{item.label}</div>
                                    <div className="flex gap-2">
                                        <span className={isOverBudget ? "text-rose-600 font-bold" : "text-emerald-600 font-medium"}>
                                            ₪{item.actual.toLocaleString()}
                                        </span>
                                        <span className="text-muted-foreground">מתוך ₪{(item.budget || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                                <Progress
                                    value={pct}
                                    className={`h-2 ${isOverBudget ? "[&>div]:bg-rose-500" : "[&>div]:bg-indigo-500"}`}
                                    max={100}
                                />
                                {isOverBudget && (
                                    <p className="text-[10px] text-rose-500 text-left">חרגת באזור זה ב-₪{(item.actual - item.budget).toLocaleString()}</p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
