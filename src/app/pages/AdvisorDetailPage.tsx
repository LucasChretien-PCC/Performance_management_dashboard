import { useParams, Link } from "react-router";
import { useState, useMemo } from "react";
import { getAdvisorById, generateMetricTimeSeries, type MetricKey } from "../data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Phone, Clock, Target, ListChecks } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { CallLevelMetrics } from "../components/CallLevelMetrics";
import { CallMetricsBreakdown } from "../components/CallMetricsBreakdown";

type TimePeriod = 'day' | 'week' | 'month' | 'all-time';
type TrendCategory = 'overall' | 'operational' | 'callMetrics' | 'quality' | 'experience' | 'opportunities';

interface MetricDef {
  key: MetricKey;
  label: string;
  axis: 'left' | 'right';
  unit?: string;
}

const CATEGORY_METRICS: Record<TrendCategory, MetricDef[]> = {
  overall: [
    { key: 'overallScore', label: 'Overall Score', axis: 'left' }
  ],
  operational: [
    { key: 'callsPerHour', label: 'Calls per Hour', axis: 'left', unit: '/hr' },
    { key: 'averageHandleTime', label: 'Avg Handle Time', axis: 'right', unit: 'min' },
  ],
  callMetrics: [
    { key: 'pctDayOnCalls', label: '% Day On Calls', axis: 'left', unit: '%' },
    { key: 'introTime', label: 'Intro', axis: 'right', unit: 'min' },
    { key: 'authenticationTime', label: 'Authentication', axis: 'right', unit: 'min' },
    { key: 'kycTime', label: 'KYC', axis: 'right', unit: 'min' },
    { key: 'redemptionDetailsTime', label: 'Redemption Details', axis: 'right', unit: 'min' },
    { key: 'confirmationsDisclosuresTime', label: 'Confirmations & Disclosures', axis: 'right', unit: 'min' },
    { key: 'outroTime', label: 'Outro', axis: 'right', unit: 'min' },
  ],
  quality: [
    { key: 'conversationalBalance', label: 'Conversational Balance', axis: 'left' },
    { key: 'clientConcernsCovered', label: 'Client Concerns', axis: 'left' },
    { key: 'followUpClarity', label: 'Follow-up Clarity', axis: 'left' },
  ],
  experience: [
    { key: 'callSentimentPositive', label: 'Sentiment Positive', axis: 'left', unit: '%' },
    { key: 'callSentimentNeutral', label: 'Sentiment Neutral', axis: 'left', unit: '%' },
    { key: 'callSentimentNegative', label: 'Sentiment Negative', axis: 'left', unit: '%' },
  ],
  opportunities: [
    { key: 'opportunitiesIdentified', label: 'Identified', axis: 'left', unit: '' },
    { key: 'opportunitiesActioned', label: 'Actioned', axis: 'left', unit: '' },
    { key: 'conversionRate', label: 'Conversion Rate', axis: 'right', unit: '%' },
  ],
};

const LINE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];

