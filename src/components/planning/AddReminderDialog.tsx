"use client"

import { useState, useEffect } from "react"
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

export function AddReminderDialog({
    triggerButton,
    forceOpen = false,
    onForceClose
}: {
    triggerButton?: React.ReactNode,
    forceOpen?: boolean,
    onForceClose?: () => void
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Sync external open state
    useEffect(() => {
        if (forceOpen) {
            setOpen(true)
        }
    }, [forceOpen])

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen)
        if (!newOpen && onForceClose) {
            onForceClose()
        }
    }

    // Form State
    const [title, setTitle] = useState("")
    const [type, setType] = useState("maintenance")
    const [dueDate, setDueDate] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            title,
            type,
            due_date: dueDate,
            is_completed: false
        }

        const { error } = await supabase.from("reminders").insert(payload as any)

        setLoading(false)

        if (error) {
            console.error("Error inserting reminder:", error)
            alert("שגיאה בהוספת התזכורת")
        } else {
            setOpen(false)
            if (onForceClose) onForceClose()
            // Reset form
            setTitle("")
            setType("maintenance")
            setDueDate("")
            // Refresh the page data
            router.refresh()
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button>
                        <Plus className="ml-2 h-4 w-4" />
                        תזכורת חדשה
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>הוספת תזכורת עיתית</DialogTitle>
                    <DialogDescription>
                        הזן משימה עם תאריך יעד שיופיע בלוח השנה.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            תיאור משימה
                        </Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            placeholder="למשל: לחדש ביטוח רכב"
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
                                <SelectItem value="maintenance">תחזוקה (Maintenance)</SelectItem>
                                <SelectItem value="car_test">טסט לרכב (Car Test)</SelectItem>
                                <SelectItem value="insurance">ביטוחים (Insurance)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="due_date" className="text-right">
                            תאריך יעד
                        </Label>
                        <Input
                            id="due_date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "שומר..." : "שמור תזכורת"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
