import { NextRequest, NextResponse } from 'next/server';
import { fetchStockPrices, isValidTicker } from '@/lib/stock-prices';

const MAX_TICKERS = 50;

export async function GET(request: NextRequest) {
  const tickersParam = request.nextUrl.searchParams.get('tickers');
  if (!tickersParam) {
    return NextResponse.json({ error: 'Missing tickers parameter' }, { status: 400 });
  }

  const raw = tickersParam
    .split(',')
    .map((t) => t.trim().toUpperCase())
    .filter(Boolean);

  if (raw.length === 0) {
    return NextResponse.json({ error: 'No valid tickers' }, { status: 400 });
  }

  if (raw.length > MAX_TICKERS) {
    return NextResponse.json({ error: `Too many tickers (max ${MAX_TICKERS})` }, { status: 400 });
  }

  const invalid = raw.filter((t) => !isValidTicker(t));
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: `Invalid ticker(s): ${invalid.join(', ')}` },
      { status: 400 },
    );
  }

  const prices = await fetchStockPrices(raw);
  return NextResponse.json(prices);
}
