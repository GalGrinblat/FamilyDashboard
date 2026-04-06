import { BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { CapitalGainsCalculator } from '@/components/tools/capital-gains/CapitalGainsCalculator';

export default function CapitalGainsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="מס רווחי הון — Interactive Brokers"
        icon={BarChart3}
        description="חישוב מס רווחי הון מעסקאות IBKR, כולל המרה לשקלים לפי שער יציג של בנק ישראל."
      />
      <CapitalGainsCalculator />
    </div>
  );
}
