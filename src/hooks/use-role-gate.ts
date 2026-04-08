// ---------------------------------------------------------------------------
// Role gating hook
// ---------------------------------------------------------------------------

import { useCallback, useEffect, useMemo } from "react";
import { useBootstrap } from "./use-bootstrap";
import { useUIStore } from "../stores/ui-store";

export function useRoleGate() {
  const { data: bootstrap } = useBootstrap();
  const activeRoles = useUIStore((s) => s.activeRoles);
  const setActiveRoles = useUIStore((s) => s.setActiveRoles);
  const toggleRoleStore = useUIStore((s) => s.toggleRole);

  // Derive all assigned roles from bootstrap
  const userRoles = useMemo<string[]>(
    () =>
      bootstrap
        ? bootstrap.role_inbox_summaries.map((r) => r.label)
        : [],
    [bootstrap],
  );

  // Initialise activeRoles from userRoles on first load (empty store = not yet seeded)
  useEffect(() => {
    if (userRoles.length > 0 && activeRoles.length === 0) {
      setActiveRoles(userRoles);
    }
  }, [userRoles, activeRoles.length, setActiveRoles]);

  const hasRole = useCallback(
    (role: string) => activeRoles.includes(role),
    [activeRoles],
  );

  const canAccessQueue = useCallback(
    (queueKey: string): boolean => {
      if (!bootstrap) return false;
      return bootstrap.queue_summaries.some((q) => q.key === queueKey);
    },
    [bootstrap],
  );

  const toggleRole = useCallback(
    (role: string) => toggleRoleStore(role),
    [toggleRoleStore],
  );

  return { userRoles, activeRoles, hasRole, canAccessQueue, toggleRole };
}
