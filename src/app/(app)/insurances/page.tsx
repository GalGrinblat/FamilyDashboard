import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, HeartPulse, Home, Car as CarIcon, Plus } from 'lucide-react';
import { DomainTransactionsTab } from '@/components/transactions/DomainTransactionsTab';
import { CATEGORY_DOMAINS, INSURANCE_TYPES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { PolicyWithAsset } from '@/types/insurance';
import { PolicyDialog } from '@/components/insurances/PolicyDialog';
import { PolicyCard } from '@/components/insurances/PolicyCard';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';

import { PolicySchema } from '@/lib/schemas';
import { z } from 'zod';

export default async function InsurancesPage() {
  const supabase = await createClient();

  // Fetch all policies
  const { data: policiesData } = await supabase
    .from('policies')
    .select('*, assets(*)')
    .order('created_at', { ascending: false });

  const policies = z.array(PolicySchema).parse(policiesData || []);

  const healthPolicies = policies.filter((p) => p.type === INSURANCE_TYPES.HEALTH);
  const propertyPolicies = policies.filter((p) => p.type === INSURANCE_TYPES.PROPERTY);
  const vehiclePolicies = policies.filter((p) => p.type === INSURANCE_TYPES.VEHICLE);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="תיק ביטוחים"
        icon={Shield}
        description="מרכז שליטה פוליסות ביטוח וכיסויים למשפחה, רכוש ורכבים."
      />

      <Tabs defaultValue={INSURANCE_TYPES.HEALTH} className="w-full mt-4" dir="rtl">
        <TabsList className="flex flex-wrap h-auto justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
          <TabsTrigger value={INSURANCE_TYPES.HEALTH}>בריאות וחיים</TabsTrigger>
          <TabsTrigger value={INSURANCE_TYPES.PROPERTY}>מבנה ותכולה</TabsTrigger>
          <TabsTrigger value={INSURANCE_TYPES.VEHICLE}>רכב</TabsTrigger>
          <TabsTrigger value="transactions" className="tabs-highlight">
            תנועות והוצאות
          </TabsTrigger>
        </TabsList>

        <TabsContent value={INSURANCE_TYPES.HEALTH} className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <HeartPulse className="h-5 w-5 text-rose-500" />
                  קופות חולים וחיים
                </CardTitle>
                <CardDescription className="mt-1">
                  ביטוחי בריאות פרטיים, קופות חולים וביטוחי חיים/משכנתא.
                </CardDescription>
              </div>
              <PolicyDialog
                defaultType={INSURANCE_TYPES.HEALTH}
                triggerButton={
                  <Button size="sm">
                    <Plus className="ml-2 w-4 h-4" />
                    פוליסה חדשה
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="pt-0 p-6">
              {healthPolicies.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                  <p>אין ביטוחי בריאות וחיים קיימים לנתח.</p>
                  <PolicyDialog
                    defaultType={INSURANCE_TYPES.HEALTH}
                    triggerButton={
                      <Button variant="outline" className="mt-4">
                        הוסף כיסוי חדש
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  {healthPolicies.map((p) => (
                    <PolicyCard key={p.id} policy={p} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={INSURANCE_TYPES.PROPERTY} className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-emerald-500" />
                  ביטוחי דירה ותכולה
                </CardTitle>
                <CardDescription className="mt-1">כיסוי נכסים ומשק הבית.</CardDescription>
              </div>
              <PolicyDialog
                defaultType={INSURANCE_TYPES.PROPERTY}
                triggerButton={
                  <Button size="sm">
                    <Plus className="ml-2 w-4 h-4" />
                    פוליסה חדשה
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="pt-0 p-6">
              {propertyPolicies.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                  <p>אין ביטוחי מבנה ותכולה מתועדים במערכת.</p>
                  <PolicyDialog
                    defaultType={INSURANCE_TYPES.PROPERTY}
                    triggerButton={
                      <Button variant="outline" className="mt-4">
                        הוסף כיסוי חדש
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  {propertyPolicies.map((p) => (
                    <PolicyCard key={p.id} policy={p} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value={INSURANCE_TYPES.VEHICLE} className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CarIcon className="h-5 w-5 text-blue-500" />
                  ביטוחי רכב חובה ומקיף
                </CardTitle>
                <CardDescription className="mt-1">
                  תאריכי חידוש ומעקב הוצאות ביטוח לרכבים.
                </CardDescription>
              </div>
              <PolicyDialog
                defaultType={INSURANCE_TYPES.VEHICLE}
                triggerButton={
                  <Button size="sm">
                    <Plus className="ml-2 w-4 h-4" />
                    פוליסה חדשה
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="pt-0 p-6">
              {vehiclePolicies.length === 0 ? (
                <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
                  <p>אין ביטוחי רכב פעילים המשויכים לרכבי המשפחה.</p>
                  <PolicyDialog
                    defaultType={INSURANCE_TYPES.VEHICLE}
                    triggerButton={
                      <Button variant="outline" className="mt-4">
                        הוסף כיסוי חדש
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                  {vehiclePolicies.map((p) => (
                    <PolicyCard key={p.id} policy={p} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <DomainTransactionsTab
          domain={CATEGORY_DOMAINS.INSURANCES}
          title="תנועות והוצאות ביטוחים"
          description="ריכוז הוצאות והפרשות לפוליסות ביטוח במגוון תחומים."
        />
      </Tabs>
    </div>
  );
}
