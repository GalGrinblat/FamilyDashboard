import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { AlertCircle, ArrowDownRight, ArrowUpRight, CarFront, ShieldCheck, Wallet } from "lucide-react"

export default function Home() {
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
            <div className="text-2xl font-bold">₪1,245,000</div>
            <p className="text-xs text-muted-foreground flex items-center text-emerald-500 mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3" />
              +2.5% מהחודש שעבר
            </p>
          </CardContent>
        </Card>

        {/* Burn Rate */}
        <Card className="shadow-sm border-zinc-200 dark:border-zinc-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              הוצאות חודשיות (Burn Rate)
            </CardTitle>
            <ArrowDownRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₪18,450</div>
            <p className="text-xs text-muted-foreground mt-1">
              נותרו ₪3,550 מתקציב פברואר
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
              יש לך 2 משימות הדורשות תשומת לב בקרוב.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">

              <div className="flex items-center p-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-900/10">
                <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-full ml-4">
                  <CarFront className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">טסט לרכב - קיה פיקנטו</p>
                  <p className="text-sm text-muted-foreground">פג תוקף בעוד 14 ימים (08/03/2026)</p>
                </div>
                <div className="font-medium text-sm text-amber-600 dark:text-amber-400">
                  ₪1,200 משוער
                </div>
              </div>

              <div className="flex items-center p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <div className="bg-zinc-100 dark:bg-zinc-800 p-2 rounded-full ml-4">
                  <ShieldCheck className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">חידוש ביטוח דירה</p>
                  <p className="text-sm text-muted-foreground">פג תוקף בעוד 28 ימים (22/03/2026)</p>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

      </div>

    </div>
  );
}
