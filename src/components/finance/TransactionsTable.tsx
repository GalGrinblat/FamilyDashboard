import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function TransactionsTable({ transactions }: { transactions: any[] }) {
    if (!transactions || transactions.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                <p>אין נתונים להצגה.</p>
            </div>
        )
    }

    return (
        <Table className="border-t border-zinc-100 dark:border-zinc-800">
            <TableHeader>
                <TableRow>
                    <TableHead className="text-right w-[120px]">תאריך</TableHead>
                    <TableHead className="text-right">תיאור עסקה</TableHead>
                    <TableHead className="text-right w-[150px]">קטגוריה</TableHead>
                    <TableHead className="text-right w-[150px]">סכום</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {transactions.map(t => {
                    const catType = Array.isArray(t.categories) ? t.categories[0]?.type : t.categories?.type;
                    const catName = Array.isArray(t.categories) ? t.categories[0]?.name_he : t.categories?.name_he;
                    return (
                        <TableRow key={t.id}>
                            <TableCell>{t.date ? new Date(t.date).toLocaleDateString("he-IL") : '-'}</TableCell>
                            <TableCell className="font-medium">{t.description || t.merchant || '-'}</TableCell>
                            <TableCell>{catName || '-'}</TableCell>
                            <TableCell className={catType === 'expense' ? 'text-red-500 font-medium' : 'text-emerald-500 font-medium'}>
                                {catType === 'expense' ? '-' : '+'}{`₪${(t.amount || 0).toLocaleString()}`}
                            </TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
        </Table>
    )
}
