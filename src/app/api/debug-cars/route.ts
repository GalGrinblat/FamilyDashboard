import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const supabase = await createClient()
        
        const { data, error } = await supabase
            .from('assets')
            .select('*')
            .eq('type', 'vehicle')

        return NextResponse.json({
            success: true,
            data,
            error
        })
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 })
    }
}
