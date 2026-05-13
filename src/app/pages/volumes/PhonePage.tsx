import { useState, useCallback, useMemo } from "react";
import {
  PhoneIncoming,
  PhoneOutgoing,
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
  availablePhoneMonths,
  getPhoneWeeklyByMonth,
  getPhoneMonthlyAggregate,
  getPhoneDailyByWeek,
  getPhoneMonthlyByYear,
  getPhoneYearlyAggregate,
  formatVolume,
  type PhoneWeekly,
} from "../../data/phoneData";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type ViewMode = "yearly" | "monthly" | "weekly";

const INBOUND_COLOR = "#3b82f6";
const OUTBOUND_COLOR = "#f59e0b";

const INBOUND_REASONS = [
  { key: "inboundRedemptions", label: "Redemptions", color: "#1e40af" },
  { key: "inboundInvestmentQuestions", label: "Investment Questions", color: "#3b82f6" },
  { key: "inboundBookAppointment", label: "Book Appointment", color: "#7dd3fc" },
  { key: "inboundMisc", label: "Miscellaneous", color: "#c4b5fd" },
] as const;

const OUTBOUND_REASONS = [
  { key: "outboundInsurance", label: "Insurance", color: "#b45309" },
  { key: "outboundMortgage", label: "Mortgage", color: "#f59e0b" },
  { key: "outboundOtherProducts", label: "Other Products", color: "#fde68a" },
] as const;

const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

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

    const clipId = `phone-bar-clip-${clipIdCounter++}`;

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
                      x={barX}
                      y={barY}
                      width={Math.max(0, barWidth)}
                      height={barHeight}
                      fill={metric.color}
                      fillOpacity={0.85}
                      rx={1}
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
/*  Tooltips                                                           */
/* ------------------------------------------------------------------ */

function VolumeTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[200px]">
      <p className="text-sm text-gray-700 mb-2 border-b pb-1.5">{label}</p>
      <div className="flex justify-between items-center gap-4 text-sm py-0.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: INBOUND_COLOR, opacity: 0.85 }} />
          <span className="text-gray-600">Inbound</span>
        </span>
        <span className="text-gray-900">{entry.inbound?.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center gap-4 text-sm py-0.5">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: OUTBOUND_COLOR, opacity: 0.85 }} />
          <span className="text-gray-600">Outbound</span>
        </span>
        <span className="text-gray-900">{entry.outbound?.toLocaleString()}</span>
      </div>
    </div>
  );
}

function InboundReasonTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[240px]">
      <p className="text-sm text-gray-700 mb-2 border-b pb-1.5">{label}</p>
      {INBOUND_REASONS.map((r) => (
        <div key={r.key} className="flex justify-between items-center gap-4 text-sm py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: r.color, opacity: 0.85 }} />
            <span className="text-gray-600">{r.label}</span>
          </span>
          <span className="text-gray-900">{(entry[r.key] as number)?.toLocaleString()}</span>
        </div>
      ))}
      <div className="flex justify-between items-center gap-4 text-sm py-0.5 border-t mt-1 pt-1">
        <span className="text-gray-600">Total Inbound</span>
        <span className="text-gray-900">{entry.inbound?.toLocaleString()}</span>
      </div>
    </div>
  );
}

function OutboundReasonTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[220px]">
      <p className="text-sm text-gray-700 mb-2 border-b pb-1.5">{label}</p>
      {OUTBOUND_REASONS.map((r) => (
        <div key={r.key} className="flex justify-between items-center gap-4 text-sm py-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: r.color, opacity: 0.85 }} />
            <span className="text-gray-600">{r.label}</span>
          </span>
          <span className="text-gray-900">{(entry[r.key] as number)?.toLocaleString()}</span>
        </div>
      ))}
      <div className="flex justify-between items-center gap-4 text-sm py-0.5 border-t mt-1 pt-1">
        <span className="text-gray-600">Total Outbound</span>
        <span className="text-gray-900">{entry.outbound?.toLocaleString()}</span>
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
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
            value === o ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function MonthNavigator({ currentIndex, onChange }: { currentIndex: number; onChange: (i: number) => void }) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < availablePhoneMonths.length - 1;
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => hasPrev && onChange(currentIndex - 1)} disabled={!hasPrev}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>
      <span className="text-sm text-gray-900 min-w-[100px] text-center">
        {availablePhoneMonths[currentIndex].label}
      </span>
      <button onClick={() => hasNext && onChange(currentIndex + 1)} disabled={!hasNext}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

