'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
  INCOME_TAX_BRACKETS,
  CREDIT_POINT_MONTHLY_VALUE,
  DEFAULT_CREDIT_POINTS,
  BITUACH_LEUMI,
  HEALTH_TAX,
  PENSION,
  TAX_YEAR,
  type TaxBracket,
  type TieredRate,
} from '@/lib/tax-constants';

// ─── Calculation helpers ──────────────────────────────────────────────────

interface BracketResult {
  bracket: TaxBracket;
  applicableSalary: number;
  tax: number;
}

function calculateIncomeTaxBrackets(gross: number): BracketResult[] {
  const results: BracketResult[] = [];
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (gross < bracket.from) break;
    const applicableTop = Math.min(gross, bracket.to);
    const applicableSalary = applicableTop - bracket.from + 1;
    const tax = applicableSalary * bracket.rate;
    results.push({ bracket, applicableSalary, tax });
  }
  return results;
}

interface TieredResult {
  config: TieredRate;
  reducedAmount: number;
  reducedTax: number;
  fullAmount: number;
  fullTax: number;
  total: number;
}

function calculateTieredDeduction(gross: number, config: TieredRate): TieredResult {
  const effective = Math.min(gross, config.ceiling);
  const reducedAmount = Math.min(effective, config.threshold);
  const reducedTax = reducedAmount * config.reducedRate;
  const fullAmount = Math.max(0, effective - config.threshold);
  const fullTax = fullAmount * config.fullRate;
  return { config, reducedAmount, reducedTax, fullAmount, fullTax, total: reducedTax + fullTax };
}

// ─── Formatter ────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return `₪${Math.round(n).toLocaleString()}`;
}

function fmtDec(n: number): string {
  return `₪${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function pct(rate: number): string {
  const value = Math.round(rate * 1000) / 10; // e.g. 0.035 → 3.5
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}%`;
}

// ─── Chart Colors ─────────────────────────────────────────────────────────

const COLORS = {
  incomeTax: '#ef4444', // red-500
  bituachLeumi: '#f59e0b', // amber-500
  healthTax: '#8b5cf6', // violet-500
  pension: '#3b82f6', // blue-500
  net: '#10b981', // emerald-500
};

// ─── Component ────────────────────────────────────────────────────────────

