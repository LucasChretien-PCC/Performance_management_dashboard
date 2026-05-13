import { useState, useCallback, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Smile,
  Frown,
  TrendingUp,
  TrendingDown,
  Users,
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
  availableFeedbackMonths,
  getFeedbackWeeklyByMonth,
  getFeedbackMonthlyAggregate,
  getFeedbackDailyByWeek,
  PROMOTER_REASONS,
  DETRACTOR_REASONS,
  type FeedbackWeekly,
} from "../../data/npsFeedbackData";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type ViewMode = "monthly" | "weekly";

/* ------------------------------------------------------------------ */
/*  Stacked bars renderer (absolute counts)                            */
/* ------------------------------------------------------------------ */

function makeStackedBarsRenderer(
  metrics: readonly { key: string; color: string }[],
  clipPrefix: string
) {
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

    const step =
      points.length > 1 ? Math.abs(points[1].x - points[0].x) : 60;

    const plotLeft = offset.left;
    const plotRight = offset.left + offset.width;
    const firstX = points[0].x;
    const lastX = points[points.length - 1].x;
    const edgeSpace = Math.min(firstX - plotLeft, plotRight - lastX);
    const maxBarWidth = Math.max(20, edgeSpace * 2 - 4);
    const barWidth = Math.min(step * 0.5, maxBarWidth, 70);

    const clipId = `${clipPrefix}-clip-${clipIdCounter++}`;

    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <rect
              x={offset.left}
              y={offset.top}
              width={offset.width}
              height={offset.height}
            />
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
                  if (value === undefined || value === null || value === 0)
                    return null;
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

function PromoterTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[260px]">
      <p className="text-sm text-gray-700 mb-2 border-b pb-1.5">{label}</p>
      {PROMOTER_REASONS.map((r) => (
        <div
          key={r.key}
          className="flex justify-between items-center gap-4 text-sm py-0.5"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: r.color, opacity: 0.85 }}
            />
            <span className="text-gray-600">{r.label}</span>
          </span>
          <span className="text-gray-900">{entry[r.key]}</span>
        </div>
      ))}
      <div className="flex justify-between items-center gap-4 text-sm py-0.5 border-t mt-1 pt-1">
        <span className="text-gray-700">Total Promoters</span>
        <span className="text-gray-900" style={{ fontWeight: 600 }}>
          {entry.totalPromoters}
        </span>
      </div>
    </div>
  );
}

function DetractorTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[280px]">
      <p className="text-sm text-gray-700 mb-2 border-b pb-1.5">{label}</p>
      {DETRACTOR_REASONS.map((r) => (
        <div
          key={r.key}
          className="flex justify-between items-center gap-4 text-sm py-0.5"
        >
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ backgroundColor: r.color, opacity: 0.85 }}
            />
            <span className="text-gray-600">{r.label}</span>
          </span>
          <span className="text-gray-900">{entry[r.key]}</span>
        </div>
      ))}
      <div className="flex justify-between items-center gap-4 text-sm py-0.5 border-t mt-1 pt-1">
        <span className="text-gray-700">Total Detractors</span>
        <span className="text-gray-900" style={{ fontWeight: 600 }}>
          {entry.totalDetractors}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared UI                                                          */
/* ------------------------------------------------------------------ */

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
      {(["monthly", "weekly"] as const).map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
            value === o
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function MonthNavigator({
  currentIndex,
  onChange,
}: {
  currentIndex: number;
  onChange: (i: number) => void;
}) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < availableFeedbackMonths.length - 1;
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => hasPrev && onChange(currentIndex - 1)}
        disabled={!hasPrev}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4 text-gray-600" />
      </button>
      <span className="text-sm text-gray-900 min-w-[100px] text-center">
        {availableFeedbackMonths[currentIndex].label}
      </span>
      <button
        onClick={() => hasNext && onChange(currentIndex + 1)}
        disabled={!hasNext}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

