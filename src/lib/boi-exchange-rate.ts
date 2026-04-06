// ─── Bank of Israel Exchange Rate API Client ──────────────────────────────
// Uses the free, public BOI SDMX REST API (no auth required).
// Docs: https://edge.boi.org.il/FusionDataBrowser
// ──────────────────────────────────────────────────────────────────────────

const BOI_BASE_URL =
  'https://edge.boi.org.il/FusionEdgeServer/sdmx/v2/data/dataflow/BOI.STATISTICS/EXR/1.0';

export interface ExchangeRateEntry {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Representative rate (SHA'AR YATZIG) */
  rate: number;
}

/**
 * Fetches historical representative exchange rates from the Bank of Israel.
 *
 * @param currency - ISO currency code (e.g. 'USD', 'EUR', 'GBP')
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate   - End date   (YYYY-MM-DD)
 * @returns Array of { date, rate } sorted by date ascending.
 */
export async function fetchExchangeRates(
  currency: string,
  startDate: string,
  endDate: string,
): Promise<ExchangeRateEntry[]> {
  const seriesCode = `RER_${currency.toUpperCase()}_ILS`;
  const url = `${BOI_BASE_URL}/${seriesCode}?startperiod=${startDate}&endperiod=${endDate}&format=csv&c[DATA_TYPE]=OF00`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`BOI API error: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  return parseBOICSV(text);
}

/**
 * Looks up the exchange rate for a specific date.
 * If the exact date is not a business day, returns the closest preceding rate.
 *
 * @param rates - Pre-fetched array of rates (sorted by date asc)
 * @param targetDate - The date to look up (YYYY-MM-DD)
 */
export function getRateForDate(
  rates: ExchangeRateEntry[],
  targetDate: string,
): ExchangeRateEntry | undefined {
  // Binary-search-like: find latest entry ≤ targetDate
  let best: ExchangeRateEntry | undefined;
  for (const entry of rates) {
    if (entry.date <= targetDate) {
      best = entry;
    } else {
      break;
    }
  }
  return best;
}

// ─── Internal CSV Parser ──────────────────────────────────────────────────

function parseBOICSV(csv: string): ExchangeRateEntry[] {
  const lines = csv.trim().split('\n');
  if (lines.length < 2) return [];

  // Header: SERIES_CODE,FREQ,...,TIME_PERIOD,OBS_VALUE,RELEASE_STATUS
  const header = lines[0].split(',');
  const timePeriodIndex = header.indexOf('TIME_PERIOD');
  const obsValueIndex = header.indexOf('OBS_VALUE');

  if (timePeriodIndex === -1 || obsValueIndex === -1) return [];

  const entries: ExchangeRateEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    const date = cols[timePeriodIndex]?.trim();
    const rateStr = cols[obsValueIndex]?.trim();
    if (date && rateStr) {
      const rate = parseFloat(rateStr);
      if (!isNaN(rate)) {
        entries.push({ date, rate });
      }
    }
  }

  return entries.sort((a, b) => a.date.localeCompare(b.date));
}
