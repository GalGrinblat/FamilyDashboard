'use client';

import { PiggyBank, Briefcase, GraduationCap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { AssetRef } from '@/lib/schemas';
import { SummaryKpisGrid } from '@/components/wealth/shared/SummaryKpisGrid';

interface PensionSummaryKpisProps {
  pensions: AssetRef[];
}

export function PensionSummaryKpis({ pensions }: PensionSummaryKpisProps) {
  const totalValue = pensions.reduce((sum, p) => sum + Number(p.estimated_value ?? 0), 0);

  const pensionAndInsurance = pensions
    .filter((p) => {
      const meta = p.metadata as { pension_type?: string } | null;
      return meta?.pension_type === 'pension_fund' || meta?.pension_type === 'managers_insurance';
    })
    .reduce((sum, p) => sum + Number(p.estimated_value ?? 0), 0);

  const gemelAndHishtalmut = pensions
    .filter((p) => {
      const meta = p.metadata as { pension_type?: string } | null;
      return meta?.pension_type === 'provident_fund' || meta?.pension_type === 'study_fund';
    })
    .reduce((sum, p) => sum + Number(p.estimated_value ?? 0), 0);

  return (
    <SummaryKpisGrid
      items={[
        {
          label: 'סך צבירה כולל',
          value: formatCurrency(totalValue),
          icon: <PiggyBank className="h-8 w-8 text-muted-foreground/40" />,
        },
        {
          label: 'פנסיה וביטוח מנהלים',
          value: pensionAndInsurance > 0 ? formatCurrency(pensionAndInsurance) : '—',
          icon: <Briefcase className="h-8 w-8 text-muted-foreground/40" />,
        },
        {
          label: 'גמל והשתלמות',
          value: gemelAndHishtalmut > 0 ? formatCurrency(gemelAndHishtalmut) : '—',
          icon: <GraduationCap className="h-8 w-8 text-muted-foreground/40" />,
        },
      ]}
    />
  );
}
