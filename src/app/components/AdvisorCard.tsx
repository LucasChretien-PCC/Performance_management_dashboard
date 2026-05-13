import { Link } from "react-router";
import { type Advisor } from "../data/mockData";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Progress } from "./ui/progress";

// AdvisorCard - displays individual advisor metrics
interface AdvisorCardProps {
  advisor: Advisor;
  timePeriod: string;
  metricCategory: 'operational' | 'quality' | 'experience' | 'opportunities' | 'callTimeBreakdown';
}

export function AdvisorCard({ advisor, timePeriod, metricCategory }: AdvisorCardProps) {
  const { name, team, metrics, callType } = advisor;
  
  const getTrendIcon = () => {
    switch (metrics.performanceTrend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };
  
  const getScoreBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getCallsPerHourBadgeColor = (cph: number) => {
    if (cph >= 4.5) return 'bg-green-100 text-green-800 border-green-200';
    if (cph >= 3.5) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
      'day': [1, 1],
      'week': [8, 4],
      'month': [25, 15],
      'all-time': [280, 150],
    };
    const [green, yellow] = thresholds[timePeriod] || thresholds['month'];
    if (count >= green) return 'bg-green-100 text-green-800 border-green-200';
    if (count >= yellow) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getConversionRateBadgeColor = (rate: number) => {
    if (rate >= 60) return 'bg-green-100 text-green-800 border-green-200';
    if (rate >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };
  
  const callTypeLabel = callType === 'redemption' ? 'Redemptions' : 'Client Appointments';
  
  return (
    <Link to={`/call-performance/advisor/${advisor.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader className="pb-1">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg text-gray-900">{name}</h3>
              <p className="text-sm text-gray-600">{callTypeLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <Badge className={`${getScoreBadgeColor(metrics.overallScore)} text-lg`}>
                {metrics.overallScore}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 pt-3">
          {/* Overall Score Bar */}
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="text-gray-600 font-bold">Overall Score</span>
              <Badge className={`${getScoreBadgeColor(metrics.overallScore)} text-base`}>
                {metrics.overallScore}/100
              </Badge>
            </div>
            <Progress value={metrics.overallScore} className="h-2" />
          </div>
          
          {/* Metrics based on selected category */}
          {metricCategory === 'operational' && (
            <div className="space-y-3.5 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Wrk Hrs/Week</span>
                <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-base">
                  {advisor.weeklyHours}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Calls per Hour</span>
                <Badge className={`${getCallsPerHourBadgeColor(metrics.callsPerHour)} text-base`}>
                  {metrics.callsPerHour.toFixed(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Avg Handle Time</span>
                <Badge className={`${getHandleTimeBadgeColor(metrics.averageHandleTime)} text-base`}>
                  {metrics.averageHandleTime}m
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">% Day On Calls</span>
                <Badge className={`${metrics.pctDayOnCalls >= 70 ? 'bg-green-100 text-green-800 border-green-200' : metrics.pctDayOnCalls >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                  {metrics.pctDayOnCalls}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">% Day Off Calls</span>
                <Badge className={`${metrics.pctDayOnCalls >= 70 ? 'bg-green-100 text-green-800 border-green-200' : metrics.pctDayOnCalls >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                  {100 - metrics.pctDayOnCalls}%
                </Badge>
              </div>
            </div>
          )}

          {metricCategory === 'quality' && (
            <div className="space-y-3.5 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Conv. Balance</span>
                <Badge className={`${metrics.conversationalBalance >= 80 ? 'bg-green-100 text-green-800 border-green-200' : metrics.conversationalBalance >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                  {metrics.conversationalBalance >= 80 ? 'High' : metrics.conversationalBalance >= 60 ? 'Medium' : 'Low'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Concerns Covered</span>
                <Badge className={`${getScoreBadgeColor(metrics.clientConcernsCovered)} text-base`}>
                  {metrics.clientConcernsCovered}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Follow-up Clarity</span>
                <Badge className={`${metrics.followUpClarity >= 80 ? 'bg-green-100 text-green-800 border-green-200' : metrics.followUpClarity >= 60 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                  {metrics.followUpClarity >= 80 ? 'High' : metrics.followUpClarity >= 60 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>
          )}
          
          {metricCategory === 'experience' && (
            <div className="space-y-3.5 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Positive</span>
                <Badge className={`${metrics.callSentimentPositive >= 55 ? 'bg-green-100 text-green-800 border-green-200' : metrics.callSentimentPositive >= 45 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                  {metrics.callSentimentPositive}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Neutral</span>
                <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-base">
                  {metrics.callSentimentNeutral}%
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Negative</span>
                <Badge className={`${metrics.callSentimentNegative <= 15 ? 'bg-green-100 text-green-800 border-green-200' : metrics.callSentimentNegative <= 20 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-base`}>
                  {metrics.callSentimentNegative}%
                </Badge>
              </div>
            </div>
          )}
          
          {metricCategory === 'callTimeBreakdown' && (
            <div className="space-y-3.5 pt-1">
              {[
                { label: 'Intro', value: metrics.introTime, key: 'introTime' },
                { label: 'Authentication', value: metrics.authenticationTime, key: 'authenticationTime' },
                { label: 'KYC', value: metrics.kycTime, key: 'kycTime' },
                { label: 'Redemption Details', value: metrics.redemptionDetailsTime, key: 'redemptionDetailsTime' },
                { label: 'Confirmations', value: metrics.confirmationsDisclosuresTime, key: 'confirmationsDisclosuresTime' },
                { label: 'Outro', value: metrics.outroTime, key: 'outroTime' },
              ].map(seg => {
                const thresholds: Record<string, [number, number]> = {
                  introTime: [0.9, 1.0], authenticationTime: [2.2, 2.6],
                  kycTime: [2.8, 3.3], redemptionDetailsTime: [4.3, 5.0],
                  confirmationsDisclosuresTime: [2.8, 3.2], outroTime: [0.9, 1.0],
                };
                const [g, y] = thresholds[seg.key];
                const color = seg.value <= g ? 'bg-green-100 text-green-800 border-green-200' : seg.value <= y ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200';
                return (
                  <div key={seg.key} className="flex justify-between items-center">
                    <span className="text-gray-600 font-bold">{seg.label}</span>
                    <Badge className={`${color} text-base`}>{seg.value}m</Badge>
                  </div>
                );
              })}
            </div>
          )}

          {metricCategory === 'opportunities' && (
            <div className="space-y-3.5 pt-1">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Identified</span>
                <Badge className={`${getOpportunitiesIdentifiedBadgeColor(metrics.opportunitiesIdentified)} text-base`}>
                  {metrics.opportunitiesIdentified}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Actioned</span>
                <Badge className={`${getOpportunitiesActionedBadgeColor(metrics.opportunitiesActioned)} text-base`}>
                  {metrics.opportunitiesActioned}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-bold">Conversion Rate</span>
                <Badge className={`${getConversionRateBadgeColor(Math.round((metrics.opportunitiesActioned / metrics.opportunitiesIdentified) * 100))} text-base`}>
                  {Math.round((metrics.opportunitiesActioned / metrics.opportunitiesIdentified) * 100)}%
                </Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}