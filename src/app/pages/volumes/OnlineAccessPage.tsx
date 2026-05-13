import { useState, useCallback, useMemo } from "react";
import {
  Monitor,
  Smartphone,
  CalendarCheck,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Customized,
} from "recharts";
import {
  availableOnlineMonths,
  getLoginWeeklyByMonth,
  getLoginMonthlyAggregate,
  getLoginDailyByWeek,
  getApptWeeklyByMonth,
  getApptMonthlyAggregate,
  getApptDailyByWeek,
  getChatWeeklyByMonth,
  getChatMonthlyAggregate,
  getChatDailyByWeek,
  getLoginMonthlyByYear,
  getLoginYearlyAggregate,
  getApptMonthlyByYear,
  getApptYearlyAggregate,
  getChatMonthlyByYear,
  getChatYearlyAggregate,
  formatVolume,
  type LoginWeekly,
} from "../../data/onlineAccessData";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type ViewMode = "yearly" | "monthly" | "weekly";

const LOGIN_CATEGORIES = [
  { key: "web", label: "Web", color: "#3b82f6" },
  { key: "app", label: "App", color: "#10b981" },
] as const;

const APPOINTMENT_REASONS = [
  { key: "financialPlanning", label: "Financial Planning", color: "#6d28d9" },
  { key: "investmentChange", label: "Investment Change", color: "#3b82f6" },
  { key: "other", label: "Other", color: "#f59e0b" },
  { key: "kycUpdate", label: "KYC Update", color: "#ef4444" },
  { key: "bankingInfoUpdate", label: "Banking Info Update", color: "#f97316" },
  { key: "accountClosure", label: "Account Closure", color: "#6b7280" },
] as const;

const CHAT_REASONS = [
  { key: "financialPlanning", label: "Financial Planning", color: "#7c3aed" },
  { key: "investmentChange", label: "Investment Change", color: "#2563eb" },
  { key: "other", label: "Other", color: "#eab308" },
  { key: "kycUpdate", label: "KYC Update", color: "#dc2626" },
  { key: "bankingInfoUpdate", label: "Banking Info Update", color: "#ea580c" },
  { key: "accountClosure", label: "Account Closure", color: "#9ca3af" },
] as const;

/* ------------------------------------------------------------------ */
/*  Customized stacked bars renderer                                   */
/* ------------------------------------------------------------------ */

function makeStackedBarsRenderer(metrics: readonly { key: string; color: string }[]) {
  let clipIdCounter = 0;
  return function StackedBars(props: any) {
    const { xAxisMap, yAxisMap, formattedGraphicalItems, offset } = props;
    if (!xAxisMap || !yAxisMap || !offset) return null;

    const xAxisKey = Object.keys(xAxisMap)[0];
    const yAxisKey = Object.keys(yAxisMap)[0];
    if (!xAxisKey || !yAxisKey) return null;

    const yAxis = yAxisMap[yAxisKey];
    if (!yAxis?.scale) return null;

    const yScale = yAxis.scale;
    const lineItem = formattedGraphicalItems?.[0];
    if (!lineItem?.props?.points) return null;

    const points = lineItem.props.points;
    const data = lineItem.props.data || points.map((p: any) => p.payload);
    if (!data || data.length === 0) return null;

    const step = points.length > 1 ? Math.abs(points[1].x - points[0].x) : 60;

    const plotLeft = offset.left;
    const plotRight = offset.left + offset.width;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const edgeSpace = Math.min(firstX - plotLeft, plotRight - lastX);
    const maxBarWidth = Math.max(20, edgeSpace * 2 - 4);
    const barWidth = Math.min(step * 0.5, maxBarWidth, 70);

    const clipId = `online-bar-clip-${clipIdCounter++}`;

    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <rect x={offset.left} y={offset.top} width={offset.width} height={offset.height} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          {points.map((point: any, dataIndex: number) => {
            const entry = data[dataIndex] || point.payload;
            if (!entry) return null;
            let cumulative = 0;
            return (
              <g key={`stack-${dataIndex}`}>
                {metrics.map((metric) => {
                  const value = entry[metric.key];
                  if (!value) return null;
                  const bottom = cumulative;
                  cumulative += value;
                  const barX = point.x - barWidth / 2;
                  const barY = yScale(cumulative);
                  const barHeight = Math.max(0, yScale(bottom) - barY);
                  return (
                    <rect
                      key={`${metric.key}-${dataIndex}`}
                      x={barX} y={barY}
                      width={Math.max(0, barWidth)} height={barHeight}
                      fill={metric.color} fillOpacity={0.85} rx={1}
                    />
                  );
                })}
              </g>
            );
          })}
        </g>
      </g>
    );
  };
}

