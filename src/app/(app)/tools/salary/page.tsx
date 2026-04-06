import { Calculator } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SalaryCalculator } from '@/components/tools/salary/SalaryCalculator';

export default function SalaryPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="מחשבון שכר"
        icon={Calculator}
        description="חישוב שכר נטו ממשכורת ברוטו — כולל פירוט מלא של כל ניכוי."
      />
      <SalaryCalculator />
    </div>
  );
}
