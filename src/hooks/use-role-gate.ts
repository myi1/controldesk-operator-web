// ---------------------------------------------------------------------------
// Role gating hook
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import { useBootstrap } from "./use-bootstrap";

export function useRoleGate() {
  const { data: bootstrap } = useBootstrap();

  return useMemo(() => {
    // Derive role list from the queue summaries' queue_key convention
    // In production, roles come from the bootstrap response.
    // For now we derive them from available queue keys.
    const userRoles: string[] = bootstrap
      ? bootstrap.role_inbox_summaries.map((r) => r.label)
      : [];

    const roleSet = new Set(userRoles);

    function hasRole(role: string): boolean {
      return roleSet.has(role);
    }

    function canAccessQueue(queueKey: string): boolean {
      // If bootstrap data isn't loaded yet, deny access
      if (!bootstrap) return false;
      return bootstrap.queue_summaries.some((q) => q.key === queueKey);
    }

    return { userRoles, hasRole, canAccessQueue };
  }, [bootstrap]);
}
