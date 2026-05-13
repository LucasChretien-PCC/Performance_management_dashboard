import { Outlet, Link, useLocation } from "react-router";
import { BarChart3, MessageSquareText } from "lucide-react";

const subTabs = [
  { path: "/nps/scores", label: "NPS Scores", icon: BarChart3 },
  { path: "/nps/feedback", label: "NPS Feedback", icon: MessageSquareText },
];

export function NpsPage() {
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === "/nps/scores" && location.pathname === "/nps");

  return (
    <div className="px-6 py-6 max-w-7xl">
      {/* Page header */}
      <div className="mb-5">
        <h2 className="text-2xl text-gray-900">Net Promoter Score</h2>
        <p className="text-sm text-gray-500 mt-1">
          NPS scores, distributions, and respondent feedback analysis
        </p>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex items-center gap-1 border-b border-gray-200 mb-6">
        {subTabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors relative ${
                active
                  ? "text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Sub-page content */}
      <Outlet />
    </div>
  );
}