/* ------------------------------------------------------------------ */
/*  Generic tooltip                                                    */
/* ------------------------------------------------------------------ */

function StackedTooltip({ metrics }: { metrics: readonly { key: string; label: string; color: string }[] }) {
  return function TooltipInner({ active, payload, label }: any) {
    if (!active || !payload?.length) return null;
    const entry = payload[0]?.payload;
    if (!entry) return null;
    return (
      <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[240px]">
        <p className="text-sm text-gray-700 mb-2 border-b pb-1.5">{label}</p>
        {metrics.map((r) => (
          <div key={r.key} className="flex justify-between items-center gap-4 text-sm py-0.5">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: r.color, opacity: 0.85 }} />
              <span className="text-gray-600">{r.label}</span>
            </span>
            <span className="text-gray-900">{(entry[r.key] as number)?.toLocaleString()}</span>
          </div>
        ))}
        <div className="flex justify-between items-center gap-4 text-sm py-0.5 border-t mt-1 pt-1">
          <span className="text-gray-600">Total</span>
          <span className="text-gray-900">{entry.total?.toLocaleString()}</span>
        </div>
      </div>
    );
  };
}

/* ------------------------------------------------------------------ */
/*  Shared UI components                                               */
/* ------------------------------------------------------------------ */

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
      {(["yearly", "monthly", "weekly"] as const).map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
            value === o ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}>
          {o}
        </button>
      ))}
    </div>
  );
}

function MonthNavigator({ currentIndex, onChange }: { currentIndex: number; onChange: (i: number) => void }) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < availableOnlineMonths.length - 1;
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => hasPrev && onChange(currentIndex - 1)} disabled={!hasPrev}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>
      <span className="text-sm text-gray-900 min-w-[100px] text-center">
        {availableOnlineMonths[currentIndex].label}
      </span>
      <button onClick={() => hasNext && onChange(currentIndex + 1)} disabled={!hasNext}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

function WeekSelector({ weeks, selectedIndex, onChange }: {
  weeks: LoginWeekly[];
  selectedIndex: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      {weeks.map((w, i) => (
        <button key={w.weekLabel} onClick={() => onChange(i)}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
            selectedIndex === i
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}>
          {w.weekLabel}
          <span className="ml-1 opacity-70">({w.startDay}–{w.endDay})</span>
        </button>
      ))}
    </div>
  );
}

