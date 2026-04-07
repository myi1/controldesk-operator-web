// ---------------------------------------------------------------------------
// Case action execution API
// ---------------------------------------------------------------------------

import { apiPost } from "./client";
import type { ActionParams, ActionResponse } from "../types/api";

export function executeAction(params: ActionParams): Promise<ActionResponse> {
  // The backend uses extra="forbid" so only send fields it accepts.
  const body: Record<string, unknown> = {
    action_key: params.action_key,
    doctype: params.doctype,
    docname: params.docname,
  };
  if (params.actor_role) body.actor_role = params.actor_role;
  if (params.actor_id) body.actor_id = params.actor_id;

  return apiPost<ActionResponse>("/api/v1/operator-shell/actions", body);
}
