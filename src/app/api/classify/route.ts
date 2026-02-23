import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database.types"
import { GoogleGenAI, Type, Schema } from "@google/genai"

type MerchantMappingRow = Database['public']['Tables']['merchant_mappings']['Row']
type CategoryRow = Database['public']['Tables']['categories']['Row']

interface ClassifyRequestRow {
    date: string
    amount: number
    description: string
    reference_number?: string
    original_row_data: Record<string, unknown>
}

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "dummy" })

const classificationSchema: Schema = {
    type: Type.ARRAY,
    description: "Array of transaction classification results",
    items: {
        type: Type.OBJECT,
        properties: {
            index: { type: Type.INTEGER, description: "Index of the transaction in the provided unmapped list" },
            suggested_category_id: { type: Type.STRING, description: "UUID of the matched existing category (if any). Send null if none match." },
            suggested_new_category: {
                type: Type.OBJECT,
                description: "If no existing category matches well, provide a suggestion for a NEW category to create.",
                nullable: true,
                properties: {
                    name_he: { type: Type.STRING, description: "Hebrew name of the new category" },
                    name_en: { type: Type.STRING, description: "English name of the new category" },
                    type: { type: Type.STRING, description: "Either 'expense' or 'income'" }
                }
            }
        },
        required: ["index"]
    }
}

export async function POST(req: Request) {
    try {
        const rows: ClassifyRequestRow[] = await req.json()
        const supabase = await createClient()

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
        }

        // 1. Fetch existing mappings and categories
        const { data: mappingsData } = await supabase.from('merchant_mappings').select('*')
        const { data: categoriesData } = await supabase.from('categories').select('*')

        const mappings = (mappingsData as MerchantMappingRow[]) || []
        const categories = (categoriesData as CategoryRow[]) || []

        const mappingsDict = new Map(mappings.map(m => [m.raw_merchant_string, m.mapped_category_id]))

        // 2. Classify rows based on exact DB matches
        const classifiedRows = rows.map((row, idx) => {
            const rawMerchant = row.description?.trim() || "Unknown"
            return {
                ...row,
                original_index: idx,
                suggested_category_id: mappingsDict.get(rawMerchant) || null,
                is_ai_classified: false,
                suggested_new_category: null
            }
        })

        // 3. Filter rows that NEED AI classification
        const unmappedRows = classifiedRows.filter(r => !r.suggested_category_id)

        // 4. Pass unmappedRows to LLM AI
        if (unmappedRows.length > 0 && process.env.GEMINI_API_KEY) {
            try {
                const promptContext = `
                You are a financial transaction categorizer for a Family Dashboard.
                Existing Categories:
                ${JSON.stringify(categories.map(c => ({ id: c.id, name_he: c.name_he, type: c.type })))}

                Transactions to format:
                ${JSON.stringify(unmappedRows.map((r, i) => ({ index: i, description: r.description, amount: r.amount })))}
                
                For each transaction, find the best matching "id" from the existing categories.
                If NO existing category fits (e.g. it's a completely new type of expense like "SpaceX Ticket"), you can return null for suggested_category_id, and instead provide a 'suggested_new_category' object with name_he, name_en, and type (expense/income).
                `

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: promptContext,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: classificationSchema,
                        temperature: 0.1
                    }
                })

                if (response.text) {
                    const aiResults = JSON.parse(response.text)
                    // Map results back to classifiedRows
                    unmappedRows.forEach((unmapped, mappedIdx) => {
                        const aiMatch = aiResults.find((res: any) => res.index === mappedIdx)
                        if (aiMatch) {
                            const mainRow = classifiedRows.find(r => r.original_index === unmapped.original_index)
                            if (mainRow) {
                                mainRow.suggested_category_id = aiMatch.suggested_category_id || null
                                mainRow.suggested_new_category = aiMatch.suggested_category_id ? null : aiMatch.suggested_new_category
                                mainRow.is_ai_classified = true
                            }
                        }
                    })
                }
            } catch (llmError) {
                console.error("LLM Classification failed, falling back to unmapped.", llmError)
            }
        }

        // Clean up internal original_index field
        const finalResults = classifiedRows.map(({ original_index, ...rest }) => rest)

        // 5. Return results
        return NextResponse.json({
            results: finalResults,
            stats: {
                total: rows.length,
                db_matched: finalResults.length - unmappedRows.length,
                ai_matched: finalResults.filter(r => r.is_ai_classified).length,
                unmapped: finalResults.filter(r => !r.suggested_category_id && !r.suggested_new_category).length
            }
        })

    } catch (error) {
        console.error("Classification error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
