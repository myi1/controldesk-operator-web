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

// ---- Property surfaces ----

export interface SummaryCard {
  key: string;
  label: string;
  value: number;
}

export interface ViewSummary {
  key: string;
  label: string;
  description: string;
  count: number;
}

export interface LabelValue {
  label: string;
  value: string;
}

// Properties bootstrap

export interface PropertyUnitDetail {
  unit_id: string;
  title: string;
  occupancy_state: string;
  attention_state: string;
  target_date: string;
}

export interface PropertyLinkedCase {
  doctype: string;
  docname: string;
  label: string;
  queue_key: string;
  queue_label: string;
  status: string;
  current_owner: string;
  next_action: string;
  unit_id?: string;
}

export interface PropertyLinkedRow {
  docname: string;
  doctype: string;
  title: string;
  status: string;
  record_id: string;
  view_key: string;
  current_owner?: string;
  target_date?: string;
  queue_key?: string;
  queue_label?: string;
}

export interface PropertyModuleAction {
  action_kind: string;
  available: boolean;
  label: string;
  route?: string;
  view_key?: string;
  reference_id?: string;
  reference_type?: string;
  support?: string;
  docname?: string;
  doctype?: string;
  queue_key?: string;
  selected_property_id?: string;
}

export interface PropertyDetail {
  linked_units: PropertyUnitDetail[];
  linked_tenancies: PropertyLinkedRow[];
  linked_finance: PropertyLinkedRow[];
  queue_continuity: PropertyLinkedCase[];
  module_actions: PropertyModuleAction[];
  ownership_context: LabelValue[];
  stock_summary: LabelValue[];
  audit_and_governance: LabelValue[];
  creation_entry_points: Array<{ label: string; description: string }>;
  deny_paths: string[];
  edit_boundaries: string[];
  truth_boundaries: string[];
}

export interface PropertyRow {
  property_reference_id: string;
  property_label: string;
  title: string;
  record_id: string;
  attention_state: string;
  unit_count: number;
  linked_tenancy_count: number;
  linked_queue_row_count: number;
  finance_row_count: number;
  landlord_account_id: string;
  landlord_account_ids: string[];
  stock_types: string[];
  summary: string;
  target_date: string | null;
  is_overdue: boolean;
  is_due_soon: boolean;
  current_owner: string;
  view_keys: string[];
  detail: PropertyDetail;
}

export interface PropertiesBootstrapResponse {
  rows: PropertyRow[];
  filter_options: {
    attention_states: string[];
    landlord_accounts: string[];
    stock_types: string[];
    properties: Array<{ label: string; property_reference_id: string }>;
  };
  summary_cards: SummaryCard[];
  view_summaries: ViewSummary[];
  default_view_key: string;
  status: string;
  module_label: string;
  limitations: string[];
}

// Portfolio bootstrap

export interface PortfolioLinkedCase {
  doctype: string;
  docname: string;
  label: string;
  queue_key: string;
  queue_label: string;
  status: string;
  current_owner: string;
  next_action: string;
}

export interface PortfolioDetail {
  linked_workflow_cases: PortfolioLinkedCase[];
  module_actions: PropertyModuleAction[];
  ownership_context: LabelValue[];
  portfolio_rollup: LabelValue[];
  truth_boundaries: string[];
}

export interface PortfolioRow {
  property_reference_id: string;
  property_label: string;
  title: string;
  record_id: string;
  unit_count: number;
  occupied_unit_count: number;
  occupancy_posture: string;
  exception_posture: string;
  exception_count: number;
  linked_queue_row_count: number;
  landlord_account_ids: string[];
  landlord_account_label: string;
  stock_type: string;
  lifecycle_summary: string;
  unit_health_summary: string;
  current_owner: string;
  view_keys: string[];
  detail: PortfolioDetail;
}

export interface PortfolioBootstrapResponse {
  rows: PortfolioRow[];
  filter_options: {
    exception_postures: string[];
    landlord_accounts: string[];
    occupancy_postures: string[];
    stock_types: string[];
    properties: Array<{ label: string; property_reference_id: string }>;
  };
  summary_cards: SummaryCard[];
  view_summaries: ViewSummary[];
  default_view_key: string;
  status: string;
  module_label: string;
  limitations: string[];
}

// Units bootstrap

export interface UnitLinkedCase {
  doctype: string;
  docname: string;
  label: string;
  queue_key: string;
  queue_label: string;
  status: string;
  current_owner: string;
  next_action: string;
}

export interface UnitDetail {
  linked_workflow_cases: UnitLinkedCase[];
  leasing_rows?: PropertyLinkedRow[];
  finance_rows?: PropertyLinkedRow[];
  ownership_context: LabelValue[];
  stock_summary?: LabelValue[];
}

export interface UnitRow {
  unit_id: string;
  title: string;
  property_reference_id: string;
  property_label: string;
  landlord_account_id: string;
  occupancy_state: string;
  attention_state: string;
  stock_type: string;
  is_overdue: boolean;
  is_due_soon: boolean;
  target_date: string | null;
  current_owner: string;
  linked_queue_row_count: number;
  detail?: UnitDetail;
  [key: string]: unknown;
}

export interface UnitsBootstrapResponse {
  rows: UnitRow[];
  filter_options: {
    attention_states: string[];
    landlord_accounts: string[];
    occupancy_states: string[];
    properties: Array<{ label: string; property_reference_id: string }>;
    stock_types: string[];
  };
  summary_cards: SummaryCard[];
  view_summaries: ViewSummary[];
  default_view_key: string;
  status: string;
  module_label: string;
  limitations?: string[];
}
