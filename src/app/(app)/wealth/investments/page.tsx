import { InvestmentTab } from '@/components/wealth/investment/InvestmentTab';
import { PageHeader } from '@/components/layout/PageHeader';
import { LineChart } from 'lucide-react';

export default function InvestmentsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader title="השקעות" icon={LineChart} />
      <InvestmentTab />
    </div>
  );
}
