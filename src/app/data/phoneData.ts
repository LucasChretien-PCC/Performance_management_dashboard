// Deterministic seeded random for phone volume data
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

export interface PhoneDaily {
  date: string;          // "2026-02-01"
  dayLabel: string;      // "Mon 1"
  dayOfWeek: string;     // "Mon"
  dayOfMonth: number;
  weekIndex: number;     // 0-based week within the month
  month: number;
  year: number;
  inbound: number;
  outbound: number;
  inboundRedemptions: number;
  inboundInvestmentQuestions: number;
  inboundBookAppointment: number;
  inboundMisc: number;
  outboundInsurance: number;
  outboundMortgage: number;
  outboundOtherProducts: number;
}

export interface PhoneWeekly {
  weekLabel: string;     // "Week 1"
  weekIndex: number;
  month: number;
  year: number;
  startDay: number;
  endDay: number;
  inbound: number;
  outbound: number;
  inboundRedemptions: number;
  inboundInvestmentQuestions: number;
  inboundBookAppointment: number;
  inboundMisc: number;
  outboundInsurance: number;
  outboundMortgage: number;
  outboundOtherProducts: number;
}

export interface PhoneMonthly {
  period: string;        // "Feb 2026"
  month: number;
  year: number;
  inbound: number;
  outbound: number;
  inboundRedemptions: number;
  inboundInvestmentQuestions: number;
  inboundBookAppointment: number;
  inboundMisc: number;
  outboundInsurance: number;
  outboundMortgage: number;
  outboundOtherProducts: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/*  Daily generation for Feb + Mar 2026                                */
/*  Yearly targets: inbound ~100k, outbound ~5k                       */
/* ------------------------------------------------------------------ */

function generateDailyData(): PhoneDaily[] {
  const rand = seededRandom(54321);
  const data: PhoneDaily[] = [];

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
    // Monthly base (yearly / 12)
    const monthlyInbound = Math.round(100000 / 12);   // ~8333
    const monthlyOutbound = Math.round(5000 / 12);     // ~417

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

      const dailyInbound = Math.round(monthlyInbound * seasonFactor * dayFactor * normalizer * noise());
      const dailyOutbound = Math.round(monthlyOutbound * seasonFactor * dayFactor * normalizer * noise());

      // Inbound reason split
      const redemptionPct = 0.55 + (rand() - 0.5) * 0.06;
      const investPct = 0.20 + (rand() - 0.5) * 0.04;
      const bookPct = 0.15 + (rand() - 0.5) * 0.04;
      const inboundRedemptions = Math.round(dailyInbound * redemptionPct);
      const inboundInvestmentQuestions = Math.round(dailyInbound * investPct);
      const inboundBookAppointment = Math.round(dailyInbound * bookPct);
      const inboundMisc = dailyInbound - inboundRedemptions - inboundInvestmentQuestions - inboundBookAppointment;

      // Outbound reason split
      const insurancePct = 0.40 + (rand() - 0.5) * 0.04;
      const mortgagePct = 0.35 + (rand() - 0.5) * 0.04;
      const outboundInsurance = Math.round(dailyOutbound * insurancePct);
      const outboundMortgage = Math.round(dailyOutbound * mortgagePct);
      const outboundOtherProducts = dailyOutbound - outboundInsurance - outboundMortgage;

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
        inbound: Math.max(1, dailyInbound),
        outbound: Math.max(1, dailyOutbound),
        inboundRedemptions: Math.max(0, inboundRedemptions),
        inboundInvestmentQuestions: Math.max(0, inboundInvestmentQuestions),
        inboundBookAppointment: Math.max(0, inboundBookAppointment),
        inboundMisc: Math.max(0, inboundMisc),
        outboundInsurance: Math.max(0, outboundInsurance),
        outboundMortgage: Math.max(0, outboundMortgage),
        outboundOtherProducts: Math.max(0, outboundOtherProducts),
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

function sumField(items: PhoneDaily[], field: keyof PhoneDaily): number {
  return items.reduce((sum, item) => sum + (item[field] as number), 0);
}

function aggregateWeekly(daily: PhoneDaily[]): PhoneWeekly[] {
  const buckets = new Map<string, PhoneDaily[]>();
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
        inbound: sumField(items, "inbound"),
        outbound: sumField(items, "outbound"),
        inboundRedemptions: sumField(items, "inboundRedemptions"),
        inboundInvestmentQuestions: sumField(items, "inboundInvestmentQuestions"),
        inboundBookAppointment: sumField(items, "inboundBookAppointment"),
        inboundMisc: sumField(items, "inboundMisc"),
        outboundInsurance: sumField(items, "outboundInsurance"),
        outboundMortgage: sumField(items, "outboundMortgage"),
        outboundOtherProducts: sumField(items, "outboundOtherProducts"),
      };
    });
}

