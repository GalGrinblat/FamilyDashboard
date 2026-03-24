import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import {
  TrendingUp,
  LineChart,
  Briefcase,
  WalletCards,
  Award,
  Wallet,
  ArrowLeft,
} from 'lucide-react';

export default async function WealthPage() {
  const supabase = await createClient();

  const [
    { data: accounts },
    { data: properties },
    { data: vehicles },
    { data: pensionAccounts },
    { data: brokerageAccounts },
    { data: rsuAccounts },
    { data: allSnapshots },
  ] = await Promise.all([
    supabase.from('accounts').select('current_balance'),
    supabase.from('properties').select('estimated_value').eq('status', 'active'),
    supabase.from('vehicles').select('estimated_value').eq('status', 'active'),
    supabase
      .from('investment_accounts')
      .select('id, current_balance, account_type')
      .in('account_type', ['pension', 'gemel'])
      .eq('is_active', true),
    supabase
      .from('investment_accounts')
      .select('id, current_balance')
      .in('account_type', ['brokerage', 'histalmut'])
      .eq('is_active', true),
    supabase
      .from('investment_accounts')
      .select('id, current_balance')
      .eq('account_type', 'rsu')
      .eq('is_active', true),
    supabase
      .from('portfolio_snapshots')
      .select('investment_account_id, total_value_ils')
      .order('snapshot_date', { ascending: false }),
  ]);

  // Build a map of investment_account_id → latest snapshot value (first per account = latest)
  const snapshotMap = new Map<string, number>();
  for (const snap of allSnapshots ?? []) {
    if (!snapshotMap.has(snap.investment_account_id)) {
      snapshotMap.set(snap.investment_account_id, Number(snap.total_value_ils) || 0);
    }
  }

  // Helper: get account value from current_balance or latest snapshot
  const getAccountValue = (acc: { id: string; current_balance: number | null }) =>
    Number(acc.current_balance) || snapshotMap.get(acc.id) || 0;

  const totalCash = (accounts || []).reduce((s, a) => s + (Number(a.current_balance) || 0), 0);
  const totalProperties = (properties || []).reduce(
    (s, p) => s + (Number(p.estimated_value) || 0),
    0,
  );
  const totalVehicles = (vehicles || []).reduce((s, v) => s + (Number(v.estimated_value) || 0), 0);
  const totalPension = (pensionAccounts || []).reduce((s, a) => s + getAccountValue(a), 0);
  const totalInvestments = (brokerageAccounts || []).reduce((s, a) => s + getAccountValue(a), 0);
  const totalRsu = (rsuAccounts || []).reduce((s, a) => s + getAccountValue(a), 0);
  const netWorth =
    totalCash + totalProperties + totalVehicles + totalPension + totalInvestments + totalRsu;

  const domains = [
    {
      href: '/wealth/investments',
      label: 'השקעות ותיקים',
      icon: LineChart,
      value: totalInvestments,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    },
    {
      href: '/wealth/real-estate',
      label: 'נדל״ן',
      icon: Briefcase,
      value: totalProperties,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      href: '/wealth/pension',
      label: 'פנסיה, גמל',
      icon: WalletCards,
      value: totalPension,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      href: '/wealth/rsu',
      label: 'RSU',
      icon: Award,
      value: totalRsu,
      color: 'text-violet-600',
      bg: 'bg-violet-50 dark:bg-violet-900/20',
    },
    {
      href: '/liquidity',
      label: 'עו״ש וכרטיסי אשראי',
      icon: Wallet,
      value: totalCash,
      color: 'text-zinc-600',
      bg: 'bg-zinc-100 dark:bg-zinc-800/50',
    },
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <PageHeader title="הון ונכסים" icon={TrendingUp} />

      {/* Net Worth KPI */}
      <Card className="border-indigo-200 dark:border-indigo-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium text-zinc-500">
            שווי נקי כולל (Net Worth)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400" dir="ltr">
            {formatCurrency(netWorth)}
          </div>
          <p className="text-base text-muted-foreground mt-1">סכום כל הנכסים הפיננסיים והריאליים</p>
        </CardContent>
      </Card>

      {/* Domain breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {domains.map((d) => (
          <Link key={d.href} href={d.href} className="block group">
            <Card className="hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${d.bg}`}>
                    <d.icon className={`h-5 w-5 ${d.color}`} />
                  </div>
                  <ArrowLeft className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4">
                  <p className="text-base text-muted-foreground">{d.label}</p>
                  <p className={`text-2xl font-bold mt-1 ${d.color}`} dir="ltr">
                    {formatCurrency(d.value)}
                  </p>
                  {netWorth > 0 && (
                    <p className="text-base text-muted-foreground mt-1">
                      {((d.value / netWorth) * 100).toFixed(1)}% מהשווי הכולל
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
