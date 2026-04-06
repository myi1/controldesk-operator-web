// ---------------------------------------------------------------------------
// Case detail & audit timeline API
// ---------------------------------------------------------------------------

import { frappeCall, ApiSchemaError } from "./client";
import { CaseDetailResponseSchema, AuditTimelineResponseSchema } from "./schemas";
import type { CaseDetailResponse, AuditTimelineResponse } from "../types/api";

export async function fetchCaseDetail(
  doctype: string,
  docname: string,
): Promise<CaseDetailResponse> {
  const raw = await frappeCall<unknown>(
    "controldesk_core.api.get_operator_case_detail",
    { doctype, docname },
  );

  const result = CaseDetailResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiSchemaError("get_operator_case_detail", result.error);
  }
  return result.data;
}

export async function fetchCaseAuditTimeline(
  doctype: string,
  docname: string,
): Promise<AuditTimelineResponse> {
  const raw = await frappeCall<unknown>(
    "controldesk_core.api.get_operator_case_audit_timeline",
    { doctype, docname },
  );

  const result = AuditTimelineResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiSchemaError("get_operator_case_audit_timeline", result.error);
  }
  return result.data;
}
