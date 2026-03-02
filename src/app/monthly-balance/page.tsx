import { Suspense } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { SpecificMonthTab } from "./_components/SpecificMonthTab"
import { GeneralMonthTab } from "./_components/GeneralMonthTab"

export default async function MonthlyBalancePage() {
    return (
        <Tabs defaultValue="specific" className="space-y-4" dir="rtl">
            <TabsList>
                <TabsTrigger value="specific">חודש ספציפי</TabsTrigger>
                <TabsTrigger value="general">חודש כללי</TabsTrigger>
            </TabsList>
            <TabsContent value="specific" className="space-y-4">
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                    <SpecificMonthTab />
                </Suspense>
            </TabsContent>
            <TabsContent value="general" className="space-y-4">
                <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
                    <GeneralMonthTab />
                </Suspense>
            </TabsContent>
        </Tabs>
    )
}
