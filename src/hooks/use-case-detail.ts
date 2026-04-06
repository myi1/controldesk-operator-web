// ---------------------------------------------------------------------------
// TanStack Query hooks — case detail & audit timeline
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import { fetchCaseDetail, fetchCaseAuditTimeline } from "../api/detail";
import type { CaseDetailResponse, AuditTimelineResponse } from "../types/api";

export function useCaseDetail(
  doctype: string | null,
  docname: string | null,
) {
  return useQuery<CaseDetailResponse>({
    queryKey: ["case-detail", doctype, docname],
    queryFn: () => fetchCaseDetail(doctype!, docname!),
    enabled: !!doctype && !!docname,
  });
}

export function useCaseAuditTimeline(
  doctype: string | null,
  docname: string | null,
) {
  return useQuery<AuditTimelineResponse>({
    queryKey: ["case-audit-timeline", doctype, docname],
    queryFn: () => fetchCaseAuditTimeline(doctype!, docname!),
    enabled: !!doctype && !!docname,
  });
}
