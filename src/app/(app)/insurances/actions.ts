"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { InsuranceType } from "@/lib/constants"

export async function addPolicyAction(formData: FormData) {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const provider = formData.get("provider") as string
    const type = formData.get("type") as InsuranceType
    const subtype = formData.get("subtype") as string
    const premiumAmountStr = formData.get("premium_amount") as string
    const premiumFrequency = formData.get("premium_frequency") as "monthly" | "yearly"
    let renewalDate: string | null = formData.get("renewal_date") as string
    let policyNumber: string | null = formData.get("policy_number") as string
    let assetId: string | null = formData.get("asset_id") as string
    let documentUrl: string | null = formData.get("document_url") as string

    if (!name || !provider || !type || !premiumAmountStr) {
        return { error: "כל שדות החובה חייבים להיות מלאים" }
    }

    if (!renewalDate) renewalDate = null
    if (!policyNumber) policyNumber = null
    if (assetId === "none" || !assetId) assetId = null
    if (!documentUrl) documentUrl = null

    const payload = {
        name,
        provider,
        type,
        subtype: subtype || null,
        premium_amount: parseFloat(premiumAmountStr),
        premium_frequency: premiumFrequency,
        renewal_date: renewalDate,
        policy_number: policyNumber,
        asset_id: assetId,
        document_url: documentUrl
    }

    // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
    const { error } = await supabase.from("policies").insert(payload)

    if (error) {
        console.error("Error inserting policy:", error)
        return { error: "שגיאה בהוספת הפוליסה" }
    }

    revalidatePath("/insurances")
    return { success: true }
}

export async function updatePolicyAction(id: string, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get("name") as string
    const provider = formData.get("provider") as string
    const type = formData.get("type") as InsuranceType
    const subtype = formData.get("subtype") as string
    const premiumAmountStr = formData.get("premium_amount") as string
    const premiumFrequency = formData.get("premium_frequency") as "monthly" | "yearly"
    let renewalDate: string | null = formData.get("renewal_date") as string
    let policyNumber: string | null = formData.get("policy_number") as string
    let assetId: string | null = formData.get("asset_id") as string
    let documentUrl: string | null = formData.get("document_url") as string

    if (!name || !provider || !type || !premiumAmountStr) {
        return { error: "כל שדות החובה חייבים להיות מלאים" }
    }

    if (!renewalDate) renewalDate = null
    if (!policyNumber) policyNumber = null
    if (assetId === "none" || !assetId) assetId = null
    if (!documentUrl) documentUrl = null

    const payload = {
        name,
        provider,
        type,
        subtype: subtype || null,
        premium_amount: parseFloat(premiumAmountStr),
        premium_frequency: premiumFrequency,
        renewal_date: renewalDate,
        policy_number: policyNumber,
        asset_id: assetId,
        document_url: documentUrl
    }

    // @ts-expect-error: Supabase generic schema mapping forces never on incomplete table descriptors
    const { error } = await supabase.from("policies").update(payload).eq('id', id)

    if (error) {
        console.error("Error updating policy:", error)
        return { error: "שגיאה בעדכון הפוליסה" }
    }

    revalidatePath("/insurances")
    return { success: true }
}
