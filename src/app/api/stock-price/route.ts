import { NextRequest, NextResponse } from 'next/server';

interface YahooQuote {
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  currency?: string;
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: YahooQuote;
    }>;
    error?: unknown;
  };
}

async function fetchTickerPrice(
  ticker: string,
): Promise<{ ticker: string; price: number; currency: string; changePercent: number | null }> {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
    },
    next: { revalidate: 0 }, // always fresh
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance error for ${ticker}: ${res.status}`);
  }

  const data = (await res.json()) as YahooChartResponse;
  const meta = data?.chart?.result?.[0]?.meta;

  if (!meta?.regularMarketPrice) {
    throw new Error(`No price data for ${ticker}`);
  }

  const price = meta.regularMarketPrice;
  const prevClose = meta.regularMarketPreviousClose ?? null;
  const changePercent = prevClose && prevClose > 0 ? ((price - prevClose) / prevClose) * 100 : null;

  return {
    ticker,
    price,
    currency: meta.currency ?? 'USD',
    changePercent,
  };
}

export async function GET(request: NextRequest) {
  const tickersParam = request.nextUrl.searchParams.get('tickers');
  if (!tickersParam) {
    return NextResponse.json({ error: 'Missing tickers parameter' }, { status: 400 });
  }

  const tickers = tickersParam
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
  if (tickers.length === 0) {
    return NextResponse.json({ error: 'No valid tickers' }, { status: 400 });
  }

  const results = await Promise.allSettled(tickers.map(fetchTickerPrice));

  const prices: Record<
    string,
    { ticker: string; price: number; currency: string; changePercent: number | null }
  > = {};

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      prices[tickers[i]] = result.value;
    } else {
      console.warn(`Failed to fetch price for ${tickers[i]}:`, result.reason);
      // Return null price rather than failing the whole request
    }
  });

  return NextResponse.json(prices);
}
