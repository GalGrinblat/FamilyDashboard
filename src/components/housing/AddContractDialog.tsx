"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Pencil } from "lucide-react"

import { Database } from "@/types/database.types"
import { CATEGORY_DOMAINS, CATEGORY_TYPES } from "@/lib/constants"

type RecurringFlowRow = Database['public']['Tables']['recurring_flows']['Row']

interface AddContractDialogProps {
    triggerButton?: React.ReactNode
    contractToEdit?: RecurringFlowRow
}

export function AddContractDialog({ triggerButton, contractToEdit }: AddContractDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const isEditing = !!contractToEdit

    const [name, setName] = useState(contractToEdit?.name || "")
    const [amount, setAmount] = useState(contractToEdit?.amount?.toString() || "")
    const [endDate, setEndDate] = useState(contractToEdit?.end_date || "")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name,
            amount: parseFloat(amount),
            type: CATEGORY_TYPES.EXPENSE,
            frequency: 'monthly',
            domain: CATEGORY_DOMAINS.UTILITIES,
            end_date: endDate || null,
            is_active: true
        }

        let error;
        if (isEditing) {
            // @ts-expect-error: Supabase generic schema mapping
            const { error: updateError } = await supabase.from("recurring_flows").update(payload).eq('id', contractToEdit.id)
            error = updateError
        } else {
            // @ts-expect-error: Supabase generic schema mapping
            const { error: insertError } = await supabase.from("recurring_flows").insert(payload)
            error = insertError
        }

        setLoading(false)
        if (error) {
            console.error(error)
            alert(isEditing ? "שגיאה בעדכון" : "שגיאה בהוספה")
            return
        }

        setOpen(false)
        if (!isEditing) {
            setName("")
            setAmount("")
            setEndDate("")
        }
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button variant={isEditing ? "ghost" : "default"} size={isEditing ? "icon" : "default"}>
                        {isEditing ? <Pencil className="h-4 w-4" /> : <><Plus className="ml-2 h-4 w-4" /> ספק חדש</>}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'עריכת חוזה/ספק' : 'הוספת חוזה/ספק חדש'}</DialogTitle>
                    <DialogDescription>
                        הוסף הוצאה קבועה על שירותים כגון שכר דירה, חשמל, מים, אינטרנט וכו׳.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">ספק / שירות</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="למשל: ארנונה, פרטנר אינטרנט"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">עלות חודשית מוערכת</Label>
                        <Input
                            id="amount"
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="col-span-3"
                            placeholder="₪"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right text-xs">תאריך סיום חוזה (אופציונלי)</Label>
                        <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="col-span-3 text-left"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "שומר..." : isEditing ? "שמור פריט" : "הוסף ספק"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
