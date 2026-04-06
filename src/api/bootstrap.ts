// ---------------------------------------------------------------------------
// Bootstrap API
// ---------------------------------------------------------------------------

import { frappeCall, ApiSchemaError } from "./client";
import { BootstrapResponseSchema } from "./schemas";
import type { BootstrapResponse } from "../types/api";

export async function fetchBootstrap(
  userRoles?: string[],
): Promise<BootstrapResponse> {
  const raw = await frappeCall<unknown>(
    "controldesk_core.api.get_operator_shell_bootstrap",
    userRoles ? { user_roles: userRoles } : {},
  );

  const result = BootstrapResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiSchemaError("get_operator_shell_bootstrap", result.error);
  }
  return result.data;
}
