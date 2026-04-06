// ---------------------------------------------------------------------------
// Case detail & audit timeline API
// ---------------------------------------------------------------------------

import { frappeCall } from "./client";
import type { CaseDetailResponse, AuditTimelineResponse } from "../types/api";

export function fetchCaseDetail(
  doctype: string,
  docname: string,
): Promise<CaseDetailResponse> {
  return frappeCall<CaseDetailResponse>(
    "controldesk_core.api.get_operator_case_detail",
    { doctype, docname },
  );
}

export function fetchCaseAuditTimeline(
  doctype: string,
  docname: string,
): Promise<AuditTimelineResponse> {
  return frappeCall<AuditTimelineResponse>(
    "controldesk_core.api.get_operator_case_audit_timeline",
    { doctype, docname },
  );
}