export function SalaryCalculator() {
  const [grossStr, setGrossStr] = useState('');
  const [creditPointsStr, setCreditPointsStr] = useState(DEFAULT_CREDIT_POINTS.toString());

  const gross = parseFloat(grossStr) || 0;
  const creditPoints = parseFloat(creditPointsStr) || 0;

  const calculation = useMemo(() => {
    if (gross <= 0) return null;

    // Income tax
    const bracketResults = calculateIncomeTaxBrackets(gross);
    const grossIncomeTax = bracketResults.reduce((s, b) => s + b.tax, 0);
    const creditDiscount = creditPoints * CREDIT_POINT_MONTHLY_VALUE;
    const incomeTax = Math.max(0, grossIncomeTax - creditDiscount);

    // Bituach Leumi
    const bl = calculateTieredDeduction(gross, BITUACH_LEUMI);

    // Health Tax
    const ht = calculateTieredDeduction(gross, HEALTH_TAX);

    // Pension (employee)
    const pensionAmount = gross * PENSION.employeeRate;

    // Net
    const totalDeductions = incomeTax + bl.total + ht.total + pensionAmount;
    const net = gross - totalDeductions;

    return {
      bracketResults,
      grossIncomeTax,
      creditDiscount,
      incomeTax,
      bl,
      ht,
      pensionAmount,
      totalDeductions,
      net,
    };
  }, [gross, creditPoints]);

  const chartData = calculation
    ? [
        { name: 'מס הכנסה', value: Math.round(calculation.incomeTax), color: COLORS.incomeTax },
        {
          name: 'ביטוח לאומי',
          value: Math.round(calculation.bl.total),
          color: COLORS.bituachLeumi,
        },
        { name: 'מס בריאות', value: Math.round(calculation.ht.total), color: COLORS.healthTax },
        {
          name: 'פנסיה (עובד)',
          value: Math.round(calculation.pensionAmount),
          color: COLORS.pension,
        },
        { name: 'נטו', value: Math.round(calculation.net), color: COLORS.net },
      ]
    : [];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* ─── Input Column ───────────────────────────────────────── */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>נתוני שכר</CardTitle>
            <CardDescription>הזן משכורת ברוטו חודשית ומספר נקודות זיכוי</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="gross-salary" className="text-base">
                שכר ברוטו חודשי (₪)
              </Label>
              <Input
                id="gross-salary"
                type="number"
                placeholder="למשל 20,000"
                value={grossStr}
                onChange={(e) => setGrossStr(e.target.value)}
                className="text-lg"
                min={0}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="credit-points" className="text-base">
                נקודות זיכוי
              </Label>
              <Input
                id="credit-points"
                type="number"
                step="0.25"
                value={creditPointsStr}
                onChange={(e) => setCreditPointsStr(e.target.value)}
                className="text-lg"
                min={0}
              />
              <p className="text-base text-muted-foreground">
                ברירת מחדל: {DEFAULT_CREDIT_POINTS} נק&apos; (תושב ישראלי). ערך כל נקודה:{' '}
                {fmt(CREDIT_POINT_MONTHLY_VALUE)}/חודש (סעיף 36א).
              </p>
            </div>

            <div className="rounded-lg bg-zinc-50 dark:bg-zinc-900 p-3 text-base text-muted-foreground">
              שנת מס: <strong>{TAX_YEAR}</strong> · הנתונים מבוססים על{' '}
              <span className="font-medium">פקודת מס הכנסה</span> · לא כולל קרן השתלמות, שווי רכב
              ובונוסים
            </div>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        {calculation && (
          <Card>
            <CardHeader>
              <CardTitle>התפלגות השכר</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    innerRadius={50}
                    paddingAngle={2}
                  >
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: unknown) => [`${fmt(Number(value))}`, '']}
                    contentStyle={{
                      borderRadius: '0.75rem',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--popover)',
                      color: 'var(--popover-foreground)',
                    }}
                  />
                  <Legend
                    formatter={(value) => {
                      const item = chartData.find((d) => d.name === value);
                      return `${value} — ${item ? fmt(item.value) : ''} (${item && gross > 0 ? ((item.value / gross) * 100).toFixed(1) : 0}%)`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Output Column ──────────────────────────────────────── */}
      <div className="space-y-6">
        {calculation ? (
          <>
            {/* Net Salary Hero */}
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-zinc-950">
              <CardContent className="p-6 text-center space-y-2">
                <p className="text-base text-muted-foreground">שכר נטו משוער</p>
                <p className="text-5xl font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {fmt(calculation.net)}
                </p>
                <p className="text-base text-muted-foreground">
                  מתוך ברוטו של {fmt(gross)} · סה&quot;כ ניכויים {fmt(calculation.totalDeductions)}{' '}
                  ({gross > 0 ? ((calculation.totalDeductions / gross) * 100).toFixed(1) : 0}%)
                </p>
              </CardContent>
            </Card>

            {/* Income Tax Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.incomeTax }}
                    />
                    מס הכנסה
                  </CardTitle>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400 tabular-nums">
                    {fmt(calculation.incomeTax)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                {calculation.bracketResults.map((br, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-base py-1.5 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                  >
                    <span className="text-muted-foreground">
                      {br.bracket.label}: {pct(br.bracket.rate)} על {fmt(br.bracket.from)}–
                      {br.bracket.to === Infinity ? '∞' : fmt(br.bracket.to)}
                    </span>
                    <span className="tabular-nums font-medium">{fmtDec(br.tax)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between text-base py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-muted-foreground">סה&quot;כ לפני זיכוי</span>
                  <span className="tabular-nums">{fmtDec(calculation.grossIncomeTax)}</span>
                </div>
                <div className="flex items-center justify-between text-base py-1.5 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-muted-foreground">
                    נקודות זיכוי: {creditPoints} × {fmt(CREDIT_POINT_MONTHLY_VALUE)}/חודש
                  </span>
                  <span className="tabular-nums text-emerald-600 dark:text-emerald-400">
                    −{fmtDec(calculation.creditDiscount)}
                  </span>
                </div>
                <p className="text-base text-muted-foreground pt-2">
                  סעיף 121 לפקודת מס הכנסה · נקודות זיכוי: סעיף 36א
                </p>
              </CardContent>
            </Card>

            {/* Bituach Leumi Breakdown */}
            <TieredDeductionCard
              title="ביטוח לאומי"
              result={calculation.bl}
              color={COLORS.bituachLeumi}
              colorClass="text-amber-600 dark:text-amber-400"
            />

            {/* Health Tax Breakdown */}
            <TieredDeductionCard
              title="מס בריאות"
              result={calculation.ht}
              color={COLORS.healthTax}
              colorClass="text-violet-600 dark:text-violet-400"
            />

            {/* Pension Breakdown */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS.pension }}
                    />
                    {PENSION.label}
                  </CardTitle>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400 tabular-nums">
                    {fmt(calculation.pensionAmount)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between text-base py-1.5">
                  <span className="text-muted-foreground">
                    {pct(PENSION.employeeRate)} × {fmt(gross)}
                  </span>
                  <span className="tabular-nums font-medium">
                    {fmtDec(calculation.pensionAmount)}
                  </span>
                </div>
                <p className="text-base text-muted-foreground pt-2">{PENSION.clause}</p>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <p className="text-lg">הזן שכר ברוטו כדי לראות את פירוט הניכויים</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ─── Reusable Tiered Deduction Card ───────────────────────────────────────

function TieredDeductionCard({
  title,
  result,
  color,
  colorClass,
}: {
  title: string;
  result: TieredResult;
  color: string;
  colorClass: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
            {title}
          </CardTitle>
          <span className={`text-xl font-bold ${colorClass} tabular-nums`}>
            {fmt(result.total)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        <div className="flex items-center justify-between text-base py-1.5 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-muted-foreground">
            שיעור מופחת: {pct(result.config.reducedRate)} על ₪0–{fmt(result.config.threshold)}
          </span>
          <span className="tabular-nums font-medium">{fmtDec(result.reducedTax)}</span>
        </div>
        {result.fullAmount > 0 && (
          <div className="flex items-center justify-between text-base py-1.5 border-b border-zinc-100 dark:border-zinc-800">
            <span className="text-muted-foreground">
              שיעור מלא: {pct(result.config.fullRate)} על {fmt(result.config.threshold + 1)}–
              {fmt(result.config.threshold + result.fullAmount)}
            </span>
            <span className="tabular-nums font-medium">{fmtDec(result.fullTax)}</span>
          </div>
        )}
        <p className="text-base text-muted-foreground pt-2">{result.config.clause}</p>
      </CardContent>
    </Card>
  );
}
