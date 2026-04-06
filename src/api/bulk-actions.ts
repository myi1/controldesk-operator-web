// ---------------------------------------------------------------------------
// Bulk action API calls
// ---------------------------------------------------------------------------

import { frappeCall } from "./client";
import type { ActionResponse } from "../types/api";

export interface BulkActionParams {
  action_key: string;
  docnames: string[];
  doctype?: string;
  actor_role: string;
  decision_note?: string;
  target_date?: string;
}

/** Per-item failure with a human-readable reason. */
export interface BulkActionFailure {
  docname: string;
  reason: string;
}

export interface BulkActionResponse {
  results: ActionResponse[];
  /** Items that could not be processed, with per-item error reasons. */
  failed: BulkActionFailure[];
}

export function executeBulkAction(
  params: BulkActionParams,
): Promise<BulkActionResponse> {
  return frappeCall<BulkActionResponse>(
    "controldesk_core.api.run_bulk_operator_action",
    params as unknown as Record<string, unknown>,
  );
}
