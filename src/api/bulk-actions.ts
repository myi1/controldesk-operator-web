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

export interface BulkActionResponse {
  results: ActionResponse[];
  failed: string[];
}

export function executeBulkAction(
  params: BulkActionParams,
): Promise<BulkActionResponse> {
  return frappeCall<BulkActionResponse>(
    "controldesk_core.api.run_bulk_operator_action",
    params as unknown as Record<string, unknown>,
  );
}
