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
import { Plus, Calendar, Target, Map } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ReminderDialog } from '@/components/planning/ReminderDialog';
import { TripDialog } from '@/components/planning/TripDialog';
import { ReminderRowActions } from '@/components/planning/ReminderRowActions';
import { GoalsTab } from '@/components/planning/GoalsTab';
import { CalendarTab } from '@/components/planning/CalendarTab';
import { Database } from '@/types/database.types';
import { SYSTEM_REMINDER_TYPES } from '@/lib/constants';
import { differenceInDays, startOfDay } from 'date-fns';
import { PageHeader } from '@/components/layout/PageHeader';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

type ReminderRow = Database['public']['Tables']['reminders']['Row'];
type ReminderWithLinked = ReminderRow & {
  vehicles?: { name: string } | null;
  properties?: { name: string } | null;
};
type TripRow = Database['public']['Tables']['trips']['Row'];

function RemindersTable({
  items,
  customTypes,
}: {
  items: ReminderWithLinked[];
  customTypes: string[];
}) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
        <p>אין תזכורות מתוכננות כרגע.</p>
        <ReminderDialog
          customTypes={customTypes}
          triggerButton={
            <Button variant="outline" className="mt-4">
              <Plus className="ml-2 h-4 w-4" />
              הוסף תזכורת
            </Button>
          }
        />
      </div>
    );
  }

  const allTypes = [...SYSTEM_REMINDER_TYPES, ...customTypes.map((t) => ({ value: t, label: t }))];
  const getTypeLabel = (val: string) => allTypes.find((t) => t.value === val)?.label || val;

  return (
    <Table className="border-t border-zinc-100 dark:border-zinc-800">
      <TableHeader>
        <TableRow>
          <TableHead className="text-right w-1/4">כותרת</TableHead>
          <TableHead className="text-right w-1/5">תאריך יעד</TableHead>
          <TableHead className="text-right w-1/6">נותרו (ימים)</TableHead>
          <TableHead className="text-right w-1/6">סוג</TableHead>
          <TableHead className="text-right w-[100px]">סטטוס</TableHead>
          <TableHead className="text-left w-[80px]">פעולות</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const today = startOfDay(new Date());
          const dueDate = startOfDay(new Date(item.due_date));
          const diffDays = differenceInDays(dueDate, today);

          let daysColorClass = '';
          if (diffDays < 0) daysColorClass = 'text-red-600 dark:text-red-400 font-bold';
          else if (diffDays <= 7) daysColorClass = 'text-amber-600 dark:text-amber-400 font-medium';

          const linkedName = item.vehicles?.name || item.properties?.name;

          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">
                {item.title}
                {linkedName && (
                  <span className="block border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-base rounded px-1.5 py-0.5 mt-1 w-fit">
                    {item.vehicles ? 'רכב' : 'נכס'}: {linkedName}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {item.due_date
                  ? new Intl.DateTimeFormat('he-IL').format(new Date(item.due_date))
                  : '-'}
              </TableCell>
              <TableCell className={daysColorClass} dir="ltr">
                {diffDays < 0 ? `עבר (${Math.abs(diffDays)})` : diffDays}
              </TableCell>
              <TableCell>{getTypeLabel(item.type)}</TableCell>
              <TableCell>
                {item.is_completed ? (
                  <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-base px-2 py-1 rounded-full whitespace-nowrap">
                    הושלם
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-base px-2 py-1 rounded-full whitespace-nowrap">
                    ממתין
                  </span>
                )}
              </TableCell>
              <TableCell className="text-left">
                <ReminderRowActions reminder={item} customTypes={customTypes} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

function TripsTable({ items }: { items: TripRow[] }) {
  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border-t border-zinc-100 dark:border-zinc-800">
        <p>אין חופשות מתוכננות כרגע.</p>
        <TripDialog
          triggerButton={
            <Button variant="outline" className="mt-4">
              <Plus className="ml-2 h-4 w-4" />
              הוסף חופשה
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <Table className="border-t border-zinc-100 dark:border-zinc-800">
      <TableHeader>
        <TableRow>
          <TableHead className="text-right w-1/3">יעד חופשה / שם</TableHead>
          <TableHead className="text-right">תאריך התחלה</TableHead>
          <TableHead className="text-right">תאריך סיום</TableHead>
          <TableHead className="text-right">תקציב</TableHead>
          <TableHead className="text-left w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.name}</TableCell>
            <TableCell>
              {item.start_date
                ? new Intl.DateTimeFormat('he-IL').format(new Date(item.start_date))
                : '-'}
            </TableCell>
            <TableCell>
              {item.end_date
                ? new Intl.DateTimeFormat('he-IL').format(new Date(item.end_date))
                : '-'}
            </TableCell>
            <TableCell>{item.budget ? formatCurrency(item.budget) : '-'}</TableCell>
            <TableCell className="text-left">
              <Link href={`/planning/trips/${item.id}`}>
                <Button variant="ghost" size="sm">
                  <Map className="h-4 w-4" />
                </Button>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default async function PlanningPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const customTypes = user?.user_metadata?.custom_reminder_types || [];

  const [{ data: remindersData }, { data: tripsData }, { data: goalsData }] = await Promise.all([
    supabase
      .from('reminders')
      .select('*, vehicles(name), properties(name)')
      .order('due_date', { ascending: true }),
    supabase.from('trips').select('*').order('start_date', { ascending: true }),
    supabase
      .from('financial_goals')
      .select('*')
      .eq('is_completed', false)
      .order('target_date', { ascending: true }),
  ]);

  const reminders = (remindersData as unknown as ReminderWithLinked[]) || [];
  const trips = (tripsData as TripRow[]) || [];
  const goals = goalsData || [];

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="תכנון" icon={Calendar} />

      <Tabs defaultValue="periodic" className="w-full mt-4" dir="rtl">
        <TabsList className="flex flex-wrap h-auto justify-start gap-1 p-1 bg-zinc-100/50 dark:bg-zinc-800/50">
          <TabsTrigger value="periodic">תכנון עיתי</TabsTrigger>
          <TabsTrigger value="goals">
            <Target className="w-4 h-4 ml-1" />
            יעדים פיננסיים
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="w-4 h-4 ml-1" />
            לוח שנה
          </TabsTrigger>
          <TabsTrigger value="vacation">חופשות</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="periodic" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>תכנון עיתי</CardTitle>
                  <CardDescription>
                    לוח שנה למעקב אחר חידושי ביטוח, טסטים לרכב, ותחזוקת הבית.
                  </CardDescription>
                </div>
                <ReminderDialog
                  customTypes={customTypes}
                  triggerButton={
                    <Button size="sm">
                      <Plus className="ml-2 h-4 w-4" />
                      תזכורת חדשה
                    </Button>
                  }
                />
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <RemindersTable items={reminders} customTypes={customTypes} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="mt-4">
            <GoalsTab goals={goals} />
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <CalendarTab reminders={reminders} trips={trips} />
          </TabsContent>

          <TabsContent value="vacation" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>תכנון חופשות</CardTitle>
                  <CardDescription>תכנון תקציב ותוכניות מסלול לחופשות עתידיות.</CardDescription>
                </div>
                <TripDialog
                  triggerButton={
                    <Button size="sm">
                      <Plus className="ml-2 h-4 w-4" />
                      חופשה חדשה
                    </Button>
                  }
                />
              </CardHeader>
              <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
                <TripsTable items={trips} />
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
