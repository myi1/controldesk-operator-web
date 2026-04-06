import { Suspense } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { cn } from "../lib/cn";
import { TooltipProvider } from "../components/primitives/Tooltip";
import { ToastProvider } from "../components/patterns/NotificationToast";
import { TopBar } from "../components/patterns/TopBar";
import { Sidebar } from "../components/patterns/Sidebar";
import { CommandPalette } from "../components/patterns/CommandPalette";
import { Spinner } from "../components/primitives/Spinner";
import { useUIStore } from "../stores/ui-store";
import { useAuthCheck } from "../hooks/use-auth-check";

function PageFallback() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function AppShell() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const { data: user, isLoading, isError } = useAuthCheck();

  // Redirect to login if not authenticated
  if (isError || (!isLoading && !user)) {
    return <Navigate to="/login" replace />;
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-app">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <ToastProvider>
        <div className="flex min-h-dvh flex-col bg-bg-app text-fg-default">
          <a href="#main" className="skip-link">
            Skip to main content
          </a>

          {/* Top bar */}
          <TopBar />

          {/* Body: sidebar + content */}
          <div className="flex flex-1">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <main
              id="main"
              role="main"
              className={cn(
                "flex-1 min-w-0",
                "transition-[margin-left] duration-[var(--duration-normal)] ease-[var(--ease-default)]",
                sidebarCollapsed
                  ? "ml-[var(--sidebar-collapsed-width)]"
                  : "ml-[var(--sidebar-width)]",
              )}
            >
              <Suspense fallback={<PageFallback />}>
                <Outlet />
              </Suspense>
            </main>
          </div>

          {/* Command palette (global overlay) */}
          <CommandPalette />
        </div>
      </ToastProvider>
    </TooltipProvider>
  );
}
