import { useState } from "react";
import { mockAdvisors, type Advisor } from "../data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { X } from "lucide-react";
import { MetricDefinitionsModal } from "../components/MetricDefinitionsModal";

export function ComparePage() {
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month' | 'all-time'>('month');
  const [showDefinitions, setShowDefinitions] = useState(false);
  
  const addAdvisor = (advisorId: string) => {
    if (advisorId && !selectedAdvisors.includes(advisorId) && selectedAdvisors.length < 4) {
      setSelectedAdvisors([...selectedAdvisors, advisorId]);
    }
  };
  
  const removeAdvisor = (advisorId: string) => {
    setSelectedAdvisors(selectedAdvisors.filter(id => id !== advisorId));
  };
  
  const getAdvisorsData = () => {
    return selectedAdvisors
      .map(id => {
        const advisor = mockAdvisors.find(a => a.id === id);
        if (!advisor) return undefined;
        return {
          ...advisor,
          metrics: advisor.metricsByPeriod[timePeriod]
        };
      })
      .filter((a): a is Advisor => a !== undefined);
  };
  
  const advisors = getAdvisorsData();
  
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

  const availableAdvisors = mockAdvisors.filter(a => !selectedAdvisors.includes(a.id));
  
  return (
    <div className="space-y-6 max-w-7xl">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl text-gray-900">Compare Advisors</h2>
          <p className="text-gray-600 mt-1">Compare performance metrics across multiple advisors</p>
        </div>
        
        <div className="flex gap-3 items-center">
          <Button variant="outline" onClick={() => setShowDefinitions(true)}>
            Metric Definitions
          </Button>
          <span className="text-sm text-gray-600">Time Period:</span>
          <Select value={timePeriod} onValueChange={(value: any) => setTimePeriod(value)}>
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
        </div>
        {showDefinitions && <MetricDefinitionsModal onClose={() => setShowDefinitions(false)} />}
      </div>
      
      {/* Advisor Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Advisors to Compare (up to 4)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 items-center flex-wrap">
            {selectedAdvisors.length < 4 && (
              <Select onValueChange={addAdvisor}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Add advisor..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAdvisors.map(advisor => (
                    <SelectItem key={advisor.id} value={advisor.id}>
                      {advisor.name} - {advisor.team}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            {selectedAdvisors.map(id => {
              const advisor = mockAdvisors.find(a => a.id === id);
              if (!advisor) return null;
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="text-sm py-2 px-3 flex items-center gap-2"
                >
                  {advisor.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeAdvisor(id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
      
      {advisors.length > 0 && (
        <>
          {/* Category Selector and Content - All wrapped in single Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Metrics by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="operational">Operational</TabsTrigger>
                  <TabsTrigger value="callTimeBreakdown">Call Time Breakdown</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                </TabsList>
              </CardContent>
            </Card>
            
            {/* Detailed Comparison Tables */}
            <TabsContent value="all">
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-base font-bold text-gray-900 w-64">Metric</th>
                          {advisors.map(advisor => (
                            <th key={advisor.id} className="text-center py-3 px-6 text-base font-bold text-gray-900 w-44">
                              {advisor.name}
                            </th>
                          ))}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Operational */}
                        <tr className="bg-gray-200">
                          <td colSpan={advisors.length + 2} className="py-2 px-4 text-lg font-bold text-gray-500">
                            Operational Metrics
                          </td>
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Weekly Hours</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-base">
                                  {advisor.weeklyHours}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Calls per Hour</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getCallsPerHourBadgeColor(advisor.metrics.callsPerHour)} text-base`}>
                                  {advisor.metrics.callsPerHour.toFixed(1)}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Avg Handle Time</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getHandleTimeBadgeColor(advisor.metrics.averageHandleTime)} text-base`}>
                                  {advisor.metrics.averageHandleTime}m
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">% Day On Calls</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.pctDayOnCalls >= 70 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.pctDayOnCalls >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.pctDayOnCalls}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">% Day Off Calls</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getOffCallsBadgeColor(advisor.metrics.pctDayOnCalls)} text-base`}>
                                  {100 - advisor.metrics.pctDayOnCalls}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Quality */}
                        <tr className="bg-gray-200">
                          <td colSpan={advisors.length + 2} className="py-2 px-4 text-lg font-bold text-gray-500">
                            Quality Metrics
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Conversational Balance</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.conversationalBalance >= 80 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.conversationalBalance >= 65 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.conversationalBalance >= 80 ? 'High' : advisor.metrics.conversationalBalance >= 60 ? 'Medium' : 'Low'}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Client Concerns Covered</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getScoreColor(advisor.metrics.clientConcernsCovered)} text-base`}>
                                  {advisor.metrics.clientConcernsCovered}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Follow-up Clarity</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.followUpClarity >= 80 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.followUpClarity >= 65 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.followUpClarity >= 80 ? 'High' : advisor.metrics.followUpClarity >= 60 ? 'Medium' : 'Low'}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>

                        {/* Experience */}
                        <tr className="bg-gray-200">
                          <td colSpan={advisors.length + 2} className="py-2 px-4 text-lg font-bold text-gray-500">
                            Experience Metrics
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Sentiment Positive</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.callSentimentPositive >= 55 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.callSentimentPositive >= 45 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.callSentimentPositive}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Sentiment Neutral</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-base">
                                  {advisor.metrics.callSentimentNeutral}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Sentiment Negative</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.callSentimentNegative <= 15 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.callSentimentNegative <= 20 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.callSentimentNegative}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        
                        {/* Call Time Breakdown */}
                        <tr className="bg-gray-200">
                          <td colSpan={advisors.length + 2} className="py-2 px-4 text-lg font-bold text-gray-500">
                            Call Time Breakdown
                          </td>
                        </tr>
                        {[
                          { label: 'Intro', key: 'introTime' as const },
                          { label: 'Authentication', key: 'authenticationTime' as const },
                          { label: 'KYC', key: 'kycTime' as const },
                          { label: 'Redemption Details', key: 'redemptionDetailsTime' as const },
                          { label: 'Confirmations & Disclosures', key: 'confirmationsDisclosuresTime' as const },
                          { label: 'Outro', key: 'outroTime' as const },
                        ].map((seg, idx) => (
                          <tr key={seg.key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">{seg.label}</td>
                            {advisors.map(advisor => (
                              <td key={advisor.id} className="text-center py-3 px-4">
                                <div className="flex justify-center">
                                  <Badge className={`${getSegTimeBadgeColor(seg.key, advisor.metrics[seg.key])} text-base`}>
                                    {advisor.metrics[seg.key]}m
                                  </Badge>
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}

                        {/* Opportunities */}
                        <tr className="bg-gray-200">
                          <td colSpan={advisors.length + 2} className="py-2 px-4 text-lg font-bold text-gray-500">
                            Opportunities Metrics
                          </td>
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Opportunities Identified</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getOpportunitiesIdentifiedBadgeColor(advisor.metrics.opportunitiesIdentified)} text-base`}>
                                  {advisor.metrics.opportunitiesIdentified}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Opportunities Actioned</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getOpportunitiesActionedBadgeColor(advisor.metrics.opportunitiesActioned)} text-base`}>
                                  {advisor.metrics.opportunitiesActioned}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Conversion Rate</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getConversionRateBadgeColor(Math.round((advisor.metrics.opportunitiesActioned / advisor.metrics.opportunitiesIdentified) * 100))} text-base`}>
                                  {Math.round((advisor.metrics.opportunitiesActioned / advisor.metrics.opportunitiesIdentified) * 100)}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="operational">
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-base font-bold text-gray-900 w-64">Metric</th>
                          {advisors.map(advisor => (
                            <th key={advisor.id} className="text-center py-3 px-6 text-base font-bold text-gray-900 w-44">
                              {advisor.name}
                            </th>
                          ))}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Weekly Hours</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-base">
                                  {advisor.weeklyHours}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Calls per Hour</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getCallsPerHourBadgeColor(advisor.metrics.callsPerHour)} text-base`}>
                                  {advisor.metrics.callsPerHour.toFixed(1)}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Avg Handle Time</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getHandleTimeBadgeColor(advisor.metrics.averageHandleTime)} text-base`}>
                                  {advisor.metrics.averageHandleTime}m
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">% Day On Calls</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.pctDayOnCalls >= 70 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.pctDayOnCalls >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.pctDayOnCalls}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">% Day Off Calls</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getOffCallsBadgeColor(advisor.metrics.pctDayOnCalls)} text-base`}>
                                  {100 - advisor.metrics.pctDayOnCalls}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="callTimeBreakdown">
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-base font-bold text-gray-900 w-64">Metric</th>
                          {advisors.map(advisor => (
                            <th key={advisor.id} className="text-center py-3 px-6 text-base font-bold text-gray-900 w-44">
                              {advisor.name}
                            </th>
                          ))}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">% Day On Calls</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.pctDayOnCalls >= 70 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.pctDayOnCalls >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.pctDayOnCalls}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">% Day Off Calls</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getOffCallsBadgeColor(advisor.metrics.pctDayOnCalls)} text-base`}>
                                  {100 - advisor.metrics.pctDayOnCalls}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-200">
                          <td colSpan={advisors.length + 2} className="py-2 px-4 text-sm font-bold text-gray-400 italic">
                            Handle Time Breakdown (all in minutes)
                          </td>
                        </tr>
                        {[
                          { label: 'Intro', key: 'introTime' as const },
                          { label: 'Authentication', key: 'authenticationTime' as const },
                          { label: 'KYC', key: 'kycTime' as const },
                          { label: 'Redemption Details', key: 'redemptionDetailsTime' as const },
                          { label: 'Confirmations & Disclosures', key: 'confirmationsDisclosuresTime' as const },
                          { label: 'Outro', key: 'outroTime' as const },
                        ].map((seg, idx) => (
                          <tr key={seg.key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">{seg.label}</td>
                            {advisors.map(advisor => (
                              <td key={advisor.id} className="text-center py-3 px-4">
                                <div className="flex justify-center">
                                  <Badge className={`${getSegTimeBadgeColor(seg.key, advisor.metrics[seg.key])} text-base`}>
                                    {advisor.metrics[seg.key]}m
                                  </Badge>
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="quality">
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-base font-bold text-gray-900 w-64">Metric</th>
                          {advisors.map(advisor => (
                            <th key={advisor.id} className="text-center py-3 px-6 text-base font-bold text-gray-900 w-44">
                              {advisor.name}
                            </th>
                          ))}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Conversational Balance</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.conversationalBalance >= 80 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.conversationalBalance >= 65 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.conversationalBalance >= 80 ? 'High' : advisor.metrics.conversationalBalance >= 60 ? 'Medium' : 'Low'}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Client Concerns Covered</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getScoreColor(advisor.metrics.clientConcernsCovered)} text-base`}>
                                  {advisor.metrics.clientConcernsCovered}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Follow-up Clarity</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.followUpClarity >= 80 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.followUpClarity >= 65 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.followUpClarity >= 80 ? 'High' : advisor.metrics.followUpClarity >= 60 ? 'Medium' : 'Low'}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="experience">
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-base font-bold text-gray-900 w-64">Metric</th>
                          {advisors.map(advisor => (
                            <th key={advisor.id} className="text-center py-3 px-6 text-base font-bold text-gray-900 w-44">
                              {advisor.name}
                            </th>
                          ))}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Sentiment Positive</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.callSentimentPositive >= 55 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.callSentimentPositive >= 45 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.callSentimentPositive}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Sentiment Neutral</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-base">
                                  {advisor.metrics.callSentimentNeutral}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Sentiment Negative</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${advisor.metrics.callSentimentNegative <= 15 ? 'bg-green-100 text-green-800 border-green-200' : advisor.metrics.callSentimentNegative <= 20 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                                  {advisor.metrics.callSentimentNegative}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="opportunities">
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="text-left py-3 px-4 text-base font-bold text-gray-900 w-64">Metric</th>
                          {advisors.map(advisor => (
                            <th key={advisor.id} className="text-center py-3 px-6 text-base font-bold text-gray-900 w-44">
                              {advisor.name}
                            </th>
                          ))}
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Opportunities Identified</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getOpportunitiesIdentifiedBadgeColor(advisor.metrics.opportunitiesIdentified)} text-base`}>
                                  {advisor.metrics.opportunitiesIdentified}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-white">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Opportunities Actioned</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getOpportunitiesActionedBadgeColor(advisor.metrics.opportunitiesActioned)} text-base`}>
                                  {advisor.metrics.opportunitiesActioned}
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                        <tr className="bg-gray-50">
                          <td className="py-3 px-4 font-bold text-base text-gray-600 w-64">Conversion Rate</td>
                          {advisors.map(advisor => (
                            <td key={advisor.id} className="text-center py-3 px-4">
                              <div className="flex justify-center">
                                <Badge className={`${getConversionRateBadgeColor(Math.round((advisor.metrics.opportunitiesActioned / advisor.metrics.opportunitiesIdentified) * 100))} text-base`}>
                                  {Math.round((advisor.metrics.opportunitiesActioned / advisor.metrics.opportunitiesIdentified) * 100)}%
                                </Badge>
                              </div>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
      
      {advisors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-600">Select advisors to begin comparison</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}