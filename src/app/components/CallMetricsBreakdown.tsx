import { type AdvisorMetrics } from "../data/mockData";

interface CallMetricsBreakdownProps {
  metrics: AdvisorMetrics;
}

const SEGMENT_COLORS: Record<string, string> = {
  intro: '#6366f1',
  authentication: '#8b5cf6',
  kyc: '#06b6d4',
  redemptionDetails: '#3b82f6',
  confirmationsDisclosures: '#f59e0b',
  outro: '#10b981',
};

const SEGMENT_LABELS: Record<string, string> = {
  intro: 'Intro',
  authentication: 'Authentication',
  kyc: 'KYC',
  redemptionDetails: 'Redemption Details',
  confirmationsDisclosures: 'Confirmations & Disclosures',
  outro: 'Outro',
};

export function CallMetricsBreakdown({ metrics }: CallMetricsBreakdownProps) {
  const pctOn = metrics.pctDayOnCalls;
  const pctOff = 100 - pctOn;

  const segments = [
    { key: 'intro', value: metrics.introTime },
    { key: 'authentication', value: metrics.authenticationTime },
    { key: 'kyc', value: metrics.kycTime },
    { key: 'redemptionDetails', value: metrics.redemptionDetailsTime },
    { key: 'confirmationsDisclosures', value: metrics.confirmationsDisclosuresTime },
    { key: 'outro', value: metrics.outroTime },
  ];

  const totalAHT = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-6">
      {/* Day Utilization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Day Utilization</span>
          <span className="text-xs text-gray-400">% of working day</span>
        </div>
        <div className="flex h-8 rounded-lg overflow-hidden w-full">
          <div
            style={{ width: `${pctOn}%`, backgroundColor: '#3b82f6' }}
            className="flex items-center justify-center transition-all"
            title={`On Calls: ${pctOn}%`}
          >
            {pctOn >= 12 && (
              <span className="text-xs text-white">{pctOn}%</span>
            )}
          </div>
          <div
            style={{ width: `${pctOff}%`, backgroundColor: '#e5e7eb' }}
            className="flex items-center justify-center transition-all"
            title={`Off Calls: ${pctOff}%`}
          >
            {pctOff >= 12 && (
              <span className="text-xs text-gray-500">{pctOff}%</span>
            )}
          </div>
        </div>
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#3b82f6' }} />
            <span className="text-xs text-gray-600">On Calls — <strong>{pctOn}%</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-200" />
            <span className="text-xs text-gray-600">Off Calls — <strong>{pctOff}%</strong></span>
          </div>
        </div>
      </div>

      {/* Call Time Breakdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-600">Avg Handle Time Breakdown</span>
          <span className="text-xs text-gray-400">total: {totalAHT.toFixed(1)} min</span>
        </div>
        <div className="flex h-8 rounded-lg overflow-hidden w-full">
          {segments.map(seg => {
            const pct = totalAHT > 0 ? (seg.value / totalAHT) * 100 : 0;
            return (
              <div
                key={seg.key}
                style={{ width: `${pct}%`, backgroundColor: SEGMENT_COLORS[seg.key] }}
                className="flex items-center justify-center transition-all"
                title={`${SEGMENT_LABELS[seg.key]}: ${seg.value}m`}
              >
                {pct >= 8 && (
                  <span className="text-xs text-white truncate px-0.5">{seg.value}m</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
          {segments.map(seg => {
            const pct = totalAHT > 0 ? Math.round((seg.value / totalAHT) * 100) : 0;
            return (
              <div key={seg.key} className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: SEGMENT_COLORS[seg.key] }}
                />
                <span className="text-xs text-gray-600 truncate">
                  {SEGMENT_LABELS[seg.key]} — <strong>{seg.value}m</strong>
                  <span className="text-gray-400 ml-1">({pct}%)</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
