// ---------------------------------------------------------------------------
// auth API — user management endpoints
// ---------------------------------------------------------------------------

import { apiGet } from "./client";

export interface UserListItem {
  username: string;
  roles: string[];
  default_actor_role: string;
}

/**
 * Fetch all active users, optionally filtered by role.
 * Maps to: GET /api/v1/auth/users?role={role}
 */
export async function fetchUsersByRole(role?: string): Promise<UserListItem[]> {
  return apiGet<UserListItem[]>("/api/v1/auth/users", role ? { role } : {});
}
