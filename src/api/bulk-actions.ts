// ---------------------------------------------------------------------------
// Bulk action API
//
// The FastAPI backend does not expose a bulk-action endpoint, so this module
// fans out to the single-action endpoint for each docname sequentially,
// collecting results and per-item failures.
// ---------------------------------------------------------------------------

import { apiPost } from "./client";
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

export async function executeBulkAction(
  params: BulkActionParams,
): Promise<BulkActionResponse> {
  const results: ActionResponse[] = [];
  const failed: BulkActionFailure[] = [];

  for (const docname of params.docnames) {
    try {
      const result = await apiPost<ActionResponse>("/api/v1/operator-shell/actions", {
        action_key: params.action_key,
        doctype: params.doctype,
        docname,
        actor_role: params.actor_role,
      });
      results.push(result);
    } catch (err) {
      failed.push({
        docname,
        reason: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return { results, failed };
}
