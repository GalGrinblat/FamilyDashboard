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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus } from "lucide-react"

export function AddRecurringFlowDialog({ triggerButton }: { triggerButton?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form State
    const [name, setName] = useState("")
    const [amount, setAmount] = useState("")
    const [type, setType] = useState("income")
    const [frequency, setFrequency] = useState("monthly")
    const [nextDate, setNextDate] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name,
            amount: parseFloat(amount),
            type,
            frequency,
            next_date: nextDate || null,
            is_active: true
        }

        const { error } = await supabase.from("recurring_flows").insert(payload as any)

        setLoading(false)

        if (error) {
            console.error("Error inserting recurring flow:", error)
            alert("שגיאה בהוספת תזרים קבוע")
        } else {
            setOpen(false)
            // Reset form
            setName("")
            setAmount("")
            setType("income")
            setFrequency("monthly")
            setNextDate("")
            // Refresh the page data
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button>
                        <Plus className="ml-2 h-4 w-4" />
                        הוסף תזרים קבוע
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>הוספת תזרים קבוע (Salary/Rent)</DialogTitle>
                    <DialogDescription>
                        הגדר הכנסה או הוצאה קבועה (כגון משכורת, שכר דירה, או ארנונה) לצורך תחזית ומעקב חריגות.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            שם התזרים
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="למשל: משכורת - גל"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            סוג
                        </Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="בחר סוג" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="income">הכנסה קבועה (+)</SelectItem>
                                <SelectItem value="expense">הוצאה קבועה (-)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">
                            סכום צפוי
                        </Label>
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
                        <Label htmlFor="freq" className="text-right">
                            תדירות
                        </Label>
                        <Select value={frequency} onValueChange={setFrequency}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="בחר תדירות" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="monthly">חודשי (Monthly)</SelectItem>
                                <SelectItem value="yearly">שנתי (Yearly)</SelectItem>
                                <SelectItem value="weekly">שבועי (Weekly)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="next_date" className="text-right">
                            תאריך חיוב קרוב
                        </Label>
                        <Input
                            id="next_date"
                            type="date"
                            value={nextDate}
                            onChange={(e) => setNextDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "שומר..." : "שמור תזרים"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
