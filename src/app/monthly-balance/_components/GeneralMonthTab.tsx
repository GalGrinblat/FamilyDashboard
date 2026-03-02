"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getMonthlyBalanceData } from "../actions"
import { Database } from "@/types/database.types"

type RecurringFlow = Database["public"]["Tables"]["recurring_flows"]["Row"]

export function GeneralMonthTab() {
    const [isLoading, setIsLoading] = useState(true)
    const [recurringFlows, setRecurringFlows] = useState<RecurringFlow[]>([])

    useEffect(() => {
        let isMounted = true
        setIsLoading(true)

        // We just need the active recurring flows for the 'General' view.
        // We pass the current month just to satisfy the function signature, 
        // though we only care about `recurringFlows` from the result.
        const now = new Date()
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        getMonthlyBalanceData(monthStart, monthEnd)
            .then((res) => {
                if (isMounted) {
                    setRecurringFlows(res.recurringFlows as any)
                    setIsLoading(false)
                }
            })
            .catch(console.error)

        return () => { isMounted = false }
    }, [])

    const incomes = recurringFlows.filter(f => f.type === 'income')
    const expenses = recurringFlows.filter(f => f.type === 'expense')

    const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0)
    const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0)

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>הכנסות שוטפות</CardTitle>
                        <CardDescription>משכורות, קצבאות והכנסות קבועות</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">טוען נתונים...</p>
                        ) : incomes.length === 0 ? (
                            <p className="text-sm text-muted-foreground">לא נמצאו הכנסות קבועות.</p>
                        ) : (
                            <div className="space-y-4">
                                {incomes.map(inc => (
                                    <div key={inc.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                                        <span>{inc.name}</span>
                                        <span className="font-bold text-emerald-600">₪{Number(inc.amount).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center font-bold pt-2 mt-2">
                                    <span>סה״כ הכנסות</span>
                                    <span className="text-emerald-600">₪{totalIncome.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>הוצאות ותקציב לפי תחומים</CardTitle>
                        <CardDescription>דיור, תחבורה, מחייה וכדומה</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <p className="text-sm text-muted-foreground">טוען נתונים...</p>
                        ) : expenses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">לא נמצאו הוצאות קבועות.</p>
                        ) : (
                            <div className="space-y-4">
                                {expenses.map(exp => (
                                    <div key={exp.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                                        <span>{exp.name} {exp.frequency !== 'monthly' ? `(${exp.frequency})` : ''}</span>
                                        <span className="font-bold text-red-600">₪{Number(exp.amount).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center font-bold pt-2 mt-2">
                                    <span>סה״כ הוצאות/תקציב</span>
                                    <span className="text-red-600">₪{totalExpense.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
