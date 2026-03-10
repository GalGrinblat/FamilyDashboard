"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Database } from "@/types/database.types"
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

export function AddEditPolicyDialog({
    triggerButton,
    defaultType = "health",
    policyToEdit,
}: {
    triggerButton?: React.ReactNode,
    defaultType?: "health" | "life" | "property" | "vehicle",
    policyToEdit?: Database['public']['Tables']['policies']['Row'],
}) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Form State
    const [name, setName] = useState(policyToEdit?.name || "")
    const [provider, setProvider] = useState(policyToEdit?.provider || "")
    const [type, setType] = useState<"health" | "life" | "property" | "vehicle">(policyToEdit?.type || defaultType)
    const [premiumAmount, setPremiumAmount] = useState(policyToEdit?.premium_amount?.toString() || "")
    const [premiumFrequency, setPremiumFrequency] = useState<"monthly" | "yearly">(policyToEdit?.premium_frequency || "monthly")
    const [renewalDate, setRenewalDate] = useState(policyToEdit?.renewal_date || "")
    const [policyNumber, setPolicyNumber] = useState(policyToEdit?.policy_number || "")
    const [assetId, setAssetId] = useState(policyToEdit?.asset_id || "none")
    const [file, setFile] = useState<File | null>(null)
    const [assets, setAssets] = useState<Database['public']['Tables']['assets']['Row'][]>([])

    const [prevOpen, setPrevOpen] = useState(open)
    const [prevPolicyToEdit, setPrevPolicyToEdit] = useState(policyToEdit)

    if (open !== prevOpen || policyToEdit !== prevPolicyToEdit) {
        setPrevOpen(open)
        setPrevPolicyToEdit(policyToEdit)

        if (open && policyToEdit) {
            setName(policyToEdit.name)
            setProvider(policyToEdit.provider)
            setType(policyToEdit.type as "health" | "life" | "property" | "vehicle")
            setPremiumAmount(policyToEdit.premium_amount.toString())
            setPremiumFrequency(policyToEdit.premium_frequency as "monthly" | "yearly")
            setRenewalDate(policyToEdit.renewal_date || "")
            setPolicyNumber(policyToEdit.policy_number || "")
            setAssetId(policyToEdit.asset_id || "none")
        } else if (open && !policyToEdit) {
            setName("")
            setProvider("")
            setType(defaultType)
            setPremiumAmount("")
            setPremiumFrequency("monthly")
            setRenewalDate("")
            setPolicyNumber("")
            setAssetId("none")
            setFile(null)
        }
    }

    // Fetch assets when the dialog opens
    useEffect(() => {
        if (open) {
            const fetchAssets = async () => {
                const { data } = await supabase.from('assets').select('id, name, type, metadata')
                if (data) {
                    setAssets(data)
                }
            }
            fetchAssets()
        }
    }, [open, supabase])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const uploadDocument = async () => {
        if (!file) return policyToEdit?.document_url || null

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${type}/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('policies_documents')
            .upload(filePath, file)

        if (uploadError) {
            console.error("Error uploading file:", uploadError)
            return null
        }

        const { data } = supabase.storage.from('policies_documents').getPublicUrl(filePath)
        return data.publicUrl
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        let documentUrl = policyToEdit?.document_url || null
        if (file) {
            documentUrl = await uploadDocument()
        }

        const payload = {
            name,
            provider,
            type,
            premium_amount: parseFloat(premiumAmount),
            premium_frequency: premiumFrequency,
            renewal_date: renewalDate || null,
            policy_number: policyNumber || null,
            document_url: documentUrl,
            asset_id: assetId === "none" ? null : assetId
        }

        if (policyToEdit) {
            // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
            const { error } = await supabase.from("policies").update(payload).eq('id', policyToEdit.id)
            if (error) {
                console.error("Error updating policy:", error)
                alert("שגיאה בעדכון הפוליסה")
            } else {
                setOpen(false)
                router.refresh()
            }
        } else {
            // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
            const { error } = await supabase.from("policies").insert(payload)
            if (error) {
                console.error("Error inserting policy:", error)
                alert("שגיאה בהוספת הפוליסה")
            } else {
                setOpen(false)
                router.refresh()
            }
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button>
                        <Plus className="ml-2 h-4 w-4" />
                        הוסף פוליסה
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader>
                    <DialogTitle>{policyToEdit ? "עריכת פוליסה" : "הוספת פוליסה חדשה"}</DialogTitle>
                    <DialogDescription>
                        הזן את נתוני הפוליסה לצורך בקרה מהירה.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right text-xs md:text-sm">סוג הפוליסה</Label>
                        <Select value={type} onValueChange={(v: "health" | "life" | "property" | "vehicle") => setType(v)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="בחר סוג" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="health">בריאות</SelectItem>
                                <SelectItem value="life">חיים / משכנתא</SelectItem>
                                <SelectItem value="property">מבנה ותכולה (דירה)</SelectItem>
                                <SelectItem value="vehicle">רכב (חובה / מקיף)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="provider" className="text-right text-xs md:text-sm">חברת ביטוח</Label>
                        <Input
                            id="provider"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="col-span-3"
                            placeholder="הראל, מנורה, מגדל..."
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-xs md:text-sm">שם פוליסה</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="ביטוח בריאות משפחתי מושלם"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="premiumAmount" className="text-right text-xs md:text-sm">עלות (₪)</Label>
                        <Input
                            id="premiumAmount"
                            type="number"
                            value={premiumAmount}
                            onChange={(e) => setPremiumAmount(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="premiumFrequency" className="text-right text-xs md:text-sm">תדירות תשלום</Label>
                        <Select value={premiumFrequency} onValueChange={(v: "monthly" | "yearly") => setPremiumFrequency(v)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="בחר" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value="monthly">חודשי</SelectItem>
                                <SelectItem value="yearly">שנתי</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="renewalDate" className="text-right text-xs md:text-sm">תאריך חידוש</Label>
                        <Input
                            id="renewalDate"
                            type="date"
                            value={renewalDate}
                            onChange={(e) => setRenewalDate(e.target.value)}
                            className="col-span-3"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="policyNumber" className="text-right text-xs md:text-sm">מספר פוליסה (אופציונלי)</Label>
                        <Input
                            id="policyNumber"
                            value={policyNumber}
                            onChange={(e) => setPolicyNumber(e.target.value)}
                            className="col-span-3 text-left"
                            dir="ltr"
                        />
                    </div>

                    {(type === "vehicle" || type === "property") && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="asset" className="text-right text-xs md:text-sm">שיוך לנכס (אופציונלי)</Label>
                            <Select value={assetId} onValueChange={(v: string) => setAssetId(v)}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="ללא שיוך" />
                                </SelectTrigger>
                                <SelectContent dir="rtl">
                                    <SelectItem value="none">ללא שיוך</SelectItem>
                                    {assets
                                        .filter(a => type === 'vehicle' ? a.type === 'vehicle' : (a.type === 'property' || a.type === 'real_estate'))
                                        .map(a => (
                                            <SelectItem key={a.id} value={a.id}>
                                                {(a.metadata as Record<string, unknown>)?.license_plate ? `(${(a.metadata as Record<string, unknown>).license_plate})` : ''}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="grid grid-cols-4 items-center gap-4 border-t pt-4">
                        <Label htmlFor="document" className="text-right text-xs md:text-sm">מסמך הפוליסה</Label>
                        <div className="col-span-3 space-y-2">
                            <Input
                                id="document"
                                type="file"
                                onChange={handleFileChange}
                                className="cursor-pointer file:bg-zinc-100 file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:text-sm"
                            />
                            {policyToEdit?.document_url && (
                                <a href={policyToEdit.document_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                    צפה במסמך קיים
                                </a>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "שומר..." : "שמור פוליסה"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
