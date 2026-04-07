/* eslint-disable react-refresh/only-export-components */
import { Suspense, lazy } from "react";
import { createHashRouter } from "react-router-dom";
import { AppShell } from "./ui/AppShell";
import { Spinner } from "./components/primitives/Spinner";
import { RoleRedirect } from "./ui/RoleRedirect";

/* ------------------------------------------------------------------ */
/*  Lazy page imports                                                  */
/* ------------------------------------------------------------------ */

const LoginPage = lazy(() => import("./pages/LoginPage"));
const QueueWorkbenchPage = lazy(() => import("./pages/QueueWorkbenchPage"));
const CaseDetailPage = lazy(() => import("./pages/CaseDetailPage"));
const GuidedRunnerPage = lazy(() => import("./pages/GuidedRunnerPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AccessDeniedPage = lazy(() => import("./pages/AccessDeniedPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const PropertiesPage = lazy(() => import("./pages/PropertiesPage"));
const PortfolioPage = lazy(() => import("./pages/PortfolioPage"));
const UnitsPage = lazy(() => import("./pages/UnitsPage"));
const TenantsPage = lazy(() => import("./pages/TenantsPage"));
const LandlordsPage = lazy(() => import("./pages/LandlordsPage"));
const VendorsPage = lazy(() => import("./pages/VendorsPage"));

/* ------------------------------------------------------------------ */
/*  Login page fallback (outside AppShell, needs its own Suspense)     */
/* ------------------------------------------------------------------ */

function LoginFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg-app">
      <Spinner size="lg" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Route tree                                                         */
/* ------------------------------------------------------------------ */

export const router = createHashRouter([
  // Public routes (no shell) — wrapped in Suspense for lazy load
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoginFallback />}>
        <LoginPage />
      </Suspense>
    ),
  },

  // Authenticated routes (with shell)
  {
    element: <AppShell />,
    children: [
      // Root redirect — role-aware landing page
      {
        index: true,
        element: <RoleRedirect />,
      },

      // Personal scopes
      {
        path: "work",
        element: <QueueWorkbenchPage />,
      },
      {
        path: "intake",
        element: <QueueWorkbenchPage />,
      },

      // Domain/system queues
      {
        path: "queue/:queueKey",
        element: <QueueWorkbenchPage />,
      },

      // Case detail
      {
        path: "case/:caseType/:caseId",
        element: <CaseDetailPage />,
      },

      // Guided runner
      {
        path: "case/:caseType/:caseId/run",
        element: <GuidedRunnerPage />,
      },

      // PMS surfaces
      {
        path: "properties",
        element: <PropertiesPage />,
      },
      {
        path: "portfolio",
        element: <PortfolioPage />,
      },
      {
        path: "units",
        element: <UnitsPage />,
      },
      {
        path: "tenants",
        element: <TenantsPage />,
      },
      {
        path: "landlords",
        element: <LandlordsPage />,
      },
      {
        path: "vendors",
        element: <VendorsPage />,
      },

      // Settings
      {
        path: "settings",
        element: <SettingsPage />,
      },

      // Access denied
      {
        path: "access-denied",
        element: <AccessDeniedPage />,
      },

      // Catch-all
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
