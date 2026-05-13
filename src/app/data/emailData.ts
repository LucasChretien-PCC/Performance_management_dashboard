// Deterministic seeded random for email volume data
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

export interface EmailDaily {
  date: string;
  dayLabel: string;
  dayOfWeek: string;
  dayOfMonth: number;
  weekIndex: number;
  month: number;
  year: number;
  total: number;
  appointment: number;
  investmentQuestions: number;
  followUp: number;
  misc: number;
}

export interface EmailWeekly {
  weekLabel: string;
  weekIndex: number;
  month: number;
  year: number;
  startDay: number;
  endDay: number;
  total: number;
  appointment: number;
  investmentQuestions: number;
  followUp: number;
  misc: number;
}

export interface EmailMonthly {
  period: string;
  month: number;
  year: number;
  total: number;
  appointment: number;
  investmentQuestions: number;
  followUp: number;
  misc: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/*  Daily generation for Feb + Mar 2026                                */
/*  Yearly target: ~10,000 emails/year                                 */
/* ------------------------------------------------------------------ */

function generateDailyData(): EmailDaily[] {
  const rand = seededRandom(98765);
  const data: EmailDaily[] = [];

  const months = [
    { year: 2026, month: 1, days: 31 },
    { year: 2026, month: 2, days: 28 },
    { year: 2026, month: 3, days: 31 },
    { year: 2026, month: 4, days: 30 },
    { year: 2026, month: 5, days: 31 },
    { year: 2026, month: 6, days: 30 },
    { year: 2026, month: 7, days: 31 },
    { year: 2026, month: 8, days: 31 },
    { year: 2026, month: 9, days: 30 },
    { year: 2026, month: 10, days: 31 },
    { year: 2026, month: 11, days: 30 },
    { year: 2026, month: 12, days: 31 },
  ];

  const seasonFactors: Record<number, number> = {
    1: 0.95, 2: 0.97, 3: 1.02, 4: 1.05, 5: 1.03, 6: 0.98,
    7: 0.92, 8: 0.90, 9: 1.00, 10: 1.04, 11: 1.06, 12: 0.96,
  };

  for (const { year, month, days } of months) {
    const monthlyTotal = Math.round(10000 / 12); // ~833
    const seasonFactor = seasonFactors[month] ?? 1.0;

    for (let d = 1; d <= days; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dow = dateObj.getDay();
      const dayName = DAY_NAMES[dow];
      const isWeekend = dow === 0 || dow === 6;

      const dayFactor = isWeekend ? 0.3 : 1.15;
      const weekdaysInMonth = countWeekdays(year, month, days);
      const weekendsInMonth = days - weekdaysInMonth;
      const normalizer = 1 / (weekdaysInMonth * 1.15 + weekendsInMonth * 0.3);

      const noise = () => 1 + (rand() - 0.5) * 0.30;

      const total = Math.max(1, Math.round(monthlyTotal * seasonFactor * dayFactor * normalizer * noise()));

      // Reason split
      const apptPct = 0.50 + (rand() - 0.5) * 0.06;
      const investPct = 0.25 + (rand() - 0.5) * 0.04;
      const followPct = 0.15 + (rand() - 0.5) * 0.04;

      const appointment = Math.round(total * apptPct);
      const investmentQuestions = Math.round(total * investPct);
      const followUp = Math.round(total * followPct);
      const misc = total - appointment - investmentQuestions - followUp;

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
        total,
        appointment: Math.max(0, appointment),
        investmentQuestions: Math.max(0, investmentQuestions),
        followUp: Math.max(0, followUp),
        misc: Math.max(0, misc),
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

/* ------------------------------------------------------------------ */
/*  Aggregation                                                        */
/* ------------------------------------------------------------------ */

function sumField(items: EmailDaily[], field: keyof EmailDaily): number {
  return items.reduce((sum, item) => sum + (item[field] as number), 0);
}

function aggregateWeekly(daily: EmailDaily[]): EmailWeekly[] {
  const buckets = new Map<string, EmailDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${String(d.month).padStart(2, "0")}-${d.weekIndex}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, items]) => {
      const { weekIndex, month, year } = items[0];
      return {
        weekLabel: `Week ${weekIndex + 1}`,
        weekIndex,
        month,
        year,
        startDay: items[0].dayOfMonth,
        endDay: items[items.length - 1].dayOfMonth,
        total: sumField(items, "total"),
        appointment: sumField(items, "appointment"),
        investmentQuestions: sumField(items, "investmentQuestions"),
        followUp: sumField(items, "followUp"),
        misc: sumField(items, "misc"),
      };
    });
}

function aggregateMonthly(daily: EmailDaily[]): EmailMonthly[] {
  const buckets = new Map<string, EmailDaily[]>();
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
        total: sumField(items, "total"),
        appointment: sumField(items, "appointment"),
        investmentQuestions: sumField(items, "investmentQuestions"),
        followUp: sumField(items, "followUp"),
        misc: sumField(items, "misc"),
      };
    });
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export const emailDailyData = generateDailyData();
export const emailWeeklyData = aggregateWeekly(emailDailyData);
export const emailMonthlyData = aggregateMonthly(emailDailyData);

export const availableEmailMonths = emailMonthlyData.map((m) => ({
  month: m.month,
  year: m.year,
  label: m.period,
}));

export function getEmailDailyByMonth(year: number, month: number): EmailDaily[] {
  return emailDailyData.filter((d) => d.year === year && d.month === month);
}

export function getEmailDailyByWeek(year: number, month: number, weekIndex: number): EmailDaily[] {
  return emailDailyData.filter(
    (d) => d.year === year && d.month === month && d.weekIndex === weekIndex
  );
}

export function getEmailWeeklyByMonth(year: number, month: number): EmailWeekly[] {
  return emailWeeklyData.filter((d) => d.year === year && d.month === month);
}

export function getEmailMonthlyAggregate(year: number, month: number): EmailMonthly | undefined {
  return emailMonthlyData.find((d) => d.year === year && d.month === month);
}

/** Get all monthly data points for a given year */
export function getEmailMonthlyByYear(year: number): EmailMonthly[] {
  return emailMonthlyData.filter((d) => d.year === year);
}

/** Yearly aggregate */
export function getEmailYearlyAggregate(year: number): EmailMonthly | undefined {
  const months = getEmailMonthlyByYear(year);
  if (months.length === 0) return undefined;
  return {
    period: `${year}`,
    month: 0,
    year,
    total: months.reduce((s, m) => s + m.total, 0),
    appointment: months.reduce((s, m) => s + m.appointment, 0),
    investmentQuestions: months.reduce((s, m) => s + m.investmentQuestions, 0),
    followUp: months.reduce((s, m) => s + m.followUp, 0),
    misc: months.reduce((s, m) => s + m.misc, 0),
  };
}

/* ------------------------------------------------------------------ */
/*  Formatting helpers                                                 */
/* ------------------------------------------------------------------ */

export function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}