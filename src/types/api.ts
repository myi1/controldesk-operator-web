// ---------------------------------------------------------------------------
// API contract types — mirrors controldesk_core.api backend exactly
// ---------------------------------------------------------------------------

// ---- Bootstrap ----

export interface BootstrapFormOptions {
  maintenance?: {
    urgency?: string[];
    issue_type?: string[];
    liability_view?: string[];
    blocker_reason?: string[];
  };
  onboarding?: { blocker_reason?: string[] };
  moveout?: { blocker_reason?: string[] };
  receivables?: { blocker_reason?: string[]; payment_method?: string[] };
  vacancy?: { stall_reason?: string[] };
  service_recovery?: { trigger_type?: string[]; severity?: string[] };
}

export interface BootstrapResponse {
  queue_summaries: QueueSummary[];
  default_role_inbox_key: string | null;
  default_scope_key: string | null;
  role_inbox_summaries: RoleInboxSummary[];
  scope_summaries: ScopeSummary[];
  saved_view_summaries: SavedViewSummary[];
  form_options?: BootstrapFormOptions;
}

export interface QueueSummary {
  key: string;
  label: string;
  count: number;
  overdue_count?: number;
  blocked_count?: number;
  escalated_count?: number;
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

export interface QueueRowsSummary {
  count: number;
  overdue_count?: number;
}

export interface QueueRowsResponse {
  rows: QueueRow[];
  queue_context: QueueContext;
  summary: QueueRowsSummary;
  scope_key?: string | null;
  view_kind?: string;
  total_count?: number;
  has_more?: boolean;
  offset?: number;
  limit?: number;
}

export interface QueueRow {
  doctype: string;
  docname: string;
  title: string;
  status: string;
  current_owner: string | null;
  target_date: string | null;
  is_overdue: boolean;
  overdue?: boolean;
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
  key: string;
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

export interface AvailableAction {
  /** '{lifecycle}.{target_status}' — matches RUNNER_REGISTRY key */
  action_key: string;
  target_status: string;
  label: string;
  confirmation_required: boolean;
}

export interface CaseDetailResponse {
  detail: CaseDetail;
  field_snapshot: FieldSnapshot[];
  context_sections: ContextSection[];
  protected_actions: ProtectedAction[];
  available_actions?: AvailableAction[];
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

// ---- Property CRUD ----

export interface CreatePropertyPayload {
  property_label: string;
  property_reference_id?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    postcode?: string;
    country?: string;
  };
  stock_types: string[];
  landlord_account_ids: string[];
  notes?: string;
}

export interface CreatePropertyResponse {
  property_reference_id: string;
  property_label: string;
  status: string;
}

// ---- Unit CRUD ----

/** Payload shape for POST /api/v1/units and PUT /api/v1/units/{unit_id} */
export interface UnitWritePayload {
  unit_id: string;
  title: string;
  property_reference_id: string;
  property_label: string;
  landlord_account_id: string;
  occupancy_state: string;
  attention_state: string;
  readiness_posture: string;
  tenancy_posture: string;
  stock_type: string;
  target_date: string;
  current_owner: string;
  lifecycle_summary: string;
  resident_label: string;
  tenant_label: string;
  view_keys: string[];
  primary_leasing_record_id?: string;
  primary_leasing_view?: string;
  primary_finance_record_id?: string;
  primary_finance_section?: string;
}

export interface DeleteUnitResponse {
  unit_id: string;
  record_status: string;
  archived_at: string;
  archived_by: string;
}

// ---- Property Context ----

export interface PropertyContextSummaryCard {
  key: string;
  label: string;
  value: number;
}

export interface PropertyContextBootstrapResponse {
  status: string;
  workspace_label: string;
  page_route: string;
  summary_cards: PropertyContextSummaryCard[];
  nearby_rows: unknown[];
  related_references: unknown[];
  upcoming_deadlines: unknown[];
  selection: unknown | null;
  user_roles: string[];
  limitations: string[];
  preferred_reference_types: string[];
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

// Tenants bootstrap

export interface TenantRow {
  tenancy_id: string
  title: string
  unit_id: string
  property_reference_id: string
  property_label: string
  landlord_account_id: string
  occupancy_state: string
  contract_start_date: string | null
  contract_end_date: string | null
  status: string
  attention_state: string
  target_date: string | null
  is_overdue: boolean
  view_keys: string[]
}

export interface TenantsBootstrapResponse {
  rows: TenantRow[]
  summary_cards: SummaryCard[]
  view_summaries: ViewSummary[]
  default_view_key: string
  filter_options: {
    occupancy_states: string[]
    landlord_accounts: string[]
    properties: { label: string; property_reference_id: string }[]
  }
}

// Landlords bootstrap

export interface LandlordRow {
  landlord_account_id: string
  display_name: string
  service_tier: string | null
  status: string
  unit_count: number
  active_tenancy_count: number
  attention_state: string
  target_date: string | null
  view_keys: string[]
  kyc_complete: boolean
  bank_details_complete: boolean
  approval_matrix_complete: boolean
}

export interface LandlordsBootstrapResponse {
  rows: LandlordRow[]
  summary_cards: SummaryCard[]
  view_summaries: ViewSummary[]
  default_view_key: string
}

export interface LandlordDetailResponse {
  landlord_account_id: string
  display_name: string
  service_tier: string | null
  status: string
  unit_count: number
  active_tenancy_count: number
  unit_ids: string[]
  tenancy_ids: string[]
  // Approval matrix
  maintenance_threshold_per_job_aed: number | null
  emergency_authority_aed: number | null
  approval_contact_name: string | null
  approval_contact_channel: string | null
  response_window_hours: number | null
  // Bank details
  bank_beneficiary_name: string | null
  bank_name: string | null
  bank_iban: string | null
  bank_currency: string | null
  bank_authority_proof_ref: string | null
  bank_payment_confirmation_contact: string | null
  bank_details_verified_at: string | null
  bank_details_verified_by: string | null
  // KYC
  kyc_passport_ref: string | null
  kyc_visa_ref: string | null
  kyc_title_deed_ref: string | null
  kyc_company_docs_ref: string | null
  kyc_poa_ref: string | null
  kyc_completed_at: string | null
  kyc_verified_by: string | null
  // Fee agreement
  fee_basis_type: string | null
  fee_percentage: number | null
  fixed_fee_amount_aed: number | null
  vat_applicable: boolean | null
  billing_cycle: string | null
  internal_family_account: boolean | null
  fee_exception_note: string | null
  // Profile
  reporting_recipients: string | null
  preferred_channel: string | null
  language: string | null
  timezone: string | null
  banking_preference: string | null
  // Readiness indicators
  kyc_complete: boolean
  bank_details_complete: boolean
  approval_matrix_complete: boolean
}

export interface LandlordApprovalMatrixRequest {
  maintenance_threshold_per_job_aed?: number | null
  emergency_authority_aed?: number | null
  approval_contact_name?: string | null
  approval_contact_channel?: string | null
  response_window_hours?: number | null
}

export interface LandlordBankDetailsRequest {
  bank_beneficiary_name?: string | null
  bank_name?: string | null
  bank_iban?: string | null
  bank_currency?: string | null
  bank_authority_proof_ref?: string | null
  bank_payment_confirmation_contact?: string | null
  bank_details_verified_at?: string | null
  bank_details_verified_by?: string | null
}

export interface LandlordKycRequest {
  kyc_passport_ref?: string | null
  kyc_visa_ref?: string | null
  kyc_title_deed_ref?: string | null
  kyc_company_docs_ref?: string | null
  kyc_poa_ref?: string | null
  kyc_completed_at?: string | null
  kyc_verified_by?: string | null
}

export interface LandlordFeeAgreementRequest {
  fee_basis_type?: string | null
  fee_percentage?: number | null
  fixed_fee_amount_aed?: number | null
  vat_applicable?: boolean | null
  billing_cycle?: string | null
  internal_family_account?: boolean | null
  fee_exception_note?: string | null
}

export interface LandlordProfileRequest {
  reporting_recipients?: string | null
  preferred_channel?: string | null
  language?: string | null
  timezone?: string | null
  banking_preference?: string | null
}

// ── Phase 7: Occupied-Unit Takeover ──────────────────────────────────────────

export interface TakeoverGapCreateRequest {
  gap_category: string
  description: string
  severity: string
  owner: string
  due_date?: string | null
  closure_evidence?: string | null
}

export interface TakeoverGapUpdateRequest {
  status?: string | null
  closure_evidence?: string | null
  severity?: string | null
  due_date?: string | null
}

export interface TakeoverGapResponse {
  gap_id: string
  onboarding_case_id: string
  gap_category: string
  description: string
  severity: string
  owner: string
  due_date?: string | null
  status: string
  closure_evidence?: string | null
  created_at: string
  updated_at: string
}

export interface TakeoverGapListResponse {
  onboarding_case_id: string
  gaps: TakeoverGapResponse[]
}

export interface TakeoverOpeningBalanceRequest {
  outstanding_rent_aed: number
  deposit_holder: string
  deposit_amount_aed: number
  deposit_basis: string
  pending_utility_bills_aed: number
  pending_maintenance_issues?: string | null
  arrears_acknowledged: boolean
  arrears_acknowledged_by?: string | null
}

export interface TakeoverOpeningBalanceResponse {
  onboarding_case_id: string
  outstanding_rent_aed: number
  deposit_holder: string
  deposit_amount_aed: number
  deposit_basis: string
  pending_utility_bills_aed: number
  pending_maintenance_issues?: string | null
  arrears_acknowledged: boolean
  arrears_acknowledged_by?: string | null
  opening_balance_locked_at: string
  opening_balance_locked_by: string
}

export interface TakeoverPortalActivationRequest {
  tenant_email: string
  activation_confirmed: boolean
  training_sent_at?: string | null
}

export interface TakeoverPortalActivationResponse {
  onboarding_case_id: string
  tenant_email: string
  activation_confirmed: boolean
  portal_user_created_at: string
  portal_access_confirmed_at?: string | null
  training_sent_at?: string | null
}

export interface OnboardingTakeoverStateResponse {
  onboarding_case_id: string
  onboarding_status: string
  onboarding_route: string
  property_unit_id: string
  landlord_account_id: string
  current_owner_role: string
}

// ---- Manager Oversight Bootstrap ----

export interface ManagerOversightBootstrapResponse {
  status: string;
  escalation_case_count: number;
  pending_approval_count: number;
  sla_breach_count: number;
  blocked_case_count: number;
  overdue_instalments_count: number;
  inspection_due_count: number;
  renewal_deadline_count: number;
  ejari_pending_count: number;
  escalation_cases: Record<string, unknown>[];
  pending_approvals: Record<string, unknown>[];
  sla_breaches: Record<string, unknown>[];
  blocked_cases: Record<string, unknown>[];
}

// ---- Phase 8: SLA & Notification Engine ----

export interface SLABreachSummary {
  entity_id: string | null;
  case_type: string | null;
  case_id: string | null;
  clock_code: string | null;
  current_owner_role: string | null;
  breach_reason: string | null;
  breach_time: string | null;
  target_time: string | null;
  breach_hours: number | null;
  escalation_state: string | null;
}

export interface ProcessRemindersResponse {
  status: string;
  sla_clocks_breached: number;
  reminder_events_created: number;
  actions_taken: string[];
}

// ---- Phase 9: Lead Qualification + Commercial Intake Enrichment ----

export type CommercialIntakeDisposition =
  | "new"
  | "qualified"
  | "not_qualified"
  | "compliance_blocked"
  | "nurture";

export type CommercialIntakeAttentionState = "overdue" | "normal";

export interface CommercialIntakeCaseListItem {
  case_id: string;
  landlord_name: string;
  primary_contact_email: string;
  requested_service_tier: string;
  status: string;
  disposition: CommercialIntakeDisposition;
  qualification_score: number | null;
  compliance_path: string | null;
  next_step_date: string | null;
  attention_state: CommercialIntakeAttentionState;
  lead_source: string | null;
  landlord_type: string | null;
  community: string | null;
  urgency: string | null;
}

export interface CommercialIntakeCaseListResponse {
  status: string;
  cases: CommercialIntakeCaseListItem[];
  total_count: number;
}

export interface CommercialIntakeCaseAdvanceResponse {
  status: string;
  case_id: string;
  case_status: string;
  disposition: CommercialIntakeDisposition;
  audit_event: Record<string, unknown>;
}

// ---- Phase 10: Reporting ----

export interface AgedVacancyBucket {
  bucket: string;
  label: string;
  count: number;
}

export interface AgedVacancyCase {
  case_id: string;
  property_unit_id: string | null;
  status: string;
  days_in_status: number;
  age_bucket: string;
}

export interface AgedVacancyReport {
  status: string;
  buckets: AgedVacancyBucket[];
  cases: AgedVacancyCase[];
  total_count: number;
}

export interface FieldCompletenessField {
  field: string;
  label: string;
  missing_count: number;
  pct: number;
}

export interface FieldCompletenessEntityType {
  entity_type: string;
  label: string;
  total_count: number;
  fields: FieldCompletenessField[];
}

export interface FieldCompletenessReport {
  status: string;
  entities: FieldCompletenessEntityType[];
}

export interface RenewalActionDueItem {
  case_id: string;
  tenancy_record_id: string | null;
  property_unit_id: string | null;
  contract_end_date: string;
  days_to_expiry: number;
  current_owner_role: string;
  missing_article_notice: boolean;
  missing_dld_check: boolean;
  action_urgency: "critical" | "warning";
}

export interface RenewalActionsDueReport {
  status: string;
  items: RenewalActionDueItem[];
  total_count: number;
}
