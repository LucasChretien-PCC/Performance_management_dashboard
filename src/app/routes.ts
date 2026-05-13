import { createBrowserRouter, redirect } from "react-router";
import { TopLevelLayout } from "./components/TopLevelLayout";
import { DashboardLayout } from "./components/DashboardLayout";
import { OverviewPage } from "./pages/OverviewPage";
import { AdvisorDetailPage } from "./pages/AdvisorDetailPage";
import { ComparePage } from "./pages/ComparePage";
import { FlowsPage } from "./pages/FlowsPage";
import { VolumesPage } from "./pages/VolumesPage";
import { PhonePage } from "./pages/volumes/PhonePage";
import { OnlineAccessPage } from "./pages/volumes/OnlineAccessPage";
import { EmailPage } from "./pages/volumes/EmailPage";
import { NpsPage } from "./pages/NpsPage";
import { NpsScoresPage } from "./pages/nps/NpsScoresPage";
import { NpsFeedbackPage } from "./pages/nps/NpsFeedbackPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: TopLevelLayout,
    children: [
      { index: true, loader: () => redirect("/call-performance") },
      {
        path: "call-performance",
        Component: DashboardLayout,
        children: [
          { index: true, Component: OverviewPage },
          { path: "advisor/:id", Component: AdvisorDetailPage },
          { path: "compare", Component: ComparePage },
        ],
      },
      { path: "flows", Component: FlowsPage },
      {
        path: "volumes",
        Component: VolumesPage,
        children: [
          { index: true, Component: PhonePage },
          { path: "phone", Component: PhonePage },
          { path: "online-access", Component: OnlineAccessPage },
          { path: "email", Component: EmailPage },
        ],
      },
      {
        path: "nps",
        Component: NpsPage,
        children: [
          { index: true, Component: NpsScoresPage },
          { path: "scores", Component: NpsScoresPage },
          { path: "feedback", Component: NpsFeedbackPage },
        ],
      },
    ],
  },
]);
