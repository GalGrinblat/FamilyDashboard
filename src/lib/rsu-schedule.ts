export interface VestScheduleItem {
  vest_date: string; // ISO date string YYYY-MM-DD
  shares_vested: number;
}

interface GenerateVestScheduleParams {
  grant_date: string;
  total_shares: number;
  cliff_months: number;
  vest_frequency_months: number;
  shares_per_vest: number | null;
  vest_percentage: number | null;
  cliff_vest_shares: number | null;
  cliff_vest_percentage: number | null;
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().split('T')[0];
}

export function generateVestSchedule({
  grant_date,
  total_shares,
  cliff_months,
  vest_frequency_months,
  shares_per_vest,
  vest_percentage,
  cliff_vest_shares,
  cliff_vest_percentage,
}: GenerateVestScheduleParams): VestScheduleItem[] {
  const regularAmount =
    shares_per_vest ??
    (vest_percentage != null ? Math.floor((total_shares * vest_percentage) / 100) : null);

  if (regularAmount == null || regularAmount <= 0) return [];

  const cliffAmount =
    cliff_vest_shares ??
    (cliff_vest_percentage != null
      ? Math.floor((total_shares * cliff_vest_percentage) / 100)
      : regularAmount);

  const schedule: VestScheduleItem[] = [];
  let remaining = total_shares;
  let vestIndex = 0;

  while (remaining > 0) {
    const vestDate = addMonths(grant_date, cliff_months + vestIndex * vest_frequency_months);
    const isFirst = vestIndex === 0;
    const amount = isFirst ? Math.min(cliffAmount, remaining) : Math.min(regularAmount, remaining);

    schedule.push({ vest_date: vestDate, shares_vested: amount });
    remaining -= amount;
    vestIndex++;

    // Safety: cap at 1000 events
    if (vestIndex > 1000) break;
  }

  return schedule;
}
