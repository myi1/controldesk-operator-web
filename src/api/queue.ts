// ---------------------------------------------------------------------------
// Queue rows API
// ---------------------------------------------------------------------------

import { frappeCall, ApiSchemaError } from "./client";
import { QueueRowsResponseSchema } from "./schemas";
import type { QueueRowsParams, QueueRowsResponse } from "../types/api";

export async function fetchQueueRows(
  params: QueueRowsParams & { user_roles?: string[] },
): Promise<QueueRowsResponse> {
  // Frappe expects 1/0 for boolean flags
  const { only_overdue, ...rest } = params;
  const mapped: Record<string, unknown> = { ...rest };
  if (only_overdue !== undefined) {
    mapped.only_overdue = only_overdue ? 1 : 0;
  }

  const raw = await frappeCall<unknown>(
    "controldesk_core.api.list_operator_queue_rows",
    mapped,
  );

  const result = QueueRowsResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiSchemaError("list_operator_queue_rows", result.error);
  }
  return result.data;
}
