// ---------------------------------------------------------------------------
// Queue rows API
// ---------------------------------------------------------------------------

import { apiGet, ApiSchemaError } from "./client";
import { QueueRowsResponseSchema } from "./schemas";
import type { QueueRowsParams, QueueRowsResponse } from "../types/api";

export async function fetchQueueRows(
  params: QueueRowsParams,
): Promise<QueueRowsResponse> {
  const raw = await apiGet<unknown>(
    "/api/v1/operator-shell/rows",
    params as Record<string, string | number | boolean | null | undefined>,
  );

  const result = QueueRowsResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiSchemaError("/api/v1/operator-shell/rows", result.error);
  }
  return result.data;
}
