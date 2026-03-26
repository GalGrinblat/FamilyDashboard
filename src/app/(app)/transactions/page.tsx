import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import {
  TransactionsTable,
  TransactionWithCategory,
} from '@/components/transactions/TransactionsTable';
import { ExpenseUploader } from '@/components/transactions/ExpenseUploader';
import { CATEGORY_TYPES, CATEGORY_DOMAINS } from '@/lib/constants';
import { PageHeader } from '@/components/layout/PageHeader';
import { ArrowRightLeft } from 'lucide-react';

import { TransactionSchema, AccountSchema } from '@/lib/schemas';
import { z } from 'zod';

export default async function TransactionsPage() {
  const supabase = await createClient();

  // Fetch all data in parallel
  const [{ data: rawTransactions }, { data: rawCategories }, { data: rawAccounts }] =
    await Promise.all([
      supabase
        .from('transactions')
        .select(
          `
                id, amount, date, description, merchant, account_id,
                categories ( name_he, name_en, type, domain )
            `,
        )
        .order('date', { ascending: false })
        .limit(500),
      supabase
        .from('categories')
        .select('id, name_he, domain')
        .order('name_he', { ascending: true }),
      supabase.from('accounts').select('id, name').order('name', { ascending: true }),
    ]);

  const transactions = z
    .array(TransactionSchema)
    .parse(rawTransactions || []) as unknown as TransactionWithCategory[];
  const dbCategories = (rawCategories || []) as { id: string; name_he: string; domain: string }[];
  const dbAccounts = z.array(AccountSchema.pick({ id: true, name: true })).parse(rawAccounts || []);

  // Map categories to Tabs visually
  const incomes = transactions.filter(
    (t) =>
      (Array.isArray(t.categories) ? t.categories[0]?.type : t.categories?.type) ===
      CATEGORY_TYPES.INCOME,
  );

  const housingExpenses = transactions.filter(
    (t) =>
      (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) ===
      CATEGORY_DOMAINS.HOUSING,
  );
  const transportationExpenses = transactions.filter(
    (t) =>
      (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) ===
      CATEGORY_DOMAINS.TRANSPORTATION,
  );
  const insuranceExpenses = transactions.filter(
    (t) =>
      (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) ===
      CATEGORY_DOMAINS.INSURANCES,
  );
  const utilitiesExpenses = transactions.filter(
    (t) =>
      (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) ===
      CATEGORY_DOMAINS.UTILITIES,
  );
  const supermarketExpenses = transactions.filter(
    (t) =>
      (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) ===
      CATEGORY_DOMAINS.SUPERMARKET,
  );
  const hobbiesExpenses = transactions.filter(
    (t) =>
      (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) ===
      CATEGORY_DOMAINS.HOBBIES,
  );
  const entertainmentExpenses = transactions.filter(
    (t) =>
      (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) ===
      CATEGORY_DOMAINS.ENTERTAINMENT,
  );
  const vacationExpenses = transactions.filter(
    (t) =>
      (Array.isArray(t.categories) ? t.categories[0]?.domain : t.categories?.domain) ===
      CATEGORY_DOMAINS.VACATION,
  );

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="יומן תנועות" icon={ArrowRightLeft} />

      <Tabs defaultValue="ai_engine" className="w-full mt-4" dir="rtl">
        <TabsList className="flex flex-wrap h-auto w-full justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
          <TabsTrigger value="ai_engine">מנוע הוצאות (AI Uploader)</TabsTrigger>
          <TabsTrigger value="all">כל התנועות</TabsTrigger>
          <TabsTrigger value="income">הכנסות</TabsTrigger>
          <TabsTrigger value="housing">מגורים</TabsTrigger>
          <TabsTrigger value="car">תחבורה</TabsTrigger>
          <TabsTrigger value="insurances">ביטוחים</TabsTrigger>
          <TabsTrigger value="utilities">חשבונות</TabsTrigger>
          <TabsTrigger value="supermarket">סופרמרקט</TabsTrigger>
          <TabsTrigger value="hobbies">חוגים ופנאי</TabsTrigger>
          <TabsTrigger value="entertainment">בילויים</TabsTrigger>
          <TabsTrigger value="vacation">חופשות</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          {/* AI Engine Tab - Default */}
          <TabsContent value="ai_engine" className="mt-4">
            <ExpenseUploader categories={dbCategories} accounts={dbAccounts} />
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>כל התנועות</CardTitle>
                <CardDescription>
                  היסטוריית כל התנועות שהוזנו למערכת החל מהחדש לישן.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TransactionsTable transactions={transactions} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>הכנסות</CardTitle>
                <CardDescription>מעקב וסיווג אוטומטי של תנועות הכנסה בעו״ש.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TransactionsTable transactions={incomes} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="housing" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>מגורים ומשק בית</CardTitle>
                <CardDescription>
                  הוצאות עבור מגורים, תחזוקה, רכישת ריהוט ומכשירי חשמל.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TransactionsTable transactions={housingExpenses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="car" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>תחבורה ורכבים</CardTitle>
                <CardDescription>מעקב אחר הוצאות דלק, טיפולים, ותחבורה ציבורית.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TransactionsTable transactions={transportationExpenses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insurances" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>ביטוחים</CardTitle>
                <CardDescription>ביטוחי בריאות, רכב, דירה וחיים.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TransactionsTable transactions={insuranceExpenses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="utilities" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>חשבונות (Utilities)</CardTitle>
                <CardDescription>תשלומי מים, חשמל, גז וארנונה.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TransactionsTable transactions={utilitiesExpenses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="supermarket" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>סופרמרקט</CardTitle>
                <CardDescription>הוצאות מזון ומוצרי צריכה בסיסיים.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TransactionsTable transactions={supermarketExpenses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hobbies" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>חוגים ופנאי</CardTitle>
                <CardDescription>מעקב הוצאות ספורט וחוגי ילדים.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TransactionsTable transactions={hobbiesExpenses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="entertainment" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>בילויים ומסעדות</CardTitle>
                <CardDescription>מעקב הוצאות בילויים, מסעדות וברים.</CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TransactionsTable transactions={entertainmentExpenses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vacation" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>חופשות</CardTitle>
                <CardDescription>
                  סיווג הוצאות לטיולים ומעקב מול התקציב שהוגדר ב׳תכנון׳.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TransactionsTable transactions={vacationExpenses} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
