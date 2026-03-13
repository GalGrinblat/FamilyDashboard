'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Pencil, Link as LinkIcon } from 'lucide-react';
import { upsertMonthlyOverride, getMonthlyBalanceData } from '../actions';
import { Database } from '@/types/database.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CATEGORY_TYPES,
  CATEGORY_DOMAINS,
  CATEGORY_DOMAIN_SHORT_LABELS,
  CategoryType,
  CategoryDomain,
  ACCOUNT_TYPES,
} from '@/lib/constants';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';

type Account = Database['public']['Tables']['accounts']['Row'];
type Transaction = Database['public']['Tables']['transactions']['Row'];
type RecurringFlow = Database['public']['Tables']['recurring_flows']['Row'];
type Override = Database['public']['Tables']['monthly_overrides']['Row'];

export function SpecificMonthTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    accounts: Account[];
    transactions: Transaction[];
    recurringFlows: RecurringFlow[];
    overrides: Override[];
  } | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const currentMonthLabel = currentDate.toLocaleDateString('he-IL', {
    month: 'long',
    year: 'numeric',
  });
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  useEffect(() => {
    let isMounted = true;

    getMonthlyBalanceData(monthStart, monthEnd)
      .then((res) => {
        if (isMounted) {
          setData(res as NonNullable<typeof data>);
          setIsLoading(false);
        }
      })
      .catch(console.error);

    return () => {
      isMounted = false;
    };
  }, [currentDate.toISOString()]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // --- Calculation Logic ---
  // 1. Calculate Bank Start Balance
  // Taking the primary checking account (assuming first one or specific type for now)
  const bankAccount = data?.accounts.find(
    (a) => a.type === ACCOUNT_TYPES.BANK || a.type === 'checking',
  );

  // We would trace back the current_balance by reversing the effect of transactions between *now* and *start_of_month*
  // For simplicity of MVP, if month in past we show `current_balance` (assuming it's accurate at that time? actually no, balance is always NOW).
  // Let's implement a rough projection from NOW back to month start. This relies on all transactions being logged.
  // For now, let's just display the current balance as the starting point.
  const startBalance = bankAccount?.current_balance || 0;

  // 2. Identify Credit Cards
  const creditCards =
    data?.accounts.filter((a) => a.type === ACCOUNT_TYPES.CREDIT_CARD || a.type === 'credit') || [];

  // 3. Build Timeline
  // A single unified list of: Historical Transactions + Expected Recurring Flows + Expected CC Bills
  interface TimelineItem {
    id: string;
    date: number; // day of month 1-31
    title: string;
    amount: number;
    type: CategoryType;
    isActual: boolean; // boolean if it happened or if it's expected
    originalRecurringId?: string; // used for inline override
    domain?: string | null;
    asset_id?: string | null;
    policy_id?: string | null;
  }

  const timeline: TimelineItem[] = [];

  if (data) {
    // A. Recurring Flows (Expected Income/Expenses)
    (data.recurringFlows as RecurringFlow[]).forEach((flow) => {
      // Check start and end dates
      if (flow.start_date && new Date(flow.start_date) > monthEnd) return;
      if (flow.end_date && new Date(flow.end_date) < monthStart) return;

      // Find if there is an override for this month
      const override = data.overrides.find((o) => o.recurring_flow_id === flow.id);
      const finalAmount = override ? Number(override.override_amount) : Number(flow.amount);

      // Determine the day of the month this flow should occur
      // Fallback to the 1st of the month if no start date is provided.
      const flowDate = flow.start_date ? new Date(flow.start_date) : new Date(monthStart);
      const dayOfMonth = flowDate.getDate();

      timeline.push({
        id: `flow-${flow.id}`,
        date: dayOfMonth,
        title: flow.name,
        amount: finalAmount,
        type: flow.type as CategoryType,
        isActual: false,
        originalRecurringId: flow.id,
        domain: flow.domain,
        asset_id: flow.asset_id,
        policy_id: flow.policy_id,
      });
    });

    // B. Credit Card Bills
    creditCards.forEach((cc) => {
      // Read billing date from metadata or default to 10
      const metadata = cc.metadata as { billingDay?: number } | null;
      const billingDay = metadata?.billingDay || 10;

      // Expected bill is the current balance (if negative, that's what we owe)
      // Or sum of transactions this period. Using current_balance is easiest for MVP.
      const billAmount = cc.current_balance ? Math.abs(cc.current_balance) : 0;

      // Only add if there is a bill and it's > 0
      if (billAmount > 0) {
        timeline.push({
          id: `cc-${cc.id}`,
          date: billingDay,
          title: `חיוב אשראי - ${cc.name}`,
          amount: billAmount,
          type: CATEGORY_TYPES.EXPENSE,
          isActual: false,
        });
      }
    });

    // (We would optionally match actual transactions against recurring flows to avoid double counting)
  }

  // Sort timeline by date
  timeline.sort((a, b) => a.date - b.date);

  // Calculate End Balance (Start + Income - Expenses)
  let endBalance = startBalance;
  timeline.forEach((item) => {
    if (item.type === CATEGORY_TYPES.INCOME) endBalance += item.amount;
    else endBalance -= item.amount;
  });

  const handleEditClick = (item: TimelineItem) => {
    setEditingItem(item);
    setEditAmount(item.amount.toString());
    setIsEditOpen(true);
  };

  const handleSaveOverride = async () => {
    if (!editingItem || !editingItem.originalRecurringId) return;

    setIsSaving(true);
    try {
      const amount = parseFloat(editAmount);
      const monthYearStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      await upsertMonthlyOverride(editingItem.originalRecurringId, monthYearStr, amount);

      // Refresh data
      const res = await getMonthlyBalanceData(monthStart, monthEnd);
      setData(res as NonNullable<typeof data>);
      setIsEditOpen(false);
    } catch (error) {
      console.error(error);
      alert('שגיאה בשמירת הערך');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="חודש קודם">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <h3 className="text-xl font-bold min-w-[150px] text-center">{currentMonthLabel}</h3>
          <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="חודש הבא">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
          החודש הנוכחי
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">יתרת פתיחה עו״ש</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(startBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {bankAccount ? bankAccount.name : 'אין חשבון מוגדר'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">יתרת סגירה צפויה</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getAmountColorClass(endBalance < 0 ? 'expense' : 'income')}`}
            >
              <span dir="ltr">{formatCurrency(endBalance)}</span>
            </div>
            <p className="text-xs text-muted-foreground">בסוף החודש</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>תזרים צפוי לחודש {currentMonthLabel}</CardTitle>
          <CardDescription>תנועות והוצאות קבועות לפי תאריך</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">טוען נתונים...</p>
          ) : timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">אין תנועות צפויות החודש.</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((item, idx) => (
                <div key={idx} className="flex items-center border-b pb-2 last:border-0 last:pb-0">
                  <div className="w-12 text-sm text-muted-foreground font-medium border-l pl-2 ml-2">
                    {item.date} בחודש
                  </div>
                  <div className="flex-1 font-medium text-sm flex items-center gap-2">
                    {item.title}
                    {(item.asset_id || item.policy_id) && (
                      <span title="תזרים מנוהל אוטומטית">
                        <LinkIcon className="h-3 w-3 text-zinc-400" />
                      </span>
                    )}
                    {item.isActual && (
                      <span className="mr-2 text-xs bg-muted px-1 rounded">בוצע</span>
                    )}
                    {!item.isActual && item.domain && item.domain !== CATEGORY_DOMAINS.GENERAL && (
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
                        {CATEGORY_DOMAIN_SHORT_LABELS[item.domain as CategoryDomain] || item.domain}
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-bold ${getAmountColorClass(item.type)}`}>
                    <span dir="ltr">
                      {formatCurrency(
                        item.type === CATEGORY_TYPES.EXPENSE ? -item.amount : item.amount,
                        true,
                      )}
                    </span>
                  </div>
                  <div className="mr-2">
                    {item.originalRecurringId && !item.isActual && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEditClick(item)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת סכום לחודש {currentMonthLabel}</DialogTitle>
            <DialogDescription>
              השינוי ישפיע על החודש הנוכחי בלבד, ולא ישנה את הסכום הקבוע.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>סכום (₪)</Label>
              <Input
                type="number"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              ביטול
            </Button>
            <Button onClick={handleSaveOverride} disabled={isSaving}>
              {isSaving ? 'שומר...' : 'שמירה'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
