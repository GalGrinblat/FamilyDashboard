"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CATEGORY_TYPES } from "@/lib/constants"
import { format, subMonths } from "date-fns"
import { he } from "date-fns/locale"

interface Transaction {
    date: string;
    amount: number;
    categories: { type: string } | { type: string }[] | null;
}

export function CashFlowTrendChart({ transactions }: { transactions: Transaction[] }) {
    const data = useMemo(() => {
        // Generate last 6 months buckets
        const buckets: Record<string, { monthDate: Date, income: number, expense: number }> = {}
        const now = new Date()

        for (let i = 5; i >= 0; i--) {
            const d = subMonths(now, i)
            const key = `${d.getFullYear()}-${d.getMonth()}`
            buckets[key] = { monthDate: d, income: 0, expense: 0 }
        }

        transactions.forEach(t => {
            const d = new Date(t.date)
            const key = `${d.getFullYear()}-${d.getMonth()}`

            if (buckets[key]) {
                const catType = Array.isArray(t.categories) ? t.categories[0]?.type : t.categories?.type
                if (catType === CATEGORY_TYPES.INCOME) {
                    buckets[key].income += Math.abs(t.amount)
                } else if (catType === CATEGORY_TYPES.EXPENSE) {
                    buckets[key].expense += Math.abs(t.amount)
                }
            }
        })

        return Object.values(buckets).map(b => ({
            name: format(b.monthDate, 'MMM', { locale: he }),
            הכנסות: b.income,
            הוצאות: b.expense
        }))

    }, [transactions])

    return (
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
            <CardHeader>
                <CardTitle>מגמת תזרים מזומנים</CardTitle>
                <CardDescription>הכנסות מול הוצאות לאורך полחצי השנה האחרונה</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full" dir="ltr">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-zinc-800" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280' }} tickFormatter={(val) => `₪${val / 1000}k`} />
                            <Tooltip
                                formatter={(value: unknown) => [`₪${Number(value).toLocaleString()}`, "סכום"]}
                                cursor={{ fill: '#f3f4f6' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', textAlign: 'right' }}
                            />
                            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
                            <Bar dataKey="הכנסות" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            <Bar dataKey="הוצאות" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    )
}
