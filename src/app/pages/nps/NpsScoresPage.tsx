import { useState, useCallback, useMemo } from "react";
import {
  ThumbsUp,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
  Users,
  Frown,
  Smile,
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
  availableNpsMonths,
  getNpsWeeklyByMonth,
  getNpsMonthlyAggregate,
  getNpsDailyByWeek,
  type NpsWeekly,
} from "../../data/npsData";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

type ViewMode = "monthly" | "weekly";

const PROMOTER_COLOR = "#22c55e";
const PASSIVE_COLOR = "#f59e0b";
const DETRACTOR_COLOR = "#ef4444";

const NPS_STACK = [
  { key: "detractorsPct", label: "Detractors %", color: DETRACTOR_COLOR },
  { key: "passivesPct", label: "Passives %", color: PASSIVE_COLOR },
  { key: "promotersPct", label: "Promoters %", color: PROMOTER_COLOR },
] as const;

/* ------------------------------------------------------------------ */
/*  Customized stacked bars renderer (100% stacked + NPS label)        */
/* ------------------------------------------------------------------ */

function makeNpsStackedBarsRenderer(
  metrics: readonly { key: string; color: string }[]
) {
  let clipIdCounter = 0;
  return function NpsStackedBars(props: any) {
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

    const clipId = `nps-score-bar-clip-${clipIdCounter++}`;

    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <rect
              x={offset.left}
              y={offset.top}
              width={offset.width}
              height={offset.height + 20}
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
                  if (value === undefined || value === null) return null;
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
        {/* NPS score labels rendered outside clip path so they aren't clipped */}
        {points.map((point: any, dataIndex: number) => {
          const entry = data[dataIndex] || point.payload;
          if (!entry) return null;
          const totalPct = metrics.reduce((sum, m) => sum + (entry[m.key] || 0), 0);
          return (
            <text
              key={`nps-label-${dataIndex}`}
              x={point.x}
              y={yScale(totalPct) - 14}
              textAnchor="middle"
              fontSize={22}
              fontWeight={800}
              fontFamily="'Nunito', 'Rounded Mplus 1c', system-ui, sans-serif"
              fill="#1e3a5f"
            >
              {entry.npsScore}
            </text>
          );
        })}
      </g>
    );
  };
}

/* ------------------------------------------------------------------ */
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */

function NpsTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0]?.payload;
  if (!entry) return null;
  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[240px]">
      <p className="text-sm text-gray-700 mb-2 border-b pb-1.5">{label}</p>
      <div className="flex justify-between items-center gap-4 text-sm py-0.5">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ backgroundColor: PROMOTER_COLOR, opacity: 0.85 }}
          />
          <span className="text-gray-600">Promoters</span>
        </span>
        <span className="text-gray-900">
          {entry.promotersPct?.toFixed(1)}% ({entry.promoters})
        </span>
      </div>
      <div className="flex justify-between items-center gap-4 text-sm py-0.5">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ backgroundColor: PASSIVE_COLOR, opacity: 0.85 }}
          />
          <span className="text-gray-600">Passives</span>
        </span>
        <span className="text-gray-900">
          {entry.passivesPct?.toFixed(1)}% ({entry.passives})
        </span>
      </div>
      <div className="flex justify-between items-center gap-4 text-sm py-0.5">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ backgroundColor: DETRACTOR_COLOR, opacity: 0.85 }}
          />
          <span className="text-gray-600">Detractors</span>
        </span>
        <span className="text-gray-900">
          {entry.detractorsPct?.toFixed(1)}% ({entry.detractors})
        </span>
      </div>
      <div className="flex justify-between items-center gap-4 text-sm py-0.5 border-t mt-1 pt-1">
        <span className="text-gray-600">Total Responses</span>
        <span className="text-gray-900">{entry.responses?.toLocaleString()}</span>
      </div>
      <div className="flex justify-between items-center gap-4 text-sm py-0.5 border-t mt-1 pt-1">
        <span className="text-gray-700">NPS Score</span>
        <span className="text-gray-900" style={{ fontWeight: 600 }}>
          {entry.npsScore}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared UI components                                               */
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
  const hasNext = currentIndex < availableNpsMonths.length - 1;
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
        {availableNpsMonths[currentIndex].label}
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
  weeks: NpsWeekly[];
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
    <div className="flex items-center justify-center gap-5 mt-4 text-sm text-gray-600 flex-wrap">
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span
            className="w-3.5 h-3 rounded-sm inline-block"
            style={{ backgroundColor: item.color, opacity: 0.85 }}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
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

  const npsChange =
    prevData !== undefined
      ? currentData.npsScore - prevData.npsScore
      : undefined;

  const responsesChange =
    prevData !== undefined
      ? ((currentData.responses - prevData.responses) / prevData.responses) *
        100
      : undefined;

  const changeLabel = isWeekly ? "WoW" : "MoM";

  const cards = [
    {
      label: "NPS Score",
      value: currentData.npsScore,
      format: "score",
      change: npsChange,
      changeUnit: "pts",
      icon: ThumbsUp,
      iconColor: "#3b82f6",
    },
    {
      label: "Total Responses",
      value: currentData.responses,
      format: "number",
      change: responsesChange,
      changeUnit: "%",
      icon: Users,
      iconColor: "#6b7280",
    },
    {
      label: "Promoters",
      value: currentData.promotersPct,
      format: "pct",
      sub: `${currentData.promoters} respondents`,
      icon: Smile,
      iconColor: PROMOTER_COLOR,
    },
    {
      label: "Detractors",
      value: currentData.detractorsPct,
      format: "pct",
      sub: `${currentData.detractors} respondents`,
      icon: Frown,
      iconColor: DETRACTOR_COLOR,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const displayValue =
          c.format === "pct"
            ? `${c.value.toFixed(1)}%`
            : c.format === "score"
            ? String(c.value)
            : c.value.toLocaleString();

        return (
          <Card key={c.label}>
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color: c.iconColor }} />
                <p className="text-xs text-gray-500">{c.label}</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-xl text-gray-900">{displayValue}</span>
                {"change" in c && c.change !== undefined && (
                  <span
                    className={`flex items-center gap-0.5 text-xs mb-0.5 ${
                      c.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {c.change >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {c.changeUnit === "pts"
                      ? `${c.change >= 0 ? "+" : ""}${c.change} pts ${changeLabel}`
                      : `${Math.abs(c.change).toFixed(1)}% ${changeLabel}`}
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
/*  Detail table                                                       */
/* ------------------------------------------------------------------ */

function DetailTable({
  data,
  periodKey,
}: {
  data: any[];
  periodKey: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NPS Detailed Breakdown</CardTitle>
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
                  NPS
                </th>
                <th className="text-right py-3 px-4 text-sm text-gray-900">
                  Responses
                </th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">
                  Promoters
                </th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">
                  Prom. %
                </th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">
                  Passives
                </th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">
                  Pass. %
                </th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">
                  Detractors
                </th>
                <th className="text-right py-3 px-4 text-sm text-gray-500 text-xs">
                  Det. %
                </th>
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
                  <td className="text-right py-2.5 px-4">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-sm">
                      {row.npsScore}
                    </Badge>
                  </td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-700">
                    {row.responses.toLocaleString()}
                  </td>
                  <td className="text-right py-2.5 px-4 text-sm" style={{ color: PROMOTER_COLOR }}>
                    {row.promoters.toLocaleString()}
                  </td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-500">
                    {row.promotersPct.toFixed(1)}%
                  </td>
                  <td className="text-right py-2.5 px-4 text-sm" style={{ color: PASSIVE_COLOR }}>
                    {row.passives.toLocaleString()}
                  </td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-500">
                    {row.passivesPct.toFixed(1)}%
                  </td>
                  <td className="text-right py-2.5 px-4 text-sm" style={{ color: DETRACTOR_COLOR }}>
                    {row.detractors.toLocaleString()}
                  </td>
                  <td className="text-right py-2.5 px-4 text-sm text-gray-500">
                    {row.detractorsPct.toFixed(1)}%
                  </td>
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
/*  Main NpsScoresPage                                                 */
/* ------------------------------------------------------------------ */

export function NpsScoresPage() {
  const [monthIndex, setMonthIndex] = useState(availableNpsMonths.length - 1);
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);

  const currentMonth = availableNpsMonths[monthIndex];
  const { month, year } = currentMonth;

  const weeklyData = useMemo(
    () => getNpsWeeklyByMonth(year, month),
    [year, month]
  );
  const monthlyAgg = useMemo(
    () => getNpsMonthlyAggregate(year, month),
    [year, month]
  );

  const prevMonth = monthIndex > 0 ? availableNpsMonths[monthIndex - 1] : null;
  const prevMonthlyAgg = useMemo(
    () =>
      prevMonth
        ? getNpsMonthlyAggregate(prevMonth.year, prevMonth.month)
        : undefined,
    [prevMonth]
  );

  const selectedWeek = weeklyData[selectedWeekIdx];
  const dailyData = useMemo(
    () =>
      selectedWeek
        ? getNpsDailyByWeek(year, month, selectedWeek.weekIndex)
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

  const npsChartData = useMemo(
    () =>
      chartData.map((d: any) => ({
        ...d,
        _total: d.detractorsPct + d.passivesPct + d.promotersPct,
      })),
    [chartData]
  );

  const renderStacked = useCallback(
    makeNpsStackedBarsRenderer(NPS_STACK),
    []
  );

  const yDomain = useMemo(
    () => ({
      domain: [0, 100] as [number, number],
      ticks: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    }),
    []
  );

  const xPadding = useMemo(() => {
    const count = chartData.length;
    if (count <= 4) return { left: 60, right: 60 };
    if (count <= 7) return { left: 45, right: 45 };
    return { left: 35, right: 35 };
  }, [chartData.length]);

  const summaryData = viewMode === "monthly" ? monthlyAgg : selectedWeek;
  const summaryPrev = viewMode === "monthly" ? prevMonthlyAgg : prevWeek;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-lg text-gray-900">NPS Scores</h3>
          <p className="text-sm text-gray-500 mt-1">
            NPS distribution, trends, and response breakdowns &middot;{" "}
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

      <Card>
        <CardHeader>
          <CardTitle>NPS Distribution — {periodLabel}</CardTitle>
          <p className="text-sm text-gray-500 mt-0.5">
            Stacked 100% bar showing Detractors, Passives &amp; Promoters with
            NPS score on top
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart
              data={npsChartData}
              margin={{ top: 35, right: 40, left: 10, bottom: 5 }}
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
                domain={yDomain.domain}
                ticks={yDomain.ticks}
                tickFormatter={(v: number) => `${v}%`}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<NpsTooltip />} />
              <Customized key="nps-bars" component={renderStacked} />
              <Line
                type="monotone"
                dataKey="_total"
                stroke="transparent"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <Legend
            items={[
              { label: "Promoters", color: PROMOTER_COLOR },
              { label: "Passives", color: PASSIVE_COLOR },
              { label: "Detractors", color: DETRACTOR_COLOR },
            ]}
          />
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <DetailTable data={chartData} periodKey={chartDataKey} />
      )}
    </div>
  );
}