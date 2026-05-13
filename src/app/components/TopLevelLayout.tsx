import { Outlet, Link, useLocation } from "react-router";
import { Phone, ArrowRightLeft, BarChart3, ThumbsUp } from "lucide-react";

const topTabs = [
  { path: "/call-performance", label: "Advisor Call Performance", icon: Phone },
  { path: "/flows", label: "Flows", icon: ArrowRightLeft },
  { path: "/volumes", label: "Volumes", icon: BarChart3 },
  { path: "/nps", label: "NPS", icon: ThumbsUp },
];

export function TopLevelLayout() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl text-blue-900">Performance Dashboard</h1>
              <p className="text-sm text-gray-600">Advisor Performance Management</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Manager Dashboard</p>
              <p className="text-xs text-gray-500">Last updated: March 4, 2026</p>
            </div>
          </div>
        </div>

        {/* Top-level tabs */}
        <div className="px-6">
          <div className="flex space-x-1">
            {topTabs.map((tab) => {
              const active = isActive(tab.path);
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.path}
                  to={tab.path}
                  className={`flex items-center gap-2 px-5 py-2.5 text-sm rounded-t-lg transition-colors ${
                    active
                      ? "bg-gray-50 text-blue-700 border border-gray-200 border-b-gray-50 -mb-px"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <Outlet />

      {/* Footer Disclaimer */}
      <footer className="px-6 py-4 border-t border-gray-200 bg-white">
        <p className="text-xs text-gray-500 text-center">
          <strong>DISCLAIMER:</strong> This dashboard is for demonstration purposes. All data shown is mock data.
          Production implementation must meet all regulatory requirements and receive guidance and sign-off from legal and compliance.
        </p>
      </footer>
    </div>
  );
}
