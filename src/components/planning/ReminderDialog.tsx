"use client"

import { useState, useEffect } from "react"
import { addReminderAction, updateReminderAction } from "@/app/(app)/planning/actions"
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
import { SYSTEM_REMINDER_TYPES } from "@/lib/constants"
import { Database } from "@/types/database.types"

type ReminderRow = Database['public']['Tables']['reminders']['Row']

export function ReminderDialog({
    triggerButton,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
    reminder,
    customTypes = []
}: {
    triggerButton?: React.ReactNode,
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
    reminder?: ReminderRow,
    customTypes?: string[]
}) {
    const isEditMode = !!reminder
    
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = setControlledOpen || setUncontrolledOpen

    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    // Form State
    const [title, setTitle] = useState(reminder?.title || "")
    const [type, setType] = useState(reminder?.type || "maintenance")
    const [dueDate, setDueDate] = useState(reminder?.due_date || "")
    const [startDate, setStartDate] = useState(reminder?.start_date || "")

    useEffect(() => {
        if (open) {
            setTitle(reminder?.title || "")
            setType(reminder?.type || "maintenance")
            setDueDate(reminder?.due_date || "")
            setStartDate(reminder?.start_date || "")
            setErrorMsg("")
        }
    }, [open, reminder])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setErrorMsg("")

        const formData = new FormData()
        formData.append("title", title)
        formData.append("type", type)
        formData.append("due_date", dueDate)
        if (startDate) formData.append("start_date", startDate)

        let result
        if (isEditMode) {
            result = await updateReminderAction(reminder.id, formData)
        } else {
            result = await addReminderAction(formData)
        }

        setLoading(false)

        if (result?.error) {
            setErrorMsg(result.error)
        } else {
            setOpen(false)
            if (!isEditMode) {
                // Reset form only if not controlled by edit mode
                setTitle("")
                setType("maintenance")
                setDueDate("")
                setStartDate("")
            }
        }
    }

    const allTypes = [
        ...SYSTEM_REMINDER_TYPES, 
        ...customTypes.map(t => ({ value: t, label: t }))
    ]

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {triggerButton && (
                <DialogTrigger asChild>
                    {triggerButton}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "עריכת תזכורת" : "הוספת תזכורת עיתית"}</DialogTitle>
                    <DialogDescription>
                        {isEditMode ? "עדכן את פרטי התזכורת." : "הזן משימה עם תאריך יעד שיופיע בלוח השנה."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            תיאור משימה
                        </Label>
                        <Input
                            id="title"
                            name="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="col-span-3"
                            placeholder="למשל: לחדש ביטוח רכב"
                            autoComplete="off"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                            סוג
                        </Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="col-span-3" id="type" dir="rtl">
                                <SelectValue placeholder="בחר סוג" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                {allTypes.map(t => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start_date" className="text-right leading-tight">
                            תאריך תזכורת (אופציונלי)
                        </Label>
                        <Input
                            id="start_date"
                            name="start_date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="col-span-3"
                            autoComplete="off"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="due_date" className="text-right">
                            תאריך יעד
                        </Label>
                        <Input
                            id="due_date"
                            name="due_date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="col-span-3"
                            autoComplete="off"
                            required
                        />
                    </div>
                    {errorMsg && (
                        <div className="text-sm font-medium text-destructive mt-2 text-right">
                            {errorMsg}
                        </div>
                    )}
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "שומר..." : isEditMode ? "שמור שינויים" : "שמור תזכורת"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
