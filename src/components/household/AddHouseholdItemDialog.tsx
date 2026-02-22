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

export function AddHouseholdItemDialog({
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
    const [name, setName] = useState("")
    const [category, setCategory] = useState("appliance")
    const [purchasePrice, setPurchasePrice] = useState("")
    const [purchaseDate, setPurchaseDate] = useState("")
    const [warrantyExpiry, setWarrantyExpiry] = useState("")


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name,
            category,
            purchase_price: purchasePrice ? parseFloat(purchasePrice) : null,
            purchase_date: purchaseDate || null,
            warranty_expiry: warrantyExpiry || null,
        }

        const { error } = await supabase.from("household_items").insert(payload as any)

        setLoading(false)

        if (error) {
            console.error("Error inserting item:", error)
            alert("שגיאה בהוספת הפריט")
        } else {
            setOpen(false)
            if (onForceClose) onForceClose()
            // Reset form
            setName("")
            setCategory("appliance")
            setPurchasePrice("")
            setPurchaseDate("")
            setWarrantyExpiry("")
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
                        הוסף פריט
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>הוספת פריט חדש</DialogTitle>
                    <DialogDescription>
                        הזן את פרטי הפריט לרישום במעקב המשפחתי.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            שם הפריט
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            קטגוריה
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="בחר קטגוריה" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="appliance">מכשירי חשמל (Appliance)</SelectItem>
                                <SelectItem value="furniture">ריהוט (Furniture)</SelectItem>
                                <SelectItem value="electronics">אלקטרוניקה (Electronics)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            מחיר קנייה
                        </Label>
                        <Input
                            id="price"
                            type="number"
                            value={purchasePrice}
                            onChange={(e) => setPurchasePrice(e.target.value)}
                            className="col-span-3"
                            placeholder="₪"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="purchase_date" className="text-right">
                            תאריך רכישה
                        </Label>
                        <Input
                            id="purchase_date"
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="warranty" className="text-right">
                            תום אחריות
                        </Label>
                        <Input
                            id="warranty"
                            type="date"
                            value={warrantyExpiry}
                            onChange={(e) => setWarrantyExpiry(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "שומר..." : "שמור פריט"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
