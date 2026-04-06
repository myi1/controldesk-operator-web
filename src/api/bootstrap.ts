// ---------------------------------------------------------------------------
// Bootstrap API
// ---------------------------------------------------------------------------

import { apiGet, ApiSchemaError } from "./client";
import { BootstrapResponseSchema } from "./schemas";
import type { BootstrapResponse } from "../types/api";

export async function fetchBootstrap(): Promise<BootstrapResponse> {
  const raw = await apiGet<unknown>("/api/v1/operator-shell/bootstrap");

  const result = BootstrapResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiSchemaError("/api/v1/operator-shell/bootstrap", result.error);
  }
  return result.data;
}
