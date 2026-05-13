import { useState, useCallback, useMemo } from "react";
import {
  availableMonths,
  getWeeklyByMonth,
  getMonthlyAggregate,
  getDailyByWeek,
  getMonthlyByYear,
  getYearlyAggregate,
  formatPct,
  type FlowWeeklyPoint,
  type FlowDailyPoint,
  type FlowMonthlyPoint,
} from "../data/flowsData";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  LineChart as LineChartIcon,
  ChevronLeft,
  ChevronRight,
  Percent,
  DollarSign,
} from "lucide-react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Customized,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type ViewMode = "yearly" | "monthly" | "weekly";
type UnitMode = "percentage" | "dollar";

const AUA = 3_000_000_000; // $3 billion

const METRIC_COLORS: Record<string, string> = {
  grossInflows: "#22c55e",
  grossOutflows: "#ef4444",
  transfersIn: "#3b82f6",
  investmentReturns: "#a855f7",
  netFlow: "#f59e0b",
};

const BAR_METRICS = [
  { key: "grossInflows", color: METRIC_COLORS.grossInflows, label: "Gross Inflows" },
  { key: "grossOutflows", color: METRIC_COLORS.grossOutflows, label: "Gross Outflows" },
  { key: "transfersIn", color: METRIC_COLORS.transfersIn, label: "Transfers In" },
];

const ALL_METRICS = [
  { key: "grossInflows", label: "Gross Inflows", type: "bar" },
  { key: "grossOutflows", label: "Gross Outflows", type: "bar" },
  { key: "transfersIn", label: "Transfers In", type: "bar" },
  { key: "investmentReturns", label: "Investment Returns", type: "line" },
  { key: "netFlow", label: "Net Flow", type: "line" },
];

const METRIC_BADGES: Record<string, string> = {
  grossInflows: "bg-green-50 text-green-700 border border-green-200",
  grossOutflows: "bg-red-50 text-red-700 border border-red-200",
  transfersIn: "bg-blue-50 text-blue-700 border border-blue-200",
  investmentReturns: "bg-purple-50 text-purple-700 border border-purple-200",
  netFlow: "bg-amber-50 text-amber-700 border border-amber-200",
};

const FLOW_METRIC_KEYS = ["grossInflows", "grossOutflows", "transfersIn", "investmentReturns", "netFlow"] as const;

/* ------------------------------------------------------------------ */
/*  Dollar conversion helpers                                          */
/* ------------------------------------------------------------------ */

function pctToDollar(pct: number): number {
  return (pct / 100) * AUA;
}

function convertRowToDollar<T extends Record<string, any>>(row: T): T {
  const out = { ...row };
  for (const key of FLOW_METRIC_KEYS) {
    if (typeof out[key] === "number") {
      (out as any)[key] = pctToDollar(out[key]);
    }
  }
  return out;
}

