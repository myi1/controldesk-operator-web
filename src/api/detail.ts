// ---------------------------------------------------------------------------
// Case detail API
// ---------------------------------------------------------------------------

import { apiGet, ApiSchemaError } from "./client";
import { RawCaseDetailResponseSchema, AuditTimelineResponseSchema } from "./schemas";
import type { CaseDetailResponse, AuditTimelineResponse } from "../types/api";

export async function fetchCaseDetail(
  doctype: string,
  docname: string,
): Promise<CaseDetailResponse> {
  const raw = await apiGet<unknown>(
    `/api/v1/operator-shell/cases/${encodeURIComponent(doctype)}/${encodeURIComponent(docname)}`,
  );

  const result = RawCaseDetailResponseSchema.safeParse(raw);
  if (!result.success) {
    throw new ApiSchemaError("/api/v1/operator-shell/cases", result.error);
  }

  // Normalise backend shape → frontend CaseDetailResponse contract
  const { detail } = result.data;
  const { record } = detail;

  const normalisedFieldSnapshot = (detail.field_snapshot ?? []).map((f) => ({
    key: f.fieldname,
    label: f.label,
    value: f.value,
  }));

  const normalisedContextSections = (detail.context_sections ?? []).map((s) => ({
    section_key: s.key,
    label: s.title,
    fields: s.items.map((f) => ({ key: f.fieldname, label: f.label, value: f.value })),
  }));

  const normalisedAvailableActions = (detail.available_actions ?? []).map((a) => ({
    action_key: a.action_key,
    label: a.label,
    confirmation_required: a.confirmation_required,
    target_status: a.target_status ?? a.action_key,
  }));

  const banner = detail.blocker_banner;
  const normalisedBlockerBanner = banner
    ? { reason: banner.title ?? "Blocked", message: banner.message }
    : undefined;

  return {
    detail: {
      doctype: record.doctype,
      docname: record.docname,
      title: record.title,
      status: record.status,
      current_owner: record.current_owner,
      escalation_state: record.escalation_state,
      target_date: record.target_date,
      is_overdue: record.is_overdue,
      queue_key: record.queue_key,
    },
    field_snapshot: normalisedFieldSnapshot,
    context_sections: normalisedContextSections,
    protected_actions: [],
    available_actions: normalisedAvailableActions,
    blocker_banner: normalisedBlockerBanner,
    limitations: detail.limitations ?? [],
  };
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
