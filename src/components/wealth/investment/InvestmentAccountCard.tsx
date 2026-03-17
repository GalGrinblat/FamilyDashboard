'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronLeft, Pencil, Trash2 } from 'lucide-react';
import { HoldingsTable } from './HoldingsTable';
import { AddHoldingDialog } from './AddHoldingDialog';
import { InvestmentAccountDialog } from './InvestmentAccountDialog';
import { formatCurrency } from '@/lib/utils';
import {
  INVESTMENT_ACCOUNT_TYPE_LABELS,
  HISTALMUT_MONTHLY_CEILING_ILS,
  TAX_RATES,
} from '@/lib/constants';
import { computeAfterTaxValue } from '@/lib/portfolio-calculations';
import type { InvestmentAccountWithHoldings, StockPrice } from '@/types/investment';

interface InvestmentAccountCardProps {
  account: InvestmentAccountWithHoldings;
  prices: Record<string, StockPrice>;
  usdIlsRate: number;
}

function TaxBadge({ account, gain }: { account: InvestmentAccountWithHoldings; gain: number }) {
  if (gain <= 0) return null;

  if (account.account_type === 'histalmut') {
    const eligible = account.histalmut_eligible_date
      ? new Date(account.histalmut_eligible_date) <= new Date()
      : false;
    const monthly = account.monthly_contribution_ils ?? 0;
    const aboveFraction =
      monthly > 0 ? Math.max(0, monthly - HISTALMUT_MONTHLY_CEILING_ILS) / monthly : 0;

    if (!eligible) {
      return (
        <Badge variant="outline" className="text-base text-amber-600 border-amber-300">
          מס 25% על רווחים
        </Badge>
      );
    }
    if (aboveFraction === 0) {
      return (
        <Badge variant="outline" className="text-base text-emerald-600 border-emerald-300">
          פטור ממס
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-base text-amber-600 border-amber-300">
        מס על {(aboveFraction * 100).toFixed(0)}% מהרווחים
      </Badge>
    );
  }

  if (account.account_type === 'gemel_lehashkaa') {
    return (
      <Badge variant="outline" className="text-base text-blue-600 border-blue-300">
        מס {TAX_RATES.CAPITAL_GAINS * 100}% על רווח
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-base text-blue-600 border-blue-300">
      מס 25%
    </Badge>
  );
}

export function InvestmentAccountCard({ account, prices, usdIlsRate }: InvestmentAccountCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const totalValue = account.totalValueIls;
  const gain = account.unrealizedGainIls;
  const gainPct = account.unrealizedGainPercent;
  const afterTax = computeAfterTaxValue({
    account,
    currentValueIls: totalValue,
    costBasisIls: account.totalCostBasisIls,
  });

  const isPositive = gain >= 0;
  const typeLabel =
    INVESTMENT_ACCOUNT_TYPE_LABELS[
      account.account_type as keyof typeof INVESTMENT_ACCOUNT_TYPE_LABELS
    ] ?? account.account_type;

  const handleDelete = async () => {
    if (!confirm(`למחוק את "${account.name}" וכל הנתונים שלו?`)) return;
    setDeleting(true);
    await supabase.from('investment_accounts').delete().eq('id', account.id);
    setDeleting(false);
    router.refresh();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          {/* Left: expand toggle + title */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-muted-foreground hover:text-foreground shrink-0"
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-lg">{account.name}</span>
                <Badge variant="secondary" className="text-base">
                  {typeLabel}
                </Badge>
                {account.broker && (
                  <span className="text-base text-muted-foreground">{account.broker}</span>
                )}
                {account.management_fee_percent != null && (
                  <span className="text-base text-muted-foreground">
                    דמי ניהול: {account.management_fee_percent}%
                  </span>
                )}
                {account.is_managed && (
                  <Badge variant="outline" className="text-base">
                    מנוהל
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right: value summary + actions */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-left">
              <div className="text-base font-bold tabular-nums">{formatCurrency(totalValue)}</div>
              {gain !== 0 && (
                <div
                  dir="ltr"
                  className={`text-base tabular-nums ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  {isPositive ? '+' : ''}
                  {formatCurrency(gain)} ({isPositive ? '+' : ''}
                  {gainPct.toFixed(1)}%)
                </div>
              )}
              {afterTax !== totalValue && (
                <div className="text-base text-muted-foreground">
                  אחרי מס: {formatCurrency(afterTax)}
                </div>
              )}
            </div>
            <TaxBadge account={account} gain={gain} />
            <InvestmentAccountDialog
              accountToEdit={account}
              triggerButton={
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              }
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0">
          {account.is_managed ? (
            /* Managed fund: just show balance info */
            <div className="flex items-center justify-between py-2 px-1">
              <p className="text-lg text-muted-foreground">קרן מנוהלת — יתרה מעודכנת ידנית</p>
              <InvestmentAccountDialog
                accountToEdit={account}
                triggerButton={
                  <Button variant="outline" size="sm">
                    עדכן יתרה
                  </Button>
                }
              />
            </div>
          ) : (
            /* Self-directed: full holdings table */
            <div className="space-y-3">
              <HoldingsTable holdings={account.holdings} prices={prices} usdIlsRate={usdIlsRate} />
              <div className="flex justify-end pt-1">
                <AddHoldingDialog investmentAccountId={account.id} />
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
