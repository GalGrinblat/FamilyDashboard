'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database } from '@/types/database.types';
import { Wrench, CarIcon, ShieldCheck, ClipboardList, Trash2 } from 'lucide-react';
import { MaintenanceDialog } from './MaintenanceDialog';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { formatCurrency, getAmountColorClass } from '@/lib/utils';

type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
type MaintenanceRow = Database['public']['Tables']['vehicle_maintenance']['Row'];

interface MaintenanceWithCar extends MaintenanceRow {
  carName: string;
}

export function MaintenanceLog({
  cars,
  maintenance,
}: {
  cars: VehicleRow[];
  maintenance: MaintenanceRow[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    if (!window.confirm('האם למחוק רשומה זו? הפעולה אינה הפיכה.')) return;
    const { error } = await supabase.from('vehicle_maintenance').delete().eq('id', id);
    if (error) {
      if (process.env.NODE_ENV === "development") console.error(error);
      alert('שגיאה במחיקה');
    } else {
      router.refresh();
    }
  };

  const typeIcons: Record<string, React.ReactNode> = {
    garage: <Wrench className="h-4 w-4 text-emerald-600" />,
    test: <CarIcon className="h-4 w-4 text-indigo-600" />,
    insurance: <ShieldCheck className="h-4 w-4 text-emerald-600" />,
    repair: <Wrench className="h-4 w-4 text-rose-600" />,
    other: <ClipboardList className="h-4 w-4 text-zinc-500" />,
  };

  const typeLabels: Record<string, string> = {
    garage: 'טיפול תקופתי',
    test: 'טסט רישוי',
    insurance: 'ביטוח',
    repair: 'תיקון תקלה',
    other: 'אחר',
  };

  const carNameMap = Object.fromEntries(cars.map((c) => [c.id, c.name]));

  const allLogs: MaintenanceWithCar[] = maintenance
    .map((log) => ({
      ...log,
      carName: carNameMap[log.vehicle_id] || 'רכב לא ידוע',
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-zinc-500" />
            יומן תחזוקה וטיפולים
          </CardTitle>
          <CardDescription>
            תיעוד היסטוריית טיפולי מוסך, אישורי רישוי (טסטים) ותחזוקת צי הרכבים.
          </CardDescription>
        </div>
        <MaintenanceDialog cars={cars} />
      </CardHeader>
      <CardContent>
        {allLogs.length === 0 ? (
          <div className="text-lg text-muted-foreground py-8 text-center border rounded-md bg-zinc-50 dark:bg-zinc-900/50 mt-4">
            לא תועדו אירועי תחזוקה.
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            {allLogs.map((log, index) => (
              <div
                key={log.id || index}
                className="flex justify-between items-center text-lg border-b border-zinc-100 dark:border-zinc-800 pb-3 last:border-0 last:pb-0 group"
              >
                <div className="flex flex-col">
                  <span className="font-medium flex items-center gap-2">
                    {typeIcons[log.type] || typeIcons['other']}
                    {log.description}
                    <span className="text-base bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full mr-2">
                      {log.carName}
                    </span>
                  </span>
                  <div className="text-base text-muted-foreground flex gap-3 mt-1">
                    <span>{new Date(log.date).toLocaleDateString('he-IL')}</span>
                    <span>{typeLabels[log.type] || typeLabels['other']}</span>
                    {log.mileage && <span>{Number(log.mileage).toLocaleString()} ק״מ</span>}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`font-semibold ${getAmountColorClass('expense')}`} dir="ltr">
                    {log.cost ? formatCurrency(-Number(log.cost), true) : ''}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(log.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
