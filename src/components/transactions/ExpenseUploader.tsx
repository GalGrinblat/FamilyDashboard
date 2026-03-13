'use client';

import { useState } from 'react';
import {
  StatementUploadEngine,
  ParsedTransactionRow,
} from '@/components/transactions/StatementUploadEngine';
import {
  ReviewTransactionsTable,
  ClassifiedTransactionRow,
} from '@/components/transactions/ReviewTransactionsTable';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function ExpenseUploader({
  categories,
  accounts,
}: {
  categories: { id: string; name_he: string; domain?: string }[];
  accounts: { id: string; name: string }[];
}) {
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classifiedRows, setClassifiedRows] = useState<ClassifiedTransactionRow[] | null>(null);
  const [activeAssets, setActiveAssets] = useState<{ id: string; name: string; domain?: string }[]>(
    [],
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const supabase = createClient();

  useEffect(() => {
    const fetchAssets = async () => {
      const { data } = await supabase
        .from('assets')
        .select('id, name, domain')
        .eq('status', 'active');
      if (data) setActiveAssets(data);
    };
    fetchAssets();
  }, [supabase]);

  const handleUploadComplete = async (data: ParsedTransactionRow[]) => {
    setIsClassifying(true);
    try {
      const payload = {
        rows: data,
        accountId: selectedAccountId,
      };

      const res = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Classification failed');

      const jsonResponse = await res.json();
      setClassifiedRows(jsonResponse.results || []);
    } catch (err) {
      console.error(err);
      alert('אירעה שגיאה בשרת הסיווג (API Error).');
    } finally {
      setIsClassifying(false);
    }
  };

  const handleReset = () => {
    setClassifiedRows(null);
  };

  const handleConfirm = async (finalRows: ClassifiedTransactionRow[]) => {
    if (!selectedAccountId) {
      alert('אנא בחר חשבון לפני שמירת התנועות.');
      return;
    }

    setIsSubmitting(true);

    // Attach selected account to all rows
    const rowsWithAccount = finalRows.map((row) => ({
      ...row,
      account_id: selectedAccountId,
    }));

    try {
      const res = await fetch('/api/transactions/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rowsWithAccount),
      });

      if (!res.ok) throw new Error('Failed to save transactions');

      alert('תנועות נשמרו בהצלחה במסד הנתונים!');
      handleReset();
      // In a real app we'd trigger a router.refresh() here so the UI tables see the new data
    } catch (error) {
      console.error(error);
      alert('שגיאה בשמירת התנועות לרשומות הבסיס.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {!classifiedRows ? (
        <div className="relative space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">בחר חשבון משויך</h3>
              <p className="text-xs text-muted-foreground">כל התנועות מהקובץ יקושרו לחשבון זה</p>
            </div>
            <select
              className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-sm rounded-lg py-2 px-3 w-64 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer"
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              dir="rtl"
            >
              <option value="" disabled>
                -- בחר חשבון / כרטיס --
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>

          <div
            className={
              !selectedAccountId
                ? 'opacity-50 pointer-events-none transition-opacity'
                : 'transition-opacity relative'
            }
          >
            <StatementUploadEngine onUploadComplete={handleUploadComplete} />
            {isClassifying && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl border border-indigo-200 dark:border-indigo-800">
                <div className="bg-white dark:bg-zinc-900 shadow-lg px-8 py-6 rounded-2xl flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                  <h3 className="font-semibold text-lg">המנוע החכם סורק את התנועות...</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    מצליב נתונים מול בסיס הנתונים ו-AI
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <ReviewTransactionsTable
          rows={classifiedRows}
          categories={categories}
          activeAssets={activeAssets}
          onConfirm={handleConfirm}
          onCancel={handleReset}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
