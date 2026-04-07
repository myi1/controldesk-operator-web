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

export async function fetchCaseAuditTimeline(
  doctype: string,
  docname: string,
): Promise<AuditTimelineResponse> {
  const raw = await apiGet<unknown>(
    `/api/v1/operator-shell/cases/${encodeURIComponent(doctype)}/${encodeURIComponent(docname)}/audit-timeline`,
  );

  const result = AuditTimelineResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiSchemaError("/api/v1/operator-shell/cases/.../audit-timeline", result.error);
  }
  return result.data;
}
