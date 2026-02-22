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
import { Plus } from "lucide-react"

export function AddTripDialog({ triggerButton }: { triggerButton?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form State
    const [name, setName] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [budget, setBudget] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name,
            start_date: startDate || null,
            end_date: endDate || null,
            budget: budget ? parseFloat(budget) : null,
        }

        const { error } = await supabase.from("trips").insert(payload as any)

        setLoading(false)

        if (error) {
            console.error("Error inserting trip:", error)
            alert("שגיאה בהוספת החופשה")
        } else {
            setOpen(false)
            // Reset form
            setName("")
            setStartDate("")
            setEndDate("")
            setBudget("")
            // Refresh the page data
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button variant="outline">
                        <Plus className="ml-2 h-4 w-4" />
                        חופשה חדשה
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>תכנון חופשה חדשה</DialogTitle>
                    <DialogDescription>
                        פתח תיקיית מסע חדש למעקב אחר תקציב והוצאות.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trip_name" className="text-right">
                            שם החופשה
                        </Label>
                        <Input
                            id="trip_name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="למשל: סקי 2026"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start_date" className="text-right">
                            תאריך התחלה
                        </Label>
                        <Input
                            id="start_date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end_date" className="text-right">
                            תאריך חזרה
                        </Label>
                        <Input
                            id="end_date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="trip_budget" className="text-right">
                            תקציב משוער
                        </Label>
                        <Input
                            id="trip_budget"
                            type="number"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="col-span-3"
                            placeholder="₪"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "פותח תיק מסע..." : "צור חופשה"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