function formatDollar(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toFixed(0)}`;
}

function formatDollarSigned(value: number): string {
  const formatted = formatDollar(value);
  return value > 0 ? `+${formatted}` : formatted;
}

function formatValue(value: number, unit: UnitMode): string {
  return unit === "dollar" ? formatDollar(value) : `${value.toFixed(2)}%`;
}

function formatValueSigned(value: number, unit: UnitMode): string {
  return unit === "dollar" ? formatDollarSigned(value) : formatPct(value);
}

/* ------------------------------------------------------------------ */
/*  Custom grouped bars via <Customized>                               */
/* ------------------------------------------------------------------ */

function CustomGroupedBars(props: any) {
  const { xAxisMap, yAxisMap, formattedGraphicalItems, offset, unitMode } = props;
  if (!xAxisMap || !yAxisMap || !offset) return null;

  const xAxisKey = Object.keys(xAxisMap)[0];
  const yAxisKey = Object.keys(yAxisMap)[0];
  if (!xAxisKey || !yAxisKey) return null;

  const xAxis = xAxisMap[xAxisKey];
  const yAxis = yAxisMap[yAxisKey];
  if (!xAxis?.scale || !yAxis?.scale) return null;

  const yScale = yAxis.scale;

  const lineItem = formattedGraphicalItems?.[0];
  if (!lineItem?.props?.points) return null;

  const points = lineItem.props.points;
  const data = lineItem.props.data || points.map((p: any) => p.payload);
  if (!data || data.length === 0) return null;

  const step = points.length > 1 ? Math.abs(points[1].x - points[0].x) : 60;

  const plotLeft = offset.left;
  const plotRight = offset.left + offset.width;
  const firstPointX = points[0].x;
  const lastPointX = points[points.length - 1].x;
  const leftSpace = firstPointX - plotLeft;
  const rightSpace = plotRight - lastPointX;
  const edgeSpace = Math.min(leftSpace, rightSpace);

  const maxBarGroupWidth = Math.max(20, edgeSpace * 2 - 4);
  const barGroupWidth = Math.min(step * 0.45, maxBarGroupWidth, 70);

  const barCount = BAR_METRICS.length;
  const barGap = 1;
  const singleBarWidth = (barGroupWidth - barGap * (barCount - 1)) / barCount;
  const yZero = yScale(0);

  return (
    <g className="custom-grouped-bars">
      {points.map((point: any, dataIndex: number) => {
        const entry = data[dataIndex] || point.payload;
        if (!entry) return null;
        const centerX = point.x;

        return (
          <g key={`bar-group-${dataIndex}`}>
            {BAR_METRICS.map((metric, metricIndex) => {
              const value = entry[metric.key];
              if (value === undefined || value === null) return null;

              const barX =
                centerX -
                barGroupWidth / 2 +
                metricIndex * (singleBarWidth + barGap);
              const barY = value >= 0 ? yScale(value) : yZero;
              const barHeight = Math.abs(yScale(value) - yZero);

              return (
                <g key={`bar-${metric.key}-${dataIndex}`}>
                  <rect
                    x={barX}
                    y={barY}
                    width={Math.max(0, singleBarWidth)}
                    height={Math.max(0, barHeight)}
                    fill={metric.color}
                    fillOpacity={0.85}
                    rx={2}
                  />
                  <text
                    x={barX + singleBarWidth / 2}
                    y={barY - 4}
                    textAnchor="middle"
                    fontSize={9}
                    fill="#374151"
                  >
                    {unitMode === "dollar" ? formatDollar(value) : value.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Tooltip                                                            */
/* ------------------------------------------------------------------ */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const fullEntry = payload[0]?.payload;
  if (!fullEntry) return null;
  const unit: UnitMode = fullEntry._unitMode || "percentage";

  return (
    <div className="bg-white border rounded-lg shadow-lg p-3 min-w-[220px]">
      <p className="text-sm text-gray-700 mb-2 border-b pb-1.5">{label}</p>
      {ALL_METRICS.map((m) => {
        const value = fullEntry[m.key];
        if (value === undefined) return null;
        return (
          <div
            key={m.key}
            className="flex justify-between items-center gap-4 text-sm py-0.5"
          >
            <span className="flex items-center gap-1.5">
              {m.type === "bar" ? (
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{
                    backgroundColor: METRIC_COLORS[m.key],
                    opacity: 0.85,
                  }}
                />
              ) : (
                <span
                  className="w-3 h-0.5 rounded inline-block"
                  style={{ backgroundColor: METRIC_COLORS[m.key] }}
                />
              )}
              <span className="text-gray-600">{m.label}</span>
            </span>
            <span className="text-gray-900">
              {m.key === "netFlow" ? formatValueSigned(value, unit) : formatValue(value, unit)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Summary Card                                                       */
/* ------------------------------------------------------------------ */

function SummaryCard({
  label,
  value,
  icon: Icon,
  description,
  previousValue,
  metricKey,
  unit,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  description: string;
  previousValue?: number;
  metricKey: string;
  unit: UnitMode;
}) {
  const change =
    previousValue !== undefined ? value - previousValue : undefined;
  const isPositiveGood = metricKey !== "grossOutflows";
  const changeIsGood =
    change !== undefined
      ? isPositiveGood
        ? change > 0
        : change < 0
      : undefined;

  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4 text-gray-400" />
            <p className="text-xs text-gray-500">{label}</p>
          </div>
          {change !== undefined && (
            <div
              className={`flex items-center gap-0.5 text-xs ${
                changeIsGood ? "text-green-600" : "text-red-600"
              }`}
            >
              {changeIsGood ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {unit === "dollar"
                  ? formatDollar(Math.abs(change))
                  : `${Math.abs(change).toFixed(2)}pp`}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-center mb-1">
          <Badge className={`${METRIC_BADGES[metricKey]} text-lg px-3 py-1`}>
            {formatValue(value, unit)}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 text-center">{description}</p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  NetFlow Summary Card (special gradient)                            */
/* ------------------------------------------------------------------ */

function NetFlowCard({
  value,
  previousValue,
  unit,
}: {
  value: number;
  previousValue?: number;
  unit: UnitMode;
}) {
  const change = previousValue !== undefined ? value - previousValue : undefined;

  return (
    <Card className="bg-gradient-to-br from-amber-50 to-orange-50">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs text-gray-500">Net Flow</p>
          {change !== undefined && (
            <div
              className={`flex items-center gap-0.5 text-xs ${
                change > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {change > 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>
                {unit === "dollar"
                  ? formatDollar(Math.abs(change))
                  : `${Math.abs(change).toFixed(2)}pp`}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-center mb-1">
          <Badge className={`${METRIC_BADGES.netFlow} text-lg px-3 py-1`}>
            {formatValueSigned(value, unit)}
          </Badge>
        </div>
        <p className="text-xs text-gray-400 text-center">
          Inflows − Outflows + Transfers + Returns
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Unit mode toggle (sub-tabs)                                        */
/* ------------------------------------------------------------------ */

function UnitToggle({
  value,
  onChange,
}: {
  value: UnitMode;
  onChange: (v: UnitMode) => void;
}) {
  return (
    <div className="flex items-center border-b border-gray-200">
      <button
        onClick={() => onChange("percentage")}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
          value === "percentage"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        <Percent className="w-3.5 h-3.5" />
        Percentage
      </button>
      <button
        onClick={() => onChange("dollar")}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-colors border-b-2 -mb-px ${
          value === "dollar"
            ? "border-blue-600 text-blue-600"
            : "border-transparent text-gray-500 hover:text-gray-700"
        }`}
      >
        <DollarSign className="w-3.5 h-3.5" />
        Dollar
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Month navigator                                                    */
/* ------------------------------------------------------------------ */

function MonthNavigator({
  currentIndex,
  onChange,
}: {
  currentIndex: number;
  onChange: (i: number) => void;
}) {
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < availableMonths.length - 1;

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
        {availableMonths[currentIndex].label}
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

/* ------------------------------------------------------------------ */
/*  View mode toggle                                                   */
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
      {(["yearly", "monthly", "weekly"] as const).map((o) => (
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

/* ------------------------------------------------------------------ */
/*  Week selector pills                                                */
/* ------------------------------------------------------------------ */

function WeekSelector({
  weeks,
  selectedIndex,
  onChange,
}: {
  weeks: FlowWeeklyPoint[];
  selectedIndex: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
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

/* ------------------------------------------------------------------ */
/*  Legend                                                              */
/* ------------------------------------------------------------------ */

function ChartLegend() {
  return (
    <div className="flex items-center justify-center gap-6 mt-4 text-sm text-gray-600 flex-wrap">
      {BAR_METRICS.map((m) => (
        <span key={m.key} className="flex items-center gap-1.5">
          <span
            className="w-3.5 h-3 rounded-sm inline-block"
            style={{ backgroundColor: m.color, opacity: 0.85 }}
          />
          {m.label}
        </span>
      ))}
      <span className="flex items-center gap-1.5">
        <span
          className="w-5 inline-block rounded"
          style={{ backgroundColor: METRIC_COLORS.investmentReturns, height: 2.5 }}
        />
        Investment Returns
      </span>
      <span className="flex items-center gap-1.5">
        <span
          className="w-5 inline-block border-t-2 border-dashed"
          style={{ borderColor: METRIC_COLORS.netFlow }}
        />
        Net Flow
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Y-axis domain helper                                               */
/* ------------------------------------------------------------------ */

function computeYDomain(data: any[], unit: UnitMode = "percentage"): { yMin: number; yMax: number; ticks: number[] } {
  const allValues = data.flatMap((d) => [
    d.grossInflows,
    d.grossOutflows,
    d.transfersIn,
    d.investmentReturns,
    d.netFlow,
  ]);
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  if (unit === "dollar") {
    const range = maxVal - Math.min(minVal, 0);
    let step: number;
    if (range > 100_000_000) step = 25_000_000;
    else if (range > 50_000_000) step = 10_000_000;
    else if (range > 20_000_000) step = 5_000_000;
    else if (range > 5_000_000) step = 2_000_000;
    else if (range > 1_000_000) step = 500_000;
    else step = 100_000;

    const yMin = Math.floor(Math.min(minVal, 0) / step) * step;
    const yMax = Math.ceil(maxVal / step) * step + step;

    const ticks: number[] = [];
    for (let v = yMin; v <= yMax + step / 2; v += step) {
      ticks.push(Math.round(v));
    }
    return { yMin, yMax, ticks };
  }

  // Percentage mode
  const range = maxVal - Math.min(minVal, 0);
  let step: number;
  if (range > 2) step = 0.5;
  else if (range > 1) step = 0.25;
  else if (range > 0.3) step = 0.1;
  else step = 0.05;

  const yMin = Math.floor(Math.min(minVal, 0) / step) * step;
  const yMax = Math.ceil(maxVal / step) * step + step;

  const ticks: number[] = [];
  for (let v = yMin; v <= yMax + step / 2; v += step) {
    ticks.push(Math.round(v * 1000) / 1000);
  }

  return { yMin, yMax, ticks };
}

/* ------------------------------------------------------------------ */
/*  Flow chart component                                               */
/* ------------------------------------------------------------------ */

function FlowChart({
  data,
  dataKey,
  title,
  subtitle,
  unit,
}: {
  data: any[];
  dataKey: string;
  title: string;
  subtitle: string;
  unit: UnitMode;
}) {
  const renderBars = useCallback(
    (props: any) => <CustomGroupedBars {...props} unitMode={unit} />,
    [unit]
  );

  const { yMin, yMax, ticks } = useMemo(() => computeYDomain(data, unit), [data, unit]);

  const xPadding = useMemo(() => {
    const count = data.length;
    if (count <= 4) return { left: 60, right: 60 };
    if (count <= 7) return { left: 45, right: 45 };
    return { left: 35, right: 35 };
  }, [data.length]);

  const yTickFormatter = useCallback(
    (v: number) => (unit === "dollar" ? formatDollar(v) : `${v}%`),
    [unit]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart
            data={data}
            margin={{ top: 10, right: 40, left: unit === "dollar" ? 20 : 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={dataKey}
              tick={{ fontSize: 11 }}
              height={40}
              textAnchor="middle"
              interval={0}
              padding={xPadding}
            />
            <YAxis
              domain={[yMin, yMax]}
              ticks={ticks}
              tickFormatter={yTickFormatter}
              tick={{ fontSize: 11 }}
              width={unit === "dollar" ? 70 : 50}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />

            <Customized key="custom-bars" component={renderBars} />

            <Line
              key="line-investmentReturns"
              type="monotone"
              dataKey="investmentReturns"
              stroke={METRIC_COLORS.investmentReturns}
              strokeWidth={2.5}
              dot={{ r: 4, fill: METRIC_COLORS.investmentReturns, strokeWidth: 0 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
              name="Investment Returns"
            />

            <Line
              key="line-netFlow"
              type="monotone"
              dataKey="netFlow"
              stroke={METRIC_COLORS.netFlow}
              strokeWidth={2.5}
              strokeDasharray="8 4"
              dot={{
                r: 4,
                fill: METRIC_COLORS.netFlow,
                stroke: "#fff",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
              name="Net Flow"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <ChartLegend />
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail table                                                       */
/* ------------------------------------------------------------------ */

function DetailTable({
  data,
  periodKey,
  unit,
}: {
  data: any[];
  periodKey: string;
  unit: UnitMode;
}) {
  const fmt = (v: number) => formatValue(v, unit);
  const fmtNet = (v: number) => formatValueSigned(v, unit);

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
                <th className="text-center py-3 px-4 text-sm text-gray-900">Gross Inflows</th>
                <th className="text-center py-3 px-4 text-sm text-gray-900">Gross Outflows</th>
                <th className="text-center py-3 px-4 text-sm text-gray-900">Transfers In</th>
                <th className="text-center py-3 px-4 text-sm text-gray-900">Inv. Returns</th>
                <th className="text-center py-3 px-4 text-sm text-gray-900">Net Flow</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row: any, idx: number) => (
                <tr
                  key={row[periodKey]}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="py-3 px-4 text-sm text-gray-700">
                    {row[periodKey]}
                  </td>
                  <td className="text-center py-3 px-4">
                    <Badge className={`${METRIC_BADGES.grossInflows} text-sm`}>
                      {fmt(row.grossInflows)}
                    </Badge>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Badge className={`${METRIC_BADGES.grossOutflows} text-sm`}>
                      {fmt(row.grossOutflows)}
                    </Badge>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Badge className={`${METRIC_BADGES.transfersIn} text-sm`}>
                      {fmt(row.transfersIn)}
                    </Badge>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Badge className={`${METRIC_BADGES.investmentReturns} text-sm`}>
                      {fmt(row.investmentReturns)}
                    </Badge>
                  </td>
                  <td className="text-center py-3 px-4">
                    <Badge className={`${METRIC_BADGES.netFlow} text-sm`}>
                      {fmtNet(row.netFlow)}
                    </Badge>
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
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export function FlowsPage() {
  const [monthIndex, setMonthIndex] = useState(availableMonths.length - 1);
  const [viewMode, setViewMode] = useState<ViewMode>("monthly");
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);
  const [unitMode, setUnitMode] = useState<UnitMode>("percentage");

  const currentMonth = availableMonths[monthIndex];
  const { month, year } = currentMonth;

  const weeklyData = useMemo(() => getWeeklyByMonth(year, month), [year, month]);
  const monthlyAgg = useMemo(() => getMonthlyAggregate(year, month), [year, month]);

  const prevMonth = monthIndex > 0 ? availableMonths[monthIndex - 1] : null;
  const prevMonthlyAgg = useMemo(
    () => prevMonth ? getMonthlyAggregate(prevMonth.year, prevMonth.month) : undefined,
    [prevMonth]
  );

  const selectedWeek = weeklyData[selectedWeekIdx];
  const dailyData = useMemo(
    () => selectedWeek ? getDailyByWeek(year, month, selectedWeek.weekIndex) : [],
    [year, month, selectedWeek]
  );

  const prevWeek = selectedWeekIdx > 0 ? weeklyData[selectedWeekIdx - 1] : undefined;

  const handleMonthChange = useCallback((i: number) => {
    setMonthIndex(i);
    setSelectedWeekIdx(0);
  }, []);

  // Yearly data
  const yearlyMonthlyData = useMemo(() => getMonthlyByYear(2026), []);
  const yearlyAgg = useMemo(() => getYearlyAggregate(2026), []);

  // Summary data — convert if dollar mode
  const summaryDataRaw = viewMode === "yearly" ? yearlyAgg : viewMode === "monthly" ? monthlyAgg : selectedWeek;
  const prevSummaryDataRaw = viewMode === "yearly" ? undefined : viewMode === "monthly" ? prevMonthlyAgg : prevWeek;
  const summaryData = useMemo(
    () => summaryDataRaw && unitMode === "dollar" ? convertRowToDollar(summaryDataRaw) : summaryDataRaw,
    [summaryDataRaw, unitMode]
  );
  const prevSummaryData = useMemo(
    () => prevSummaryDataRaw && unitMode === "dollar" ? convertRowToDollar(prevSummaryDataRaw) : prevSummaryDataRaw,
    [prevSummaryDataRaw, unitMode]
  );

  // Chart data — convert if dollar mode, tag with _unitMode for tooltip
  const MONTH_SHORT_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const chartDataRaw = viewMode === "yearly" ? yearlyMonthlyData : viewMode === "monthly" ? weeklyData : dailyData;
  const chartData = useMemo(() => {
    const converted = unitMode === "dollar" ? chartDataRaw.map(convertRowToDollar) : chartDataRaw;
    return converted.map((row: any) => ({
      ...row,
      _unitMode: unitMode,
      ...(viewMode === "yearly" ? { monthLabel: MONTH_SHORT_LABELS[row.month - 1] } : {}),
    }));
  }, [chartDataRaw, unitMode, viewMode]);
  const chartDataKey = viewMode === "yearly" ? "monthLabel" : viewMode === "monthly" ? "weekLabel" : "dayLabel";
  const chartTitle =
    viewMode === "yearly"
      ? `Monthly Flow ${unitMode === "dollar" ? "Amounts" : "Rates"} — 2026`
      : viewMode === "monthly"
      ? `Weekly Flow ${unitMode === "dollar" ? "Amounts" : "Rates"} — ${currentMonth.label}`
      : `Daily Flow ${unitMode === "dollar" ? "Amounts" : "Rates"} — ${selectedWeek?.weekLabel} (${currentMonth.label})`;
  const chartSubtitle =
    unitMode === "dollar"
      ? "All values in USD (AUA: $3B) · Bars = Inflows, Outflows & Transfers · Lines = Investment Returns & Net Flow"
      : "All values as % of AUA · Bars = Inflows, Outflows & Transfers · Lines = Investment Returns & Net Flow";

  // Table data — convert if dollar mode
  const tableDataRaw = viewMode === "yearly" ? yearlyMonthlyData : viewMode === "monthly" ? weeklyData : dailyData;
  const tableData = useMemo(
    () => unitMode === "dollar" ? tableDataRaw.map(convertRowToDollar) : tableDataRaw,
    [tableDataRaw, unitMode]
  );
  const tablePeriodKey = viewMode === "yearly" ? "period" : viewMode === "monthly" ? "weekLabel" : "dayLabel";

  // Period label for header
  const periodLabel = viewMode === "yearly" ? "2026" : currentMonth.label;

  return (
    <div className="px-6 py-6 space-y-6 max-w-7xl">
      {/* Page header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl text-gray-900">Flows</h2>
          <p className="text-sm text-gray-500 mt-1">
            Track asset flows {unitMode === "dollar" ? "in dollar terms" : "as a percentage of AUA"} &middot; {periodLabel}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ViewToggle value={viewMode} onChange={setViewMode} />
          {viewMode !== "yearly" && (
            <MonthNavigator currentIndex={monthIndex} onChange={handleMonthChange} />
          )}
        </div>
      </div>

      {/* Unit mode toggle */}
      <UnitToggle value={unitMode} onChange={setUnitMode} />

      {/* Week selector (only in weekly view) */}
      {viewMode === "weekly" && (
        <WeekSelector
          weeks={weeklyData}
          selectedIndex={selectedWeekIdx}
          onChange={setSelectedWeekIdx}
        />
      )}

      {/* Summary Cards */}
      {summaryData && (
        <div className="grid grid-cols-5 gap-4">
          <SummaryCard
            label="Gross Inflows"
            value={summaryData.grossInflows}
            icon={ArrowUpRight}
            description={viewMode === "yearly" ? "Full year contributions & deposits" : "New contributions & deposits"}
            previousValue={prevSummaryData?.grossInflows}
            metricKey="grossInflows"
            unit={unitMode}
          />
          <SummaryCard
            label="Gross Outflows"
            value={summaryData.grossOutflows}
            icon={ArrowDownRight}
            description={viewMode === "yearly" ? "Full year withdrawals & redemptions" : "Withdrawals & redemptions"}
            previousValue={prevSummaryData?.grossOutflows}
            metricKey="grossOutflows"
            unit={unitMode}
          />
          <SummaryCard
            label="Transfers In"
            value={summaryData.transfersIn}
            icon={Users}
            description={viewMode === "yearly" ? "Full year new client acquisitions" : "AUA from new client acquisitions"}
            previousValue={prevSummaryData?.transfersIn}
            metricKey="transfersIn"
            unit={unitMode}
          />
          <SummaryCard
            label="Investment Returns"
            value={summaryData.investmentReturns}
            icon={LineChartIcon}
            description={viewMode === "yearly" ? "Full year portfolio performance" : "Portfolio performance"}
            previousValue={prevSummaryData?.investmentReturns}
            metricKey="investmentReturns"
            unit={unitMode}
          />
          <NetFlowCard
            value={summaryData.netFlow}
            previousValue={prevSummaryData?.netFlow}
            unit={unitMode}
          />
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 && (
        <FlowChart
          data={chartData}
          dataKey={chartDataKey}
          title={chartTitle}
          subtitle={chartSubtitle}
          unit={unitMode}
        />
      )}

      {/* Detail Table */}
      {tableData.length > 0 && (
        <DetailTable
          data={tableData}
          periodKey={tablePeriodKey}
          unit={unitMode}
        />
      )}
    </div>
  );
}