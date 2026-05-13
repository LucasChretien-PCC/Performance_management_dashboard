import { useState } from "react";
import { mockAdvisors } from "../data/mockData";
import { AdvisorCard } from "../components/AdvisorCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Button } from "../components/ui/button";
import { MetricDefinitionsModal } from "../components/MetricDefinitionsModal";

type TimePeriod = 'day' | 'week' | 'month' | 'all-time';
type MetricCategory = 'operational' | 'quality' | 'experience' | 'opportunities' | 'callTimeBreakdown';

export function OverviewPage() {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [metricCategory, setMetricCategory] = useState<MetricCategory>('operational');
  const [showDefinitions, setShowDefinitions] = useState(false);

  const advisorsWithPeriodMetrics = mockAdvisors.map(advisor => ({
    ...advisor,
    metrics: advisor.metricsByPeriod[timePeriod]
  }));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl text-gray-900">Team Performance Overview</h2>
          <p className="text-gray-600 mt-1">Monitor and analyze advisor performance metrics</p>
        </div>

        <div className="flex gap-3 items-center">
          <Button variant="outline" onClick={() => setShowDefinitions(true)}>
            Metric Definitions
          </Button>
          <span className="text-sm text-gray-600">Time Period:</span>
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
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

      {/* Metric Category Buttons */}
      <div className="flex gap-2">
        <Button
          variant={metricCategory === 'operational' ? 'default' : 'outline'}
          onClick={() => setMetricCategory('operational')}
        >
          Operational
        </Button>
        <Button
          variant={metricCategory === 'quality' ? 'default' : 'outline'}
          onClick={() => setMetricCategory('quality')}
        >
          Quality
        </Button>
        <Button
          variant={metricCategory === 'experience' ? 'default' : 'outline'}
          onClick={() => setMetricCategory('experience')}
        >
          Experience
        </Button>
        <Button
          variant={metricCategory === 'opportunities' ? 'default' : 'outline'}
          onClick={() => setMetricCategory('opportunities')}
        >
          Opportunities
        </Button>
        <Button
          variant={metricCategory === 'callTimeBreakdown' ? 'default' : 'outline'}
          onClick={() => setMetricCategory('callTimeBreakdown')}
        >
          Call Time Breakdown
        </Button>
      </div>
      
      {/* Advisors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {advisorsWithPeriodMetrics.map((advisor) => (
          <AdvisorCard key={advisor.id} advisor={advisor} timePeriod={timePeriod} metricCategory={metricCategory} />
        ))}
      </div>
    </div>
  );
}