function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <div className="flex items-center justify-center gap-5 mt-4 text-sm text-gray-600 flex-wrap">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span className="w-3.5 h-3 rounded-sm inline-block" style={{ backgroundColor: item.color, opacity: 0.85 }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Y domain helper                                                    */
/* ------------------------------------------------------------------ */

function computeYDomain(values: number[]): { domain: [number, number]; ticks: number[] } {
  const max = Math.max(...values);
  const rawMax = max * 1.15;

  // Pick a "nice" step that yields roughly 5–8 tick marks
  const niceSteps = [1, 2, 5, 10, 15, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10000, 20000, 50000];
  let step = niceSteps[niceSteps.length - 1];
  for (const s of niceSteps) {
    const count = Math.ceil(rawMax / s);
    if (count >= 4 && count <= 10) { step = s; break; }
  }

  const yMax = Math.max(step, Math.ceil(rawMax / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += step) ticks.push(v);
  return { domain: [0, yMax], ticks };
}

/* ------------------------------------------------------------------ */
/*  Summary cards                                                      */
/* ------------------------------------------------------------------ */

function SummaryCards({ loginData, loginPrev, apptData, apptPrev, chatData, chatPrev, isWeekly }: {
  loginData: any;
  loginPrev: any | undefined;
  apptData: any;
  apptPrev: any | undefined;
  chatData: any;
  chatPrev: any | undefined;
  isWeekly: boolean;
}) {
  if (!loginData || !apptData || !chatData) return null;

  const changeLabel = isWeekly ? "WoW" : "MoM";

  const cards = [
    {
      label: "Total Logins",
      value: loginData.total,
      change: loginPrev ? ((loginData.total - loginPrev.total) / loginPrev.total) * 100 : undefined,
      icon: Monitor,
      iconColor: "#3b82f6",
    },
    {
      label: "Web / App Split",
      value: loginData.web,
      suffix: ` / ${formatVolume(loginData.app)}`,
      icon: Smartphone,
      iconColor: "#10b981",
    },
    {
      label: "Appointments Booked",
      value: apptData.total,
      change: apptPrev ? ((apptData.total - apptPrev.total) / apptPrev.total) * 100 : undefined,
      icon: CalendarCheck,
      iconColor: "#6d28d9",
    },
    {
      label: "Chat Sessions",
      value: chatData.total,
      change: chatPrev ? ((chatData.total - chatPrev.total) / chatPrev.total) * 100 : undefined,
      icon: MessageCircle,
      iconColor: "#7c3aed",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: c.iconColor }} />
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-xl text-gray-900">{formatVolume(c.value)}</span>
                {"suffix" in c && c.suffix && (
                  <span className="text-sm text-gray-500 mb-0.5">{c.suffix}</span>
                )}
                {"change" in c && c.change !== undefined && (
                  <span className={`flex items-center gap-0.5 text-xs mb-0.5 ${c.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {c.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(c.change).toFixed(1)}% {changeLabel}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable stacked chart card                                        */
/* ------------------------------------------------------------------ */

function StackedChartCard({
  title,
  subtitle,
  data,
  dataKey,
  metrics,
}: {
  title: string;
  subtitle: string;
  data: any[];
  dataKey: string;
  metrics: readonly { key: string; label: string; color: string }[];
}) {
  const renderStacked = useCallback(makeStackedBarsRenderer(metrics), [metrics]);
  const tooltipRenderer = useMemo(() => StackedTooltip({ metrics }), [metrics]);
  const yDomain = useMemo(() => computeYDomain(data.map((d) => d.total)), [data]);

  const xPadding = useMemo(() => {
    const count = data.length;
    if (count <= 4) return { left: 60, right: 60 };
    if (count <= 7) return { left: 45, right: 45 };
    return { left: 35, right: 35 };
  }, [data.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={data} margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={dataKey}
              tick={{ fontSize: 11 }}
              height={40}
              textAnchor="middle"
              interval={0}
              padding={xPadding}
            />
            <YAxis domain={yDomain.domain} ticks={yDomain.ticks} tickFormatter={formatVolume} tick={{ fontSize: 11 }} />
            <Tooltip content={tooltipRenderer} />
            <Customized key={`bars-${title}`} component={renderStacked} />
            <Line type="monotone" dataKey="total" stroke="transparent" dot={false} activeDot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
        <Legend items={metrics.map((m) => ({ label: m.label, color: m.color }))} />
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function OnlineAccessPage() {
  const [monthIndex, setMonthIndex] = useState(availableOnlineMonths.length - 1);
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);

  const currentMonth = availableOnlineMonths[monthIndex];
  const { month, year } = currentMonth;

  const prevMonth = monthIndex > 0 ? availableOnlineMonths[monthIndex - 1] : null;

  // Yearly data
  const addMonthLabel = (d: any) => ({ ...d, monthLabel: MONTH_SHORT[d.month - 1] });
  const loginYearlyMonthly = useMemo(() => getLoginMonthlyByYear(2026).map(addMonthLabel), []);
  const apptYearlyMonthly = useMemo(() => getApptMonthlyByYear(2026).map(addMonthLabel), []);
  const chatYearlyMonthly = useMemo(() => getChatMonthlyByYear(2026).map(addMonthLabel), []);
  const loginYearlyAgg = useMemo(() => getLoginYearlyAggregate(2026), []);
  const apptYearlyAgg = useMemo(() => getApptYearlyAggregate(2026), []);
  const chatYearlyAgg = useMemo(() => getChatYearlyAggregate(2026), []);

  // Login data
  const loginWeekly = useMemo(() => getLoginWeeklyByMonth(year, month), [year, month]);
  const loginSelectedWeek = loginWeekly[selectedWeekIdx];
  const loginDaily = useMemo(
    () => loginSelectedWeek ? getLoginDailyByWeek(year, month, loginSelectedWeek.weekIndex) : [],
    [year, month, loginSelectedWeek]
  );
  const loginChartData = viewMode === "yearly" ? loginYearlyMonthly : viewMode === "monthly" ? loginWeekly : loginDaily;

  // Appointment data
  const apptWeekly = useMemo(() => getApptWeeklyByMonth(year, month), [year, month]);
  const apptSelectedWeek = apptWeekly[selectedWeekIdx];
  const apptDaily = useMemo(
    () => apptSelectedWeek ? getApptDailyByWeek(year, month, apptSelectedWeek.weekIndex) : [],
    [year, month, apptSelectedWeek]
  );
  const apptChartData = viewMode === "yearly" ? apptYearlyMonthly : viewMode === "monthly" ? apptWeekly : apptDaily;

  // Chat data
  const chatWeekly = useMemo(() => getChatWeeklyByMonth(year, month), [year, month]);
  const chatSelectedWeek = chatWeekly[selectedWeekIdx];
  const chatDaily = useMemo(
    () => chatSelectedWeek ? getChatDailyByWeek(year, month, chatSelectedWeek.weekIndex) : [],
    [year, month, chatSelectedWeek]
  );
  const chatChartData = viewMode === "yearly" ? chatYearlyMonthly : viewMode === "monthly" ? chatWeekly : chatDaily;

  const loginPrevWeek = selectedWeekIdx > 0 ? loginWeekly[selectedWeekIdx - 1] : undefined;
  const apptPrevWeek = selectedWeekIdx > 0 ? apptWeekly[selectedWeekIdx - 1] : undefined;
  const chatPrevWeek = selectedWeekIdx > 0 ? chatWeekly[selectedWeekIdx - 1] : undefined;

  const chartDataKey = viewMode === "yearly" ? "monthLabel" : viewMode === "monthly" ? "weekLabel" : "dayLabel";

  const handleMonthChange = useCallback((i: number) => {
    setMonthIndex(i);
    setSelectedWeekIdx(0);
  }, []);

  const periodLabel = viewMode === "yearly"
    ? "2026"
    : viewMode === "monthly"
    ? currentMonth.label
    : `${loginSelectedWeek?.weekLabel} (${currentMonth.label})`;

  // Summary data
  const loginSummary = viewMode === "yearly" ? loginYearlyAgg : viewMode === "monthly" ? getLoginMonthlyAggregate(year, month) : loginSelectedWeek;
  const loginPrevSummary = viewMode === "yearly" ? undefined : viewMode === "monthly" ? (prevMonth ? getLoginMonthlyAggregate(prevMonth.year, prevMonth.month) : undefined) : loginPrevWeek;
  const apptSummary = viewMode === "yearly" ? apptYearlyAgg : viewMode === "monthly" ? getApptMonthlyAggregate(year, month) : apptSelectedWeek;
  const apptPrevSummary = viewMode === "yearly" ? undefined : viewMode === "monthly" ? (prevMonth ? getApptMonthlyAggregate(prevMonth.year, prevMonth.month) : undefined) : apptPrevWeek;
  const chatSummary = viewMode === "yearly" ? chatYearlyAgg : viewMode === "monthly" ? getChatMonthlyAggregate(year, month) : chatSelectedWeek;
  const chatPrevSummary = viewMode === "yearly" ? undefined : viewMode === "monthly" ? (prevMonth ? getChatMonthlyAggregate(prevMonth.year, prevMonth.month) : undefined) : chatPrevWeek;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-lg text-gray-900">Online Access</h3>
          <p className="text-sm text-gray-500 mt-1">
            Login activity, appointment bookings, and chat engagement &middot; {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          {viewMode !== "yearly" && (
            <MonthNavigator currentIndex={monthIndex} onChange={handleMonthChange} />
          )}
        </div>
      </div>

      {/* Week selector (only in weekly view) */}
      {viewMode === "weekly" && (
        <WeekSelector weeks={loginWeekly} selectedIndex={selectedWeekIdx} onChange={setSelectedWeekIdx} />
      )}

      {/* Summary cards */}
      <SummaryCards
        loginData={loginSummary}
        loginPrev={loginPrevSummary}
        apptData={apptSummary}
        apptPrev={apptPrevSummary}
        chatData={chatSummary}
        chatPrev={chatPrevSummary}
        isWeekly={viewMode === "weekly"}
      />

      {/* Login Activity chart */}
      <StackedChartCard
        title={`Login Activity — ${periodLabel}`}
        subtitle="Web and app logins stacked by platform"
        data={loginChartData}
        dataKey={chartDataKey}
        metrics={LOGIN_CATEGORIES}
      />

      {/* Appointments Booked chart */}
      <StackedChartCard
        title={`Appointments Booked — ${periodLabel}`}
        subtitle="Volume by reason category"
        data={apptChartData}
        dataKey={chartDataKey}
        metrics={APPOINTMENT_REASONS}
      />

      {/* Chat Volumes chart */}
      <StackedChartCard
        title={`Chat Sessions — ${periodLabel}`}
        subtitle="Volume by reason category"
        data={chatChartData}
        dataKey={chartDataKey}
        metrics={CHAT_REASONS}
      />
    </div>
  );
}