function WeekSelector({
  weeks,
  selectedIndex,
  onChange,
}: {
  weeks: FeedbackWeekly[];
  selectedIndex: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {weeks.map((w, i) => (
        <button
          key={w.weekLabel}
          onClick={() => onChange(i)}
          className={`px-3 py-1.5 text-xs rounded-lg transition-colors border ${
            selectedIndex === i
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          {w.weekLabel}
          <span className="ml-1 opacity-70">
            ({w.startDay}–{w.endDay})
          </span>
        </button>
      ))}
    </div>
  );
}

function Legend({
  items,
}: {
  items: { label: string; color: string }[];
}) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-600 flex-wrap">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span
            className="w-3 h-2.5 rounded-sm inline-block"
            style={{ backgroundColor: item.color, opacity: 0.85 }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Y domain                                                           */
/* ------------------------------------------------------------------ */

function computeYDomain(values: number[]): {
  domain: [number, number];
  ticks: number[];
} {
  const max = Math.max(...values);
  const rawMax = max * 1.15;
  const niceSteps = [1, 2, 5, 10, 15, 20, 25, 50, 100, 200, 250, 500, 1000, 2000];
  let step = niceSteps[niceSteps.length - 1];
  for (const s of niceSteps) {
    const count = Math.ceil(rawMax / s);
    if (count >= 4 && count <= 10) {
      step = s;
      break;
    }
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
  currentData,
  prevData,
  isWeekly,
}: {
  currentData: any;
  prevData: any | undefined;
  isWeekly: boolean;
}) {
  if (!currentData) return null;

  const changeLabel = isWeekly ? "WoW" : "MoM";

  const promoterChange =
    prevData !== undefined
      ? ((currentData.totalPromoters - prevData.totalPromoters) /
          prevData.totalPromoters) *
        100
      : undefined;

  const detractorChange =
    prevData !== undefined
      ? ((currentData.totalDetractors - prevData.totalDetractors) /
          prevData.totalDetractors) *
        100
      : undefined;

  // Top promoter reason
  const topPromoterReason = PROMOTER_REASONS.reduce((best, r) =>
    currentData[r.key] > currentData[best.key] ? r : best
  );

  // Top detractor reason
  const topDetractorReason = DETRACTOR_REASONS.reduce((best, r) =>
    currentData[r.key] > currentData[best.key] ? r : best
  );

  const cards = [
    {
      label: "Total Promoter Mentions",
      value: currentData.totalPromoters,
      format: "number",
      change: promoterChange,
      icon: Smile,
      iconColor: "#22c55e",
    },
    {
      label: "Top Promoter Reason",
      value: topPromoterReason.label,
      format: "text",
      sub: `${currentData[topPromoterReason.key]} mentions`,
      icon: TrendingUp,
      iconColor: "#22c55e",
    },
    {
      label: "Total Detractor Mentions",
      value: currentData.totalDetractors,
      format: "number",
      change: detractorChange,
      icon: Frown,
      iconColor: "#ef4444",
    },
    {
      label: "Top Detractor Reason",
      value: topDetractorReason.label,
      format: "text",
      sub: `${currentData[topDetractorReason.key]} mentions`,
      icon: TrendingDown,
      iconColor: "#ef4444",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const displayValue =
          c.format === "number"
            ? (c.value as number).toLocaleString()
            : (c.value as string);

        return (
          <Card key={c.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: c.iconColor }} />
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
              <div className="flex items-end gap-2">
                <span className={`text-gray-900 ${c.format === "text" ? "text-sm" : "text-xl"}`}>
                  {displayValue}
                </span>
                {"change" in c && c.change !== undefined && (
                  <span
                    className={`flex items-center gap-0.5 text-xs mb-0.5 ${
                      c.label.includes("Detractor")
                        ? c.change! <= 0
                          ? "text-green-600"
                          : "text-red-600"
                        : c.change! >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {c.change! >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(c.change!).toFixed(1)}% {changeLabel}
                  </span>
                )}
              </div>
              {"sub" in c && c.sub && (
                <p className="text-xs text-gray-400 mt-1">{c.sub}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail tables                                                      */
/* ------------------------------------------------------------------ */

function DetailTable({
  title,
  data,
  periodKey,
  reasons,
  totalKey,
}: {
  title: string;
  data: any[];
  periodKey: string;
  reasons: readonly { key: string; label: string; color: string }[];
  totalKey: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left py-3 px-4 text-sm text-gray-900">
                  Period
                </th>
                <th className="text-right py-3 px-4 text-sm text-gray-900">
                  Total
                </th>
                {reasons.map((r) => (
                  <th
                    key={r.key}
                    className="text-right py-3 px-3 text-xs text-gray-500"
                  >
                    {r.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, idx: number) => (
                <tr
                  key={row[periodKey]}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-2.5 px-4 text-sm text-gray-700">
                    {row[periodKey]}
                  </td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-900">
                    {row[totalKey]?.toLocaleString()}
                  </td>
                  {reasons.map((r) => (
                    <td
                      key={r.key}
                      className="text-right py-2.5 px-3 text-sm"
                      style={{ color: r.color }}
                    >
                      {row[r.key]?.toLocaleString()}
                    </td>
                  ))}
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
/*  Main NpsFeedbackPage                                               */
/* ------------------------------------------------------------------ */

export function NpsFeedbackPage() {
  const [monthIndex, setMonthIndex] = useState(
    availableFeedbackMonths.length - 1
  );
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);

  const currentMonth = availableFeedbackMonths[monthIndex];
  const { month, year } = currentMonth;

  const weeklyData = useMemo(
    () => getFeedbackWeeklyByMonth(year, month),
    [year, month]
  );
  const monthlyAgg = useMemo(
    () => getFeedbackMonthlyAggregate(year, month),
    [year, month]
  );

  const prevMonth =
    monthIndex > 0 ? availableFeedbackMonths[monthIndex - 1] : null;
  const prevMonthlyAgg = useMemo(
    () =>
      prevMonth
        ? getFeedbackMonthlyAggregate(prevMonth.year, prevMonth.month)
        : undefined,
    [prevMonth]
  );

  const selectedWeek = weeklyData[selectedWeekIdx];
  const dailyData = useMemo(
    () =>
      selectedWeek
        ? getFeedbackDailyByWeek(year, month, selectedWeek.weekIndex)
        : [],
    [year, month, selectedWeek]
  );

  const prevWeek =
    selectedWeekIdx > 0 ? weeklyData[selectedWeekIdx - 1] : undefined;

  const handleMonthChange = useCallback((i: number) => {
    setMonthIndex(i);
    setSelectedWeekIdx(0);
  }, []);

  const chartData = viewMode === "monthly" ? weeklyData : dailyData;
  const chartDataKey = viewMode === "monthly" ? "weekLabel" : "dayLabel";
  const periodLabel =
    viewMode === "monthly"
      ? currentMonth.label
      : `${selectedWeek?.weekLabel} (${currentMonth.label})`;

  const summaryData = viewMode === "monthly" ? monthlyAgg : selectedWeek;
  const summaryPrev = viewMode === "monthly" ? prevMonthlyAgg : prevWeek;

  // Y domains
  const promoterYDomain = useMemo(
    () =>
      computeYDomain(chartData.map((d: any) => d.totalPromoters as number)),
    [chartData]
  );
  const detractorYDomain = useMemo(
    () =>
      computeYDomain(chartData.map((d: any) => d.totalDetractors as number)),
    [chartData]
  );

  const xPadding = useMemo(() => {
    const count = chartData.length;
    if (count <= 4) return { left: 60, right: 60 };
    if (count <= 7) return { left: 45, right: 45 };
    return { left: 35, right: 35 };
  }, [chartData.length]);

  const renderPromoterBars = useCallback(
    makeStackedBarsRenderer(PROMOTER_REASONS, "promo-fb"),
    []
  );
  const renderDetractorBars = useCallback(
    makeStackedBarsRenderer(DETRACTOR_REASONS, "detr-fb"),
    []
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-lg text-gray-900">NPS Feedback Analysis</h3>
          <p className="text-sm text-gray-500 mt-1">
            Breakdown of promoter &amp; detractor feedback reasons &middot;{" "}
            {currentMonth.label}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          <MonthNavigator
            currentIndex={monthIndex}
            onChange={handleMonthChange}
          />
        </div>
      </div>

      {viewMode === "weekly" && (
        <WeekSelector
          weeks={weeklyData}
          selectedIndex={selectedWeekIdx}
          onChange={setSelectedWeekIdx}
        />
      )}

      <SummaryCards
        currentData={summaryData}
        prevData={summaryPrev}
        isWeekly={viewMode === "weekly"}
      />

      {/* Promoter Reasons chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-green-500" />
            <CardTitle>Promoter Feedback Reasons — {periodLabel}</CardTitle>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Stacked breakdown of why customers gave positive scores
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 40, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={chartDataKey}
                tick={{ fontSize: 11 }}
                height={40}
                textAnchor="middle"
                interval={0}
                padding={xPadding}
              />
              <YAxis
                domain={promoterYDomain.domain}
                ticks={promoterYDomain.ticks}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<PromoterTooltip />} />
              <Customized
                key="promoter-bars"
                component={renderPromoterBars}
              />
              <Line
                type="monotone"
                dataKey="totalPromoters"
                stroke="transparent"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <Legend
            items={PROMOTER_REASONS.map((r) => ({
              label: r.label,
              color: r.color,
            }))}
          />
        </CardContent>
      </Card>

      {/* Detractor Reasons chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Frown className="w-5 h-5 text-red-500" />
            <CardTitle>Detractor Feedback Reasons — {periodLabel}</CardTitle>
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Stacked breakdown of why customers gave negative scores
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 40, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey={chartDataKey}
                tick={{ fontSize: 11 }}
                height={40}
                textAnchor="middle"
                interval={0}
                padding={xPadding}
              />
              <YAxis
                domain={detractorYDomain.domain}
                ticks={detractorYDomain.ticks}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<DetractorTooltip />} />
              <Customized
                key="detractor-bars"
                component={renderDetractorBars}
              />
              <Line
                type="monotone"
                dataKey="totalDetractors"
                stroke="transparent"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <Legend
            items={DETRACTOR_REASONS.map((r) => ({
              label: r.label,
              color: r.color,
            }))}
          />
        </CardContent>
      </Card>

      {/* Detail tables */}
      {chartData.length > 0 && (
        <>
          <DetailTable
            title="Promoter Reasons Breakdown"
            data={chartData}
            periodKey={chartDataKey}
            reasons={PROMOTER_REASONS}
            totalKey="totalPromoters"
          />
          <DetailTable
            title="Detractor Reasons Breakdown"
            data={chartData}
            periodKey={chartDataKey}
            reasons={DETRACTOR_REASONS}
            totalKey="totalDetractors"
          />
        </>
      )}
    </div>
  );
}