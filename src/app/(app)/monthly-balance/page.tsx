import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { SpecificMonthTab } from './_components/SpecificMonthTab';
import { GeneralMonthTab } from './_components/GeneralMonthTab';

export default async function MonthlyBalancePage() {
  return (
    <Tabs defaultValue="specific" className="w-full space-y-4" dir="rtl">
      <TabsList className="flex flex-wrap h-auto justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
        <TabsTrigger value="specific">חודש ספציפי</TabsTrigger>
        <TabsTrigger value="general">חודש כללי</TabsTrigger>
      </TabsList>
      <TabsContent value="specific" className="mt-4">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <SpecificMonthTab />
        </Suspense>
      </TabsContent>
      <TabsContent value="general" className="mt-4">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <GeneralMonthTab />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
