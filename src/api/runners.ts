// ---------------------------------------------------------------------------
// Runner engine API layer — lifecycle advance endpoints
// ---------------------------------------------------------------------------

import { apiPost } from "./client";
import type { ActionResponse } from "../types/api";

/**
 * Replaces the `{id}` placeholder in an endpoint template with the actual
 * record identifier and POSTs the payload to that lifecycle advance endpoint.
 *
 * @param endpointTemplate  e.g. '/api/v1/operator-shell/maintenance-tickets/{id}/advance'
 * @param recordId          The docname of the case record (e.g. 'MAINT-0042')
 * @param payload           The assembled transition payload
 */
export function advanceLifecycle(
  endpointTemplate: string,
  recordId: string,
  payload: Record<string, unknown>,
): Promise<ActionResponse> {
  const path = endpointTemplate.replace("{id}", encodeURIComponent(recordId));
  return apiPost<ActionResponse>(path, payload);
}

/**
 * Executes a confirm-only action — no form fields, just a fixed payload POST.
 *
 * @param endpointTemplate  e.g. '/api/v1/operator-shell/onboarding-cases/{id}/advance'
 * @param recordId          The docname of the case record
 * @param fixedPayload      Optional static fields (e.g. target_status, next_action)
 */
export function executeConfirmAction(
  endpointTemplate: string,
  recordId: string,
  fixedPayload: Record<string, unknown> = {},
): Promise<ActionResponse> {
  const path = endpointTemplate.replace("{id}", encodeURIComponent(recordId));
  return apiPost<ActionResponse>(path, fixedPayload);
}
