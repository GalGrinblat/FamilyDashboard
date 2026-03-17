import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Plus, Sofa } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { HouseholdItemDialog } from '@/components/household/HouseholdItemDialog';
import { Database } from '@/types/database.types';
import { ContractsTab } from '@/components/housing/ContractsTab';
import { DomainTransactionsTab } from '@/components/transactions/DomainTransactionsTab';
import { CATEGORY_DOMAINS } from '@/lib/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/utils';

type HouseholdItemRow = Database['public']['Tables']['household_items']['Row'];

function ItemsTable({ items }: { items: HouseholdItemRow[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
        <p>אין פריטים להצגה בקטגוריה זו.</p>
        <HouseholdItemDialog
          triggerButton={
            <Button variant="outline" className="mt-4">
              <Plus className="ml-2 h-4 w-4" />
              הוסף פריט חדש
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Desktop View */}
      <div className="hidden md:block">
        <Table className="border-t border-zinc-100 dark:border-zinc-800">
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם הפריט</TableHead>
              <TableHead className="text-right">תאריך רכישה</TableHead>
              <TableHead className="text-right">מחיר</TableHead>
              <TableHead className="text-right">תום אחריות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>
                  {item.purchase_date
                    ? new Date(item.purchase_date).toLocaleDateString('he-IL')
                    : '-'}
                </TableCell>
                <TableCell dir="ltr">
                  {item.purchase_price ? formatCurrency(item.purchase_price) : '-'}
                </TableCell>
                <TableCell>
                  {item.warranty_expiry
                    ? new Date(item.warranty_expiry).toLocaleDateString('he-IL')
                    : '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="md:hidden flex flex-col space-y-3 p-4 pt-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col space-y-2 p-4 rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
          >
            <div className="flex justify-between items-start">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-lg">
                {item.name}
              </span>
              <span className="font-medium" dir="ltr">
                {item.purchase_price ? formatCurrency(item.purchase_price) : '-'}
              </span>
            </div>
            <div className="flex flex-col gap-1 text-lg text-zinc-600 dark:text-zinc-400 mt-1">
              <div className="flex justify-between">
                <span>תאריך רכישה:</span>
                <span>
                  {item.purchase_date
                    ? new Date(item.purchase_date).toLocaleDateString('he-IL')
                    : '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>תום אחריות:</span>
                <span>
                  {item.warranty_expiry
                    ? new Date(item.warranty_expiry).toLocaleDateString('he-IL')
                    : '-'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function HousingPage() {
  const supabase = await createClient();

  // 1. Fetch household items
  const { data: householdData } = await supabase
    .from('household_items')
    .select('*')
    .order('created_at', { ascending: false });

  const items = (householdData as HouseholdItemRow[]) || [];
  const appliances = items.filter((i) => i.category === 'appliance');
  const furniture = items.filter((i) => i.category === 'furniture');
  const electronics = items.filter((i) => i.category === 'electronics');

  // 2. Fetch contracts
  const { data: rawContracts } = await supabase
    .from('recurring_flows')
    .select('*')
    .in('domain', ['housing', 'utilities'])
    .eq('type', 'expense')
    .order('name', { ascending: true });

  const contracts =
    (rawContracts as Database['public']['Tables']['recurring_flows']['Row'][]) || [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="מגורים ומשק בית" icon={Sofa} />

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
