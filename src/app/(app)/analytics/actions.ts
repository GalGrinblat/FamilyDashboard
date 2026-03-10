"use server"

import { createClient } from "@/lib/supabase/server"
import { CategoryDomain, CategoryType } from "@/lib/constants"
import { Database } from "@/types/database.types"

type TransactionWithCategory = Database['public']['Tables']['transactions']['Row'] & {
    categories: Pick<Database['public']['Tables']['categories']['Row'], 'name_he' | 'type' | 'domain'> | Pick<Database['public']['Tables']['categories']['Row'], 'name_he' | 'type' | 'domain'>[] | null
}
type RecurringFlow = Database['public']['Tables']['recurring_flows']['Row']

export async function getAnalyticsData() {
    const supabase = await createClient()

    // Base current date
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() // 0-11

    // Fetch all transactions for the last 6 full months + current month
    const sixMonthsAgo = new Date(currentYear, currentMonth - 5, 1)

    const { data: rawTransactions } = await supabase
        .from('transactions')
        .select(`
            id, amount, date,
            categories ( name_he, type, domain )
        `)
        .gte('date', sixMonthsAgo.toISOString())
        .order('date', { ascending: true })

    const transactions = (rawTransactions as TransactionWithCategory[]) || []

    // Fetch recurring flows for budget vs actual
    const { data: rawFlows } = await supabase
        .from('recurring_flows')
        .select('*')
        .eq('is_active', true)

    const recurringFlows = (rawFlows as RecurringFlow[]) || []

    // Fetch simple net worth (current balances)
    const { data: accounts } = await supabase.from('accounts').select('current_balance')
    const { data: assets } = await supabase.from('assets').select('estimated_value').eq('status', 'active')

    const accountsArr = (accounts as { current_balance: number | null }[]) || []
    const assetsArr = (assets as { estimated_value: number | null }[]) || []

    const totalCash = accountsArr.reduce((acc, curr) => acc + (curr.current_balance || 0), 0)
    const totalAssets = assetsArr.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0)
    const currentNetWorth = totalCash + totalAssets

    return { transactions, recurringFlows, currentNetWorth, currentYear, currentMonth }
}
