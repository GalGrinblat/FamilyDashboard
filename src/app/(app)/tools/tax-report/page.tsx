import { FileText } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { TaxReportGuide } from '@/components/tools/tax-report/TaxReportGuide';

export default function TaxReportPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <PageHeader
        title="דוח מס שנתי (1301)"
        icon={FileText}
        description="מדריך לאיסוף מסמכים ומילוי דוח מס שנתי לרשות המסים."
      />
      <TaxReportGuide />
    </div>
  );
}
