// Deterministic seeded random for online access data
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

export interface LoginDaily {
  date: string;
  dayLabel: string;
  dayOfWeek: string;
  dayOfMonth: number;
  weekIndex: number;
  month: number;
  year: number;
  total: number;
  web: number;
  app: number;
}

export interface LoginWeekly {
  weekLabel: string;
  weekIndex: number;
  month: number;
  year: number;
  startDay: number;
  endDay: number;
  total: number;
  web: number;
  app: number;
}

export interface LoginMonthly {
  period: string;
  month: number;
  year: number;
  total: number;
  web: number;
  app: number;
}

export interface AppointmentDaily {
  date: string;
  dayLabel: string;
  dayOfWeek: string;
  dayOfMonth: number;
  weekIndex: number;
  month: number;
  year: number;
  total: number;
  kycUpdate: number;
  bankingInfoUpdate: number;
  financialPlanning: number;
  investmentChange: number;
  accountClosure: number;
  other: number;
}

export interface AppointmentWeekly {
  weekLabel: string;
  weekIndex: number;
  month: number;
  year: number;
  startDay: number;
  endDay: number;
  total: number;
  kycUpdate: number;
  bankingInfoUpdate: number;
  financialPlanning: number;
  investmentChange: number;
  accountClosure: number;
  other: number;
}

export interface AppointmentMonthly {
  period: string;
  month: number;
  year: number;
  total: number;
  kycUpdate: number;
  bankingInfoUpdate: number;
  financialPlanning: number;
  investmentChange: number;
  accountClosure: number;
  other: number;
}

export interface ChatDaily {
  date: string;
  dayLabel: string;
  dayOfWeek: string;
  dayOfMonth: number;
  weekIndex: number;
  month: number;
  year: number;
  total: number;
  kycUpdate: number;
  bankingInfoUpdate: number;
  financialPlanning: number;
  investmentChange: number;
  accountClosure: number;
  other: number;
}

export interface ChatWeekly {
  weekLabel: string;
  weekIndex: number;
  month: number;
  year: number;
  startDay: number;
  endDay: number;
  total: number;
  kycUpdate: number;
  bankingInfoUpdate: number;
  financialPlanning: number;
  investmentChange: number;
  accountClosure: number;
  other: number;
}

