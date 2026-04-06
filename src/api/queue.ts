// ---------------------------------------------------------------------------
// Queue rows API
// ---------------------------------------------------------------------------

import { frappeCall } from "./client";
import type { QueueRowsParams, QueueRowsResponse } from "../types/api";

export function fetchQueueRows(
  params: QueueRowsParams & { user_roles?: string[] },
): Promise<QueueRowsResponse> {
  // Frappe expects 1/0 for boolean flags
  const { only_overdue, ...rest } = params;
  const mapped: Record<string, unknown> = { ...rest };
  if (only_overdue !== undefined) {
    mapped.only_overdue = only_overdue ? 1 : 0;
  }

  return frappeCall<QueueRowsResponse>(
    "controldesk_core.api.list_operator_queue_rows",
    mapped,
  );
}
