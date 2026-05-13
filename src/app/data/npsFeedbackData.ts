// Deterministic seeded random for NPS feedback data
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

export interface FeedbackDaily {
  date: string;
  dayLabel: string;
  dayOfWeek: string;
  dayOfMonth: number;
  weekIndex: number;
  month: number;
  year: number;
  // Promoter reasons
  totalPromoters: number;
  friendlyAdvisor: number;
  quickService: number;
  concernsResolved: number;
  goodProfessionalism: number;
  delightfulExperience: number;
  // Detractor reasons
  totalDetractors: number;
  longWaitTimes: number;
  poorCustomerService: number;
  rudeAdvisor: number;
  lackOfProfessionalism: number;
  concernsNotResolved: number;
  upsetAboutTransfer: number;
}

export interface FeedbackWeekly {
  weekLabel: string;
  weekIndex: number;
  month: number;
  year: number;
  startDay: number;
  endDay: number;
  totalPromoters: number;
  friendlyAdvisor: number;
  quickService: number;
  concernsResolved: number;
  goodProfessionalism: number;
  delightfulExperience: number;
  totalDetractors: number;
  longWaitTimes: number;
  poorCustomerService: number;
  rudeAdvisor: number;
  lackOfProfessionalism: number;
  concernsNotResolved: number;
  upsetAboutTransfer: number;
}

export interface FeedbackMonthly {
  period: string;
  month: number;
  year: number;
  totalPromoters: number;
  friendlyAdvisor: number;
  quickService: number;
  concernsResolved: number;
  goodProfessionalism: number;
  delightfulExperience: number;
  totalDetractors: number;
  longWaitTimes: number;
  poorCustomerService: number;
  rudeAdvisor: number;
  lackOfProfessionalism: number;
  concernsNotResolved: number;
  upsetAboutTransfer: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/*  Promoter reason keys + labels + colors (greens/teals)              */
/* ------------------------------------------------------------------ */

export const PROMOTER_REASONS = [
  { key: "friendlyAdvisor", label: "Friendly Advisor", color: "#22c55e" },
  { key: "quickService", label: "Quick Service", color: "#3b82f6" },
  { key: "concernsResolved", label: "Concerns Resolved", color: "#a855f7" },
  { key: "goodProfessionalism", label: "Good Professionalism", color: "#14b8a6" },
  { key: "delightfulExperience", label: "Delightful Experience", color: "#f59e0b" },
] as const;

/* ------------------------------------------------------------------ */
/*  Detractor reason keys + labels + colors                            */
/* ------------------------------------------------------------------ */

export const DETRACTOR_REASONS = [
  { key: "longWaitTimes", label: "Long Wait Times", color: "#ef4444" },
  { key: "poorCustomerService", label: "Poor Customer Service", color: "#f97316" },
  { key: "rudeAdvisor", label: "Rude Advisor", color: "#8b5cf6" },
  { key: "lackOfProfessionalism", label: "Lack of Professionalism", color: "#ec4899" },
  { key: "concernsNotResolved", label: "Concerns Not Resolved", color: "#0ea5e9" },
  { key: "upsetAboutTransfer", label: "Upset About Transfer", color: "#64748b" },
] as const;

/* ------------------------------------------------------------------ */
/*  Daily generation for Feb + Mar 2026                                */
/* ------------------------------------------------------------------ */

function generateDailyData(): FeedbackDaily[] {
  const rand = seededRandom(88888);
  const data: FeedbackDaily[] = [];

  const months = [
    { year: 2026, month: 2, days: 28 },
    { year: 2026, month: 3, days: 31 },
  ];

  for (const { year, month, days } of months) {
    const seasonFactor = month === 2 ? 0.95 : 1.05;

    for (let d = 1; d <= days; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dow = dateObj.getDay();
      const dayName = DAY_NAMES[dow];
      const isWeekend = dow === 0 || dow === 6;

      const noise = () => 1 + (rand() - 0.5) * 0.3;

      // Promoter responses: ~12/day weekday, ~4 weekend
      const basePromoters = isWeekend ? 4 : 12;
      const totalPromoters = Math.max(2, Math.round(basePromoters * seasonFactor * noise()));

      // Detractor responses: ~5/day weekday, ~2 weekend
      const baseDetractors = isWeekend ? 2 : 5;
      const totalDetractors = Math.max(1, Math.round(baseDetractors * seasonFactor * noise()));

      // Split promoter reasons (approximate pcts with noise)
      // Friendly advisor ~28%, quick service ~24%, concerns resolved ~22%, professionalism ~15%, delightful ~11%
      const pProms = splitWithNoise(rand, totalPromoters, [0.28, 0.24, 0.22, 0.15, 0.11]);
      const [friendlyAdvisor, quickService, concernsResolved, goodProfessionalism, delightfulExperience] = pProms;

      // Split detractor reasons (approximate pcts with noise)
      // Long wait ~25%, poor service ~20%, rude advisor ~15%, lack prof ~15%, not resolved ~15%, transfer ~10%
      const pDets = splitWithNoise(rand, totalDetractors, [0.25, 0.20, 0.15, 0.15, 0.15, 0.10]);
      const [longWaitTimes, poorCustomerService, rudeAdvisor, lackOfProfessionalism, concernsNotResolved, upsetAboutTransfer] = pDets;

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
        totalPromoters,
        friendlyAdvisor,
        quickService,
        concernsResolved,
        goodProfessionalism,
        delightfulExperience,
        totalDetractors,
        longWaitTimes,
        poorCustomerService,
        rudeAdvisor,
        lackOfProfessionalism,
        concernsNotResolved,
        upsetAboutTransfer,
      });
    }
  }

  return data;
}