export interface ChatMonthly {
  period: string;
  month: number;
  year: number;
  total: number;
  kycUpdate: number;
  bankingInfoUpdate: number;
  financialPlanning: number;
  investmentChange: number;
  accountClosure: number;
  other: number;
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function countWeekdays(year: number, month: number, days: number): number {
  let count = 0;
  for (let d = 1; d <= days; d++) {
    const dow = new Date(year, month - 1, d).getDay();
    if (dow !== 0 && dow !== 6) count++;
  }
  return count;
}

const MONTHS_CONFIG = [
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

const SEASON_FACTORS: Record<number, number> = {
  1: 0.95, 2: 0.97, 3: 1.02, 4: 1.05, 5: 1.03, 6: 0.98,
  7: 0.92, 8: 0.90, 9: 1.00, 10: 1.04, 11: 1.06, 12: 0.96,
};

/* ------------------------------------------------------------------ */
/*  Login data: ~10k/year → ~833/month                                 */
/* ------------------------------------------------------------------ */

function generateLoginDaily(): LoginDaily[] {
  const rand = seededRandom(54321);
  const data: LoginDaily[] = [];

  for (const { year, month, days } of MONTHS_CONFIG) {
    const monthlyBase = Math.round(10000 / 12);
    const seasonFactor = SEASON_FACTORS[month];

    for (let d = 1; d <= days; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dow = dateObj.getDay();
      const dayName = DAY_NAMES[dow];
      const isWeekend = dow === 0 || dow === 6;

      const dayFactor = isWeekend ? 0.4 : 1.12;
      const weekdaysInMonth = countWeekdays(year, month, days);
      const weekendsInMonth = days - weekdaysInMonth;
      const normalizer = 1 / (weekdaysInMonth * 1.12 + weekendsInMonth * 0.4);

      const noise = () => 1 + (rand() - 0.5) * 0.25;
      const total = Math.max(1, Math.round(monthlyBase * seasonFactor * dayFactor * normalizer * noise()));

      const webPct = 0.50 + (rand() - 0.5) * 0.10;
      const web = Math.round(total * webPct);
      const app = total - web;

      const weekIndex = Math.floor((d - 1) / 7);
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      data.push({
        date: dateStr, dayLabel: `${dayName} ${d}`, dayOfWeek: dayName,
        dayOfMonth: d, weekIndex, month, year,
        total, web, app,
      });
    }
  }
  return data;
}

/* ------------------------------------------------------------------ */
/*  Appointments data: ~3k/year → ~250/month                           */
/* ------------------------------------------------------------------ */

function generateAppointmentDaily(): AppointmentDaily[] {
  const rand = seededRandom(11223);
  const data: AppointmentDaily[] = [];

  for (const { year, month, days } of MONTHS_CONFIG) {
    const monthlyBase = Math.round(3000 / 12);
    const seasonFactor = SEASON_FACTORS[month];

    for (let d = 1; d <= days; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dow = dateObj.getDay();
      const dayName = DAY_NAMES[dow];
      const isWeekend = dow === 0 || dow === 6;

      const dayFactor = isWeekend ? 0.2 : 1.18;
      const weekdaysInMonth = countWeekdays(year, month, days);
      const weekendsInMonth = days - weekdaysInMonth;
      const normalizer = 1 / (weekdaysInMonth * 1.18 + weekendsInMonth * 0.2);

      const noise = () => 1 + (rand() - 0.5) * 0.28;
      const total = Math.max(1, Math.round(monthlyBase * seasonFactor * dayFactor * normalizer * noise()));

      const kycPct = 0.10 + (rand() - 0.5) * 0.03;
      const bankingPct = 0.10 + (rand() - 0.5) * 0.03;
      const fpPct = 0.35 + (rand() - 0.5) * 0.06;
      const icPct = 0.25 + (rand() - 0.5) * 0.05;
      const acPct = 0.05 + (rand() - 0.5) * 0.02;

      const kycUpdate = Math.round(total * kycPct);
      const bankingInfoUpdate = Math.round(total * bankingPct);
      const financialPlanning = Math.round(total * fpPct);
      const investmentChange = Math.round(total * icPct);
      const accountClosure = Math.max(0, Math.round(total * acPct));
      const other = total - kycUpdate - bankingInfoUpdate - financialPlanning - investmentChange - accountClosure;

      const weekIndex = Math.floor((d - 1) / 7);
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      data.push({
        date: dateStr, dayLabel: `${dayName} ${d}`, dayOfWeek: dayName,
        dayOfMonth: d, weekIndex, month, year,
        total, kycUpdate, bankingInfoUpdate, financialPlanning,
        investmentChange, accountClosure, other: Math.max(0, other),
      });
    }
  }
  return data;
}

/* ------------------------------------------------------------------ */
/*  Chat data: ~2k/year → ~167/month                                   */
/* ------------------------------------------------------------------ */

function generateChatDaily(): ChatDaily[] {
  const rand = seededRandom(77889);
  const data: ChatDaily[] = [];

  for (const { year, month, days } of MONTHS_CONFIG) {
    const monthlyBase = Math.round(2000 / 12);
    const seasonFactor = SEASON_FACTORS[month];

    for (let d = 1; d <= days; d++) {
      const dateObj = new Date(year, month - 1, d);
      const dow = dateObj.getDay();
      const dayName = DAY_NAMES[dow];
      const isWeekend = dow === 0 || dow === 6;

      const dayFactor = isWeekend ? 0.35 : 1.14;
      const weekdaysInMonth = countWeekdays(year, month, days);
      const weekendsInMonth = days - weekdaysInMonth;
      const normalizer = 1 / (weekdaysInMonth * 1.14 + weekendsInMonth * 0.35);

      const noise = () => 1 + (rand() - 0.5) * 0.30;
      const total = Math.max(1, Math.round(monthlyBase * seasonFactor * dayFactor * normalizer * noise()));

      const kycPct = 0.10 + (rand() - 0.5) * 0.03;
      const bankingPct = 0.10 + (rand() - 0.5) * 0.03;
      const fpPct = 0.35 + (rand() - 0.5) * 0.06;
      const icPct = 0.25 + (rand() - 0.5) * 0.05;
      const acPct = 0.05 + (rand() - 0.5) * 0.02;

      const kycUpdate = Math.round(total * kycPct);
      const bankingInfoUpdate = Math.round(total * bankingPct);
      const financialPlanning = Math.round(total * fpPct);
      const investmentChange = Math.round(total * icPct);
      const accountClosure = Math.max(0, Math.round(total * acPct));
      const other = total - kycUpdate - bankingInfoUpdate - financialPlanning - investmentChange - accountClosure;

      const weekIndex = Math.floor((d - 1) / 7);
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

      data.push({
        date: dateStr, dayLabel: `${dayName} ${d}`, dayOfWeek: dayName,
        dayOfMonth: d, weekIndex, month, year,
        total, kycUpdate, bankingInfoUpdate, financialPlanning,
        investmentChange, accountClosure, other: Math.max(0, other),
      });
    }
  }
  return data;
}

/* ------------------------------------------------------------------ */
/*  Generic aggregation                                                */
/* ------------------------------------------------------------------ */

function sumField<T>(items: T[], field: keyof T): number {
  return items.reduce((sum, item) => sum + (item[field] as number), 0);
}

function aggLoginWeekly(daily: LoginDaily[]): LoginWeekly[] {
  const buckets = new Map<string, LoginDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${String(d.month).padStart(2, "0")}-${d.weekIndex}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }
  return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, items]) => {
    const { weekIndex, month, year } = items[0];
    return {
      weekLabel: `Week ${weekIndex + 1}`, weekIndex, month, year,
      startDay: items[0].dayOfMonth, endDay: items[items.length - 1].dayOfMonth,
      total: sumField(items, "total"), web: sumField(items, "web"), app: sumField(items, "app"),
    };
  });
}

