import { useState, useMemo } from "react";
import { type Advisor, type CallMetrics, generateCallLevelMetrics } from "../data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft, ChevronDown, ChevronUp, Check, X, Clock } from "lucide-react";

type CallCategory = 'all' | 'quality' | 'experience' | 'opportunities';

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-red-100 text-red-800 border-red-200';
};

const getScoreBg = (score: number) => {
  if (score >= 90) return 'text-green-600';
  if (score >= 80) return 'text-blue-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

function getCallAverage(call: CallMetrics): number {
  const scores = [
    call.conversationalBalance,
    call.clientConcernsCovered,
    call.followUpClarity,
    call.callSentimentPositive,
    call.informationAccuracy,
    call.securityCompliance,
  ];
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

interface CallLevelMetricsProps {
  advisor: Advisor;
  onBack: () => void;
}

export function CallLevelMetrics({ advisor, onBack }: CallLevelMetricsProps) {
  const [expandedCall, setExpandedCall] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CallCategory>('all');

  const calls = useMemo(() => generateCallLevelMetrics(advisor), [advisor]);

  const toggleCall = (callId: string) => {
    setExpandedCall(prev => prev === callId ? null : callId);
  };

  const categories: { key: CallCategory; label: string }[] = [
    { key: 'all', label: 'All Categories' },
    { key: 'quality', label: 'Quality' },
    { key: 'experience', label: 'Experience' },
    { key: 'opportunities', label: 'Opportunities' },
  ];

  const renderMetricRow = (label: string, value: number, isAlt: boolean) => (
    <tr className={isAlt ? 'bg-gray-50' : 'bg-white'}>
      <td className="py-2 px-4 text-sm text-gray-600">{label}</td>
      <td className="text-left py-2 px-4">
        <Badge className={`${getScoreColor(value)} text-sm`}>{value}</Badge>
      </td>
      <td></td>
    </tr>
  );

  const renderCallDetails = (call: CallMetrics) => {
    let rowIndex = 0;
    return (
      <div className="border-t bg-gray-50/50 px-4 py-4">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-4 text-sm text-gray-500 w-64">Metric</th>
              <th className="text-left py-2 px-4 text-sm text-gray-500 w-32">Score</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {(categoryFilter === 'all' || categoryFilter === 'quality') && (
              <>
                {categoryFilter === 'all' && (
                  <tr className="bg-gray-200">
                    <td colSpan={3} className="py-1.5 px-4 text-sm text-gray-500">Quality</td>
                  </tr>
                )}
                <tr className={rowIndex++ % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 text-sm text-gray-600">Conversational Balance</td>
                  <td className="text-left py-2 px-4">
                    <Badge className={`${call.conversationalBalance >= 80 ? 'bg-green-100 text-green-800 border-green-200' : call.conversationalBalance >= 65 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-sm`}>
                      {call.conversationalBalance >= 80 ? 'High' : call.conversationalBalance >= 60 ? 'Medium' : 'Low'}
                    </Badge>
                  </td>
                  <td></td>
                </tr>
                <tr className={rowIndex++ % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 text-sm text-gray-600">Client Concerns Covered</td>
                  <td className="text-left py-2 px-4">
                    <Badge className={`${getScoreColor(call.clientConcernsCovered)} text-sm`}>{call.clientConcernsCovered}%</Badge>
                  </td>
                  <td></td>
                </tr>
                <tr className={rowIndex++ % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 text-sm text-gray-600">Follow-up Clarity</td>
                  <td className="text-left py-2 px-4">
                    <Badge className={`${call.followUpClarity >= 80 ? 'bg-green-100 text-green-800 border-green-200' : call.followUpClarity >= 65 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-sm`}>
                      {call.followUpClarity >= 80 ? 'High' : call.followUpClarity >= 60 ? 'Medium' : 'Low'}
                    </Badge>
                  </td>
                  <td></td>
                </tr>
              </>
            )}
            {(categoryFilter === 'all' || categoryFilter === 'experience') && (
              <>
                {categoryFilter === 'all' && (
                  <tr className="bg-gray-200">
                    <td colSpan={3} className="py-1.5 px-4 text-sm text-gray-500">Experience</td>
                  </tr>
                )}
                <tr className={rowIndex++ % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 text-sm text-gray-600">Sentiment Positive</td>
                  <td className="text-left py-2 px-4">
                    <Badge className={`${call.callSentimentPositive >= 55 ? 'bg-green-100 text-green-800 border-green-200' : call.callSentimentPositive >= 45 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-sm`}>{call.callSentimentPositive}%</Badge>
                  </td>
                  <td></td>
                </tr>
                <tr className={rowIndex++ % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 text-sm text-gray-600">Sentiment Neutral</td>
                  <td className="text-left py-2 px-4">
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200 text-sm">{call.callSentimentNeutral}%</Badge>
                  </td>
                  <td></td>
                </tr>
                <tr className={rowIndex++ % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 text-sm text-gray-600">Sentiment Negative</td>
                  <td className="text-left py-2 px-4">
                    <Badge className={`${call.callSentimentNegative <= 15 ? 'bg-green-100 text-green-800 border-green-200' : call.callSentimentNegative <= 20 ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-red-100 text-red-800 border-red-200'} text-sm`}>{call.callSentimentNegative}%</Badge>
                  </td>
                  <td></td>
                </tr>
              </>
            )}
            {(categoryFilter === 'all' || categoryFilter === 'opportunities') && (
              <>
                {categoryFilter === 'all' && (
                  <tr className="bg-gray-200">
                    <td colSpan={3} className="py-1.5 px-4 text-sm text-gray-500">Opportunities</td>
                  </tr>
                )}
                <tr className={rowIndex++ % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 text-sm text-gray-600">Opportunity Identified</td>
                  <td className="text-left py-2 px-4">
                    {call.opportunityIdentified ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">
                        <Check className="w-3 h-3 mr-1" />Yes
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-sm">
                        <X className="w-3 h-3 mr-1" />No
                      </Badge>
                    )}
                  </td>
                  <td></td>
                </tr>
                <tr className={rowIndex++ % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 text-sm text-gray-600">Opportunity Actioned</td>
                  <td className="text-left py-2 px-4">
                    {call.opportunityActioned ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-sm">
                        <Check className="w-3 h-3 mr-1" />Yes
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-sm">
                        <X className="w-3 h-3 mr-1" />No
                      </Badge>
                    )}
                  </td>
                  <td></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Summary
          </Button>
          <h3 className="text-lg text-gray-900">
            Call-by-Call Metrics &middot; Last Day ({calls.length} calls &middot; {advisor.weeklyHours / 5} hrs)
          </h3>
        </div>
      </div>

      {/* Category filter pills */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setCategoryFilter(cat.key)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors border ${
              categoryFilter === cat.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Call list */}
      <div className="space-y-2">
        {calls.map(call => {
          const isExpanded = expandedCall === call.callId;
          const avg = getCallAverage(call);
          return (
            <Card key={call.callId} className="overflow-hidden">
              <button
                onClick={() => toggleCall(call.callId)}
                className="w-full text-left"
              >
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-400 w-16">#{call.callNumber}</span>
                      <span className="text-sm text-gray-600 w-24">{call.timestamp}</span>
                      <div className="flex items-center gap-1 text-sm text-gray-500 w-20">
                        <Clock className="w-3.5 h-3.5" />
                        {call.duration}m
                      </div>
                      <Badge className={`${getScoreColor(avg)} text-sm`}>
                        Avg: {avg}
                      </Badge>
                      {call.opportunityIdentified && (
                        <Badge className={`text-sm ${call.opportunityActioned ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}`}>
                          {call.opportunityActioned ? 'Opp Actioned' : 'Opp Identified'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1">
                        <span className={`text-xs ${getScoreBg(call.conversationalBalance)}`}>Q</span>
                        <span className={`text-xs ${getScoreBg(call.callSentimentPositive)}`}>E</span>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </button>
              {isExpanded && renderCallDetails(call)}
            </Card>
          );
        })}
      </div>
    </div>
  );
}