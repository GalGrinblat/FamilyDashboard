import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { RsuGrantSchema, RsuVestSchema } from '@/lib/schemas';
import type { RsuGrantWithVests, StockPrice } from '@/types/investment';
import { RsuGrantCard } from './RsuGrantCard';
import { RsuGrantDialog } from './RsuGrantDialog';

export async function RsuTab() {
  const supabase = await createClient();

  const [{ data: rawGrants }, { data: rawVests }, { data: rawAccounts }] = await Promise.all([
    supabase
      .from('rsu_grants')
      .select('*')
      .eq('is_active', true)
      .order('grant_date', { ascending: false }),
    supabase.from('rsu_vests').select('*').order('vest_date', { ascending: true }),
    supabase.from('investment_accounts').select('id, name').eq('is_active', true),
  ]);

  const grants = z.array(RsuGrantSchema).parse(rawGrants ?? []);
  const vests = z.array(RsuVestSchema).parse(rawVests ?? []);

  // Fetch live prices for all grant tickers
  const tickers = [...new Set(grants.map((g) => g.ticker))];
  let prices: Record<string, StockPrice> = {};

  if (tickers.length > 0) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/stock-price?tickers=${tickers.join(',')}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        prices = (await res.json()) as Record<string, StockPrice>;
      }
    } catch (err) {
      console.warn('Failed to fetch RSU stock prices:', err);
    }
  }

  // Enrich grants with vest data + computed fields
  const enrichedGrants: RsuGrantWithVests[] = grants.map((grant) => {
    const grantVests = vests.filter((v) => v.grant_id === grant.id);
    const totalVested = grantVests.reduce((sum, v) => sum + v.shares_vested, 0);
    const totalRemaining = Math.max(0, grant.total_shares - totalVested);
    const vestingPercent = grant.total_shares > 0 ? (totalVested / grant.total_shares) * 100 : 0;

    const currentPriceUsd = prices[grant.ticker]?.price ?? null;
    const currentValueUsd = currentPriceUsd !== null ? currentPriceUsd * totalVested : null;

    return {
      ...grant,
      vests: grantVests,
      totalVested,
      totalRemaining,
      vestingPercent,
      currentPriceUsd,
      currentValueUsd,
      estimatedSaleTax: null, // computed in card
      netAfterTaxUsd: null, // computed in card
    };
  });

  // Build a map of account id → name for the dialog
  const accountOptions = (rawAccounts ?? []) as { id: string; name: string }[];

  if (enrichedGrants.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-center py-12 text-muted-foreground text-sm">
          אין מענקי RSU פעילים. הוסף מענק ראשון כדי להתחיל.
        </div>
        <div className="flex justify-center">
          {accountOptions.length > 0 && (
            <RsuGrantDialog investmentAccountId={accountOptions[0].id} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enrichedGrants.map((grant) => (
        <RsuGrantCard key={grant.id} grant={grant} prices={prices} />
      ))}

      <div className="flex justify-center pt-2">
        {accountOptions.length > 0 && <RsuGrantDialog investmentAccountId={accountOptions[0].id} />}
      </div>
    </div>
  );
}
