// Deterministic seeded random for flows data
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FlowDailyPoint {
  date: string;          // "2026-02-01"
  dayLabel: string;      // "Feb 1" or "Mon 2"
  dayOfWeek: string;     // "Mon", "Tue", etc.
  dayOfMonth: number;
  weekIndex: number;     // 0-based week within the month
  month: number;         // 1-12
  year: number;
  grossInflows: number;
  grossOutflows: number;
  transfersIn: number;
  investmentReturns: number;
  netFlow: number;
}

export interface FlowWeeklyPoint {
  weekLabel: string;     // "Week 1" etc.
  weekIndex: number;
  month: number;
  year: number;
  startDay: number;
  endDay: number;
  grossInflows: number;
  grossOutflows: number;
  transfersIn: number;
  investmentReturns: number;
  netFlow: number;
}

export interface FlowMonthlyPoint {
  period: string;        // "Feb 2026"
  month: number;
  year: number;
  grossInflows: number;
  grossOutflows: number;
  transfersIn: number;
  investmentReturns: number;
  netFlow: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/*  Daily generation for Feb + Mar 2026                                */
/*  Yearly targets: inflows 4%, outflows 12%, transfers 20%, returns 5%*/
/*  Monthly ≈ yearly/12, daily ≈ monthly/daysInMonth                   */
/* ------------------------------------------------------------------ */

function generateDailyData(): FlowDailyPoint[] {
  const rand = seededRandom(20260301);
  const data: FlowDailyPoint[] = [];

  const months = [
    { year: 2026, month: 1, days: 31 },  // Jan
    { year: 2026, month: 2, days: 28 },  // Feb (not leap)
    { year: 2026, month: 3, days: 31 },  // Mar
    { year: 2026, month: 4, days: 30 },  // Apr
    { year: 2026, month: 5, days: 31 },  // May
    { year: 2026, month: 6, days: 30 },  // Jun
    { year: 2026, month: 7, days: 31 },  // Jul
    { year: 2026, month: 8, days: 31 },  // Aug
    { year: 2026, month: 9, days: 30 },  // Sep
    { year: 2026, month: 10, days: 31 }, // Oct
    { year: 2026, month: 11, days: 30 }, // Nov
    { year: 2026, month: 12, days: 31 }, // Dec
  ];

  // Seasonal adjustment factors by month (1-indexed via array position)
  const seasonFactors: Record<number, number> = {
    1: 0.95, 2: 0.97, 3: 1.02, 4: 1.05, 5: 1.03, 6: 0.98,
    7: 0.92, 8: 0.90, 9: 1.00, 10: 1.04, 11: 1.06, 12: 0.96,
  };

  for (const { year, month, days } of months) {
    // Monthly base rates (yearly / 12)
    const monthlyInflows = 4.0 / 12;
    const monthlyOutflows = 12.0 / 12;
    const monthlyTransfers = 20.0 / 12;
    const monthlyReturns = 5.0 / 12;

    // Slight seasonal adjustment
    const seasonFactor = seasonFactors[month] ?? 1.0;

    for (let d = 1; d <= days; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dow = dateObj.getDay(); // 0=Sun
      const dayName = DAY_NAMES[dow];
      const isWeekend = dow === 0 || dow === 6;

      // Daily base = monthly / daysInMonth, with weekend dip
      const dayFactor = isWeekend ? 0.3 : 1.15; // weekends much lower
      // Normalize so sum ≈ monthly total
      const weekdaysInMonth = countWeekdays(year, month, days);
      const weekendsInMonth = days - weekdaysInMonth;
      const normalizer = 1 / (weekdaysInMonth * 1.15 + weekendsInMonth * 0.3);

      const dailyInflows = monthlyInflows * seasonFactor * dayFactor * normalizer;
      const dailyOutflows = monthlyOutflows * seasonFactor * dayFactor * normalizer;
      const dailyTransfers = monthlyTransfers * seasonFactor * dayFactor * normalizer;
      const dailyReturns = monthlyReturns * seasonFactor * dayFactor * normalizer;

      // Add noise ±20%
      const noise = () => 1 + (rand() - 0.5) * 0.40;

      const grossInflows = round4(dailyInflows * noise());
      const grossOutflows = round4(dailyOutflows * noise());
      const transfersIn = round4(dailyTransfers * noise());
      const investmentReturns = round4(dailyReturns * noise());
      const netFlow = round4(grossInflows - grossOutflows + transfersIn + investmentReturns);

      const weekIndex = Math.floor((d - 1) / 7);

      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      data.push({
        date: dateStr,
        dayLabel: `${dayName} ${d}`,
        dayOfWeek: dayName,
        dayOfMonth: d,
        weekIndex,
        month,
        year,
        grossInflows: Math.max(0.001, grossInflows),
        grossOutflows: Math.max(0.005, grossOutflows),
        transfersIn: Math.max(0.01, transfersIn),
        investmentReturns: round4(investmentReturns),
        netFlow,
      });
    }
  }

  return data;
}

function countWeekdays(year: number, month: number, days: number): number {
  let count = 0;
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

function round4(v: number): number {
  return Math.round(v * 10000) / 10000;
}

/* ------------------------------------------------------------------ */
/*  Aggregation                                                        */
/* ------------------------------------------------------------------ */

function sumRound(arr: number[]): number {
  return Math.round(arr.reduce((s, v) => s + v, 0) * 100) / 100;
}

function aggregateWeekly(daily: FlowDailyPoint[]): FlowWeeklyPoint[] {
  const buckets = new Map<string, FlowDailyPoint[]>();

  for (const d of daily) {
    const key = `${d.year}-${String(d.month).padStart(2, "0")}-${d.weekIndex}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, items]) => {
      const { weekIndex, month, year } = items[0];
      const startDay = items[0].dayOfMonth;
      const endDay = items[items.length - 1].dayOfMonth;
      return {
        weekLabel: `Week ${weekIndex + 1}`,
        weekIndex,
        month,
        year,
        startDay,
        endDay,
        grossInflows: sumRound(items.map((i) => i.grossInflows)),
        grossOutflows: sumRound(items.map((i) => i.grossOutflows)),
        transfersIn: sumRound(items.map((i) => i.transfersIn)),
        investmentReturns: sumRound(items.map((i) => i.investmentReturns)),
        netFlow: sumRound(items.map((i) => i.netFlow)),
      };
    });
}

function aggregateMonthly(daily: FlowDailyPoint[]): FlowMonthlyPoint[] {
  const buckets = new Map<string, FlowDailyPoint[]>();

  for (const d of daily) {
    const key = `${d.year}-${String(d.month).padStart(2, "0")}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, items]) => {
      const { month, year } = items[0];
      return {
        period: `${MONTH_NAMES[month - 1]} ${year}`,
        month,
        year,
        grossInflows: sumRound(items.map((i) => i.grossInflows)),
        grossOutflows: sumRound(items.map((i) => i.grossOutflows)),
        transfersIn: sumRound(items.map((i) => i.transfersIn)),
        investmentReturns: sumRound(items.map((i) => i.investmentReturns)),
        netFlow: sumRound(items.map((i) => i.netFlow)),
      };
    });
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export const dailyFlowData = generateDailyData();
export const weeklyFlowData = aggregateWeekly(dailyFlowData);
export const monthlyFlowData = aggregateMonthly(dailyFlowData);

/** Available months as {month, year} pairs */
export const availableMonths = monthlyFlowData.map((m) => ({
  month: m.month,
  year: m.year,
  label: m.period,
}));

/** Get daily data for a specific month */
export function getDailyByMonth(year: number, month: number): FlowDailyPoint[] {
  return dailyFlowData.filter((d) => d.year === year && d.month === month);
}

/** Get daily data for a specific week within a month */
export function getDailyByWeek(year: number, month: number, weekIndex: number): FlowDailyPoint[] {
  return dailyFlowData.filter(
    (d) => d.year === year && d.month === month && d.weekIndex === weekIndex
  );
}

/** Get weekly data for a specific month */
export function getWeeklyByMonth(year: number, month: number): FlowWeeklyPoint[] {
  return weeklyFlowData.filter((d) => d.year === year && d.month === month);
}

/** Get monthly aggregate for a specific month */
export function getMonthlyAggregate(year: number, month: number): FlowMonthlyPoint | undefined {
  return monthlyFlowData.find((d) => d.year === year && d.month === month);
}

/** Get all monthly data points for a given year (for yearly chart/table) */
export function getMonthlyByYear(year: number): FlowMonthlyPoint[] {
  return monthlyFlowData.filter((d) => d.year === year);
}

/** Yearly aggregate interface */
export interface FlowYearlyAggregate {
  year: number;
  label: string;
  grossInflows: number;
  grossOutflows: number;
  transfersIn: number;
  investmentReturns: number;
  netFlow: number;
}

/** Get yearly aggregate for a given year */
export function getYearlyAggregate(year: number): FlowYearlyAggregate | undefined {
  const months = getMonthlyByYear(year);
  if (months.length === 0) return undefined;
  return {
    year,
    label: `${year}`,
    grossInflows: sumRound(months.map((m) => m.grossInflows)),
    grossOutflows: sumRound(months.map((m) => m.grossOutflows)),
    transfersIn: sumRound(months.map((m) => m.transfersIn)),
    investmentReturns: sumRound(months.map((m) => m.investmentReturns)),
    netFlow: sumRound(months.map((m) => m.netFlow)),
  };
}

/* ------------------------------------------------------------------ */
/*  Badge color thresholds                                             */
/* ------------------------------------------------------------------ */

// Monthly thresholds (% of AUM for one month)
export function getFlowBadgeColor(
  value: number,
  metric: string,
  granularity: "monthly" | "weekly" | "daily" = "monthly"
): string {
  // Scale thresholds by granularity
  const scale = granularity === "weekly" ? 0.25 : granularity === "daily" ? 0.036 : 1;

  if (metric === "grossOutflows") {
    if (value <= 0.8 * scale) return "bg-green-100 text-green-800 border-green-200";
    if (value <= 1.0 * scale) return "bg-blue-100 text-blue-800 border-blue-200";
    if (value <= 1.2 * scale) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  }
  if (metric === "netFlow") {
    if (value >= 2.0 * scale) return "bg-green-100 text-green-800 border-green-200";
    if (value >= 1.2 * scale) return "bg-blue-100 text-blue-800 border-blue-200";
    if (value >= 0.8 * scale) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  }
  if (metric === "grossInflows") {
    if (value >= 0.4 * scale) return "bg-green-100 text-green-800 border-green-200";
    if (value >= 0.3 * scale) return "bg-blue-100 text-blue-800 border-blue-200";
    if (value >= 0.2 * scale) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  }
  if (metric === "transfersIn") {
    if (value >= 1.8 * scale) return "bg-green-100 text-green-800 border-green-200";
    if (value >= 1.5 * scale) return "bg-blue-100 text-blue-800 border-blue-200";
    if (value >= 1.2 * scale) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  }
  // investmentReturns
  if (value >= 0.5 * scale) return "bg-green-100 text-green-800 border-green-200";
  if (value >= 0.3 * scale) return "bg-blue-100 text-blue-800 border-blue-200";
  if (value >= 0.2 * scale) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  return "bg-red-100 text-red-800 border-red-200";
}

export function formatPct(value: number): string {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}