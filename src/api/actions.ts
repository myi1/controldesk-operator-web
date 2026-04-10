// ---------------------------------------------------------------------------
// Case action execution API
// ---------------------------------------------------------------------------

import { apiPost } from "./client";
import type { ActionParams, ActionResponse } from "../types/api";

export function executeAction(params: ActionParams): Promise<ActionResponse> {
  const body: Record<string, unknown> = {
    action_key: params.action_key,
    doctype: params.doctype,
    docname: params.docname,
  };
  if (params.actor_role) body.actor_role = params.actor_role;
  if (params.actor_id) body.actor_id = params.actor_id;

  // Pack advisory fields into action_payload so backend can store them with the audit event.
  const advisory: Record<string, string> = {};
  if (params.next_action) advisory.next_action = params.next_action;
  if (params.target_date) advisory.target_date = params.target_date;
  if (params.decision_note) advisory.decision_note = params.decision_note;
  if (Object.keys(advisory).length > 0) body.action_payload = advisory;

  return apiPost<ActionResponse>("/api/v1/operator-shell/actions", body);
}
