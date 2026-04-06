// ---------------------------------------------------------------------------
// Case action execution API
// ---------------------------------------------------------------------------

import { frappeCall } from "./client";
import type { ActionParams, ActionResponse } from "../types/api";

export function executeAction(
  params: ActionParams,
): Promise<ActionResponse> {
  return frappeCall<ActionResponse>(
    "controldesk_core.api.run_operator_case_action",
    params,
  );
}
