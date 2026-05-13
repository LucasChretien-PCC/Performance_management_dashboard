import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Alert, AlertDescription } from "./ui/alert";
import { AlertTriangle, CheckCircle, Target } from "lucide-react";
import { mockAdvisors, type TimePeriod } from "../data/mockData";

interface PerformanceInsightsProps {
  timePeriod: TimePeriod;
}

export function PerformanceInsights({ timePeriod }: PerformanceInsightsProps) {
  // Get advisors with metrics for the selected time period
  const advisorsWithPeriodMetrics = mockAdvisors.map(advisor => ({
    ...advisor,
    metrics: advisor.metricsByPeriod[timePeriod]
  }));
  
  const topPerformers = [...advisorsWithPeriodMetrics]
    .sort((a, b) => b.metrics.overallScore - a.metrics.overallScore)
    .slice(0, Math.ceil(advisorsWithPeriodMetrics.length * 0.25));
    
  const bottomPerformers = [...advisorsWithPeriodMetrics]
    .sort((a, b) => a.metrics.overallScore - b.metrics.overallScore)
    .slice(0, Math.ceil(advisorsWithPeriodMetrics.length * 0.25));
  
  // Calculate some insights
  const avgOpportunityConversion = Math.round(
    advisorsWithPeriodMetrics.reduce((sum, a) => 
      sum + (a.metrics.opportunitiesActioned / a.metrics.opportunitiesIdentified), 0
    ) / advisorsWithPeriodMetrics.length * 100
  );
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Insights</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900">
            <strong>{topPerformers.length} advisors</strong> are performing exceptionally well with scores above 89. 
            Consider them for mentorship roles.
          </AlertDescription>
        </Alert>
        
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-900">
            <strong>{bottomPerformers.length} advisors</strong> may benefit from additional coaching and support 
            to improve their performance scores.
          </AlertDescription>
        </Alert>
        
        <Alert className="border-blue-200 bg-blue-50">
          <Target className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-900">
            Team opportunity conversion rate is <strong>{avgOpportunityConversion}%</strong>. 
            Top performers are converting at higher rates.
          </AlertDescription>
        </Alert>
        
      </CardContent>
    </Card>
  );
}
