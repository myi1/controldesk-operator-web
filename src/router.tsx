/* eslint-disable react-refresh/only-export-components */
import { lazy } from "react";
import { createHashRouter, Navigate } from "react-router-dom";
import { AppShell } from "./ui/AppShell";

/* ------------------------------------------------------------------ */
/*  Lazy page imports                                                  */
/* ------------------------------------------------------------------ */

const LoginPage = lazy(() => import("./pages/LoginPage"));
const QueueWorkbenchPage = lazy(() => import("./pages/QueueWorkbenchPage"));
const CaseDetailPage = lazy(() => import("./pages/CaseDetailPage"));
const GuidedRunnerPage = lazy(() => import("./pages/GuidedRunnerPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

/* ------------------------------------------------------------------ */
/*  Route tree                                                         */
/* ------------------------------------------------------------------ */

export const router = createHashRouter([
  // Public routes (no shell)
  {
    path: "/login",
    element: <LoginPage />,
  },

  // Authenticated routes (with shell)
  {
    element: <AppShell />,
    children: [
      // Root redirect
      {
        index: true,
        element: <Navigate to="/work" replace />,
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

      // Settings
      {
        path: "settings",
        element: <SettingsPage />,
      },

      // Catch-all
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);