/** Split a total into N buckets with given base proportions + noise, ensuring sum = total */
function splitWithNoise(
  rand: () => number,
  total: number,
  basePcts: number[]
): number[] {
  const raw = basePcts.map((p) => p * (1 + (rand() - 0.5) * 0.3));
  const rawSum = raw.reduce((s, v) => s + v, 0);
  const normalized = raw.map((v) => v / rawSum);
  const result = normalized.map((p) => Math.round(total * p));

  // Fix rounding to match total
  const diff = total - result.reduce((s, v) => s + v, 0);
  if (diff !== 0) {
    // Add/subtract from the largest bucket
    const maxIdx = result.indexOf(Math.max(...result));
    result[maxIdx] += diff;
  }
  return result.map((v) => Math.max(0, v));
}

/* ------------------------------------------------------------------ */
/*  Aggregation                                                        */
/* ------------------------------------------------------------------ */

const PROMOTER_FIELDS: (keyof FeedbackDaily)[] = [
  "totalPromoters", "friendlyAdvisor", "quickService",
  "concernsResolved", "goodProfessionalism", "delightfulExperience",
];

const DETRACTOR_FIELDS: (keyof FeedbackDaily)[] = [
  "totalDetractors", "longWaitTimes", "poorCustomerService",
  "rudeAdvisor", "lackOfProfessionalism", "concernsNotResolved", "upsetAboutTransfer",
];

const ALL_FIELDS = [...PROMOTER_FIELDS, ...DETRACTOR_FIELDS];

function sumField(items: FeedbackDaily[], field: keyof FeedbackDaily): number {
  return items.reduce((sum, item) => sum + (item[field] as number), 0);
}

function aggregateWeekly(daily: FeedbackDaily[]): FeedbackWeekly[] {
  const buckets = new Map<string, FeedbackDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${d.month}-${d.weekIndex}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, items]) => {
      const { weekIndex, month, year } = items[0];
      const agg: any = {
        weekLabel: `Week ${weekIndex + 1}`,
        weekIndex,
        month,
        year,
        startDay: items[0].dayOfMonth,
        endDay: items[items.length - 1].dayOfMonth,
      };
      for (const f of ALL_FIELDS) agg[f] = sumField(items, f);
      return agg as FeedbackWeekly;
    });
}

function aggregateMonthly(daily: FeedbackDaily[]): FeedbackMonthly[] {
  const buckets = new Map<string, FeedbackDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${d.month}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, items]) => {
      const { month, year } = items[0];
      const agg: any = {
        period: `${MONTH_NAMES[month - 1]} ${year}`,
        month,
        year,
      };
      for (const f of ALL_FIELDS) agg[f] = sumField(items, f);
      return agg as FeedbackMonthly;
    });
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export const feedbackDailyData = generateDailyData();
export const feedbackWeeklyData = aggregateWeekly(feedbackDailyData);
export const feedbackMonthlyData = aggregateMonthly(feedbackDailyData);

export const availableFeedbackMonths = feedbackMonthlyData.map((m) => ({
  month: m.month,
  year: m.year,
  label: m.period,
}));

export function getFeedbackDailyByWeek(year: number, month: number, weekIndex: number): FeedbackDaily[] {
  return feedbackDailyData.filter(
    (d) => d.year === year && d.month === month && d.weekIndex === weekIndex
  );
}

export function getFeedbackWeeklyByMonth(year: number, month: number): FeedbackWeekly[] {
  return feedbackWeeklyData.filter((d) => d.year === year && d.month === month);
}

export function getFeedbackMonthlyAggregate(year: number, month: number): FeedbackMonthly | undefined {
  return feedbackMonthlyData.find((d) => d.year === year && d.month === month);
}