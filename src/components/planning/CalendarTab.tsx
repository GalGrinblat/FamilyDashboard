'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/types/database.types';
import { startOfDay, isSameMonth, isBefore } from 'date-fns';
import { he } from 'date-fns/locale';
import { format } from 'date-fns';

type ReminderWithLinked = Database['public']['Tables']['reminders']['Row'] & {
  vehicles?: { name: string } | null;
  properties?: { name: string } | null;
};

const MONTH_NAMES_HE = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
];

function MonthCard({
  year,
  monthIndex,
  reminders,
  today,
}: {
  year: number;
  monthIndex: number;
  reminders: ReminderWithLinked[];
  today: Date;
}) {
  const monthDate = new Date(year, monthIndex, 1);
  const isPast = isBefore(new Date(year, monthIndex + 1, 0), today);
  const isCurrent = isSameMonth(monthDate, today);

  const monthReminders = reminders.filter((r) => {
    const d = new Date(r.due_date);
    return d.getFullYear() === year && d.getMonth() === monthIndex;
  });

  return (
    <div
      className={`border rounded-xl p-4 space-y-2 ${
        isCurrent
          ? 'border-indigo-400 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10'
          : isPast
            ? 'border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30 opacity-60'
            : 'border-zinc-200 dark:border-zinc-700'
      }`}
    >
      <p
        className={`font-semibold text-base ${
          isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-700 dark:text-zinc-300'
        }`}
      >
        {MONTH_NAMES_HE[monthIndex]} {year}
      </p>

      {monthReminders.length === 0 ? (
        <p className="text-base text-zinc-400 dark:text-zinc-600">אין תזכורות</p>
      ) : (
        <ul className="space-y-1.5">
          {monthReminders.map((r) => {
            const dueDate = new Date(r.due_date);
            const overdue = !r.is_completed && isBefore(startOfDay(dueDate), today);
            const linkedName = r.vehicles?.name || r.properties?.name;

            return (
              <li key={r.id} className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${
                      r.is_completed ? 'bg-emerald-500' : overdue ? 'bg-red-500' : 'bg-amber-500'
                    }`}
                  />
                  <span
                    className={`text-base font-medium ${
                      r.is_completed
                        ? 'line-through text-zinc-400'
                        : overdue
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {r.title}
                  </span>
                </div>
                <p className="text-base text-zinc-400 dark:text-zinc-500 mr-3">
                  {format(dueDate, 'd בMMMM', { locale: he })}
                  {linkedName ? ` · ${linkedName}` : ''}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function CalendarTab({ reminders }: { reminders: ReminderWithLinked[] }) {
  const today = startOfDay(new Date());

  // Show current month + 11 more = 12 months total
  const months: { year: number; monthIndex: number }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push({ year: d.getFullYear(), monthIndex: d.getMonth() });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>לוח שנה</CardTitle>
        <CardDescription>תצוגת 12 החודשים הקרובים עם כל התזכורות המתוכננות.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {months.map(({ year, monthIndex }) => (
            <MonthCard
              key={`${year}-${monthIndex}`}
              year={year}
              monthIndex={monthIndex}
              reminders={reminders}
              today={today}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
