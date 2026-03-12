"use client"

import * as React from "react"
import { Plus, Home, Calendar, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ExpenseUploader } from "@/components/finance/ExpenseUploader"
import { HouseholdItemDialog } from "@/components/household/HouseholdItemDialog"
import { ReminderDialog } from "@/components/planning/ReminderDialog"

export function GlobalFAB({ categories, accounts }: { categories: { id: string, name_he: string, domain?: string }[], accounts: { id: string, name: string }[] }) {
    const [isExpenseOpen, setIsExpenseOpen] = React.useState(false)
    const [isHouseholdOpen, setIsHouseholdOpen] = React.useState(false)
    const [isReminderOpen, setIsReminderOpen] = React.useState(false)

    return (
        <>
            <div className="fixed bottom-20 left-4 z-50 md:hidden">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button size="icon" className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600 border-none">
                            <Plus className="h-6 w-6" />
                            <span className="sr-only">Add new</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                        <DropdownMenuLabel>הוסף חדש</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsExpenseOpen(true) }}>
                            <Wallet className="mr-2 h-4 w-4 ml-2" />
                            <span>הוצאה / העלאת קובץ בנק</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsHouseholdOpen(true) }}>
                            <Home className="mr-2 h-4 w-4 ml-2" />
                            <span>פריט משק בית (מוצר חשמלי)</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setIsReminderOpen(true) }}>
                            <Calendar className="mr-2 h-4 w-4 ml-2" />
                            <span>תזכורת (טסט / ביטוח)</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Hidden triggered dialogs */}
            {isExpenseOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white dark:bg-zinc-950 p-6 rounded-lg shadow-xl w-full max-w-md relative">
                        <button onClick={() => setIsExpenseOpen(false)} className="absolute top-4 left-4 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">X</button>
                        <h2 className="text-xl font-bold mb-4" dir="rtl">ייבוא הוצאות</h2>
                        <ExpenseUploader categories={categories} accounts={accounts} />
                    </div>
                </div>
            )}

            {/* Dialog wrappers */}
            {isHouseholdOpen && (
                <HouseholdItemDialog
                    triggerButton={<span className="hidden"></span>}
                    forceOpen={true}
                    onForceClose={() => setIsHouseholdOpen(false)}
                />
            )}

            {isReminderOpen && (
                <ReminderDialog
                    triggerButton={<span className="hidden"></span>}
                    open={true}
                    onOpenChange={(open) => {
                        if (!open) setIsReminderOpen(false)
                    }}
                />
            )}
        </>
    )
}
