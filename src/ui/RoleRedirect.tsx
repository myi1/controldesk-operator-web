import { Navigate } from "react-router-dom";
import { useBootstrap } from "../hooks/use-bootstrap";
import { ROLE_DEFAULT_ROUTES } from "../config/role-config";
import { Spinner } from "../components/primitives/Spinner";
import type { OperatorRole } from "../types/enums";

/**
 * Redirects the user to their role-specific landing page.
 * Falls back to /work if no matching role route is found.
 */
export function RoleRedirect() {
  const { data: bootstrap, isLoading } = useBootstrap();

  if (isLoading || !bootstrap) {
    return (
      <div className="flex h-full items-center justify-center text-fg-muted">
        <Spinner size="md" />
      </div>
    );
  }

  // Find the first matching role route from the user's role inboxes
  for (const roleInbox of bootstrap.role_inbox_summaries) {
    const route = ROLE_DEFAULT_ROUTES[roleInbox.label as OperatorRole];
    if (route) {
      return <Navigate to={route} replace />;
    }
  }

  // Fallback to /work if no role match
  return <Navigate to="/work" replace />;
}
