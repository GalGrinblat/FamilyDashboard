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
import { Plus, Pencil } from "lucide-react"

import { Database } from "@/types/database.types"

type AssetRow = Database['public']['Tables']['assets']['Row']

interface AddEditAssetDialogProps {
    triggerButton?: React.ReactNode
    assetToEdit?: AssetRow
}

export function AddEditAssetDialog({ triggerButton, assetToEdit }: AddEditAssetDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const isEditing = !!assetToEdit

    const [name, setName] = useState(assetToEdit?.name || "")
    const [type, setType] = useState(assetToEdit?.type === 'vehicle' ? 'other' : (assetToEdit?.type || "stock"))
    const [estimatedValue, setEstimatedValue] = useState(assetToEdit?.estimated_value?.toString() || "")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const payload = {
            name,
            type,
            estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
            status: 'active'
        }

        let error;

        if (isEditing) {
            // @ts-expect-error: Supabase generic schema mapping
            const { error: updateError } = await supabase.from("assets").update(payload).eq('id', assetToEdit.id)
            error = updateError
        } else {
            // @ts-expect-error: Supabase generic schema mapping
            const { error: insertError } = await supabase.from("assets").insert(payload)
            error = insertError
        }

        setLoading(false)

        if (error) {
            console.error("Error saving asset:", error)
            alert(isEditing ? "שגיאה בעדכון הנכס" : "שגיאה בהוספת הנכס")
            return
        }

        setOpen(false)
        if (!isEditing) {
            setName("")
            setType("stock")
            setEstimatedValue("")
        }
        router.refresh()
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button variant={isEditing ? "ghost" : "default"} size={isEditing ? "icon" : "default"}>
                        {isEditing ? <Pencil className="h-4 w-4" /> : <><Plus className="ml-2 h-4 w-4" /> הוסף נכס</>}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'עריכת נכס' : 'הוספת נכס חדש'}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? 'עדכן את שווי הנכס או את סיווגו כדי לשמור על תמונת מצב עדכנית.' : 'הוסף מנייה, קרן, מטבע קריפטו או נדל״ן כדי לעקוב אחר השווי הכולל.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">שם הנכס</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="למשל: תיק השקעות IBI, דירה בחיפה"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">סוג</Label>
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="בחר סוג נכס" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="stock">מניות ושוק ההון</SelectItem>
                                <SelectItem value="crypto">מטבעות קריפטו</SelectItem>
                                <SelectItem value="real_estate">נדל״ן</SelectItem>
                                <SelectItem value="other">אחר</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="value" className="text-right">שווי מעודכן</Label>
                        <Input
                            id="value"
                            type="number"
                            value={estimatedValue}
                            onChange={(e) => setEstimatedValue(e.target.value)}
                            className="col-span-3"
                            placeholder="₪"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "שומר..." : isEditing ? "שמור פריט" : "הוסף נכס"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
