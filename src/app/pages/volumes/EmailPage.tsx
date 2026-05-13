import { useState, useCallback, useMemo } from "react";
import {
  Mail,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
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
  availableEmailMonths,
  getEmailWeeklyByMonth,
  getEmailMonthlyAggregate,
  getEmailDailyByWeek,
  getEmailMonthlyByYear,
  getEmailYearlyAggregate,
  formatVolume,
  type EmailWeekly,
} from "../../data/emailData";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

type ViewMode = "yearly" | "monthly" | "weekly";

const EMAIL_COLOR = "#8b5cf6";

const EMAIL_REASONS = [
  { key: "appointment", label: "Appointment", color: "#6d28d9" },
  { key: "investmentQuestions", label: "Investment Questions", color: "#a78bfa" },
  { key: "followUp", label: "Follow-up with Advisors", color: "#f0abfc" },
  { key: "misc", label: "Miscellaneous", color: "#fde68a" },
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

    const clipId = `email-bar-clip-${clipIdCounter++}`;

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
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */

function EmailTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[240px]">
      <p className="text-sm text-gray-700 mb-2 border-b pb-1.5">{label}</p>
      {EMAIL_REASONS.map((r) => (
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
  const hasNext = currentIndex < availableEmailMonths.length - 1;
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => hasPrev && onChange(currentIndex - 1)} disabled={!hasPrev}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>
      <span className="text-sm text-gray-900 min-w-[100px] text-center">
        {availableEmailMonths[currentIndex].label}
      </span>
      <button onClick={() => hasNext && onChange(currentIndex + 1)} disabled={!hasNext}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

function WeekSelector({ weeks, selectedIndex, onChange }: {
  weeks: EmailWeekly[];
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

function SummaryCards({ monthData, prevMonthData, isWeekly }: { monthData: any; prevMonthData: any | undefined; isWeekly: boolean }) {
  if (!monthData) return null;

  const totalChange = prevMonthData
    ? ((monthData.total - prevMonthData.total) / prevMonthData.total) * 100
    : undefined;

  const changeLabel = isWeekly ? "WoW" : "MoM";

  const cards = [
    { label: "Total Emails", value: monthData.total, change: totalChange },
    { label: isWeekly ? "Avg Daily" : "Avg Weekly", value: Math.round(monthData.total / (isWeekly ? 7 : 4)) },
    {
      label: "Appointment (largest)",
      value: monthData.appointment,
      pct: ((monthData.appointment / monthData.total) * 100).toFixed(0),
    },
    {
      label: "Investment Questions",
      value: monthData.investmentQuestions,
      pct: ((monthData.investmentQuestions / monthData.total) * 100).toFixed(0),
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4" style={{ color: EMAIL_COLOR }} />
              <p className="text-xs text-gray-500">{c.label}</p>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-xl text-gray-900">{formatVolume(c.value)}</span>
              {"change" in c && c.change !== undefined && (
                <span className={`flex items-center gap-0.5 text-xs mb-0.5 ${c.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {c.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(c.change).toFixed(1)}% {changeLabel}
                </span>
              )}
              {"pct" in c && c.pct !== undefined && (
                <span className="text-xs text-gray-400 mb-0.5">({c.pct}%)</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail table                                                       */
/* ------------------------------------------------------------------ */

function DetailTable({ data, periodKey }: { data: any[]; periodKey: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <table className="max-w-2xl">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 text-sm text-gray-900">Period</th>
                <th className="text-left py-3 px-4 text-sm text-gray-900">Total</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500 text-xs">Appointment</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500 text-xs">Invest. Q</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500 text-xs">Follow-up</th>
                <th className="text-left py-3 px-4 text-sm text-gray-500 text-xs">Misc</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, idx: number) => (
                <tr key={row[periodKey]} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-2.5 px-4 text-sm text-gray-700">{row[periodKey]}</td>
                  <td className="py-2.5 px-4">
                    <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-sm">
                      {row.total.toLocaleString()}
                    </Badge>
                  </td>
                  <td className="py-2.5 px-4 text-sm text-gray-500">{row.appointment.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-sm text-gray-500">{row.investmentQuestions.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-sm text-gray-500">{row.followUp.toLocaleString()}</td>
                  <td className="py-2.5 px-4 text-sm text-gray-500">{row.misc.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Main EmailPage                                                     */
/* ------------------------------------------------------------------ */

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function EmailPage() {
  const [monthIndex, setMonthIndex] = useState(availableEmailMonths.length - 1);
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);

  const currentMonth = availableEmailMonths[monthIndex];
  const { month, year } = currentMonth;

  const weeklyData = useMemo(() => getEmailWeeklyByMonth(year, month), [year, month]);
  const monthlyAgg = useMemo(() => getEmailMonthlyAggregate(year, month), [year, month]);

  const prevMonth = monthIndex > 0 ? availableEmailMonths[monthIndex - 1] : null;
  const prevMonthlyAgg = useMemo(
    () => prevMonth ? getEmailMonthlyAggregate(prevMonth.year, prevMonth.month) : undefined,
    [prevMonth]
  );

  const selectedWeek = weeklyData[selectedWeekIdx];
  const dailyData = useMemo(
    () => selectedWeek ? getEmailDailyByWeek(year, month, selectedWeek.weekIndex) : [],
    [year, month, selectedWeek]
  );

  const prevWeek = selectedWeekIdx > 0 ? weeklyData[selectedWeekIdx - 1] : undefined;

  const handleMonthChange = useCallback((i: number) => {
    setMonthIndex(i);
    setSelectedWeekIdx(0);
  }, []);

  // Yearly data
  const yearlyMonthlyData = useMemo(() => getEmailMonthlyByYear(2026).map((d) => ({ ...d, monthLabel: MONTH_SHORT[d.month - 1] })), []);
  const yearlyAgg = useMemo(() => getEmailYearlyAggregate(2026), []);

  const chartData = viewMode === "yearly" ? yearlyMonthlyData : viewMode === "monthly" ? weeklyData : dailyData;
  const chartDataKey = viewMode === "yearly" ? "monthLabel" : viewMode === "monthly" ? "weekLabel" : "dayLabel";
  const periodLabel = viewMode === "yearly"
    ? "2026"
    : viewMode === "monthly"
    ? currentMonth.label
    : `${selectedWeek?.weekLabel} (${currentMonth.label})`;

  const summaryData = viewMode === "yearly" ? yearlyAgg : viewMode === "monthly" ? monthlyAgg : selectedWeek;
  const prevSummaryData = viewMode === "yearly" ? undefined : viewMode === "monthly" ? prevMonthlyAgg : prevWeek;

  const renderStacked = useCallback(makeStackedBarsRenderer(EMAIL_REASONS), []);

  const yDomain = useMemo(() => computeYDomain(chartData.map((d: any) => d.total)), [chartData]);

  const xPadding = useMemo(() => {
    const count = chartData.length;
    if (count <= 4) return { left: 60, right: 60 };
    if (count <= 7) return { left: 45, right: 45 };
    return { left: 35, right: 35 };
  }, [chartData.length]);

  const tableData = viewMode === "yearly" ? yearlyMonthlyData : chartData;
  const tablePeriodKey = viewMode === "yearly" ? "period" : chartDataKey;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-lg text-gray-900">Email</h3>
          <p className="text-sm text-gray-500 mt-1">
            Email volumes, trends, and reason breakdowns &middot; {periodLabel}
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
        <WeekSelector weeks={weeklyData} selectedIndex={selectedWeekIdx} onChange={setSelectedWeekIdx} />
      )}

      {/* Summary cards */}
      <SummaryCards
        monthData={summaryData}
        prevMonthData={prevSummaryData}
        isWeekly={viewMode === "weekly"}
      />

      {/* Stacked bar chart */}
      <Card>
        <CardHeader>
          <CardTitle>Email Volumes by Reason — {periodLabel}</CardTitle>
          <p className="text-sm text-gray-500 mt-0.5">
            Emails broken down by reason
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 40, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={chartDataKey}
                tick={{ fontSize: 11 }}
                height={40}
                textAnchor="middle"
                interval={0}
                padding={xPadding}
              />
              <YAxis domain={yDomain.domain} ticks={yDomain.ticks} tickFormatter={formatVolume} tick={{ fontSize: 11 }} />
              <Tooltip content={<EmailTooltip />} />
              <Customized key="email-bars" component={renderStacked} />
              <Line type="monotone" dataKey="total" stroke="transparent" dot={false} activeDot={false} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
          <Legend items={EMAIL_REASONS.map((r) => ({ label: r.label, color: r.color }))} />
        </CardContent>
      </Card>

      {/* Detail Table */}
      {tableData.length > 0 && (
        <DetailTable data={tableData} periodKey={tablePeriodKey} />
      )}
    </div>
  );
}