function aggLoginMonthly(daily: LoginDaily[]): LoginMonthly[] {
  const buckets = new Map<string, LoginDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${String(d.month).padStart(2, "0")}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }
  return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, items]) => {
    const { month, year } = items[0];
    return {
      period: `${MONTH_NAMES[month - 1]} ${year}`, month, year,
      total: sumField(items, "total"), web: sumField(items, "web"), app: sumField(items, "app"),
    };
  });
}

function aggApptWeekly(daily: AppointmentDaily[]): AppointmentWeekly[] {
  const buckets = new Map<string, AppointmentDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${String(d.month).padStart(2, "0")}-${d.weekIndex}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }
  return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, items]) => {
    const { weekIndex, month, year } = items[0];
    return {
      weekLabel: `Week ${weekIndex + 1}`, weekIndex, month, year,
      startDay: items[0].dayOfMonth, endDay: items[items.length - 1].dayOfMonth,
      total: sumField(items, "total"),
      kycUpdate: sumField(items, "kycUpdate"), bankingInfoUpdate: sumField(items, "bankingInfoUpdate"),
      financialPlanning: sumField(items, "financialPlanning"), investmentChange: sumField(items, "investmentChange"),
      accountClosure: sumField(items, "accountClosure"), other: sumField(items, "other"),
    };
  });
}

function aggApptMonthly(daily: AppointmentDaily[]): AppointmentMonthly[] {
  const buckets = new Map<string, AppointmentDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${String(d.month).padStart(2, "0")}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }
  return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, items]) => {
    const { month, year } = items[0];
    return {
      period: `${MONTH_NAMES[month - 1]} ${year}`, month, year,
      total: sumField(items, "total"),
      kycUpdate: sumField(items, "kycUpdate"), bankingInfoUpdate: sumField(items, "bankingInfoUpdate"),
      financialPlanning: sumField(items, "financialPlanning"), investmentChange: sumField(items, "investmentChange"),
      accountClosure: sumField(items, "accountClosure"), other: sumField(items, "other"),
    };
  });
}

function aggChatWeekly(daily: ChatDaily[]): ChatWeekly[] {
  const buckets = new Map<string, ChatDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${String(d.month).padStart(2, "0")}-${d.weekIndex}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }
  return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, items]) => {
    const { weekIndex, month, year } = items[0];
    return {
      weekLabel: `Week ${weekIndex + 1}`, weekIndex, month, year,
      startDay: items[0].dayOfMonth, endDay: items[items.length - 1].dayOfMonth,
      total: sumField(items, "total"),
      kycUpdate: sumField(items, "kycUpdate"), bankingInfoUpdate: sumField(items, "bankingInfoUpdate"),
      financialPlanning: sumField(items, "financialPlanning"), investmentChange: sumField(items, "investmentChange"),
      accountClosure: sumField(items, "accountClosure"), other: sumField(items, "other"),
    };
  });
}

