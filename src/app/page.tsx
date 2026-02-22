import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { AlertCircle, ArrowDownRight, ArrowUpRight, CarFront, ShieldCheck, Wallet, Wrench } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { Database } from "@/types/database.types"

type AccountRef = Pick<Database['public']['Tables']['accounts']['Row'], 'current_balance'>
type AssetRef = Pick<Database['public']['Tables']['assets']['Row'], 'estimated_value'>
type TransactionRef = Pick<Database['public']['Tables']['transactions']['Row'], 'amount'> & {
  categories: Pick<Database['public']['Tables']['categories']['Row'], 'type'> | Pick<Database['public']['Tables']['categories']['Row'], 'type'>[] | null
}
type ReminderRef = Database['public']['Tables']['reminders']['Row']

// Helper function to format currency
const formatILS = (amount: number) => {
  return new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 }).format(amount)
}

// Map reminder type to icon
const getTypeIcon = (type: string) => {
  switch (type) {
    case 'car_test': return <CarFront className="h-4 w-4 text-amber-600 dark:text-amber-400" />
    case 'insurance': return <ShieldCheck className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
    case 'maintenance': return <Wrench className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    default: return <AlertCircle className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
  }
}

export default async function Home() {
  const supabase = await createClient()

  // 1. Calculate Net Worth (Accounts balances + Assets estimated values)
  const { data: accountsRaw } = await supabase.from('accounts').select('current_balance')
  const { data: assetsRaw } = await supabase.from('assets').select('estimated_value')

  const accounts = accountsRaw as AccountRef[] | null
  const assets = assetsRaw as AssetRef[] | null

  const totalBalance = accounts?.reduce((acc, curr) => acc + (curr.current_balance || 0), 0) || 0
  const totalAssetsValue = assets?.reduce((acc, curr) => acc + (curr.estimated_value || 0), 0) || 0
  const netWorth = totalBalance + totalAssetsValue

  // 2. Calculate Monthly Burn Rate (Sum of expense transactions for the current month)
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { data: transactionsData } = await supabase
    .from('transactions')
    .select(`
      amount,
      categories ( type )
    `)
    .gte('date', startOfMonth.toISOString())

  const transactions = transactionsData as TransactionRef[] | null

  const monthlyBurnRate = transactions?.reduce((acc, curr) => {
    const catType = Array.isArray(curr.categories) ? curr.categories[0]?.type : curr.categories?.type

    if (catType === 'expense') {
      return acc + (curr.amount || 0)
    }
    return acc
  }, 0) || 0

  // 3. Fetch Urgent Reminders (Due within next 30 days)
  const in30Days = new Date()
  in30Days.setDate(in30Days.getDate() + 30)

  const { data } = await supabase
    .from('reminders')
    .select('*')
    .eq('is_completed', false)
    .lte('due_date', in30Days.toISOString())
    .order('due_date', { ascending: true })
    .limit(5)

  const reminders = (data as ReminderRef[]) || []

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">ראשי</h2>
      </div>

      {/* Main KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Net Worth */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              שווי נקי (Net Worth)
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatILS(netWorth)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              סה״כ נכסים וחסכונות
            </p>
          </CardContent>
        </Card>

        {/* Burn Rate */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              הוצאות החודש (Burn Rate)
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatILS(monthlyBurnRate)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              מתחילת החודש ({startOfMonth.toLocaleDateString("he-IL", { month: 'long' })})
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Sub-Grids */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 pt-4">

        {/* Alerts / Reminders */}
        <Card className="col-span-4 shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              התראות דחופות
            </CardTitle>
            <CardDescription>
              {reminders && reminders.length > 0
                ? `יש לך ${reminders.length} התראות קרובות הדורשות תשומת לב.`
                : "אין לך משימות קרובות ל-30 ימים הקרובים."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">

              {reminders && reminders.length > 0 ? reminders.map((reminder) => {
                const isUrgent = new Date(reminder.due_date).getTime() < (new Date().getTime() + 7 * 24 * 60 * 60 * 1000); // within 7 days
                return (
                  <div key={reminder.id} className={`flex items-center p-3 rounded-lg border ${isUrgent
                    ? "border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10"
                    : "border-zinc-200 dark:border-zinc-800"
                    }`}>
                    <div className={`p-2 rounded-full ml-4 ${isUrgent
                      ? "bg-amber-100 dark:bg-amber-900"
                      : "bg-zinc-100 dark:bg-zinc-800"
                      }`}>
                      {getTypeIcon(reminder.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">{reminder.title}</p>
                      <p className="text-sm text-muted-foreground">תאריך יעד: {new Date(reminder.due_date).toLocaleDateString("he-IL")}</p>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-center p-4 text-muted-foreground">
                  הכל תקין, אין משימות דחופות כרגע!
                </div>
              )}

            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