function aggregateMonthly(daily: PhoneDaily[]): PhoneMonthly[] {
  const buckets = new Map<string, PhoneDaily[]>();
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
        inbound: sumField(items, "inbound"),
        outbound: sumField(items, "outbound"),
        inboundRedemptions: sumField(items, "inboundRedemptions"),
        inboundInvestmentQuestions: sumField(items, "inboundInvestmentQuestions"),
        inboundBookAppointment: sumField(items, "inboundBookAppointment"),
        inboundMisc: sumField(items, "inboundMisc"),
        outboundInsurance: sumField(items, "outboundInsurance"),
        outboundMortgage: sumField(items, "outboundMortgage"),
        outboundOtherProducts: sumField(items, "outboundOtherProducts"),
      };
    });
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export const phoneDailyData = generateDailyData();
export const phoneWeeklyData = aggregateWeekly(phoneDailyData);
export const phoneMonthlyData = aggregateMonthly(phoneDailyData);

export const availablePhoneMonths = phoneMonthlyData.map((m) => ({
  month: m.month,
  year: m.year,
  label: m.period,
}));

export function getPhoneDailyByMonth(year: number, month: number): PhoneDaily[] {
  return phoneDailyData.filter((d) => d.year === year && d.month === month);
}

export function getPhoneDailyByWeek(year: number, month: number, weekIndex: number): PhoneDaily[] {
  return phoneDailyData.filter(
    (d) => d.year === year && d.month === month && d.weekIndex === weekIndex
  );
}

export function getPhoneWeeklyByMonth(year: number, month: number): PhoneWeekly[] {
  return phoneWeeklyData.filter((d) => d.year === year && d.month === month);
}

export function getPhoneMonthlyAggregate(year: number, month: number): PhoneMonthly | undefined {
  return phoneMonthlyData.find((d) => d.year === year && d.month === month);
}

/** Get all monthly data points for a given year */
export function getPhoneMonthlyByYear(year: number): PhoneMonthly[] {
  return phoneMonthlyData.filter((d) => d.year === year);
}

/** Yearly aggregate */
export function getPhoneYearlyAggregate(year: number): PhoneMonthly | undefined {
  const months = getPhoneMonthlyByYear(year);
  if (months.length === 0) return undefined;
  return {
    period: `${year}`,
    month: 0,
    year,
    inbound: months.reduce((s, m) => s + m.inbound, 0),
    outbound: months.reduce((s, m) => s + m.outbound, 0),
    inboundRedemptions: months.reduce((s, m) => s + m.inboundRedemptions, 0),
    inboundInvestmentQuestions: months.reduce((s, m) => s + m.inboundInvestmentQuestions, 0),
    inboundBookAppointment: months.reduce((s, m) => s + m.inboundBookAppointment, 0),
    inboundMisc: months.reduce((s, m) => s + m.inboundMisc, 0),
    outboundInsurance: months.reduce((s, m) => s + m.outboundInsurance, 0),
    outboundMortgage: months.reduce((s, m) => s + m.outboundMortgage, 0),
    outboundOtherProducts: months.reduce((s, m) => s + m.outboundOtherProducts, 0),
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