export function AdvisorDetailPage() {
  const { id } = useParams();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [trendCategory, setTrendCategory] = useState<TrendCategory>('overall');
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(['overallScore']);
  const [showCallLevel, setShowCallLevel] = useState(false);
  
  const advisor = getAdvisorById(id || '');
  
  if (!advisor) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl text-gray-900">Advisor not found</h2>
        <Link to="/call-performance">
          <Button className="mt-4">Back to Overview</Button>
        </Link>
      </div>
    );
  }
  
  const metrics = advisor.metricsByPeriod[timePeriod];
  const callTypeLabel = advisor.callType === 'redemption' ? 'Redemption Calls' : 'Appointment Calls';
  const conversionRate = metrics.opportunitiesIdentified > 0
    ? Math.round((metrics.opportunitiesActioned / metrics.opportunitiesIdentified) * 100)
    : 0;
  
  // Badge color functions (synced with ComparePage and AdvisorCard)
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getCallsPerHourBadgeColor = (cph: number) => {
    if (cph >= 2.0) return 'bg-green-100 text-green-800 border-green-200';
    if (cph >= 1.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getHandleTimeBadgeColor = (time: number) => {
    if (time <= 13.5) return 'bg-green-100 text-green-800 border-green-200';
    if (time <= 15) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getAfterCallWorkBadgeColor = (time: number) => {
    if (time <= 6) return 'bg-green-100 text-green-800 border-green-200';
    if (time <= 7) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getOpportunitiesIdentifiedBadgeColor = (count: number) => {
    const thresholds: Record<string, [number, number]> = {
      'day': [2, 1],
      'week': [10, 6],
      'month': [30, 18],
      'all-time': [350, 200],
    };
    const [green, yellow] = thresholds[timePeriod] || thresholds['month'];
    if (count >= green) return 'bg-green-100 text-green-800 border-green-200';
    if (count >= yellow) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getOpportunitiesActionedBadgeColor = (count: number) => {
    const thresholds: Record<string, [number, number]> = {
      'day': [2, 1],
      'week': [7, 4],
      'month': [22, 11],
      'all-time': [260, 135],
    };
    const [green, yellow] = thresholds[timePeriod] || thresholds['month'];
    if (count >= green) return 'bg-green-100 text-green-800 border-green-200';
    if (count >= yellow) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getConversionRateBadgeColor = (rate: number) => {
    if (rate >= 60) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 45) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getOffCallsBadgeColor = (pctOnCalls: number) => {
    if (pctOnCalls >= 70) return 'bg-green-100 text-green-800 border-green-200';
    if (pctOnCalls >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getSegTimeBadgeColor = (key: string, val: number) => {
    const thresholds: Record<string, [number, number]> = {
      introTime:                    [0.9,  1.0],
      authenticationTime:           [2.2,  2.6],
      kycTime:                      [2.8,  3.3],
      redemptionDetailsTime:        [4.3,  5.0],
      confirmationsDisclosuresTime: [2.8,  3.2],
      outroTime:                    [0.9,  1.0],
    };
    const [g, y] = thresholds[key] ?? [99, 99];
    if (val <= g) return 'bg-green-100 text-green-800 border-green-200';
    if (val <= y) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getTrendIcon = () => {
    switch (metrics.performanceTrend) {
      case 'up': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'down': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Minus className="w-5 h-5 text-gray-600" />;
    }
  };
  
  const getScoreTextColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Handle category change - reset metric selection to first metric of new category
  const handleCategoryChange = (cat: string) => {
    const category = cat as TrendCategory;
    setTrendCategory(category);
    const catMetrics = CATEGORY_METRICS[category];
    setSelectedMetrics([catMetrics[0].key]);
  };
  
  // Toggle a metric within the current category
  const toggleMetric = (metricKey: MetricKey) => {
    setSelectedMetrics(prev => {
      if (prev.includes(metricKey)) {
        // Don't allow deselecting the last metric
        if (prev.length === 1) return prev;
        return prev.filter(m => m !== metricKey);
      }
      return [...prev, metricKey];
    });
  };
  
  // Generate time series data
  const timeSeriesData = useMemo(() => {
    if (selectedMetrics.length === 0) return [];
    return generateMetricTimeSeries(
      advisor.id,
      metrics,
      metrics.performanceTrend,
      timePeriod,
      selectedMetrics,
      advisor.weeklyHours
    );
  }, [advisor.id, metrics, timePeriod, selectedMetrics, advisor.weeklyHours]);
  
  // Determine Y-axis configuration
  const categoryDefs = CATEGORY_METRICS[trendCategory];
  const hasLeftAxis = selectedMetrics.some(m => categoryDefs.find(d => d.key === m)?.axis === 'left');
  const hasRightAxis = selectedMetrics.some(m => categoryDefs.find(d => d.key === m)?.axis === 'right');
  const isDualAxis = hasLeftAxis && hasRightAxis;
  
  // Compute dynamic domains for dual-axis categories
  const getLeftAxisConfig = () => {
    if (trendCategory === 'operational') {
      // Left axis = Calls/hr
      const maxVal = Math.max(...timeSeriesData.map(p => (p.callsPerHour as number) || 0));
      const domain = Math.ceil(maxVal * 2) / 2 || 1;
      return { domain: [0, domain], label: 'Calls/hr' };
    }
    if (trendCategory === 'callMetrics') {
      return { domain: [0, 100], label: '%' };
    }
    if (trendCategory === 'opportunities') {
      // Left axis = Count
      const maxVal = Math.max(
        ...timeSeriesData.map(p => (p.opportunitiesIdentified as number) || 0),
        ...timeSeriesData.map(p => (p.opportunitiesActioned as number) || 0)
      );
      const domain = Math.ceil(maxVal / 5) * 5 || 5;
      return { domain: [0, domain], label: 'Count' };
    }
    return { domain: [0, 100], label: 'Score' };
  };
  
  const getRightAxisConfig = () => {
    if (trendCategory === 'operational') {
      const maxVal = Math.max(
        ...timeSeriesData.map(p => (p.averageHandleTime as number) || 0),
        ...timeSeriesData.map(p => (p.afterCallWorkTime as number) || 0)
      );
      const domain = Math.ceil(maxVal / 5) * 5 || 5;
      return { domain: [0, domain], label: 'Minutes' };
    }
    if (trendCategory === 'callMetrics') {
      const segKeys = ['introTime', 'authenticationTime', 'kycTime', 'redemptionDetailsTime', 'confirmationsDisclosuresTime', 'outroTime'];
      const maxVal = Math.max(...segKeys.flatMap(k => timeSeriesData.map(p => (p[k] as number) || 0)));
      const domain = Math.ceil(maxVal * 2) / 2 || 5;
      return { domain: [0, domain], label: 'Minutes' };
    }
    if (trendCategory === 'opportunities') {
      return { domain: [0, 100], label: 'Percentage' };
    }
    return { domain: [0, 100], label: '' };
  };
  
  const leftAxisConfig = getLeftAxisConfig();
  const rightAxisConfig = getRightAxisConfig();
  
  // Get the period label for time-period-aware descriptions
  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'day': return 'Today';
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'all-time': return 'All Time';
    }
  };
  
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link to="/call-performance">
            <Button variant="outline" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl text-gray-900">{advisor.name}</h2>
              <Badge variant="outline">{advisor.team}</Badge>
              <Badge variant="outline" className="text-gray-600">{callTypeLabel}</Badge>
              <Badge variant="outline" className="text-gray-600">{advisor.weeklyHours} hrs/week</Badge>
              {getTrendIcon()}
            </div>
            <p className="text-gray-600 mt-1">Detailed performance analysis &middot; {getPeriodLabel()}</p>
          </div>
        </div>
        
        <div className="flex gap-3 items-center">
          <span className="text-sm text-gray-600">Time Period:</span>
          <Select value={timePeriod} onValueChange={(value) => { setTimePeriod(value as TimePeriod); setShowCallLevel(false); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Last Day</SelectItem>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
            </SelectContent>
          </Select>
          {timePeriod === 'day' && !showCallLevel && (
            <Button variant="outline" onClick={() => setShowCallLevel(true)}>
              <ListChecks className="mr-2 h-4 w-4" />
              See Metrics by Call
            </Button>
          )}
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="pt-5 pb-4 text-center">
            <p className="text-xs text-gray-500 mb-1">Overall Score</p>
            <p className={`text-4xl ${getScoreTextColor(metrics.overallScore)}`}>
              {metrics.overallScore}
            </p>
            <p className="text-xs text-gray-400">/100</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">Weekly Hours</p>
            <div className="flex justify-center">
              <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-base">
                {advisor.weeklyHours}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Phone className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">Calls per Hour</p>
            <div className="flex justify-center">
              <Badge className={`${getCallsPerHourBadgeColor(metrics.callsPerHour)} text-base`}>
                {metrics.callsPerHour.toFixed(1)}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Clock className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">Avg Handle Time</p>
            <div className="flex justify-center">
              <Badge className={`${getHandleTimeBadgeColor(metrics.averageHandleTime)} text-base`}>
                {metrics.averageHandleTime}m
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5 pb-4 text-center">
            <Target className="w-5 h-5 text-gray-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500 mb-1">Opportunities</p>
            <div className="flex justify-center">
              <Badge className={`${getOpportunitiesActionedBadgeColor(metrics.opportunitiesActioned)} text-base`}>
                {metrics.opportunitiesActioned}/{metrics.opportunitiesIdentified}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Show call-level view OR chart+table view */}
      {showCallLevel ? (
        <CallLevelMetrics advisor={advisor} onBack={() => setShowCallLevel(false)} />
      ) : (
        <>
          {/* Performance Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Over Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category selector */}
              <Tabs value={trendCategory} onValueChange={handleCategoryChange} className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overall">Overall</TabsTrigger>
                  <TabsTrigger value="operational">Operational</TabsTrigger>
                  <TabsTrigger value="callMetrics">Call Metrics</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Metric pills (multi-select within category) */}
              {trendCategory !== 'overall' && (
                <div className="flex gap-2 flex-wrap">
                  {categoryDefs.map(def => {
                    const isSelected = selectedMetrics.includes(def.key);
                    return (
                      <button
                        key={def.key}
                        onClick={() => toggleMetric(def.key)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
                        }`}
                      >
                        {def.label}
                      </button>
                    );
                  })}
                </div>
              )}
              
              {/* Call Metrics visual breakdown */}
              {trendCategory === 'callMetrics' && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <CallMetricsBreakdown metrics={metrics} />
                </div>
              )}

              {/* Chart */}
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12 }}
                    height={50}
                    angle={timePeriod === 'month' ? -45 : 0}
                    textAnchor={timePeriod === 'month' ? 'end' : 'middle'}
                  />
                  
                  {/* Left Y-axis */}
                  {(trendCategory === 'overall' || trendCategory === 'quality' || trendCategory === 'experience') ? (
                    <YAxis domain={[0, 100]} />
                  ) : trendCategory === 'callMetrics' && isDualAxis ? (
                    <>
                      <YAxis
                        yAxisId="left"
                        domain={[0, 100]}
                        label={{ value: '%', angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={rightAxisConfig.domain as [number, number]}
                        label={{ value: 'Minutes', angle: 90, position: 'insideRight' }}
                      />
                    </>
                  ) : trendCategory === 'callMetrics' ? (
                    // Single axis — either % or minutes
                    <YAxis
                      domain={hasRightAxis ? (rightAxisConfig.domain as [number, number]) : [0, 100]}
                      label={{ value: hasRightAxis ? 'Minutes' : '%', angle: -90, position: 'insideLeft' }}
                    />
                  ) : isDualAxis ? (
                    <>
                      <YAxis
                        yAxisId="left"
                        domain={leftAxisConfig.domain as [number, number]}
                        label={{ value: leftAxisConfig.label, angle: -90, position: 'insideLeft' }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={rightAxisConfig.domain as [number, number]}
                        label={{ value: rightAxisConfig.label, angle: 90, position: 'insideRight' }}
                      />
                    </>
                  ) : hasRightAxis ? (
                    <YAxis
                      domain={rightAxisConfig.domain as [number, number]}
                      label={{ value: rightAxisConfig.label, angle: -90, position: 'insideLeft' }}
                    />
                  ) : (
                    <YAxis
                      domain={leftAxisConfig.domain as [number, number]}
                      label={{ value: leftAxisConfig.label, angle: -90, position: 'insideLeft' }}
                    />
                  )}
                  
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white border rounded shadow-lg p-3">
                          <p className="text-sm text-gray-600 mb-1">{label}</p>
                          {payload.map((entry: any, i: number) => {
                            const def = categoryDefs.find(d => d.key === entry.dataKey);
                            const suffix = def?.unit !== undefined ? def.unit : '';
                            return (
                              <p key={i} style={{ color: entry.color }} className="text-sm">
                                {def?.label || entry.dataKey}: {entry.value}{suffix}
                              </p>
                            );
                          })}
                        </div>
                      );
                    }}
                  />
                  <Legend />
                  
                  {selectedMetrics.map((metricKey, idx) => {
                    const def = categoryDefs.find(d => d.key === metricKey);
                    const yAxisId = isDualAxis ? (def?.axis || 'left') : undefined;
                    return (
                      <Line
                        key={metricKey}
                        type="monotone"
                        dataKey={metricKey}
                        name={def?.label || metricKey}
                        stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                        activeDot={{ r: 5 }}
                        yAxisId={yAxisId}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
      
          {/* Detailed Metrics Tables */}
          <Card>
            <CardHeader>
              <CardTitle>
                {trendCategory === 'overall' ? 'All Metrics' : 
                 trendCategory === 'operational' ? 'Operational Metrics' :
                 trendCategory === 'callMetrics' ? 'Call Metrics' :
                 trendCategory === 'quality' ? 'Quality Metrics' :
                 trendCategory === 'experience' ? 'Experience Metrics' :
                 'Opportunities Metrics'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 text-base text-gray-900 w-72">Metric</th>
                      <th className="text-center py-3 px-4 text-base text-gray-900 w-32">Value</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Operational */}
                    {(trendCategory === 'overall' || trendCategory === 'operational') && (
                      <>
                        {trendCategory === 'overall' && (
                          <tr className="bg-gray-200">
                            <td colSpan={3} className="py-2 px-4 text-lg text-gray-500">Operational Metrics</td>
                          </tr>
                        )}
                        <tr className="bg-white">
                          <td className="py-3 px-4 text-base text-gray-600">Calls per Hour</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${getCallsPerHourBadgeColor(metrics.callsPerHour)} text-base`}>
                                {metrics.callsPerHour.toFixed(1)}
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 text-base text-gray-600">Avg Handle Time</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${getHandleTimeBadgeColor(metrics.averageHandleTime)} text-base`}>
                                {metrics.averageHandleTime}m
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                      </>
                    )}

                    {/* Call Metrics */}
                    {(trendCategory === 'overall' || trendCategory === 'callMetrics') && (
                      <>
                        {trendCategory === 'overall' && (
                          <tr className="bg-gray-200">
                            <td colSpan={3} className="py-2 px-4 text-lg text-gray-500">Call Metrics</td>
                          </tr>
                        )}
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 text-base text-gray-600">% Day On Calls</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${metrics.pctDayOnCalls >= 70 ? 'bg-green-100 text-green-800 border-green-200' : metrics.pctDayOnCalls >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                {metrics.pctDayOnCalls}%
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 text-base text-gray-600">% Day Off Calls</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${getOffCallsBadgeColor(metrics.pctDayOnCalls)} text-base`}>
                                {100 - metrics.pctDayOnCalls}%
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-gray-200">
                          <td colSpan={3} className="py-1.5 px-4 text-sm text-gray-400 italic">
                            Handle Time Breakdown — sums to {metrics.averageHandleTime}m Avg Handle Time
                          </td>
                        </tr>
                        {[
                          { label: 'Intro', value: metrics.introTime, key: 'introTime' },
                          { label: 'Authentication', value: metrics.authenticationTime, key: 'authenticationTime' },
                          { label: 'KYC', value: metrics.kycTime, key: 'kycTime' },
                          { label: 'Redemption Details', value: metrics.redemptionDetailsTime, key: 'redemptionDetailsTime' },
                          { label: 'Confirmations & Disclosures', value: metrics.confirmationsDisclosuresTime, key: 'confirmationsDisclosuresTime' },
                          { label: 'Outro', value: metrics.outroTime, key: 'outroTime' },
                        ].map((seg, idx) => (
                          <tr key={seg.label} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-3 px-4 text-base text-gray-600">{seg.label}</td>
                            <td className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getSegTimeBadgeColor(seg.key, seg.value)} text-base`}>
                                  {seg.value}m
                                </Badge>
                              </div>
                            </td>
                            <td></td>
                          </tr>
                        ))}
                      </>
                    )}

                    {/* Quality */}
                    {(trendCategory === 'overall' || trendCategory === 'quality') && (
                      <>
                        {trendCategory === 'overall' && (
                          <tr className="bg-gray-200">
                            <td colSpan={3} className="py-2 px-4 text-lg text-gray-500">Quality Metrics</td>
                          </tr>
                        )}
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 text-base text-gray-600">Conversational Balance</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${metrics.conversationalBalance >= 80 ? 'bg-green-100 text-green-800 border-green-200' : metrics.conversationalBalance >= 65 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                {metrics.conversationalBalance >= 80 ? 'High' : metrics.conversationalBalance >= 60 ? 'Medium' : 'Low'}
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 text-base text-gray-600">Client Concerns Covered</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${getScoreColor(metrics.clientConcernsCovered)} text-base`}>
                                {metrics.clientConcernsCovered}%
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 text-base text-gray-600">Follow-up Clarity</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${metrics.followUpClarity >= 80 ? 'bg-green-100 text-green-800 border-green-200' : metrics.followUpClarity >= 65 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                {metrics.followUpClarity >= 80 ? 'High' : metrics.followUpClarity >= 60 ? 'Medium' : 'Low'}
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                      </>
                    )}
                    
                    {/* Experience */}
                    {(trendCategory === 'overall' || trendCategory === 'experience') && (
                      <>
                        {trendCategory === 'overall' && (
                          <tr className="bg-gray-200">
                            <td colSpan={3} className="py-2 px-4 text-lg text-gray-500">Experience Metrics</td>
                          </tr>
                        )}
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 text-base text-gray-600">Sentiment Positive</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${metrics.callSentimentPositive >= 55 ? 'bg-green-100 text-green-800 border-green-200' : metrics.callSentimentPositive >= 45 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                {metrics.callSentimentPositive}%
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 text-base text-gray-600">Sentiment Neutral</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-base">
                                {metrics.callSentimentNeutral}%
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 text-base text-gray-600">Sentiment Negative</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${metrics.callSentimentNegative <= 15 ? 'bg-green-100 text-green-800 border-green-200' : metrics.callSentimentNegative <= 20 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                {metrics.callSentimentNegative}%
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                      </>
                    )}
                    
                    {/* Opportunities */}
                    {(trendCategory === 'overall' || trendCategory === 'opportunities') && (
                      <>
                        {trendCategory === 'overall' && (
                          <tr className="bg-gray-200">
                            <td colSpan={3} className="py-2 px-4 text-lg text-gray-500">Opportunities Metrics</td>
                          </tr>
                        )}
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 text-base text-gray-600">Opportunities Identified</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${getOpportunitiesIdentifiedBadgeColor(metrics.opportunitiesIdentified)} text-base`}>
                                {metrics.opportunitiesIdentified}
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 text-base text-gray-600">Opportunities Actioned</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${getOpportunitiesActionedBadgeColor(metrics.opportunitiesActioned)} text-base`}>
                                {metrics.opportunitiesActioned}
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 text-base text-gray-600">Conversion Rate</td>
                          <td className="text-center py-3 px-4">
                            <div className="flex justify-center">
                              <Badge className={`${getConversionRateBadgeColor(conversionRate)} text-base`}>
                                {conversionRate}%
                              </Badge>
                            </div>
                          </td>
                          <td></td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}