"use client"

import { useState, useEffect } from "react"
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
import { addPolicyAction, updatePolicyAction } from "@/app/(app)/insurances/actions"
import { INSURANCE_SUBTYPES, INSURANCE_TYPES, InsuranceType } from "@/lib/constants"

type PolicyRow = Database['public']['Tables']['policies']['Row']

export function PolicyDialog({
    triggerButton,
    defaultType = "health",
    policy,
    open: controlledOpen,
    onOpenChange: setControlledOpen,
}: {
    triggerButton?: React.ReactNode,
    defaultType?: InsuranceType,
    policy?: PolicyRow,
    open?: boolean,
    onOpenChange?: (open: boolean) => void,
}) {
    const isEditMode = !!policy

    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
    const setOpen = setControlledOpen || setUncontrolledOpen

    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")
    const supabase = createClient()

    // Form State
    const [name, setName] = useState(policy?.name || "")
    const [provider, setProvider] = useState(policy?.provider || "")
    const [type, setType] = useState<InsuranceType>(policy?.type as InsuranceType || defaultType)
    const [subtype, setSubtype] = useState(policy?.subtype || "")
    const [premiumAmount, setPremiumAmount] = useState(policy?.premium_amount?.toString() || "")
    const [premiumFrequency, setPremiumFrequency] = useState<"monthly" | "yearly">(
        (policy?.premium_frequency as "monthly" | "yearly") || "monthly"
    )
    const [renewalDate, setRenewalDate] = useState(policy?.renewal_date || "")
    const [policyNumber, setPolicyNumber] = useState(policy?.policy_number || "")
    const [assetId, setAssetId] = useState(policy?.asset_id || "none")
    const [file, setFile] = useState<File | null>(null)
    const [assets, setAssets] = useState<Database['public']['Tables']['assets']['Row'][]>([])

    // Reset when dialog opens
    useEffect(() => {
        if (open) {
            setName(policy?.name || "")
            setProvider(policy?.provider || "")
            // If the database has 'life', fall back to 'health'
            const dbType = policy?.type === 'life' ? INSURANCE_TYPES.HEALTH : policy?.type;
            setType((dbType as InsuranceType) || defaultType)

            // Subtype reset logic. If editing, keep the existing one.
            // If creating, we'll reset it, but only once we have the options.
            setSubtype(policy?.subtype || "")

            setPremiumAmount(policy?.premium_amount?.toString() || "")
            setPremiumFrequency((policy?.premium_frequency as "monthly" | "yearly") || "monthly")
            setRenewalDate(policy?.renewal_date || "")
            setPolicyNumber(policy?.policy_number || "")
            setAssetId(policy?.asset_id || "none")
            setFile(null)
            setErrorMsg("")
        }
    }, [open, policy, defaultType])

    // Reset subtype when primary type changes (only when creating, or if user explicitly changes type while editing)
    useEffect(() => {
        if (open && type) {
            // When type changes, if the current subtype doesn't belong to this type, clear it.
            const subtypeKey = type as keyof typeof INSURANCE_SUBTYPES
            const validSubtypes = INSURANCE_SUBTYPES[subtypeKey] || []
            if (!validSubtypes.find(st => st.value === subtype)) {
                setSubtype("")
            }
        }
        // disabled because we only want to run this when `type` changes, specifically to clear the subtype.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type])

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
        if (!file) return policy?.document_url || null

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
        setErrorMsg("")

        let documentUrl = policy?.document_url || null
        if (file) {
            documentUrl = await uploadDocument()
        }

        const formData = new FormData()
        formData.append("name", name)
        formData.append("provider", provider)
        formData.append("type", type)
        if (subtype) formData.append("subtype", subtype)
        formData.append("premium_amount", premiumAmount)
        formData.append("premium_frequency", premiumFrequency)
        if (renewalDate) formData.append("renewal_date", renewalDate)
        if (policyNumber) formData.append("policy_number", policyNumber)
        if (assetId && assetId !== "none") formData.append("asset_id", assetId)
        if (documentUrl) formData.append("document_url", documentUrl)

        let result
        if (isEditMode) {
            result = await updatePolicyAction(policy.id, formData)
        } else {
            result = await addPolicyAction(formData)
        }

        setLoading(false)

        if (result?.error) {
            setErrorMsg(result.error)
        } else {
            setOpen(false)
        }
    }

    const subtypeKey = type as keyof typeof INSURANCE_SUBTYPES
    const subtypeOptions = INSURANCE_SUBTYPES[subtypeKey] || []

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {triggerButton && (
                <DialogTrigger asChild>
                    {triggerButton}
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto" dir="rtl">
                <DialogHeader className="text-right">
                    {/* Fixed alignment for title using `text-right` */}
                    <DialogTitle className="text-right">{isEditMode ? "עריכת פוליסה" : "הוספת פוליסה חדשה"}</DialogTitle>
                    <DialogDescription className="text-right">
                        הזן את נתוני הפוליסה לצורך בקרה מהירה.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right text-xs md:text-sm">סוג הפוליסה</Label>
                        <Select value={type} onValueChange={(v: InsuranceType) => setType(v)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="בחר סוג" />
                            </SelectTrigger>
                            <SelectContent dir="rtl">
                                <SelectItem value={INSURANCE_TYPES.HEALTH}>בריאות וחיים</SelectItem>
                                <SelectItem value={INSURANCE_TYPES.PROPERTY}>מבנה ותכולה (דירה)</SelectItem>
                                <SelectItem value={INSURANCE_TYPES.VEHICLE}>רכב (חובה / מקיף)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {subtypeOptions.length > 0 && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subtype" className="text-right text-xs md:text-sm">תת-סוג</Label>
                            <Select value={subtype} onValueChange={setSubtype}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="בחר תת-סוג" />
                                </SelectTrigger>
                                <SelectContent dir="rtl">
                                    {subtypeOptions.map(st => (
                                        <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

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
                            placeholder={type === INSURANCE_TYPES.HEALTH ? 'ביטוח בריאות משפחתי מושלם' : ''}
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
                                        .filter(a => type === INSURANCE_TYPES.VEHICLE ? a.type === 'vehicle' : (a.type === 'property' || a.type === 'real_estate'))
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
                            {policy?.document_url && (
                                <a href={policy.document_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline flex items-center gap-1">
                                    צפה במסמך קיים
                                </a>
                            )}
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="text-sm font-medium text-destructive mt-2 text-right">
                            {errorMsg}
                        </div>
                    )}

                    <DialogFooter className="mt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "שומר..." : isEditMode ? "שמור פוליסה" : "הוסף פוליסה"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
