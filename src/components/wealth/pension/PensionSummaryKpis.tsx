'use client';

import { PiggyBank, Briefcase, GraduationCap } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { InvestmentAccountRef } from '@/lib/schemas';
import { SummaryKpisGrid } from '@/components/wealth/shared/SummaryKpisGrid';

interface PensionSummaryKpisProps {
  pensions: InvestmentAccountRef[];
}

export function PensionSummaryKpis({ pensions }: PensionSummaryKpisProps) {
  const totalValue = pensions.reduce((sum, p) => sum + Number(p.current_balance ?? 0), 0);
  const pensionTotal = pensions
    .filter((p) => p.account_type === 'pension')
    .reduce((sum, p) => sum + Number(p.current_balance ?? 0), 0);
  const gemelTotal = pensions
    .filter((p) => p.account_type === 'gemel')
    .reduce((sum, p) => sum + Number(p.current_balance ?? 0), 0);

  return (
    <SummaryKpisGrid
      items={[
        {
          label: 'סך צבירה כולל',
          value: formatCurrency(totalValue),
          icon: <PiggyBank className="h-8 w-8 text-muted-foreground/40" />,
        },
        {
          label: 'קרנות פנסיה',
          value: pensionTotal > 0 ? formatCurrency(pensionTotal) : '—',
          icon: <Briefcase className="h-8 w-8 text-muted-foreground/40" />,
        },
        {
          label: 'קופות גמל',
          value: gemelTotal > 0 ? formatCurrency(gemelTotal) : '—',
          icon: <GraduationCap className="h-8 w-8 text-muted-foreground/40" />,
        },
      ]}
    />
  );
}
