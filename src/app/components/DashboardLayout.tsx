import { Outlet, Link, useLocation } from "react-router";
import { BarChart3, GitCompare } from "lucide-react";

export function DashboardLayout() {
  const location = useLocation();
  const basePath = "/call-performance";

  const isOverviewActive =
    location.pathname === basePath ||
    location.pathname === `${basePath}/` ||
    location.pathname.startsWith(`${basePath}/advisor`);

  const isCompareActive = location.pathname === `${basePath}/compare`;

  return (
    <div>
      {/* Sub-navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6">
          <div className="flex space-x-8">
            <Link
              to={basePath}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm transition-colors ${
                isOverviewActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </Link>
            <Link
              to={`${basePath}/compare`}
              className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm transition-colors ${
                isCompareActive
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <GitCompare className="w-4 h-4" />
              <span>Compare Advisors</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