function WeekSelector({ weeks, selectedIndex, onChange }: {
  weeks: PhoneWeekly[];
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

function SummaryCards({
  monthData,
  prevMonthData,
  currentLabel,
  isWeekly,
}: {
  monthData: any;
  prevMonthData: any | undefined;
  currentLabel: string;
  isWeekly: boolean;
}) {
  if (!monthData) return null;

  const inboundChange = prevMonthData
    ? ((monthData.inbound - prevMonthData.inbound) / prevMonthData.inbound) * 100
    : undefined;
  const outboundChange = prevMonthData
    ? ((monthData.outbound - prevMonthData.outbound) / prevMonthData.outbound) * 100
    : undefined;

  const changeLabel = isWeekly ? "WoW" : "MoM";

  const cards = [
    { label: "Total Inbound", value: monthData.inbound, change: inboundChange, icon: PhoneIncoming, color: INBOUND_COLOR },
    { label: "Total Outbound", value: monthData.outbound, change: outboundChange, icon: PhoneOutgoing, color: OUTBOUND_COLOR },
    { label: isWeekly ? "Avg Daily Inbound" : "Avg Weekly Inbound", value: Math.round(monthData.inbound / (isWeekly ? 7 : 4)), icon: PhoneIncoming, color: INBOUND_COLOR },
    { label: isWeekly ? "Avg Daily Outbound" : "Avg Weekly Outbound", value: Math.round(monthData.outbound / (isWeekly ? 7 : 4)), icon: PhoneOutgoing, color: OUTBOUND_COLOR },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card key={c.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: c.color }} />
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
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable stacked chart                                             */
/* ------------------------------------------------------------------ */

function StackedChart({
  title,
  subtitle,
  data,
  dataKey,
  metrics,
  totalKey,
  tooltipContent,
}: {
  title: string;
  subtitle: string;
  data: any[];
  dataKey: string;
  metrics: readonly { key: string; label?: string; color: string }[];
  totalKey: string;
  tooltipContent: React.ReactElement;
}) {
  const renderStacked = useCallback(makeStackedBarsRenderer(metrics), [metrics]);
  const yDomain = useMemo(() => computeYDomain(data.map((d) => d[totalKey])), [data, totalKey]);

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
        <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
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
            <Tooltip content={tooltipContent} />
            <Customized key="bars" component={renderStacked} />
            <Line type="monotone" dataKey={totalKey} stroke="transparent" dot={false} activeDot={false} isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
        <Legend items={(metrics as any[]).map((m: any) => ({ label: m.label || m.key, color: m.color }))} />
      </CardContent>
    </Card>
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
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 text-sm text-gray-900">Period</th>
                <th className="text-right py-3 px-4 text-sm text-gray-900">Inbound</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">Redemptions</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">Invest. Q</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">Book Appt</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">Misc</th>
                <th className="text-right py-3 px-4 text-sm text-gray-900">Outbound</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">Insurance</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">Mortgage</th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">Other</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, idx: number) => (
                <tr key={row[periodKey]} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="py-2.5 px-4 text-sm text-gray-700">{row[periodKey]}</td>
                  <td className="text-right py-2.5 px-4">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm">{row.inbound.toLocaleString()}</Badge>
                  </td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-500">{row.inboundRedemptions.toLocaleString()}</td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-500">{row.inboundInvestmentQuestions.toLocaleString()}</td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-500">{row.inboundBookAppointment.toLocaleString()}</td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-500">{row.inboundMisc.toLocaleString()}</td>
                  <td className="text-right py-2.5 px-4">
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-sm">{row.outbound.toLocaleString()}</Badge>
                  </td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-500">{row.outboundInsurance.toLocaleString()}</td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-500">{row.outboundMortgage.toLocaleString()}</td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-500">{row.outboundOtherProducts.toLocaleString()}</td>
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
/*  Main PhonePage                                                     */
/* ------------------------------------------------------------------ */

export function PhonePage() {
  const [monthIndex, setMonthIndex] = useState(availablePhoneMonths.length - 1);
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);

  const currentMonth = availablePhoneMonths[monthIndex];
  const { month, year } = currentMonth;

  const weeklyData = useMemo(() => getPhoneWeeklyByMonth(year, month), [year, month]);
  const monthlyAgg = useMemo(() => getPhoneMonthlyAggregate(year, month), [year, month]);

  const prevMonth = monthIndex > 0 ? availablePhoneMonths[monthIndex - 1] : null;
  const prevMonthlyAgg = useMemo(
    () => prevMonth ? getPhoneMonthlyAggregate(prevMonth.year, prevMonth.month) : undefined,
    [prevMonth]
  );

  const selectedWeek = weeklyData[selectedWeekIdx];
  const dailyData = useMemo(
    () => selectedWeek ? getPhoneDailyByWeek(year, month, selectedWeek.weekIndex) : [],
    [year, month, selectedWeek]
  );

  const prevWeek = selectedWeekIdx > 0 ? weeklyData[selectedWeekIdx - 1] : undefined;

  const handleMonthChange = useCallback((i: number) => {
    setMonthIndex(i);
    setSelectedWeekIdx(0);
  }, []);

  // Yearly data
  const yearlyMonthlyData = useMemo(() => getPhoneMonthlyByYear(2026).map((d) => ({ ...d, monthLabel: MONTH_SHORT[d.month - 1] })), []);
  const yearlyAgg = useMemo(() => getPhoneYearlyAggregate(2026), []);

  // Chart & table data depend on view mode
  const chartData = viewMode === "yearly" ? yearlyMonthlyData : viewMode === "monthly" ? weeklyData : dailyData;
  const chartDataKey = viewMode === "yearly" ? "monthLabel" : viewMode === "monthly" ? "weekLabel" : "dayLabel";
  const periodLabel = viewMode === "yearly" ? "2026" : currentMonth.label;
  const chartLabel = viewMode === "yearly"
    ? "Monthly Call Volumes — 2026"
    : viewMode === "monthly"
    ? `Weekly Call Volumes — ${currentMonth.label}`
    : `Daily Call Volumes — ${selectedWeek?.weekLabel} (${currentMonth.label})`;

  // Add "total" for stacked chart
  const volumeChartData = useMemo(
    () => chartData.map((d: any) => ({ ...d, _total: d.inbound + d.outbound })),
    [chartData]
  );

  const VOLUME_STACK = [
    { key: "inbound", label: "Inbound", color: INBOUND_COLOR },
    { key: "outbound", label: "Outbound", color: OUTBOUND_COLOR },
  ] as const;

  // Summary data
  const summaryData = viewMode === "yearly" ? yearlyAgg : viewMode === "monthly" ? monthlyAgg : selectedWeek;
  const prevSummaryData = viewMode === "yearly" ? undefined : viewMode === "monthly" ? prevMonthlyAgg : prevWeek;

  // Table data
  const tableData = viewMode === "yearly" ? yearlyMonthlyData : chartData;
  const tablePeriodKey = viewMode === "yearly" ? "period" : chartDataKey;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-lg text-gray-900">Phone</h3>
          <p className="text-sm text-gray-500 mt-1">
            Inbound & outbound call volumes, trends, and reason breakdowns &middot; {periodLabel}
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
        currentLabel={periodLabel}
        isWeekly={viewMode === "weekly"}
      />

      {/* Call Volumes chart */}
      <StackedChart
        title={chartLabel}
        subtitle="Total inbound & outbound calls stacked"
        data={volumeChartData}
        dataKey={chartDataKey}
        metrics={VOLUME_STACK}
        totalKey="_total"
        tooltipContent={<VolumeTooltip />}
      />

      {/* Inbound by reason chart */}
      <StackedChart
        title={`Inbound by Reason — ${periodLabel}`}
        subtitle="Breakdown of inbound calls by reason category"
        data={chartData}
        dataKey={chartDataKey}
        metrics={INBOUND_REASONS}
        totalKey="inbound"
        tooltipContent={<InboundReasonTooltip />}
      />

      {/* Outbound by reason chart */}
      <StackedChart
        title={`Outbound by Reason — ${periodLabel}`}
        subtitle="Breakdown of outbound calls by reason category"
        data={chartData}
        dataKey={chartDataKey}
        metrics={OUTBOUND_REASONS}
        totalKey="outbound"
        tooltipContent={<OutboundReasonTooltip />}
      />

      {/* Detail Table */}
      {tableData.length > 0 && (
        <DetailTable data={tableData} periodKey={tablePeriodKey} />
      )}
    </div>
  );
}