// ---------------------------------------------------------------------------
// Bootstrap API
// ---------------------------------------------------------------------------

import { frappeCall } from "./client";
import type { BootstrapResponse } from "../types/api";

export function fetchBootstrap(
  userRoles?: string[],
): Promise<BootstrapResponse> {
  return frappeCall<BootstrapResponse>(
    "controldesk_core.api.get_operator_shell_bootstrap",
    userRoles ? { user_roles: userRoles } : {},
  );
}
