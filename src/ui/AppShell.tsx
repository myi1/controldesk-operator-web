import { Suspense } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { cn } from "../lib/cn";
import { TooltipProvider } from "../components/primitives/Tooltip";
import { ToastProvider } from "../components/patterns/NotificationToast";
import { TopBar } from "../components/patterns/TopBar";
import { Sidebar } from "../components/patterns/Sidebar";
import { CommandPalette } from "../components/patterns/CommandPalette";
import { Spinner } from "../components/primitives/Spinner";
import { Button } from "../components/primitives/Button";
import { useUIStore } from "../stores/ui-store";
import { useAuthCheck, AuthServiceUnavailableError } from "../hooks/use-auth-check";
import { useSessionExpiry } from "../hooks/use-session-expiry";

function PageFallback() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

export function AppShell() {
  const location = useLocation();
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const { data: user, isLoading, isError, error } = useAuthCheck();

  // Redirect to /login (with ?next=) whenever any API call returns 401
  useSessionExpiry();

  // Show full-screen spinner while the initial auth check is in flight
  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg-app">
        <Spinner size="lg" />
      </div>
    );
  }

  // If the auth service itself is down (5xx / network), show an error banner
  // rather than redirecting to /login — login would fail too.
  if (isError && error instanceof AuthServiceUnavailableError) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-bg-app px-4 text-center">
        <p
          className={cn(
            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
            "text-fg-muted max-w-sm",
          )}
        >
          {error.message}
        </p>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  // Not authenticated — redirect to /login preserving the attempted URL
  if (isError || !user) {
    const returnTo = location.pathname + location.search;
    const loginPath =
      returnTo && returnTo !== "/" && returnTo !== "/login"
        ? `/login?next=${encodeURIComponent(returnTo)}`
        : "/login";
    return <Navigate to={loginPath} replace />;
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
