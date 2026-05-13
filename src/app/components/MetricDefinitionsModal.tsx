import { X } from "lucide-react";
import { Button } from "./ui/button";

interface MetricDefinitionsModalProps {
  onClose: () => void;
}

const SECTIONS = [
  {
    title: "Overall",
    metrics: [
      {
        name: "Overall Score",
        unit: "0–100",
        definition: "A composite performance score aggregating quality, experience, and operational metrics, weighted and normalized to a 0–100 scale. Higher is better.",
      },
    ],
  },
  {
    title: "Operational",
    metrics: [
      {
        name: "Weekly Hours",
        unit: "Hours",
        definition: "Total contracted working hours per week for the advisor.",
      },
      {
        name: "Calls per Hour",
        unit: "Calls/hr",
        definition: "Number of calls completed divided by hours worked. Measures how efficiently an advisor moves through their call queue.",
      },
      {
        name: "Avg Handle Time",
        unit: "Minutes",
        definition: "Average total duration of a call from the moment it is answered to when it ends, encompassing all conversation segments.",
      },
      {
        name: "% Day On Calls",
        unit: "%",
        definition: "Percentage of the advisor's work hours spent actively on calls. Calculated as total time on calls divided by total hours worked.",
      },
      {
        name: "% Day Off Calls",
        unit: "%",
        definition: "Percentage of the advisor's work hours spent on non-call activities, such as training, administrative tasks, and team meetings. Equals 100% minus % Day On Calls.",
      },
    ],
  },
  {
    title: "Call Time Breakdown",
    metrics: [
      {
        name: "Intro",
        unit: "Minutes (avg per call)",
        definition: "Average time spent on the opening of the call — greeting the client and establishing the purpose of the call.",
      },
      {
        name: "Authentication",
        unit: "Minutes (avg per call)",
        definition: "Average time spent verifying the client's identity before discussing account details, following security protocols.",
      },
      {
        name: "KYC",
        unit: "Minutes (avg per call)",
        definition: "Average time spent on Know Your Customer questions — understanding the client's current financial situation, goals, and any changes since the last interaction.",
      },
      {
        name: "Redemption Details",
        unit: "Minutes (avg per call)",
        definition: "Average time spent gathering the client's redemption request information — including the amount, fund, account details, and any relevant instructions.",
      },
      {
        name: "Confirmations & Disclosures",
        unit: "Minutes (avg per call)",
        definition: "Average time spent confirming the client's decisions and reading any required regulatory disclosures before the transaction is processed.",
      },
      {
        name: "Outro",
        unit: "Minutes (avg per call)",
        definition: "Average time spent closing the call — summarising next steps, checking for remaining questions, and thanking the client.",
      },
    ],
  },
  {
    title: "Quality",
    metrics: [
      {
        name: "Conversational Balance",
        unit: "High / Medium / Low",
        definition: "Measures the ratio of advisor speaking time to client speaking time. High indicates a balanced, two-way conversation. Low indicates the advisor is dominating the call without giving the client sufficient opportunity to speak.",
      },
      {
        name: "Client Concerns Covered",
        unit: "%",
        definition: "Percentage of distinct concerns or questions raised by the client that were meaningfully addressed during the call. Measured by reviewing the call transcript for each concern raised and whether a satisfactory response was provided.",
      },
      {
        name: "Follow-up Clarity",
        unit: "High / Medium / Low",
        definition: "Measures how clearly the advisor communicated next steps and action items at the end of the call. High means specific, actionable follow-ups were stated. Low means the call ended without clear direction for the client.",
      },
    ],
  },
  {
    title: "Experience",
    metrics: [
      {
        name: "Sentiment Positive",
        unit: "% of calls",
        definition: "Percentage of calls where the overall tone and language used by both parties was classified as positive. Measured using sentiment analysis on the call transcript.",
      },
      {
        name: "Sentiment Neutral",
        unit: "% of calls",
        definition: "Percentage of calls classified as neutral in tone — neither notably positive nor negative.",
      },
      {
        name: "Sentiment Negative",
        unit: "% of calls",
        definition: "Percentage of calls where the overall tone was classified as negative — typically indicating client frustration, dissatisfaction, or unresolved concerns. Lower is better.",
      },
    ],
  },
  {
    title: "Opportunities",
    metrics: [
      {
        name: "Opportunities Identified",
        unit: "Count",
        definition: "Number of calls where a potential opportunity was identified — such as a product recommendation, financial planning need, or cross-sell — relevant to the client's situation.",
      },
      {
        name: "Opportunities Actioned",
        unit: "Count",
        definition: "Number of identified opportunities that the advisor actively pursued during the call — for example, by making a recommendation, sending follow-up information, or scheduling a dedicated financial review.",
      },
      {
        name: "Conversion Rate",
        unit: "%",
        definition: "Percentage of identified opportunities that were actioned. Calculated as Opportunities Actioned ÷ Opportunities Identified × 100. Measures how effectively an advisor follows through on what they notice.",
      },
    ],
  },
];

export function MetricDefinitionsModal({ onClose }: MetricDefinitionsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b sticky top-0 bg-white rounded-t-xl">
          <div>
            <h2 className="text-2xl text-gray-900">Metric Definitions</h2>
            <p className="text-sm text-gray-500 mt-0.5">What each metric measures, its unit, and how it is calculated</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="px-8 py-6 space-y-8">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <h3 className="text-base text-gray-500 uppercase tracking-wide mb-3 pb-2 border-b">
                {section.title}
              </h3>
              <div className="space-y-4">
                {section.metrics.map(metric => (
                  <div key={metric.name} className="flex gap-4">
                    <div className="w-52 shrink-0">
                      <p className="text-base text-gray-900">{metric.name}</p>
                      <p className="text-sm text-gray-400 mt-0.5">{metric.unit}</p>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{metric.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
}
