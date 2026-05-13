import { Card, CardContent } from "./ui/card";
import { Users, Phone, Clock, Target, TrendingUp, Calendar } from "lucide-react";

interface MetricsOverviewProps {
  overallScore: number;
  totalAdvisors: number;
  avgWeeklyHours: number;
  avgCallsPerHour: number;
  avgHandleTime: number;
  avgOpportunities: number;
}

export function MetricsOverview({ 
  overallScore, 
  totalAdvisors, 
  avgWeeklyHours,
  avgCallsPerHour, 
  avgHandleTime, 
  avgOpportunities 
}: MetricsOverviewProps) {
  const metrics = [
    {
      label: "Team Average Score",
      value: overallScore,
      suffix: "/100",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      label: "Total Advisors",
      value: totalAdvisors,
      suffix: "",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      label: "Avg Hrs/Week",
      value: avgWeeklyHours,
      suffix: "",
      icon: Calendar,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      label: "Avg Calls/Hour",
      value: avgCallsPerHour,
      suffix: "",
      icon: Phone,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Avg Handle Time",
      value: avgHandleTime,
      suffix: "m",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      label: "Avg Opps Identified",
      value: avgOpportunities,
      suffix: "",
      icon: Target,
      color: "text-pink-600",
      bgColor: "bg-pink-50"
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{metric.label}</p>
                <p className="text-2xl text-gray-900 mt-1">
                  {metric.value}{metric.suffix}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}