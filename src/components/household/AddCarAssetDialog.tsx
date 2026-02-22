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

export function AddCarAssetDialog({ triggerButton }: { triggerButton?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form State
    const [name, setName] = useState("")
    const [estimatedValue, setEstimatedValue] = useState("")
    const [licensePlate, setLicensePlate] = useState("")
    const [year, setYear] = useState("")


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name,
            type: 'vehicle',
            estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
            metadata: {
                license_plate: licensePlate,
                year: year
            }
        }

        const { error } = await supabase.from("assets").insert(payload as any)

        setLoading(false)

        if (error) {
            console.error("Error inserting car asset:", error)
            alert("שגיאה בהוספת הרכב")
        } else {
            setOpen(false)
            // Reset form
            setName("")
            setEstimatedValue("")
            setLicensePlate("")
            setYear("")
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
                        הוסף רכב
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>הוספת רכב חדש (נכס)</DialogTitle>
                    <DialogDescription>
                        הזן את פרטי הרכב. רכבים מנוהלים כנכסים שמשפיעים על השווי הנקי (Net Worth) של המשפחה.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            שם הרכב
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="למשל: מאזדה 3 שחורה"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="license" className="text-right">
                            מספר רישוי
                        </Label>
                        <Input
                            id="license"
                            value={licensePlate}
                            onChange={(e) => setLicensePlate(e.target.value)}
                            className="col-span-3"
                            placeholder="123-45-678"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="year" className="text-right">
                            שנת עלייה לכביש
                        </Label>
                        <Input
                            id="year"
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="col-span-3"
                            placeholder="2020"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">
                            שווי נוכחי מוערך
                        </Label>
                        <Input
                            id="value"
                            type="number"
                            value={estimatedValue}
                            onChange={(e) => setEstimatedValue(e.target.value)}
                            className="col-span-3"
                            placeholder="₪"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "שומר..." : "הוסף רכב כנכס"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
