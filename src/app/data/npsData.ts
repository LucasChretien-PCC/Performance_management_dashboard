// Deterministic seeded random for NPS data
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

export interface NpsDaily {
  date: string;
  dayLabel: string;
  dayOfWeek: string;
  dayOfMonth: number;
  weekIndex: number;
  month: number;
  year: number;
  responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  promotersPct: number;
  passivesPct: number;
  detractorsPct: number;
  npsScore: number;
}

export interface NpsWeekly {
  weekLabel: string;
  weekIndex: number;
  month: number;
  year: number;
  startDay: number;
  endDay: number;
  responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  promotersPct: number;
  passivesPct: number;
  detractorsPct: number;
  npsScore: number;
}

export interface NpsMonthly {
  period: string;
  month: number;
  year: number;
  responses: number;
  promoters: number;
  passives: number;
  detractors: number;
  promotersPct: number;
  passivesPct: number;
  detractorsPct: number;
  npsScore: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/*  Daily generation for Feb + Mar 2026                                */
/*  Target: NPS avg ~20, never negative                                */
/*  Typical split: ~35% promoters, ~45% passives, ~20% detractors      */
/*  => NPS = 35 - 20 = 15 (we nudge promoters up a bit for avg ~20)   */
/* ------------------------------------------------------------------ */

function generateDailyData(): NpsDaily[] {
  const rand = seededRandom(77777);
  const data: NpsDaily[] = [];

  const months = [
    { year: 2026, month: 2, days: 28 },
    { year: 2026, month: 3, days: 31 },
  ];

  for (const { year, month, days } of months) {
    // ~30 responses/day on weekdays, ~10 on weekends
    const seasonFactor = month === 2 ? 0.95 : 1.05;

    for (let d = 1; d <= days; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dow = dateObj.getDay();
      const dayName = DAY_NAMES[dow];
      const isWeekend = dow === 0 || dow === 6;

      const baseResponses = isWeekend ? 10 : 30;
      const noise = () => 1 + (rand() - 0.5) * 0.3;
      const responses = Math.max(5, Math.round(baseResponses * seasonFactor * noise()));

      // Target: promotersPct ~37%, detractorsPct ~15%, passivesPct = remainder
      // This gives NPS = 37 - 15 = 22, with noise it averages ~20
      const baseProm = 0.37 + (rand() - 0.5) * 0.10;   // 32-42%
      const baseDet = 0.15 + (rand() - 0.5) * 0.08;     // 11-19%

      // Ensure NPS stays positive: promotersPct must be > detractorsPct
      const detractorsPct = Math.max(0.05, Math.min(baseDet, baseProm - 0.02));
      const promotersPct = Math.max(detractorsPct + 0.02, baseProm);
      const passivesPct = 1 - promotersPct - detractorsPct;

      const promoters = Math.round(responses * promotersPct);
      const detractors = Math.round(responses * detractorsPct);
      const passives = responses - promoters - detractors;

      const actualPromPct = (promoters / responses) * 100;
      const actualDetPct = (detractors / responses) * 100;
      const actualPassPct = (passives / responses) * 100;
      const npsScore = Math.round(actualPromPct - actualDetPct);

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
        responses,
        promoters: Math.max(0, promoters),
        passives: Math.max(0, passives),
        detractors: Math.max(0, detractors),
        promotersPct: parseFloat(actualPromPct.toFixed(1)),
        passivesPct: parseFloat(actualPassPct.toFixed(1)),
        detractorsPct: parseFloat(actualDetPct.toFixed(1)),
        npsScore: Math.max(0, npsScore),
      });
    }
  }

  return data;
}

/* ------------------------------------------------------------------ */
/*  Aggregation                                                        */
/* ------------------------------------------------------------------ */

function aggregateWeekly(daily: NpsDaily[]): NpsWeekly[] {
  const buckets = new Map<string, NpsDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${d.month}-${d.weekIndex}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, items]) => {
      const { weekIndex, month, year } = items[0];
      const responses = items.reduce((s, i) => s + i.responses, 0);
      const promoters = items.reduce((s, i) => s + i.promoters, 0);
      const passives = items.reduce((s, i) => s + i.passives, 0);
      const detractors = items.reduce((s, i) => s + i.detractors, 0);
      const promPct = (promoters / responses) * 100;
      const detPct = (detractors / responses) * 100;
      const passPct = (passives / responses) * 100;
      return {
        weekLabel: `Week ${weekIndex + 1}`,
        weekIndex,
        month,
        year,
        startDay: items[0].dayOfMonth,
        endDay: items[items.length - 1].dayOfMonth,
        responses,
        promoters,
        passives,
        detractors,
        promotersPct: parseFloat(promPct.toFixed(1)),
        passivesPct: parseFloat(passPct.toFixed(1)),
        detractorsPct: parseFloat(detPct.toFixed(1)),
        npsScore: Math.max(0, Math.round(promPct - detPct)),
      };
    });
}

function aggregateMonthly(daily: NpsDaily[]): NpsMonthly[] {
  const buckets = new Map<string, NpsDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${d.month}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, items]) => {
      const { month, year } = items[0];
      const responses = items.reduce((s, i) => s + i.responses, 0);
      const promoters = items.reduce((s, i) => s + i.promoters, 0);
      const passives = items.reduce((s, i) => s + i.passives, 0);
      const detractors = items.reduce((s, i) => s + i.detractors, 0);
      const promPct = (promoters / responses) * 100;
      const detPct = (detractors / responses) * 100;
      const passPct = (passives / responses) * 100;
      return {
        period: `${MONTH_NAMES[month - 1]} ${year}`,
        month,
        year,
        responses,
        promoters,
        passives,
        detractors,
        promotersPct: parseFloat(promPct.toFixed(1)),
        passivesPct: parseFloat(passPct.toFixed(1)),
        detractorsPct: parseFloat(detPct.toFixed(1)),
        npsScore: Math.max(0, Math.round(promPct - detPct)),
      };
    });
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export const npsDailyData = generateDailyData();
export const npsWeeklyData = aggregateWeekly(npsDailyData);
export const npsMonthlyData = aggregateMonthly(npsDailyData);

export const availableNpsMonths = npsMonthlyData.map((m) => ({
  month: m.month,
  year: m.year,
  label: m.period,
}));

export function getNpsDailyByMonth(year: number, month: number): NpsDaily[] {
  return npsDailyData.filter((d) => d.year === year && d.month === month);
}

export function getNpsDailyByWeek(year: number, month: number, weekIndex: number): NpsDaily[] {
  return npsDailyData.filter(
    (d) => d.year === year && d.month === month && d.weekIndex === weekIndex
  );
}

export function getNpsWeeklyByMonth(year: number, month: number): NpsWeekly[] {
  return npsWeeklyData.filter((d) => d.year === year && d.month === month);
}

export function getNpsMonthlyAggregate(year: number, month: number): NpsMonthly | undefined {
  return npsMonthlyData.find((d) => d.year === year && d.month === month);
}
