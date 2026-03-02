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
    const [registrationDate, setRegistrationDate] = useState("")
    const [insuranceEndDate, setInsuranceEndDate] = useState("")
    const [lastServiceDate, setLastServiceDate] = useState("")
    const [lastServiceKm, setLastServiceKm] = useState("")


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const productionYear = registrationDate ? new Date(registrationDate).getFullYear().toString() : "";

        const payload = {
            name,
            type: 'vehicle',
            estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
            metadata: {
                license_plate: licensePlate,
                year: productionYear,
                registration_date: registrationDate || null,
                insurance_end_date: insuranceEndDate || null,
                last_service_date: lastServiceDate || null,
                last_service_km: lastServiceKm ? parseInt(lastServiceKm) : null
            }
        }

        // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
        const { data: insertedAsset, error: assetError } = await supabase.from("assets").insert(payload).select().single()

        if (assetError || !insertedAsset) {
            console.error("Error inserting car asset:", assetError)
            alert("שגיאה בהוספת הרכב")
            setLoading(false)
            return
        }

        const assetId = (insertedAsset as any).id

        // Auto-generate reminders
        const remindersToInsert = []

        if (registrationDate) {
            const regDate = new Date(registrationDate)
            const today = new Date()
            let nextTest = new Date(today.getFullYear(), regDate.getMonth(), regDate.getDate())
            if (nextTest < today) {
                nextTest.setFullYear(today.getFullYear() + 1)
            }
            // 1 month prior
            nextTest.setMonth(nextTest.getMonth() - 1)
            remindersToInsert.push({
                title: `טסט שנתי: ${name}`,
                due_date: nextTest.toISOString().split('T')[0],
                type: 'car_test',
                asset_id: assetId
            })
        }

        if (insuranceEndDate) {
            const insDate = new Date(insuranceEndDate)
            // 1 month prior
            insDate.setMonth(insDate.getMonth() - 1)
            remindersToInsert.push({
                title: `חידוש ביטוח: ${name}`,
                due_date: insDate.toISOString().split('T')[0],
                type: 'insurance',
                asset_id: assetId
            })
        }

        const baseServiceDate = lastServiceDate ? new Date(lastServiceDate) : (registrationDate ? new Date(registrationDate) : null)
        if (baseServiceDate) {
            const nextService = new Date(baseServiceDate)
            nextService.setFullYear(nextService.getFullYear() + 1)
            nextService.setDate(nextService.getDate() - 7) // 1 week prior
            remindersToInsert.push({
                title: `טיפול תקופתי: ${name}`,
                due_date: nextService.toISOString().split('T')[0],
                type: 'maintenance',
                asset_id: assetId
            })
        }

        if (remindersToInsert.length > 0) {
            // @ts-expect-error: Supabase generic schema mapping forces never for bulk inserts
            const { error: remError } = await supabase.from("reminders").insert(remindersToInsert)
            if (remError) {
                console.error("Error inserting reminders:", remError)
            }
        }

        setLoading(false)

        setOpen(false)
        // Reset form
        setName("")
        setEstimatedValue("")
        setLicensePlate("")
        setRegistrationDate("")
        setInsuranceEndDate("")
        setLastServiceDate("")
        setLastServiceKm("")
        // Refresh the page data
        router.refresh()
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
                        <Label htmlFor="registrationDate" className="text-right whitespace-nowrap">
                            תאריך עלייה לכביש
                        </Label>
                        <Input
                            id="registrationDate"
                            type="date"
                            value={registrationDate}
                            onChange={(e) => setRegistrationDate(e.target.value)}
                            className="col-span-3 text-left"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="insuranceEndDate" className="text-right whitespace-nowrap">
                            תאריך תפוגת ביטוח
                        </Label>
                        <Input
                            id="insuranceEndDate"
                            type="date"
                            value={insuranceEndDate}
                            onChange={(e) => setInsuranceEndDate(e.target.value)}
                            className="col-span-3 text-left"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lastServiceDate" className="text-right whitespace-nowrap">
                            תאריך טיפול אחרון
                        </Label>
                        <Input
                            id="lastServiceDate"
                            type="date"
                            value={lastServiceDate}
                            onChange={(e) => setLastServiceDate(e.target.value)}
                            className="col-span-3 text-left"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="lastServiceKm" className="text-right whitespace-nowrap">
                            ק״מ בטיפול אחרון
                        </Label>
                        <Input
                            id="lastServiceKm"
                            type="number"
                            value={lastServiceKm}
                            onChange={(e) => setLastServiceKm(e.target.value)}
                            className="col-span-3"
                            placeholder="למשל: 45000"
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
