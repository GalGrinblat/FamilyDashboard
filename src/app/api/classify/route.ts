import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database.types"

type MerchantMappingRow = Database['public']['Tables']['merchant_mappings']['Row']

interface ClassifyRequestRow {
    date: string
    amount: number
    description: string
    reference_number?: string
    original_row_data: Record<string, unknown>
}

// Temporary generic API handler structure
export async function POST(req: Request) {
    try {
        const rows: ClassifyRequestRow[] = await req.json()
        const supabase = await createClient()

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
        }

        // 1. Fetch existing mappings
        const { data: mappingsData } = await supabase
            .from('merchant_mappings')
            .select('*')

        const mappings = (mappingsData as MerchantMappingRow[]) || []

        const mappingsDict = new Map(mappings.map(m => [m.raw_merchant_string, m.mapped_category_id]))

        // 2. Classify rows based on exact DB matches
        const classifiedRows = rows.map(row => {
            const rawMerchant = row.description?.trim() || "Unknown"

            return {
                ...row,
                suggested_category_id: mappingsDict.get(rawMerchant) || null,
                is_ai_classified: false
            }
        })

        // 3. Filter rows that NEED AI classification
        const unmappedRows = classifiedRows.filter(r => !r.suggested_category_id)

        // TODO: Pass unmappedRows to LLM AI here

        // 4. Return results (currently only local cache DB answers)
        return NextResponse.json({
            results: classifiedRows,
            stats: {
                total: rows.length,
                db_matched: classifiedRows.length - unmappedRows.length,
                ai_matched: 0,
                unmapped: unmappedRows.length
            }
        })

    } catch (error) {
        console.error("Classification error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
