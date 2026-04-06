'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Upload, Loader2, AlertTriangle, Download, Info } from 'lucide-react';
import {
  fetchExchangeRates,
  getRateForDate,
  type ExchangeRateEntry,
} from '@/lib/boi-exchange-rate';
import { CAPITAL_GAINS_TAX_RATE, CAPITAL_GAINS_CLAUSE } from '@/lib/tax-constants';

// ─── Types ────────────────────────────────────────────────────────────────

interface IBKRTrade {
  symbol: string;
  dateTime: string; // YYYY-MM-DD
  quantity: number; // positive=buy, negative=sell
  price: number; // USD per share
  proceeds: number; // USD total (negative for buys, positive for sells)
  currency: string;
}

interface MatchedTrade {
  symbol: string;
  buyDate: string;
  buyPriceUSD: number;
  buyRateILS: number;
  buyAmountILS: number;
  sellDate: string;
  sellPriceUSD: number;
  sellRateILS: number;
  sellAmountILS: number;
  quantity: number;
  profitILS: number;
  taxILS: number;
}

type Step = 'upload' | 'processing' | 'results';

// ─── Format helpers ───────────────────────────────────────────────────────

function fmt(n: number): string {
  return `₪${Math.round(n).toLocaleString()}`;
}

function fmtUSD(n: number): string {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Component ────────────────────────────────────────────────────────────

export function CapitalGainsCalculator() {
  const [step, setStep] = useState<Step>('upload');
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [matchedTrades, setMatchedTrades] = useState<MatchedTrade[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setStep('processing');
    setError(null);

    try {
      const text = await file.text();
      setStatusMessage('מנתח את קובץ ה-CSV...');
      const trades = parseIBKRCSV(text);

      if (trades.length === 0) {
        throw new Error(
          'לא נמצאו עסקאות בקובץ. ודא שהקובץ הוא Activity Statement מ-Interactive Brokers בפורמט CSV.',
        );
      }

      // Determine date range for exchange rates
      const allDates = trades.map((t) => t.dateTime).sort();
      const startDate = allDates[0];
      const endDate = allDates[allDates.length - 1];

      setStatusMessage(`שולף שערי חליפין מבנק ישראל (${startDate} עד ${endDate})...`);
      const rates = await fetchExchangeRates('USD', startDate, endDate);

      if (rates.length === 0) {
        throw new Error('לא התקבלו שערי חליפין מבנק ישראל. בדוק את טווח התאריכים.');
      }

      setStatusMessage('מחשב רווחי הון (FIFO)...');
      const matched = matchTradesFIFO(trades, rates);
      setMatchedTrades(matched);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה לא צפויה');
      setStep('upload');
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const totals = matchedTrades.reduce(
    (acc, t) => ({
      proceeds: acc.proceeds + t.sellAmountILS,
      costBasis: acc.costBasis + t.buyAmountILS,
      profit: acc.profit + t.profitILS,
      tax: acc.tax + t.taxILS,
    }),
    { proceeds: 0, costBasis: 0, profit: 0, tax: 0 },
  );

  const exportCSV = useCallback(() => {
    const header =
      'Symbol,Buy Date,Buy Price (USD),Buy Rate (ILS),Buy Total (ILS),Sell Date,Sell Price (USD),Sell Rate (ILS),Sell Total (ILS),Qty,Profit (ILS),Tax (ILS)\n';
    const rows = matchedTrades
      .map(
        (t) =>
          `${t.symbol},${t.buyDate},${t.buyPriceUSD.toFixed(2)},${t.buyRateILS.toFixed(4)},${t.buyAmountILS.toFixed(2)},${t.sellDate},${t.sellPriceUSD.toFixed(2)},${t.sellRateILS.toFixed(4)},${t.sellAmountILS.toFixed(2)},${t.quantity},${t.profitILS.toFixed(2)},${t.taxILS.toFixed(2)}`,
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `capital-gains-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [matchedTrades]);

  // ─── Render ─────────────────────────────────────────────────────────────

  if (step === 'processing') {
    return (
      <Card>
        <CardContent className="p-12 flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <p className="text-lg text-muted-foreground">{statusMessage}</p>
        </CardContent>
      </Card>
    );
  }

  if (step === 'upload') {
    return (
      <div className="space-y-6">
        {error && (
          <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-base text-red-700 dark:text-red-400">{error}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>העלאת קובץ</CardTitle>
            <CardDescription>
              הורד את ה-Activity Statement מתוך Interactive Brokers בפורמט CSV והעלה אותו כאן.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                  : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">גרור קובץ CSV לכאן</p>
              <p className="text-base text-muted-foreground mb-4">או לחץ כדי לבחור קובץ</p>
              <input
                type="file"
                accept=".csv"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileInput}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-500" />
              מידע חשוב
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-base text-muted-foreground">
            <p>
              <strong>שיעור מס רווחי הון:</strong> {(CAPITAL_GAINS_TAX_RATE * 100).toFixed(0)}% (
              {CAPITAL_GAINS_CLAUSE})
            </p>
            <p>
              <strong>שיטת חישוב:</strong> FIFO (First In First Out) — מכירה מותאמת לקניה הראשונה
            </p>
            <p>
              <strong>שערי חליפין:</strong> שער יציג של בנק ישראל ליום ביצוע העסקה (
              edge.boi.org.il)
            </p>
            <p>
              <strong>המרה למטבע:</strong> עלות הרכישה מומרת לפי שער יום הקניה, תמורת המכירה לפי שער
              יום המכירה
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Results ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-base text-muted-foreground mb-1">סה&quot;כ תמורה</p>
            <p className="text-2xl font-bold tabular-nums">{fmt(totals.proceeds)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 text-center">
            <p className="text-base text-muted-foreground mb-1">סה&quot;כ עלות מתואמת</p>
            <p className="text-2xl font-bold tabular-nums">{fmt(totals.costBasis)}</p>
          </CardContent>
        </Card>
        <Card
          className={
            totals.profit >= 0
              ? 'border-emerald-200 dark:border-emerald-800'
              : 'border-red-200 dark:border-red-800'
          }
        >
          <CardContent className="p-5 text-center">
            <p className="text-base text-muted-foreground mb-1">רווח חייב במס</p>
            <p
              className={`text-2xl font-bold tabular-nums ${
                totals.profit >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              {fmt(totals.profit)}
            </p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-zinc-950">
          <CardContent className="p-5 text-center">
            <p className="text-base text-muted-foreground mb-1">
              מס לתשלום ({(CAPITAL_GAINS_TAX_RATE * 100).toFixed(0)}%)
            </p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
              {fmt(Math.max(0, totals.tax))}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detail Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>פירוט עסקאות ({matchedTrades.length})</CardTitle>
            <CardDescription>
              שיטת FIFO · שער יציג של בנק ישראל · {CAPITAL_GAINS_CLAUSE}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportCSV}>
              <Download className="h-4 w-4 ml-2" />
              ייצוא CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStep('upload');
                setMatchedTrades([]);
              }}
            >
              קובץ חדש
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 pt-0 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">נייר ערך</TableHead>
                  <TableHead className="text-right">כמות</TableHead>
                  <TableHead className="text-right">תאריך קניה</TableHead>
                  <TableHead className="text-right">מחיר ($)</TableHead>
                  <TableHead className="text-right">שער BOI</TableHead>
                  <TableHead className="text-right">עלות (₪)</TableHead>
                  <TableHead className="text-right">תאריך מכירה</TableHead>
                  <TableHead className="text-right">מחיר ($)</TableHead>
                  <TableHead className="text-right">שער BOI</TableHead>
                  <TableHead className="text-right">תמורה (₪)</TableHead>
                  <TableHead className="text-right">רווח (₪)</TableHead>
                  <TableHead className="text-right">מס (₪)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matchedTrades.map((t, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{t.symbol}</TableCell>
                    <TableCell className="tabular-nums">{t.quantity}</TableCell>
                    <TableCell>{t.buyDate}</TableCell>
                    <TableCell className="tabular-nums">{fmtUSD(t.buyPriceUSD)}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {t.buyRateILS.toFixed(4)}
                    </TableCell>
                    <TableCell className="tabular-nums">{fmt(t.buyAmountILS)}</TableCell>
                    <TableCell>{t.sellDate}</TableCell>
                    <TableCell className="tabular-nums">{fmtUSD(t.sellPriceUSD)}</TableCell>
                    <TableCell className="tabular-nums text-muted-foreground">
                      {t.sellRateILS.toFixed(4)}
                    </TableCell>
                    <TableCell className="tabular-nums">{fmt(t.sellAmountILS)}</TableCell>
                    <TableCell
                      className={`tabular-nums font-medium ${
                        t.profitILS >= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {fmt(t.profitILS)}
                    </TableCell>
                    <TableCell className="tabular-nums">{fmt(t.taxILS)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Footer notes */}
      <Card>
        <CardContent className="p-4 text-base text-muted-foreground space-y-1">
          <p>
            <strong>{CAPITAL_GAINS_CLAUSE}</strong> · שיעור מס:{' '}
            {(CAPITAL_GAINS_TAX_RATE * 100).toFixed(0)}%
          </p>
          <p>שער חליפין: שער יציג של בנק ישראל ליום העסקה · מקור: edge.boi.org.il</p>
          <p>שיטת חישוב: FIFO (First In First Out)</p>
          <p className="text-amber-600 dark:text-amber-400 font-medium">
            ⚠️ חישוב זה הוא לצרכי הערכה בלבד ואינו מהווה ייעוץ מס. יש להתייעץ עם רואה חשבון.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── IBKR CSV Parser ──────────────────────────────────────────────────────

function parseIBKRCSV(csv: string): IBKRTrade[] {
  const trades: IBKRTrade[] = [];
  const lines = csv.split('\n');

  // Look for the "Trades" section
  let inTradesSection = false;
  let headers: string[] = [];

  for (const line of lines) {
    const cols = parseCSVLine(line);
    if (cols.length < 3) continue;

    // Detect section
    if (cols[0] === 'Trades' && cols[1] === 'Header') {
      inTradesSection = true;
      headers = cols;
      continue;
    }

    if (inTradesSection && cols[0] === 'Trades' && cols[1] === 'Data' && cols[2] === 'Order') {
      const getCol = (name: string) => {
        const idx = headers.indexOf(name);
        return idx >= 0 ? cols[idx] : '';
      };

      const symbol = getCol('Symbol');
      const dateTimeStr = getCol('Date/Time');
      const quantityStr = getCol('Quantity');
      const priceStr = getCol('T. Price');
      const proceedsStr = getCol('Proceeds');
      const currency = getCol('Currency');

      if (!symbol || !dateTimeStr || !quantityStr || !priceStr) continue;

      // Parse date — IBKR format is typically "YYYY-MM-DD, HH:MM:SS" or "YYYY-MM-DD"
      const datePart = dateTimeStr.split(',')[0].trim();

      trades.push({
        symbol,
        dateTime: datePart,
        quantity: parseFloat(quantityStr.replace(/,/g, '')),
        price: parseFloat(priceStr.replace(/,/g, '')),
        proceeds: parseFloat((proceedsStr || '0').replace(/,/g, '')),
        currency: currency || 'USD',
      });
    }

    // Stop if we hit a new section header
    if (inTradesSection && cols[0] !== 'Trades' && cols[0] !== '') {
      inTradesSection = false;
    }
  }

  return trades;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// ─── FIFO Matching ────────────────────────────────────────────────────────

interface LotEntry {
  symbol: string;
  date: string;
  price: number;
  remainingQty: number;
}

function matchTradesFIFO(trades: IBKRTrade[], rates: ExchangeRateEntry[]): MatchedTrade[] {
  const lots: Map<string, LotEntry[]> = new Map();
  const results: MatchedTrade[] = [];

  // Sort by date
  const sorted = [...trades].sort((a, b) => a.dateTime.localeCompare(b.dateTime));

  for (const trade of sorted) {
    if (trade.quantity > 0) {
      // Buy: add to lots
      const existing = lots.get(trade.symbol) || [];
      existing.push({
        symbol: trade.symbol,
        date: trade.dateTime,
        price: trade.price,
        remainingQty: trade.quantity,
      });
      lots.set(trade.symbol, existing);
    } else if (trade.quantity < 0) {
      // Sell: match against oldest lots (FIFO)
      let sellQty = Math.abs(trade.quantity);
      const symbolLots = lots.get(trade.symbol) || [];

      const sellRate = getRateForDate(rates, trade.dateTime);
      if (!sellRate) continue;

      while (sellQty > 0 && symbolLots.length > 0) {
        const lot = symbolLots[0];
        const matchQty = Math.min(sellQty, lot.remainingQty);

        const buyRate = getRateForDate(rates, lot.date);
        if (!buyRate) {
          lot.remainingQty -= matchQty;
          sellQty -= matchQty;
          if (lot.remainingQty <= 0) symbolLots.shift();
          continue;
        }

        const buyAmountILS = matchQty * lot.price * buyRate.rate;
        const sellAmountILS = matchQty * trade.price * sellRate.rate;
        const profitILS = sellAmountILS - buyAmountILS;
        const taxILS = Math.max(0, profitILS * CAPITAL_GAINS_TAX_RATE);

        results.push({
          symbol: trade.symbol,
          buyDate: lot.date,
          buyPriceUSD: lot.price,
          buyRateILS: buyRate.rate,
          buyAmountILS,
          sellDate: trade.dateTime,
          sellPriceUSD: trade.price,
          sellRateILS: sellRate.rate,
          sellAmountILS,
          quantity: matchQty,
          profitILS,
          taxILS,
        });

        lot.remainingQty -= matchQty;
        sellQty -= matchQty;
        if (lot.remainingQty <= 0) symbolLots.shift();
      }
    }
  }

  return results;
}
