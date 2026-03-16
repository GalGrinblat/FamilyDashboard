export interface StockPriceResult {
  ticker: string;
  price: number;
  currency: string;
  changePercent: number | null;
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        regularMarketPreviousClose?: number;
        currency?: string;
      };
    }>;
    error?: unknown;
  };
}

// Valid ticker: 1–20 chars, uppercase letters/digits plus . - = ^ (covers BRK.A, TEVA.TA, BTC-USD, USDILS=X)
const TICKER_RE = /^[A-Z0-9.\-=^]{1,20}$/;

export function isValidTicker(ticker: string): boolean {
  return TICKER_RE.test(ticker.toUpperCase());
}

async function fetchOne(ticker: string): Promise<StockPriceResult> {
  if (!isValidTicker(ticker)) throw new Error(`Invalid ticker format: ${ticker}`);
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
    next: { revalidate: 0 },
  });

  if (!res.ok) throw new Error(`Yahoo Finance error for ${ticker}: ${res.status}`);

  const data = (await res.json()) as YahooChartResponse;
  const meta = data?.chart?.result?.[0]?.meta;

  if (!meta?.regularMarketPrice) throw new Error(`No price data for ${ticker}`);

  const price = meta.regularMarketPrice;
  const prevClose = meta.regularMarketPreviousClose ?? null;
  const changePercent = prevClose && prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : null;

  return { ticker, price, currency: meta.currency ?? 'USD', changePercent };
}

/**
 * Fetch live prices for a list of tickers.
 * Returns a map of ticker → result; missing/failed tickers are omitted.
 */
export async function fetchStockPrices(
  tickers: string[],
): Promise<Record<string, StockPriceResult>> {
  if (tickers.length === 0) return {};

  const results = await Promise.allSettled(tickers.map(fetchOne));
  const prices: Record<string, StockPriceResult> = {};

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      prices[tickers[i]] = result.value;
    } else {
      console.warn(`Failed to fetch price for ${tickers[i]}:`, result.reason);
    }
  });

  return prices;
}
