// ---------------------------------------------------------------------------
// Case detail API
// ---------------------------------------------------------------------------

import { apiGet, ApiSchemaError } from "./client";
import { CaseDetailResponseSchema, AuditTimelineResponseSchema } from "./schemas";
import type { CaseDetailResponse, AuditTimelineResponse } from "../types/api";

export async function fetchCaseDetail(
  doctype: string,
  docname: string,
): Promise<CaseDetailResponse> {
  const raw = await apiGet<unknown>(
    `/api/v1/operator-shell/cases/${encodeURIComponent(doctype)}/${encodeURIComponent(docname)}`,
  );

  const result = CaseDetailResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiSchemaError("/api/v1/operator-shell/cases", result.error);
  }
  return result.data;
}

// Audit timeline endpoint is not yet available in this backend version.
// Returns an empty timeline so the UI degrades gracefully.
export async function fetchCaseAuditTimeline(
  _doctype: string,
  _docname: string,
): Promise<AuditTimelineResponse> {
  const stub: AuditTimelineResponse = { audit_timeline: [] };
  const result = AuditTimelineResponseSchema.safeParse(stub);
  return result.data!;
}
