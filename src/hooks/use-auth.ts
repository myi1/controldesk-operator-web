// ---------------------------------------------------------------------------
// TanStack Query hooks — auth / user surfaces
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import { fetchUsersByRole, type UserListItem } from "../api/auth";

/**
 * Fetch active users, optionally filtered by role.
 * The query key includes the role so separate role filters get their own cache.
 */
export function useUsersByRole(role?: string) {
  return useQuery<UserListItem[], Error>({
    queryKey: ["users-by-role", role ?? ""],
    queryFn: () => fetchUsersByRole(role),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}
