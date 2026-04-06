// ---------------------------------------------------------------------------
// API contract types — mirrors controldesk_core.api backend exactly
// ---------------------------------------------------------------------------

// ---- Bootstrap ----

export interface BootstrapResponse {
  queue_summaries: QueueSummary[];
  default_role_inbox_key: string | null;
  default_scope_key: string | null;
  role_inbox_summaries: RoleInboxSummary[];
  scope_summaries: ScopeSummary[];
  saved_view_summaries: SavedViewSummary[];
}

export interface QueueSummary {
  queue_key: string;
  label: string;
  count: number;
  overdue_count: number;
  blocked_count: number;
  escalated_count: number;
}

export interface RoleInboxSummary {
  key: string;
  label: string;
  count: number;
}

export interface ScopeSummary {
  key: string;
  label: string;
  count: number;
}

export interface SavedViewSummary {
  key: string;
  label: string;
  count: number;
}

// ---- Queue rows ----

export interface QueueRowsParams {
  queue_name?: string;
  scope_name?: string;
  current_owner?: string;
  status?: string;
  escalation_state?: string;
  only_overdue?: boolean;
  search_text?: string;
  limit?: number;
  as_of_date?: string;
}

export interface QueueRowsResponse {
  rows: QueueRow[];
  queue_context: QueueContext;
  summary: QueueSummary;
  scope_key?: string;
  view_kind?: string;
}

export interface QueueRow {
  doctype: string;
  docname: string;
  title: string;
  status: string;
  current_owner: string | null;
  target_date: string | null;
  is_overdue: boolean;
  overdue: boolean;
  escalation_state: string;
  blocker_summary: string | null;
  next_action: string | null;
  linked_references: LinkedReference[];
  property_context?: string;
  unit_context?: string;
  landlord_context?: string;
  created_at?: string;
  updated_at?: string;
  search_match?: boolean;
  queue_key?: string;
}

export interface QueueContext {
  queue_key: string;
  label: string;
  description?: string;
  status_options?: string[];
}

export interface LinkedReference {
  label: string;
  reference_type: string;
  reference_id: string;
  system?: string;
  path?: string;
}

// ---- Case detail ----

export interface CaseDetailResponse {
  detail: CaseDetail;
  field_snapshot: FieldSnapshot[];
  context_sections: ContextSection[];
  protected_actions: ProtectedAction[];
  blocker_banner?: BlockerBanner;
  limitations: string[];
}

export interface CaseDetail {
  doctype: string;
  docname: string;
  title: string;
  status: string;
  current_owner: string | null;
  escalation_state: string;
  target_date: string | null;
  is_overdue: boolean;
  queue_key: string;
}

export interface FieldSnapshot {
  key: string;
  label: string;
  value: string | number | boolean | null;
}

export interface ContextSection {
  section_key: string;
  label: string;
  fields: FieldSnapshot[];
}

export interface ProtectedAction {
  action_key: string;
  label: string;
  requires_human_release: boolean;
  permission_scope: string;
  available_roles: string[];
  ref_doctype?: string;
}

export interface BlockerBanner {
  reason: string;
  message: string;
}

// ---- Audit timeline ----

export interface AuditTimelineResponse {
  audit_timeline: AuditTimelineEntry[];
}

export interface AuditTimelineEntry {
  event: string;
  occurred_at: string;
  title: string;
  summary: string;
  evidence_references: EvidenceReference[];
}

export interface EvidenceReference {
  label: string;
  reference_type: string;
  reference_id: string;
  system: string;
  path?: string;
}

// ---- Action execution ----

export interface ActionParams {
  doctype: string;
  docname: string;
  action_key: string;
  actor_role: string;
  actor_id?: string;
  next_action?: string;
  target_date?: string;
  decision_note?: string;
  release_user_roles?: string[];
}

export interface ActionResponse {
  status: string;
  queue_key?: string;
  [key: string]: unknown;
}

// ---- Auth ----

export interface LoginUser {
  username: string;
  roles: string[];
  default_actor_role: string;
}
