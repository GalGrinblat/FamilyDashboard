import { Metadata } from 'next';
import { PageHeader } from '@/components/layout/PageHeader';
import { PieChart } from 'lucide-react';

export const metadata: Metadata = {
  title: 'מאזן חודשי',
  description: 'ניהול מאזן חודשי ומעקב תזרים',
};

export default function MonthlyBalanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 relative min-h-[calc(100vh-4rem)] md:min-h-screen pb-20 md:pb-8">
      <PageHeader title="מאזן חודשי" icon={PieChart} />
      {children}
    </div>
  );
}