function aggChatMonthly(daily: ChatDaily[]): ChatMonthly[] {
  const buckets = new Map<string, ChatDaily[]>();
  for (const d of daily) {
    const key = `${d.year}-${String(d.month).padStart(2, "0")}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(d);
  }
  return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([, items]) => {
    const { month, year } = items[0];
    return {
      period: `${MONTH_NAMES[month - 1]} ${year}`, month, year,
      total: sumField(items, "total"),
      kycUpdate: sumField(items, "kycUpdate"), bankingInfoUpdate: sumField(items, "bankingInfoUpdate"),
      financialPlanning: sumField(items, "financialPlanning"), investmentChange: sumField(items, "investmentChange"),
      accountClosure: sumField(items, "accountClosure"), other: sumField(items, "other"),
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

// Login
export const loginDailyData = generateLoginDaily();
export const loginWeeklyData = aggLoginWeekly(loginDailyData);
export const loginMonthlyData = aggLoginMonthly(loginDailyData);

// Appointment
export const appointmentDailyData = generateAppointmentDaily();
export const appointmentWeeklyData = aggApptWeekly(appointmentDailyData);
export const appointmentMonthlyData = aggApptMonthly(appointmentDailyData);

// Chat
export const chatDailyData = generateChatDaily();
export const chatWeeklyData = aggChatWeekly(chatDailyData);
export const chatMonthlyData = aggChatMonthly(chatDailyData);

// Available months (same for all three — Feb & Mar 2026)
export const availableOnlineMonths = loginMonthlyData.map((m) => ({
  month: m.month,
  year: m.year,
  label: m.period,
}));

// Login getters
export function getLoginDailyByMonth(year: number, month: number): LoginDaily[] {
  return loginDailyData.filter((d) => d.year === year && d.month === month);
}
export function getLoginDailyByWeek(year: number, month: number, weekIndex: number): LoginDaily[] {
  return loginDailyData.filter((d) => d.year === year && d.month === month && d.weekIndex === weekIndex);
}
export function getLoginWeeklyByMonth(year: number, month: number): LoginWeekly[] {
  return loginWeeklyData.filter((d) => d.year === year && d.month === month);
}
export function getLoginMonthlyAggregate(year: number, month: number): LoginMonthly | undefined {
  return loginMonthlyData.find((d) => d.year === year && d.month === month);
}

// Appointment getters
export function getApptDailyByMonth(year: number, month: number): AppointmentDaily[] {
  return appointmentDailyData.filter((d) => d.year === year && d.month === month);
}
export function getApptDailyByWeek(year: number, month: number, weekIndex: number): AppointmentDaily[] {
  return appointmentDailyData.filter((d) => d.year === year && d.month === month && d.weekIndex === weekIndex);
}
export function getApptWeeklyByMonth(year: number, month: number): AppointmentWeekly[] {
  return appointmentWeeklyData.filter((d) => d.year === year && d.month === month);
}
export function getApptMonthlyAggregate(year: number, month: number): AppointmentMonthly | undefined {
  return appointmentMonthlyData.find((d) => d.year === year && d.month === month);
}

// Chat getters
export function getChatDailyByMonth(year: number, month: number): ChatDaily[] {
  return chatDailyData.filter((d) => d.year === year && d.month === month);
}
export function getChatDailyByWeek(year: number, month: number, weekIndex: number): ChatDaily[] {
  return chatDailyData.filter((d) => d.year === year && d.month === month && d.weekIndex === weekIndex);
}
export function getChatWeeklyByMonth(year: number, month: number): ChatWeekly[] {
  return chatWeeklyData.filter((d) => d.year === year && d.month === month);
}
export function getChatMonthlyAggregate(year: number, month: number): ChatMonthly | undefined {
  return chatMonthlyData.find((d) => d.year === year && d.month === month);
}

// Yearly by-month getters
export function getLoginMonthlyByYear(year: number): LoginMonthly[] {
  return loginMonthlyData.filter((d) => d.year === year);
}
export function getApptMonthlyByYear(year: number): AppointmentMonthly[] {
  return appointmentMonthlyData.filter((d) => d.year === year);
}
export function getChatMonthlyByYear(year: number): ChatMonthly[] {
  return chatMonthlyData.filter((d) => d.year === year);
}

// Yearly aggregates
function sumMonthly<T extends Record<string, any>>(months: T[], fields: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const f of fields) result[f] = months.reduce((s, m) => s + (m[f] as number), 0);
  return result;
}

export function getLoginYearlyAggregate(year: number): LoginMonthly | undefined {
  const months = getLoginMonthlyByYear(year);
  if (months.length === 0) return undefined;
  const s = sumMonthly(months, ["total", "web", "app"]);
  return { period: `${year}`, month: 0, year, total: s.total, web: s.web, app: s.app };
}

export function getApptYearlyAggregate(year: number): AppointmentMonthly | undefined {
  const months = getApptMonthlyByYear(year);
  if (months.length === 0) return undefined;
  const s = sumMonthly(months, ["total", "kycUpdate", "bankingInfoUpdate", "financialPlanning", "investmentChange", "accountClosure", "other"]);
  return { period: `${year}`, month: 0, year, total: s.total, kycUpdate: s.kycUpdate, bankingInfoUpdate: s.bankingInfoUpdate, financialPlanning: s.financialPlanning, investmentChange: s.investmentChange, accountClosure: s.accountClosure, other: s.other };
}

export function getChatYearlyAggregate(year: number): ChatMonthly | undefined {
  const months = getChatMonthlyByYear(year);
  if (months.length === 0) return undefined;
  const s = sumMonthly(months, ["total", "kycUpdate", "bankingInfoUpdate", "financialPlanning", "investmentChange", "accountClosure", "other"]);
  return { period: `${year}`, month: 0, year, total: s.total, kycUpdate: s.kycUpdate, bankingInfoUpdate: s.bankingInfoUpdate, financialPlanning: s.financialPlanning, investmentChange: s.investmentChange, accountClosure: s.accountClosure, other: s.other };
}

/* ------------------------------------------------------------------ */
/*  Formatting                                                         */
/* ------------------------------------------------------------------ */

export function formatVolume(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}