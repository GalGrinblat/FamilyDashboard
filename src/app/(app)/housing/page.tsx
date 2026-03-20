import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Sofa, Receipt, AlertTriangle, Package } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { HouseholdItemDialog } from '@/components/household/HouseholdItemDialog';
import { ItemsTable } from '@/components/household/ItemsTable';
import { Database } from '@/types/database.types';
import { ContractsTab } from '@/components/housing/ContractsTab';
import { DomainTransactionsTab } from '@/components/transactions/DomainTransactionsTab';
import { SummaryKpisGrid } from '@/components/wealth/shared/SummaryKpisGrid';
import { CATEGORY_DOMAINS } from '@/lib/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/utils';

type HouseholdItemRow = Database['public']['Tables']['household_items']['Row'];

export default async function HousingPage() {
  const supabase = await createClient();

  // Parallel fetches — select only columns used downstream
  const [{ data: householdData }, { data: rawContracts }] = await Promise.all([
    supabase
      .from('household_items')
      .select('id, name, category, purchase_date, purchase_price, warranty_expiry, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('recurring_flows')
      .select('id, name, amount, type, frequency, end_date, is_active, categories!inner(domain)')
      .in('categories.domain', ['housing', 'utilities'])
      .eq('type', 'expense')
      .order('name', { ascending: true }),
  ]);

  const items = (householdData as HouseholdItemRow[]) || [];
  const appliances = items.filter((i) => i.category === 'appliance');
  const furniture = items.filter((i) => i.category === 'furniture');
  const electronics = items.filter((i) => i.category === 'electronics');

  const contracts =
    (rawContracts as unknown as Database['public']['Tables']['recurring_flows']['Row'][]) || [];

  // KPI computations
  const totalMonthlyCost = contracts.reduce((sum, c) => sum + Number(c.amount || 0), 0);
  const soon = new Date();
  soon.setDate(soon.getDate() + 30);
  const expiringWarrantyCount = items.filter(
    (i) => i.warranty_expiry && new Date(i.warranty_expiry) <= soon,
  ).length;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="מגורים ומשק בית" icon={Sofa} />

      <SummaryKpisGrid
        items={[
          {
            label: 'עלות חוזים חודשית',
            value: formatCurrency(totalMonthlyCost),
            subtitle: `${contracts.length} חוזים פעילים`,
            valueClassName: 'text-rose-600 dark:text-rose-400',
            icon: <Receipt className="h-8 w-8 text-muted-foreground/40" />,
          },
          {
            label: 'אחריות לפקיעה',
            value: expiringWarrantyCount > 0 ? String(expiringWarrantyCount) : '—',
            subtitle: expiringWarrantyCount > 0 ? 'תוך 30 יום או שפגה' : 'הכל תקין',
            valueClassName: expiringWarrantyCount > 0 ? 'text-amber-600 dark:text-amber-400' : '',
            icon: <AlertTriangle className="h-8 w-8 text-muted-foreground/40" />,
          },
          {
            label: 'סה״כ פריטים',
            value: String(items.length),
            subtitle: `${appliances.length} חשמל · ${furniture.length} ריהוט · ${electronics.length} אלקטרוניקה`,
            icon: <Package className="h-8 w-8 text-muted-foreground/40" />,
          },
        ]}
      />

      <Tabs defaultValue="utilities" className="w-full mt-4" dir="rtl">
        <TabsList className="flex flex-wrap h-auto justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
          <TabsTrigger value="utilities">חוזים ושירותים</TabsTrigger>
          <TabsTrigger value="appliances">מכשירי חשמל</TabsTrigger>
          <TabsTrigger value="furniture">ריהוט</TabsTrigger>
          <TabsTrigger value="electronics">אלקטרוניקה</TabsTrigger>
          <TabsTrigger value="transactions" className="tabs-highlight">
            תנועות והוצאות
          </TabsTrigger>
        </TabsList>

        <TabsContent value="utilities" className="mt-4">
          <ContractsTab contracts={contracts} />
        </TabsContent>

        <TabsContent value="appliances" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>מכשירי חשמל</CardTitle>
                <CardDescription>מעקב אחר מקרר, מכונת כביסה, תנור ועוד.</CardDescription>
              </div>
              <HouseholdItemDialog
                triggerButton={
                  <Button size="sm">
                    <Plus className="ml-2 h-4 w-4" />
                    פריט חדש
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
              <ItemsTable items={appliances} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="furniture" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>ריהוט</CardTitle>
                <CardDescription>מעקב אחר ספות, מיטות, שולחנות וארונות.</CardDescription>
              </div>
              <HouseholdItemDialog
                triggerButton={
                  <Button size="sm">
                    <Plus className="ml-2 h-4 w-4" />
                    פריט חדש
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
              <ItemsTable items={furniture} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="electronics" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>אלקטרוניקה</CardTitle>
                <CardDescription>מחשבים, טלוויזיות, קונסולות וציוד נלווה.</CardDescription>
              </div>
              <HouseholdItemDialog
                triggerButton={
                  <Button size="sm">
                    <Plus className="ml-2 h-4 w-4" />
                    פריט חדש
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
              <ItemsTable items={electronics} />
            </CardContent>
          </Card>
        </TabsContent>

        <DomainTransactionsTab
          domain={CATEGORY_DOMAINS.HOUSING}
          title="תנועות בחשבון"
          description="ריכוז הוצאות והכנסות תחת קטגוריות המשויכות למגורים (שכירות, ארנונה, חשמל וכו׳)."
        />
      </Tabs>
    </div>
  );
}
