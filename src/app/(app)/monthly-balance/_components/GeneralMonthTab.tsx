'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMonthlyBalanceData } from '../actions';
import { Database } from '@/types/database.types';
import {
  CATEGORY_TYPES,
  CATEGORY_DOMAINS,
  CATEGORY_DOMAIN_SHORT_LABELS,
  CategoryDomain,
  FREQUENCY_TYPES,
} from '@/lib/constants';
import { formatCurrency, getAmountColorClass, getBadgeColorClass } from '@/lib/utils';

type RecurringFlow = Database['public']['Tables']['recurring_flows']['Row'];

export function GeneralMonthTab() {
  const [isLoading, setIsLoading] = useState(true);
  const [recurringFlows, setRecurringFlows] = useState<RecurringFlow[]>([]);

  useEffect(() => {
    let isMounted = true;

    // We just need the active recurring flows for the 'General' view.
    // We pass the current month just to satisfy the function signature,
    // though we only care about `recurringFlows` from the result.
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    getMonthlyBalanceData(monthStart, monthEnd)
      .then((res) => {
        if (isMounted) {
          const activeFlowsForMonth = (res.recurringFlows as RecurringFlow[]).filter((flow) => {
            if (flow.start_date && new Date(flow.start_date) > monthEnd) return false;
            if (flow.end_date && new Date(flow.end_date) < monthStart) return false;
            return true;
          });
          setRecurringFlows(activeFlowsForMonth);
          setIsLoading(false);
        }
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, []);

  const incomes = recurringFlows.filter((f) => f.type === CATEGORY_TYPES.INCOME);
  const expenses = recurringFlows.filter((f) => f.type === CATEGORY_TYPES.EXPENSE);

  const totalIncome = incomes.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  const groupedExpenses = expenses.reduce(
    (acc, exp) => {
      const domain = exp.domain || CATEGORY_DOMAINS.GENERAL;
      if (!acc[domain]) acc[domain] = [];
      acc[domain].push(exp);
      return acc;
    },
    {} as Record<string, RecurringFlow[]>,
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>הכנסות שוטפות</CardTitle>
            <CardDescription>משכורות, קצבאות והכנסות קבועות</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-lg text-muted-foreground">טוען נתונים...</p>
            ) : incomes.length === 0 ? (
              <p className="text-lg text-muted-foreground">לא נמצאו הכנסות קבועות.</p>
            ) : (
              <div className="space-y-4">
                {incomes.map((inc) => (
                  <div
                    key={inc.id}
                    className="flex justify-between items-center text-lg border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2">
                      <span>{inc.name}</span>
                      {inc.domain && inc.domain !== CATEGORY_DOMAINS.GENERAL && (
                        <span
                          className={`text-base px-1.5 py-0.5 rounded-md ${getBadgeColorClass('income')}`}
                        >
                          {CATEGORY_DOMAIN_SHORT_LABELS[inc.domain as CategoryDomain] || inc.domain}
                        </span>
                      )}
                    </div>
                    <span dir="ltr" className={`font-bold ${getAmountColorClass('income')}`}>
                      {formatCurrency(Number(inc.amount))}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center font-bold pt-2 mt-2 border-t">
                  <span>סה״כ הכנסות</span>
                  <span dir="ltr" className={getAmountColorClass('income')}>
                    {formatCurrency(totalIncome)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>הוצאות ותקציב לפי תחומים</CardTitle>
            <CardDescription>דיור, תחבורה, מחייה וכדומה</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-lg text-muted-foreground">טוען נתונים...</p>
            ) : expenses.length === 0 ? (
              <p className="text-lg text-muted-foreground">לא נמצאו הוצאות קבועות.</p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedExpenses)
                  .sort(([dA], [dB]) => dA.localeCompare(dB))
                  .map(([domain, domExpenses]) => {
                    const domainTotal = domExpenses.reduce(
                      (sum, item) => sum + Number(item.amount),
                      0,
                    );
                    const domainLabel =
                      CATEGORY_DOMAIN_SHORT_LABELS[domain as CategoryDomain] || domain;
                    return (
                      <div key={domain} className="space-y-2">
                        <h4 className="font-semibold text-lg border-b border-zinc-100 dark:border-zinc-800 pb-1 text-zinc-800 dark:text-zinc-200">
                          {domainLabel}
                        </h4>
                        <div className="space-y-1.5">
                          {domExpenses.map((exp) => (
                            <div key={exp.id} className="flex justify-between items-center text-lg">
                              <span className="text-zinc-600 dark:text-zinc-400">
                                {exp.name}{' '}
                                {exp.frequency !== FREQUENCY_TYPES.MONTHLY ? (
                                  <span className="text-lg bg-zinc-100 dark:bg-zinc-800 px-1 rounded">
                                    ({exp.frequency})
                                  </span>
                                ) : (
                                  ''
                                )}
                              </span>
                              <span
                                dir="ltr"
                                className={`font-medium ${getAmountColorClass('expense')}`}
                              >
                                {formatCurrency(-Number(exp.amount), true)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between items-center text-base font-semibold pt-1 text-zinc-500">
                          <span>תקציב/צפי נדרש מול התחום:</span>
                          <span dir="ltr">{formatCurrency(domainTotal)}</span>
                        </div>
                      </div>
                    );
                  })}
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-2">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>סה״כ הוצאות/תקציב צפוי</span>
                    <span dir="ltr" className={getAmountColorClass('expense')}>
                      {formatCurrency(-totalExpense, true)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/50 shadow-sm mt-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-indigo-900 dark:text-indigo-200">
              תזרים ותחזית לחודש ממוצע
            </CardTitle>
            <CardDescription className="text-center">
              פוטנציאל חיסכון חודשי מחושב מתוך הכנסות והוצאות קבועות
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-extrabold flex flex-col items-center justify-center py-6 gap-2">
              <span
                dir="ltr"
                className={getAmountColorClass(
                  totalIncome - totalExpense >= 0 ? 'income' : 'expense',
                )}
              >
                {formatCurrency(totalIncome - totalExpense)}
              </span>
              {totalIncome - totalExpense > 0 && (
                <span className="text-base font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full uppercase tracking-wider">
                  Positive Cashflow
                </span>
              )}
              {totalIncome - totalExpense < 0 && (
                <span className="text-base font-medium text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30 px-3 py-1 rounded-full uppercase tracking-wider">
                  Negative Cashflow
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
