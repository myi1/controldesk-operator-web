# ControlDesk Guided Runner — Technical Governance Specification

**Status:** Authoritative build constraint
**Applies to:** All TransitionRunner configs, FieldRenderer implementations, confirm actions, and case-opening runners
**Prerequisite reads:** `CODING_PASS_SPEC.md`, `DESIGN_SYSTEM.md`, `INTERACTION_PATTERNS.md`
**Backend reference:** `openapi.json` at `http://localhost:8001/openapi.json`

---

## 0. Purpose and Scope

This document governs every guided runner built for ControlDesk. Its purpose is to prevent the following failure modes which are explicitly prohibited:

- Placeholder field content ("e.g. enter notes here" used as actual submitted data logic)
- Hardcoded decision options that do not reflect backend enum constraints
- Generic step labels disconnected from actual lifecycle terminology
- Fields present in the UI that are never submitted to the API
- Required API fields absent from the UI
- "Complete" buttons that do not call the backend
- Toast-only feedback without proper error state handling
- Steps that collect data but do not map it to the correct API payload key
- `next_action` and `target_date` fields filled with placeholder strings
- Role checking omitted or stubbed with `userRoles[0] ?? ""`
- Runners that work with a seeded backend but silently fail against an empty one

Every runner must function correctly in a production environment against a live backend with real tenant data.

---

## 1. Architecture

### 1.1 Component Hierarchy

```
GuidedRunnerPage (route: /case/:caseType/:caseId/run)
└── TransitionRunner
    └── WizardShell (modal) OR GuidedRunner (full-page)
        └── FieldRenderer (per field def)
            ├── TextField
            ├── DateField
            ├── SelectField
            ├── TextareaField
            ├── CheckboxField
            ├── ChecklistField
            └── NumberField
```

**Rule:** `WizardShell` (modal) is used for runners with ≤3 steps and no branching. `GuidedRunner` (full-page) is used for runners with 4+ steps or contextual branching (e.g. `complete-file-check`, `configure-tenancy-record`, `open-receivables-case`).

### 1.2 Runner Config Shape

```typescript
// src/config/runners/types.ts

export type FieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'select'
  | 'checkbox'
  | 'checklist'
  | 'reference-text'; // reference ID input with hint about external system

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;                    // must match the exact API payload key
  label: string;                  // production-quality label, not a variable name
  type: FieldType;
  required: boolean;
  placeholder?: string;           // must be a realistic example, not "enter value"
  hint?: string;                  // explains system of record or format constraints
  options?: SelectOption[];       // for select fields: must reflect backend enum values exactly
  minLength?: number;             // for textarea: enforced minimum
  min?: number;                   // for number fields
  max?: number;
  defaultValue?: string | boolean | number;
}

export interface RunnerStep {
  label: string;                  // matches the lifecycle state label in ControlDesk terminology
  description: string;            // explains what this step accomplishes operationally
  fields: FieldDef[];
}

export type RunnerMode = 'modal' | 'full-page';

export interface RunnerConfig {
  id: string;                     // format: '{lifecycle}.{action}' e.g. 'onboarding.start_document_collection'
  title: string;                  // displayed in WizardShell header or GuidedRunnerPage header
  description: string;            // one sentence: what does completing this runner do to the case
  lifecycle: string;              // e.g. 'onboarding-cases', 'vacancy-cases', 'maintenance-tickets'
  endpoint: string;               // full path template e.g. '/api/v1/operator-shell/onboarding-cases/{id}/start-document-collection'
  method: 'POST';
  mode: RunnerMode;
  fixedPayload?: Record<string, unknown>; // fields sent on every call e.g. { target_status: 'pricing_pending' }
  steps: RunnerStep[];
  invalidates: string[];          // TanStack Query keys to invalidate on success: must list every key that shows this case's data
  successMessage: string;         // shown in toast on success — specific to the action, not generic "Done"
  allowedRoles: string[];         // copied from backend TransitionRule.required_roles — enforced pre-submission
}

export interface ConfirmActionConfig {
  id: string;
  title: string;
  description: string;            // explains what will happen when confirmed
  lifecycle: string;
  endpoint: string;
  method: 'POST';
  invalidates: string[];
  successMessage: string;
  allowedRoles: string[];
  // No body — backend accepts POST with empty body or no Content-Type
}
```

### 1.3 Payload Assembly Rules

The `TransitionRunner` assembles the final API payload by merging:

1. `fixedPayload` (always included)
2. All field values collected across all steps, keyed by `FieldDef.key`
3. `next_action`: assembled from config `id` — format `'{lifecycle}.{action}'`
4. `target_date`: from the field named `target_date` if present; otherwise the config must specify a fallback calculation (e.g. T+3 days from now)
5. `owner_role`: from `useRoleGate()` — the user's active role, not `userRoles[0]`

**Prohibited:** Submitting `next_action: "completed"`, `next_action: ""`, or `target_date: ""` to the API. Both fields are required on every advance endpoint and must carry meaningful values.

### 1.4 Role Enforcement

Every runner must check `allowedRoles` before rendering the trigger button. If the user's active role is not in `allowedRoles`, the trigger renders as disabled with a tooltip: `"Your current role ({role}) cannot perform this action"`.

This check happens at the trigger point (case detail panel), not inside the runner itself. The runner still validates role on submit as a safety net.

---

## 2. Field Standards

### 2.1 TextField

- Maps to API fields of type `string`
- `placeholder` must be a realistic example value (e.g. `"MA-2024-00123"`, `"Mandate ref from Clozr"`)
- Never use generic placeholders: `"Enter value"`, `"Type here"`, `"e.g. text"`
- If the field is a reference ID from an external system, include `hint` naming the system: `"Reference ID from Clozr commercial intake record"`

### 2.2 DateField

- Maps to API fields typed as ISO 8601 date string (`YYYY-MM-DD`)
- Renders as `<input type="date">` with a calendar picker
- Never submit a raw display string — always convert to `YYYY-MM-DD` before submission
- Required date fields must not allow submission with an empty value
- `hint` must state any constraints: `"Must be on or after today"`, `"Must be within the notice period"`

### 2.3 SelectField

- `options` must exactly mirror the enum values the backend accepts
- Option labels must be human-readable ControlDesk terminology, not raw snake_case values
- Never hardcode options that are not backed by the API schema or backend domain constants
- If the backend has no documented enum (e.g. a free text field accepting known values), document the source of options in a comment

**Canonical option sets used across runners:**

```typescript
// storage_system (artifact documents)
export const STORAGE_SYSTEM_OPTIONS: SelectOption[] = [
  { value: 'controldesk', label: 'ControlDesk Document Store' },
  { value: 'clozr', label: 'Clozr' },
  { value: 'zoho_books', label: 'Zoho Books' },
  { value: 'signing_service', label: 'Signing Service' },
];

// utility_closure_status / ejari_closure_status
export const CLOSURE_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'tracked', label: 'In Progress / Tracked' },
  { value: 'complete', label: 'Complete' },
];

// make_good_status
export const MAKE_GOOD_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending Assessment' },
  { value: 'complete', label: 'Complete' },
  { value: 'handed_over', label: 'Handed Over to Contractor' },
];

// key_return_status
export const KEY_RETURN_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Not Yet Returned' },
  { value: 'logged', label: 'Keys Logged / Received' },
];

// pre_listing_works_status
export const PRE_LISTING_WORKS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'waived', label: 'Waived — Not Required' },
];

// target_tenant_profile_status
export const TENANT_PROFILE_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Not Yet Defined' },
  { value: 'defined', label: 'Profile Defined' },
];

// listing_pack_status / contract_pack_status
export const PACK_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Not Ready' },
  { value: 'ready', label: 'Ready' },
];

// offer_summary_status
export const OFFER_SUMMARY_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Awaiting Upload' },
  { value: 'uploaded', label: 'Uploaded' },
];

// lease_readiness_gate_status / contract_to_move_in_gate_status
export const GATE_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'blocked', label: 'Blocked' },
];

// access_status
export const ACCESS_STATUS_OPTIONS: SelectOption[] = [
  { value: 'blocked', label: 'Access Blocked' },
  { value: 'ready', label: 'Access Ready' },
];

// pricing_status
export const PRICING_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'reset_requested', label: 'Reset Requested' },
];

// market_review_status
export const MARKET_REVIEW_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'complete', label: 'Complete' },
];

// landlord_recommendation_status
export const RECOMMENDATION_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'issued', label: 'Issued to Landlord' },
  { value: 'rejected', label: 'Rejected by Landlord' },
];

// decision_route (renewal)
export const RENEWAL_DECISION_OPTIONS: SelectOption[] = [
  { value: 'renew', label: 'Renew — Same Terms' },
  { value: 'amend', label: 'Amend — Modified Terms' },
  { value: 'nonrenew', label: 'Non-Renewal — Tenant Exiting' },
];

// notice_pack_status
export const NOTICE_PACK_OPTIONS: SelectOption[] = [
  { value: 'not_required', label: 'Not Required' },
  { value: 'pending', label: 'Pending Preparation' },
  { value: 'ready', label: 'Ready' },
  { value: 'issued', label: 'Issued to Tenant' },
  { value: 'signed', label: 'Signed' },
];

// tenant_score (renewal)
export const TENANT_SCORE_OPTIONS: SelectOption[] = [
  { value: 'unscored', label: 'Not Yet Scored' },
  { value: 'strong', label: 'Strong — Highly Recommended' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'weak', label: 'Weak — Concerns Noted' },
];

// formal_notice_approval_status (receivables)
export const FORMAL_NOTICE_APPROVAL_OPTIONS: SelectOption[] = [
  { value: 'not_required', label: 'Not Required' },
  { value: 'pending', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
];

// payment_match_status (receivables)
export const PAYMENT_MATCH_OPTIONS: SelectOption[] = [
  { value: 'clear', label: 'Matched and Clear' },
  { value: 'pending_review', label: 'Pending Manual Review' },
  { value: 'unmatched_receipt', label: 'Unmatched Receipt' },
];

// receipt_status (receivables / tenancy)
export const RECEIPT_STATUS_OPTIONS: SelectOption[] = [
  { value: 'upcoming', label: 'Upcoming — Not Yet Due' },
  { value: 'due_unpaid', label: 'Due and Unpaid' },
  { value: 'receipt_pending_match', label: 'Receipt Received — Pending Match' },
  { value: 'receipt_matched', label: 'Matched' },
  { value: 'bounced_or_reversed', label: 'Bounced / Reversed' },
  { value: 'cured', label: 'Cured' },
];

// maintenance urgency — exact values from MAINTENANCE_URGENCY_LEVELS frozenset
export const URGENCY_OPTIONS: SelectOption[] = [
  { value: 'Routine', label: 'Routine — Non-urgent, schedule in next cycle' },
  { value: 'Urgent', label: 'Urgent — Action required within 48 hours' },
  { value: 'Emergency', label: 'Emergency — Immediate dispatch required' },
];

// maintenance issue_type — exact values from MAINTENANCE_ISSUE_TYPES frozenset
export const MAINTENANCE_ISSUE_TYPE_OPTIONS: SelectOption[] = [
  { value: 'Access', label: 'Access' },
  { value: 'Appliance', label: 'Appliance' },
  { value: 'Cleaning', label: 'Cleaning' },
  { value: 'Electrical', label: 'Electrical' },
  { value: 'General Repair', label: 'General Repair' },
  { value: 'HVAC', label: 'HVAC' },
  { value: 'Other', label: 'Other' },
  { value: 'Pest Control', label: 'Pest Control' },
  { value: 'Plumbing', label: 'Plumbing' },
  { value: 'Safety', label: 'Safety' },
];

// maintenance liability_view — exact values from MAINTENANCE_LIABILITY_VIEWS frozenset
export const LIABILITY_OPTIONS: SelectOption[] = [
  { value: 'Landlord', label: 'Landlord Liability' },
  { value: 'Shared', label: 'Shared Liability' },
  { value: 'Tenant', label: 'Tenant Liability' },
  { value: 'Under Review', label: 'Under Review — Liability TBD' },
];

// maintenance blocker_reason — exact values from MAINTENANCE_BLOCKER_REASONS frozenset
export const MAINTENANCE_BLOCKER_OPTIONS: SelectOption[] = [
  { value: 'Access unavailable', label: 'Access Unavailable' },
  { value: 'External system issue', label: 'External System Issue' },
  { value: 'Waiting completion evidence', label: 'Waiting Completion Evidence' },
  { value: 'Waiting emergency retrospective review', label: 'Waiting Emergency Retrospective Review' },
  { value: 'Waiting landlord approval', label: 'Waiting Landlord Approval' },
  { value: 'Waiting threshold decision', label: 'Waiting Threshold Decision' },
  { value: 'Waiting vendor quote', label: 'Waiting Vendor Quote' },
];

// service recovery severity
export const SEVERITY_OPTIONS: SelectOption[] = [
  { value: 'low', label: 'Low — Minor Inconvenience' },
  { value: 'medium', label: 'Medium — Operational Impact' },
  { value: 'high', label: 'High — Significant Complaint' },
  { value: 'critical', label: 'Critical — Relationship at Risk' },
];

// report review_status
export const REPORT_REVIEW_STATUS_OPTIONS: SelectOption[] = [
  { value: 'not_requested', label: 'Not Requested' },
  { value: 'requested', label: 'Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'corrections_required', label: 'Corrections Required' },
];

// report receipt_match_status / expense_match_status
export const REPORT_MATCH_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'clear', label: 'Clear' },
  { value: 'exception', label: 'Exception — Requires Review' },
];

// report pm_fee_posting_status
export const PM_FEE_POSTING_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'posted', label: 'Posted' },
  { value: 'not_applicable', label: 'Not Applicable' },
];

// report maintenance_evidence_status
export const MAINTENANCE_EVIDENCE_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'complete', label: 'Complete' },
];

// moveout_handoff_status
export const MOVEOUT_HANDOFF_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'sent', label: 'Sent to Tenant' },
  { value: 'acknowledged', label: 'Acknowledged by Tenant' },
];

// renewal handoff_status
export const RENEWAL_HANDOFF_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'prepared', label: 'Prepared' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
];

// leasing_handoff_status
export const LEASING_HANDOFF_STATUS_OPTIONS: SelectOption[] = [
  { value: 'pending', label: 'Pending Acceptance' },
  { value: 'prepared', label: 'Prepared — Awaiting Send' },
  { value: 'sent', label: 'Sent to Leasing' },
  { value: 'accepted', label: 'Accepted by Leasing' },
];

// payment_method (receivables) — exact values from RENT_EVENT_PAYMENT_METHODS frozenset
export const PAYMENT_METHOD_OPTIONS: SelectOption[] = [
  { value: 'Bank Transfer', label: 'Bank Transfer' },
  { value: 'Card', label: 'Card Payment' },
  { value: 'Cash', label: 'Cash' },
  { value: 'Cheque', label: 'Cheque' },
  { value: 'Direct Debit', label: 'Direct Debit' },
  { value: 'Other', label: 'Other' },
];

// onboarding blocker_reason — exact values from ONBOARDING_BLOCKER_REASONS frozenset
export const ONBOARDING_BLOCKER_OPTIONS: SelectOption[] = [
  { value: 'Access unavailable', label: 'Access Unavailable' },
  { value: 'External system issue', label: 'External System Issue' },
  { value: 'Missing authority docs', label: 'Missing Authority Docs' },
  { value: 'Missing bank details', label: 'Missing Bank Details' },
  { value: 'Missing ownership docs', label: 'Missing Ownership Docs' },
  { value: 'Missing tenant documents', label: 'Missing Tenant Documents' },
  { value: 'Waiting finance match', label: 'Waiting Finance Match' },
  { value: 'Waiting landlord approval', label: 'Waiting Landlord Approval' },
  { value: 'Waiting legal route confirmation', label: 'Waiting Legal Route Confirmation' },
  { value: 'Waiting tenant response', label: 'Waiting Tenant Response' },
  { value: 'Waiting vendor quote', label: 'Waiting Vendor Quote' },
];

// moveout blocker_reason — exact values from MOVEOUT_BLOCKER_REASONS frozenset
export const MOVEOUT_BLOCKER_OPTIONS: SelectOption[] = [
  { value: 'Access unavailable', label: 'Access Unavailable' },
  { value: 'External system issue', label: 'External System Issue' },
  { value: 'Missing authority docs', label: 'Missing Authority Docs' },
  { value: 'Missing bank details', label: 'Missing Bank Details' },
  { value: 'Missing ownership docs', label: 'Missing Ownership Docs' },
  { value: 'Missing tenant documents', label: 'Missing Tenant Documents' },
  { value: 'Waiting finance match', label: 'Waiting Finance Match' },
  { value: 'Waiting landlord approval', label: 'Waiting Landlord Approval' },
  { value: 'Waiting legal route confirmation', label: 'Waiting Legal Route Confirmation' },
  { value: 'Waiting tenant response', label: 'Waiting Tenant Response' },
  { value: 'Waiting vendor quote', label: 'Waiting Vendor Quote' },
];

// receivables blocker_reason — exact values from RECEIVABLES_BLOCKER_REASONS frozenset
export const RECEIVABLES_BLOCKER_OPTIONS: SelectOption[] = [
  { value: 'External system issue', label: 'External System Issue' },
  { value: 'Formal notice approval pending', label: 'Formal Notice Approval Pending' },
  { value: 'Payment evidence unclear', label: 'Payment Evidence Unclear' },
  { value: 'Waiting finance match', label: 'Waiting Finance Match' },
  { value: 'Waiting landlord escalation note', label: 'Waiting Landlord Escalation Note' },
  { value: 'Waiting legal review route', label: 'Waiting Legal Review Route' },
];

// vacancy stall_reason — exact values from VACANCY_STALL_REASONS frozenset
export const VACANCY_STALL_OPTIONS: SelectOption[] = [
  { value: 'Access unavailable', label: 'Access Unavailable' },
  { value: 'Handoff not accepted', label: 'Handoff Not Accepted' },
  { value: 'No update for 3 days', label: 'No Update for 3 Days' },
  { value: 'Pricing mismatch', label: 'Pricing Mismatch' },
  { value: 'Weak follow-up', label: 'Weak Follow-up' },
];

// service_recovery trigger_type — exact values from SERVICE_RECOVERY_TRIGGER_TYPES frozenset
export const SERVICE_RECOVERY_TRIGGER_OPTIONS: SelectOption[] = [
  { value: 'formal_complaint', label: 'Formal Complaint' },
  { value: 'landlord_at_risk', label: 'Landlord At Risk' },
  { value: 'late_report_repeat', label: 'Late Report (Repeat)' },
  { value: 'maintenance_repeat', label: 'Maintenance (Repeat)' },
  { value: 'nps_failure', label: 'NPS Failure' },
  { value: 'repeated_issue', label: 'Repeated Issue' },
  { value: 'sla_repeat', label: 'SLA Breach (Repeat)' },
];
```

### 2.4 TextareaField

- `minLength` must be set for notes fields that constitute audit evidence: minimum 10 characters
- `placeholder` must be a realistic operational example, not `"Add notes..."` or `"Type your notes here"`
- All textarea values submitted to `notes`, `resolution_summary`, `root_cause_summary`, `recovery_plan_summary`, `report_summary`, `recommendation_draft_summary`, `decision_note` fields must be trimmed before submission
- Empty strings must not be submitted for optional textarea fields — use `undefined` if blank

### 2.5 NumberField

- Maps to API fields of type `number`
- `min` and `max` must be set where the business domain constrains the range
- `approval_threshold_snapshot` (maintenance): min `0`, always required
- `asking_rent` (vacancy): min `1`, currency display with AED label
- `amount_due` (receivables): min `0.01`, currency display
- Never submit `NaN` — validate before submission

### 2.6 ChecklistField

- Used for `required_artifact_codes` in document collection
- Renders as a list of checkboxes where each item is an artifact code
- The checked items become the submitted array
- At least one item must be checked (validated before advancing)
- Artifact code options must come from the case detail's existing document pack or bootstrap data — not hardcoded

### 2.7 CheckboxField

- Single boolean confirmation
- Must have a label that states exactly what is being confirmed in operational language
- Never use: `"I confirm this is correct"` — always specific: `"I confirm Ejari cancellation has been submitted to DLD"`

---

## 3. Runner Catalogue

The following table is authoritative. Every runner listed must be built exactly as specified. Nothing may be omitted. `target_status` and `target_date` handling are specified per runner.

### 3.1 ONBOARDING LIFECYCLE

**Endpoint base:** `/api/v1/operator-shell/onboarding-cases/{id}`

---

#### `onboarding.start_document_collection`
**Endpoint:** `{base}/start-document-collection`
**Mode:** Modal (WizardShell)
**Steps:** 1
**Allowed roles:** `Documentation`, `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fixed payload:** none
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `required_artifact_codes` | checklist | yes | Options loaded from case detail or bootstrap — see §4.1 |
| `missing_artifact_codes` | checklist | no | Subset of required codes known to be missing at time of collection |

**Success message:** `"Document collection started. {N} artifact codes registered."`
**Invalidates:** `['operator-shell-bootstrap', 'case-detail']`

---

#### `onboarding.complete_file_check`
**Endpoint:** `{base}/complete-file-check`
**Mode:** Full-page (GuidedRunner)
**Steps:** Dynamic — one step per artifact code registered in `start_document_collection`
**Allowed roles:** `Documentation`, `PM Coordinator`, `PM Manager / Senior PM Coordinator`

Each step collects for one artifact code:

| key (within artifact object) | type | required | notes |
|------------------------------|------|----------|-------|
| `reference_id` | reference-text | yes | Reference ID in the storage system |
| `label` | text | yes | Human-readable document label |
| `storage_system` | select | yes | Options: `STORAGE_SYSTEM_OPTIONS` |

The submitted payload assembles as:
```typescript
{
  artifact_documents: {
    [code]: { reference_id, label, storage_system }
    // one entry per code
  }
}
```

**Success message:** `"File check complete. Document pack recorded."`
**Invalidates:** `['operator-shell-bootstrap', 'case-detail']`

---

#### `onboarding.approve_ready_to_market`
**Endpoint:** `{base}/approve-ready-to-market`
**Mode:** Modal (WizardShell)
**Steps:** 1
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `PM Head`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `approval_threshold` | number | yes | Minimum threshold value for approval — min: 0 |

**Success message:** `"Ready-to-market approval recorded."`
**Invalidates:** `['operator-shell-bootstrap', 'case-detail']`

---

#### `onboarding.record_leasing_handoff`
**Endpoint:** `{base}/record-leasing-handoff`
**Mode:** Modal (WizardShell)
**Steps:** 1
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`, `Leasing Head`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `leasing_handoff_id` | reference-text | yes | Handoff record ID from the Handoffs queue |
| `leasing_handoff_status` | select | yes | Options: `LEASING_HANDOFF_STATUS_OPTIONS` |
| `next_action` | text | no | Operational note for the leasing team |
| `target_date` | date | yes | Target date for leasing handoff acceptance |

**Success message:** `"Leasing handoff recorded."`
**Invalidates:** `['operator-shell-bootstrap', 'case-detail']`

---

**CONFIRM ACTIONS (no body — render as inline confirm button, not a runner):**

| Action | Endpoint suffix | Allowed roles | Confirm label | Success message |
|--------|----------------|---------------|---------------|-----------------|
| Verify Authority | `/verify-authority` | PM Coordinator, PM Manager | `"Confirm Authority Verified"` | `"Management authority verified."` |
| Schedule Inspection | `/schedule-inspection` | Move Team, PM Coordinator | `"Confirm Inspection Scheduled"` | `"Inspection marked as scheduled."` |
| Complete Inspection Baseline | `/complete-inspection-baseline` | Move Team, PM Coordinator | `"Mark Inspection Baseline Complete"` | `"Inspection baseline recorded."` |
| Complete Finance Setup | `/complete-finance-setup` | Finance, PM Coordinator | `"Confirm Finance Setup Complete"` | `"Finance setup marked complete."` |
| Record Portal Ready | `/record-portal-ready` | Documentation, PM Coordinator | `"Mark Portal Ready"` | `"Property marked as portal ready."` |
| Complete Leasing Handoff | `/complete-leasing-handoff` | Leasing Head, PM Head | `"Confirm Leasing Handoff Complete"` | `"Leasing handoff completed. Vacancy case will be opened."` |

---

### 3.2 VACANCY LIFECYCLE

**Endpoint base:** `/api/v1/operator-shell/vacancy-cases/{id}`
**All state transitions use:** `POST {base}/advance` with `target_status`, `next_action`, `target_date`

---

#### `vacancy.set_pricing`
**target_status:** `pricing_pending`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`, `Head of Leasing`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `asking_rent` | number | yes | Monthly rent in AED, min: 1 |
| `pricing_status` | select | yes | `PRICING_STATUS_OPTIONS` |
| `pre_listing_works_status` | select | yes | `PRE_LISTING_WORKS_OPTIONS` |
| `target_tenant_profile_status` | select | yes | `TENANT_PROFILE_OPTIONS` |
| `target_date` | date | yes | Target date to go market-live |

**Success message:** `"Pricing set. Vacancy case is now in Pricing Pending."`

---

#### `vacancy.confirm_lease_readiness`
**target_status:** `lease_readiness_pending`
**Mode:** Modal
**Allowed roles:** `Head of Leasing`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `lease_readiness_gate_status` | select | yes | `GATE_STATUS_OPTIONS` |
| `listing_pack_status` | select | yes | `PACK_STATUS_OPTIONS` |
| `listing_pack_reference` | reference-text | no | Listing pack document reference |
| `access_status` | select | yes | `ACCESS_STATUS_OPTIONS` |
| `target_date` | date | yes | |

**Success message:** `"Lease readiness confirmed."`

---

#### `vacancy.go_market_live`
**target_status:** `market_live`
**Mode:** Modal
**Allowed roles:** `Head of Leasing`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `target_date` | date | yes | Expected date of first viewings |
| `next_action` | text | no | |

**Success message:** `"Unit is now Market Live."`

---

#### `vacancy.record_applications`
**target_status:** `applications_pending`
**Mode:** Modal
**Allowed roles:** `Head of Leasing`, `PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `offer_summary_status` | select | yes | `OFFER_SUMMARY_OPTIONS` |
| `offer_summary_reference` | reference-text | no | |
| `target_date` | date | yes | Landlord decision deadline |

**Success message:** `"Applications recorded. Awaiting landlord decision."`

---

#### `vacancy.request_landlord_decision`
**target_status:** `landlord_decision_pending`
**Mode:** Modal
**Allowed roles:** `Head of Leasing`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `target_date` | date | yes | Decision deadline |
| `next_action` | text | no | |

**Success message:** `"Landlord decision requested."`

---

#### `vacancy.record_contract_ejari`
**target_status:** `contract_ejari_pending`
**Mode:** Modal
**Allowed roles:** `Head of Leasing`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `contract_pack_status` | select | yes | `PACK_STATUS_OPTIONS` |
| `contract_pack_reference` | reference-text | no | Contract pack document reference |
| `contract_to_move_in_gate_status` | select | yes | `GATE_STATUS_OPTIONS` |
| `target_date` | date | yes | Target Ejari / move-in date |

**Success message:** `"Contract and Ejari process initiated."`

---

#### `vacancy.configure_tenancy`
**Endpoint:** `{base}/configure-tenancy-record`
**Mode:** Full-page
**Allowed roles:** `Head of Leasing`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `contract_start_date` | date | yes | Tenancy start date |
| `contract_end_date` | date | no | Tenancy end date |
| `ejari_reference` | reference-text | no | Ejari registration number from DLD |
| `payment_schedule_summary` | textarea | no | Summary of agreed payment schedule |

**Success message:** `"Tenancy record configured. Tenancy is now active."`
**Invalidates:** `['operator-shell-bootstrap', 'case-detail', 'units-bootstrap']`

---

**CONFIRM ACTIONS (vacancy):**

| Action | Endpoint | Confirm label | Success message |
|--------|----------|---------------|-----------------|
| Send Contract Handoff | `/send-contract-handoff` | `"Send Contract Handoff"` | `"Contract handoff sent."` |
| Complete Contract Handoff | `/complete-contract-handoff` | `"Confirm Contract Handoff Complete"` | `"Contract handoff complete."` |

---

### 3.3 TENANCY LIFECYCLE

**Endpoint base:** `/api/v1/operator-shell/tenancy-records/{id}`

---

#### `tenancy.activate`
**Endpoint:** `{base}/advance` with `target_status: 'Active'`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Admin / Ejari / Documentation`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `contract_start_date` | date | yes | Confirmed actual move-in date |
| `contract_end_date` | date | no | Contract end date |
| `ejari_reference` | reference-text | no | Ejari registration number |
| `payment_schedule_summary` | textarea | no | |

**Success message:** `"Tenancy activated. Unit is now Occupied."`

---

#### `tenancy.record_notice`
**Endpoint:** `{base}/advance` with `target_status: 'Notice'`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `notice_date` | date | yes | Date notice was served or received |

**Success message:** `"Notice recorded. Move-out case can now be opened."`

---

#### `tenancy.open_moveout_case`
**Endpoint:** `{base}/open-moveout-case`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `next_action` | text | yes | First action for the move-out case |
| `target_date` | date | yes | Expected move-out date |
| `notice_reference` | reference-text | no | Reference to served notice document |

**Success message:** `"Move-out case opened."`

---

#### `tenancy.open_receivables_case`
**Endpoint:** `{base}/open-receivables-case`
**Mode:** Full-page
**Allowed roles:** `PM Coordinator`, `Finance / Accounts Support`, `PM Manager / Senior PM Coordinator`
**Steps:** 2 (Rent Event Details, Case Setup)

Step 1 — Rent Event:

| key | type | required | notes |
|-----|------|----------|-------|
| `rent_event_id` | reference-text | yes | Rent event record ID |
| `amount_due` | number | yes | Amount due in AED, min: 0.01 |
| `due_date` | date | yes | Original due date of payment |
| `receipt_status` | select | yes | `RECEIPT_STATUS_OPTIONS` |
| `payment_method` | select | yes | `PAYMENT_METHOD_OPTIONS` |

Step 2 — Case Setup:

| key | type | required | notes |
|-----|------|----------|-------|
| `next_action` | text | yes | First chase action description |
| `target_date` | date | yes | Target resolution date |

**Success message:** `"Receivables case opened. Arrears tracking started."`

---

#### `tenancy.open_renewal_case`
**Endpoint:** `{base}/open-renewal-case`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `next_action` | text | yes | |
| `target_date` | date | yes | 120-day milestone target |
| `current_date` | date | no | Defaults to today if blank |

**Success message:** `"Renewal case opened."`

---

### 3.4 MOVEOUT LIFECYCLE

**Endpoint base:** `/api/v1/operator-shell/moveout-cases/{id}`
**All state transitions use:** `POST {base}/advance`

---

#### `moveout.send_offboarding_pack`
**target_status:** `offboarding_pack_sent`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Admin / Ejari / Documentation`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `offboarding_pack_reference` | reference-text | yes | Document reference for sent pack |
| `notice_reference` | reference-text | no | Original notice document reference |
| `target_date` | date | yes | Target scheduled move-out date |

**Success message:** `"Offboarding pack sent."`

---

#### `moveout.schedule_moveout`
**target_status:** `moveout_scheduled`
**Mode:** Modal
**Allowed roles:** `Move Team`, `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `scheduled_moveout_date` | date | yes | Confirmed move-out date |
| `key_return_status` | select | yes | `KEY_RETURN_OPTIONS` |
| `target_date` | date | yes | Must equal or be after scheduled_moveout_date |

**Success message:** `"Move-out date scheduled."`

---

#### `moveout.record_inspection`
**target_status:** `inspection_complete`
**Mode:** Modal
**Allowed roles:** `Move Team`, `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `inspection_evidence_reference` | reference-text | yes | Inspection report reference |
| `make_good_status` | select | yes | `MAKE_GOOD_OPTIONS` |
| `target_date` | date | yes | |

**Success message:** `"Move-out inspection recorded."`

---

#### `moveout.track_utility_ejari_closure`
**target_status:** `utility_and_ejari_closure_tracked`
**Mode:** Modal
**Allowed roles:** `Documentation`, `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `utility_closure_status` | select | yes | `CLOSURE_STATUS_OPTIONS` |
| `ejari_closure_status` | select | yes | `CLOSURE_STATUS_OPTIONS` |
| `target_date` | date | yes | |

**Success message:** `"Utility and Ejari closure tracked."`

---

#### `moveout.prepare_deposit_reconciliation`
**target_status:** `deposit_reconciliation_prepared`
**Mode:** Full-page
**Allowed roles:** `Finance / Accounts Support`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `deposit_reconciliation_reference` | reference-text | yes | Reconciliation document reference |
| `target_date` | date | yes | |

**Success message:** `"Deposit reconciliation prepared."`

---

#### `moveout.confirm_reletting_ready`
**target_status:** `reletting_ready`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `PM Head`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `target_date` | date | yes | |
| `next_action` | text | no | |

**Success message:** `"Unit confirmed as reletting ready."`

---

#### `moveout.approve_closure`
**target_status:** `closure_approved`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `PM Head`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `archive_pack_reference` | reference-text | no | Archive document pack reference |
| `target_date` | date | yes | |

**Success message:** `"Move-out closure approved."`

---

**CONFIRM ACTIONS (moveout):**

| Action | Endpoint | Confirm label | Success message |
|--------|----------|---------------|-----------------|
| Send Reletting Handoff | `/send-reletting-handoff` | `"Send Reletting Handoff"` | `"Reletting handoff sent."` |
| Complete Reletting Handoff | `/complete-reletting-handoff` | `"Confirm Reletting Handoff Complete"` | `"Reletting handoff complete."` |
| Open Vacancy Case | `/open-vacancy-case` | `"Open Vacancy Case"` | `"Vacancy case opened for re-letting."` |

---

### 3.5 RENEWAL LIFECYCLE

**Endpoint base:** `/api/v1/operator-shell/renewal-cases/{id}`
**All state transitions use:** `POST {base}/advance`

---

#### `renewal.trigger_prep`
**target_status:** `prep_120_day_due`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `tenant_score` | select | yes | `TENANT_SCORE_OPTIONS` |
| `target_date` | date | yes | 120-day market review deadline |

**Success message:** `"Renewal preparation started. 120-day review window open."`

---

#### `renewal.generate_recommendation_packet`
**Endpoint:** `{base}/generate-recommendation-packet`
**Mode:** Full-page
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Steps:** 2

Step 1 — Market Review:

| key | type | required | notes |
|-----|------|----------|-------|
| `market_review_status` | select | yes | `MARKET_REVIEW_STATUS_OPTIONS` |
| `market_review_reference` | reference-text | no | Market comparable report reference |
| `recommendation_draft_summary` | textarea | yes | Market-based renewal recommendation, min 20 chars |

Step 2 — Packet Details:

| key | type | required | notes |
|-----|------|----------|-------|
| `recommendation_source_fields` | checklist | yes | Fields included in the packet snapshot |
| `next_action` | text | yes | |
| `target_date` | date | yes | |

Note: `recommendation_snapshot` is assembled from all currently known case fields on the client — not a user-input field.

**Success message:** `"Recommendation packet generated."`

---

#### `renewal.complete_market_review`
**target_status:** `market_review_complete`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `market_review_status` | select | yes | Must be `complete` |
| `market_review_reference` | reference-text | no | |
| `target_date` | date | yes | |

**Success message:** `"Market review complete."`

---

#### `renewal.issue_landlord_recommendation`
**target_status:** `landlord_recommendation_due`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `landlord_recommendation_status` | select | yes | `RECOMMENDATION_STATUS_OPTIONS` |
| `landlord_recommendation_reference` | reference-text | no | Recommendation document reference |
| `target_date` | date | yes | Landlord decision deadline |

**Success message:** `"Recommendation issued to landlord."`

---

#### `renewal.record_decision`
**target_status:** `renew_or_amend_or_nonrenew`
**Mode:** Full-page
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Steps:** 2

Step 1 — Decision:

| key | type | required | notes |
|-----|------|----------|-------|
| `decision_route` | select | yes | `RENEWAL_DECISION_OPTIONS` |
| `notice_pack_status` | select | yes | `NOTICE_PACK_OPTIONS` |
| `notice_pack_reference` | reference-text | no | |

Step 2 — Confirmation:

| key | type | required | notes |
|-----|------|----------|-------|
| `target_date` | date | yes | Target signed pack date or exit date |
| `next_action` | text | yes | |

**Success message:** `"Renewal decision recorded."`

---

#### `renewal.record_signed_pack`
**target_status:** `signed_pack_complete`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Admin / Ejari / Documentation`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `signed_artifact_reference` | reference-text | yes | Signed document reference |
| `notice_pack_status` | select | yes | Must be `signed` |
| `target_date` | date | yes | |

**Success message:** `"Signed pack recorded."`

---

#### `renewal.schedule_next_cycle`
**target_status:** `next_cycle_scheduled`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `target_date` | date | yes | Next renewal trigger date |
| `next_action` | text | no | |

**Success message:** `"Next renewal cycle scheduled."`

---

**CONFIRM ACTIONS (renewal):**

| Action | Endpoint | Confirm label | Success message |
|--------|----------|---------------|-----------------|
| Send Reletting Handoff | `/send-reletting-handoff` | `"Send Reletting Handoff"` | `"Reletting handoff sent."` |
| Complete Reletting Handoff | `/complete-reletting-handoff` | `"Confirm Reletting Handoff Complete"` | `"Reletting handoff complete."` |
| Open Vacancy Case | `/open-vacancy-case` | `"Open Vacancy Case"` | `"Vacancy case opened."` |

---

### 3.6 RECEIVABLES LIFECYCLE

**Endpoint base:** `/api/v1/operator-shell/receivables-cases/{id}`
**All transitions use:** `POST {base}/advance`

Each runner collects the contextual fields relevant to that day-band step. Fields not relevant to the current step must not appear in the form.

---

#### `receivables.log_day3_check`
**target_status:** `day_3_check_due`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Finance / Accounts Support`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `day_3_checked_at` | date | yes | Date check was performed |
| `day_3_check_outcome` | textarea | yes | Outcome of day 3 check, min 10 chars |
| `receipt_status` | select | yes | `RECEIPT_STATUS_OPTIONS` |
| `payment_match_status` | select | yes | `PAYMENT_MATCH_OPTIONS` |
| `target_date` | date | yes | Day 5 reminder target date |

**Success message:** `"Day 3 check logged."`

---

#### `receivables.log_day5_reminder`
**target_status:** `day_5_reminder_due`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Finance / Accounts Support`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `reminder_sent_at` | date | yes | Date reminder was sent |
| `reminder_summary` | textarea | yes | Method and content of reminder, min 10 chars |
| `target_date` | date | yes | Day 10 call target date |

**Success message:** `"Day 5 reminder logged."`

---

#### `receivables.log_day10_call`
**target_status:** `day_10_call_due`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Finance / Accounts Support`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `day_10_call_at` | date | yes | Date call was made |
| `day_10_call_outcome` | textarea | yes | Call outcome and tenant response, min 10 chars |
| `target_date` | date | yes | Day 15 notice target date |

**Success message:** `"Day 10 call logged."`

---

#### `receivables.log_day15_notice`
**target_status:** `day_15_notice_due`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Finance / Accounts Support`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `formal_notice_approval_status` | select | yes | `FORMAL_NOTICE_APPROVAL_OPTIONS` |
| `formal_notice_reference` | reference-text | no | |
| `formal_notice_sent_at` | date | no | Date formal notice was sent |
| `target_date` | date | yes | Day 30 legal review target date |

**Success message:** `"Day 15 formal notice logged."`

---

#### `receivables.log_day30_legal_review`
**target_status:** `day_30_legal_escalation_review`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `Finance / Accounts Support`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `formal_notice_reference` | reference-text | yes | Evidence of formal notice |
| `payment_match_status` | select | yes | `PAYMENT_MATCH_OPTIONS` |
| `target_date` | date | yes | Legal referral / resolution target |

**Success message:** `"Day 30 legal escalation review logged."`

---

#### `receivables.record_resolution`
**target_status:** `resolved_or_escalated`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `PM Head`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `resolution_summary` | textarea | yes | Resolution description, min 20 chars |
| `resolved_at` | date | yes | Date resolved |
| `payment_match_status` | select | yes | `PAYMENT_MATCH_OPTIONS` |
| `target_date` | date | yes | |

**Success message:** `"Receivables case resolved."`

---

### 3.7 MAINTENANCE LIFECYCLE

**Endpoint base:** `/api/v1/operator-shell/maintenance-tickets`

---

#### `maintenance.open_ticket`
**Endpoint:** `POST /api/v1/operator-shell/maintenance-tickets`
**Mode:** Full-page
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`, `Maintenance / Vendor Coordinator`
**Steps:** 2

Step 1 — Issue Details:

| key | type | required | notes |
|-----|------|----------|-------|
| `property_unit_id` | reference-text | yes | Unit ID from the Units directory |
| `issue_type` | select | yes | `MAINTENANCE_ISSUE_TYPE_OPTIONS` |
| `report_summary` | textarea | yes | Full description of the issue, min 20 chars |
| `urgency` | select | yes | `URGENCY_OPTIONS` |

Step 2 — Assignment:

| key | type | required | notes |
|-----|------|----------|-------|
| `liability_view` | select | yes | `LIABILITY_OPTIONS` |
| `approval_threshold_snapshot` | number | yes | Approval spend threshold at time of opening, min: 0 |
| `estimated_cost` | number | no | Initial cost estimate in AED |
| `next_action` | text | yes | |
| `target_date` | date | yes | Target resolution date |

**Success message:** `"Maintenance ticket opened."`
**Invalidates:** `['operator-shell-bootstrap', 'units-bootstrap']`

---

#### `maintenance.triage`
**Endpoint:** `{base}/{id}/advance`, `target_status: 'triaged'`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`, `Maintenance / Vendor Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `urgency` | select | yes | `URGENCY_OPTIONS` |
| `liability_view` | select | yes | `LIABILITY_OPTIONS` |
| `issue_type` | select | no | `MAINTENANCE_ISSUE_TYPE_OPTIONS` — refined post-assessment |
| `report_summary` | textarea | no | Updated description if needed |
| `target_date` | date | yes | |

**Success message:** `"Maintenance ticket triaged."`

---

#### `maintenance.request_quote`
**target_status:** `quote_requested`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Maintenance / Vendor Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `vendor_name` | text | yes | Vendor or contractor name |
| `target_date` | date | yes | Quote deadline |
| `next_action` | text | no | |

**Success message:** `"Quote requested from vendor."`

---

#### `maintenance.log_quote`
**target_status:** `quote_received`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Maintenance / Vendor Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `quote_reference` | reference-text | yes | Quote document reference |
| `quote_amount` | number | yes | Quoted amount in AED, min: 0.01 |
| `vendor_name` | text | no | |
| `target_date` | date | yes | |

**Success message:** `"Quote logged."`

---

#### `maintenance.submit_for_approval`
**target_status:** `approval_required`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `estimated_cost` | number | yes | Confirmed cost for approval |
| `target_date` | date | yes | Approval deadline |
| `next_action` | text | no | |

**Success message:** `"Submitted for approval."`

---

#### `maintenance.record_approval_decision`
**Endpoint:** `{base}/{id}/record-approval-decision`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `PM Head`, `Landlord`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `approval_request_id` | reference-text | yes | Approval request record ID |
| `approved` | checkbox | yes | `"I approve this maintenance spend"` |
| `decision_note` | textarea | no | Reason for approval or rejection, min 10 chars if rejecting |
| `next_action` | text | yes | |
| `target_date` | date | yes | |

**Success message:** `"Approval decision recorded."`

---

#### `maintenance.dispatch_vendor`
**target_status:** `dispatched`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Maintenance / Vendor Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `dispatch_reference` | reference-text | yes | Vendor dispatch / job order reference |
| `scheduled_for` | date | yes | Scheduled visit date |
| `vendor_name` | text | no | |
| `target_date` | date | yes | Expected completion date |

**Success message:** `"Vendor dispatched."`

---

#### `maintenance.record_evidence`
**target_status:** `evidence_received`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Maintenance / Vendor Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `completion_evidence_reference` | reference-text | yes | Completion evidence document reference |
| `resolution_summary` | textarea | yes | Work completed description, min 10 chars |
| `resolved_at` | date | yes | Date work was completed |
| `target_date` | date | yes | |

**Success message:** `"Completion evidence recorded."`

---

#### `maintenance.emergency_dispatch`
**target_status:** `emergency_dispatch_authorized`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `PM Head`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `emergency_justification` | textarea | yes | Justification for bypassing quote process, min 20 chars |
| `emergency_authorized_by` | text | yes | Name of authorising person |
| `estimated_cost` | number | no | Estimated cost in AED |
| `target_date` | date | yes | Expected completion date |

**Success message:** `"Emergency dispatch authorized."`

---

#### `maintenance.notify_landlord`
**target_status:** `landlord_notified`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `landlord_notification_reference` | reference-text | yes | Notification record or communication reference |
| `target_date` | date | yes | |

**Success message:** `"Landlord notified of emergency works."`

---

### 3.8 SERVICE RECOVERY LIFECYCLE

**Endpoint base:** `/api/v1/operator-shell/service-recovery-cases`

---

#### `service_recovery.open_case`
**Endpoint:** `POST /api/v1/operator-shell/service-recovery-cases`
**Mode:** Full-page
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `Landlord Success Manager`, `PM Head`
**Steps:** 2

Step 1 — Complaint Details:

| key | type | required | notes |
|-----|------|----------|-------|
| `property_unit_id` | reference-text | yes | Unit ID |
| `source_type` | text | yes | Source entity type e.g. "Landlord", "Tenant", "Internal" |
| `source_id` | reference-text | yes | Source entity ID |
| `trigger_type` | select | yes | `SERVICE_RECOVERY_TRIGGER_OPTIONS` |
| `severity` | select | yes | `SEVERITY_OPTIONS` |

Step 2 — Ownership:

| key | type | required | notes |
|-----|------|----------|-------|
| `notes` | textarea | no | Initial context, min 10 chars if provided |
| `next_action` | text | yes | |
| `target_date` | date | yes | Target acknowledgement date |

**Success message:** `"Service recovery case opened."`

---

#### `service_recovery.acknowledge`
**Endpoint:** `{base}/{id}/advance`, `target_status: 'acknowledged'`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `Landlord Success Manager`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `acknowledgement_reference` | reference-text | yes | Reference to acknowledgement sent to client |
| `target_date` | date | yes | Plan-set target date |

**Success message:** `"Complaint acknowledged."`

---

#### `service_recovery.set_plan`
**target_status:** `recovery_plan_set`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `Landlord Success Manager`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `recovery_plan_summary` | textarea | yes | Recovery plan description, min 30 chars |
| `target_date` | date | yes | Target resolution date |
| `next_action` | text | yes | |

**Success message:** `"Recovery plan set."`

---

#### `service_recovery.log_root_cause`
**target_status:** `root_cause_logged`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `Landlord Success Manager`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `root_cause_summary` | textarea | yes | Root cause analysis, min 30 chars |
| `target_date` | date | yes | Resolution target |
| `next_action` | text | no | |

**Success message:** `"Root cause logged."`

---

#### `service_recovery.record_resolution`
**target_status:** `resolved`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `Landlord Success Manager`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `written_summary_reference` | reference-text | no | Written resolution summary reference |
| `notes` | textarea | yes | Resolution description and outcome, min 20 chars |
| `target_date` | date | yes | |

**Success message:** `"Service recovery case resolved."`

---

### 3.9 REPORT CYCLE LIFECYCLE

**Endpoint base:** `/api/v1/operator-shell/report-cycles`

---

#### `reporting.open_cycle`
**Endpoint:** `POST /api/v1/operator-shell/report-cycles`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `property_unit_id` | reference-text | yes | Unit ID for the report |
| `reporting_month` | text | yes | Format: `YYYY-MM` e.g. `2026-03` |
| `next_action` | text | yes | First data-gathering action |
| `target_date` | date | yes | Draft completion target |

**Success message:** `"Report cycle opened for {reporting_month}."`

---

#### `reporting.submit_for_finance_match`
**target_status:** `finance_match_pending`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `Finance / Accounts Support`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `receipt_match_status` | select | yes | `REPORT_MATCH_OPTIONS` |
| `expense_match_status` | select | yes | `REPORT_MATCH_OPTIONS` |
| `target_date` | date | yes | Finance match completion target |

**Success message:** `"Report submitted for finance matching."`

---

#### `reporting.confirm_finance_match`
**target_status:** `draft_ready`
**Mode:** Modal
**Allowed roles:** `Finance / Accounts Support`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `receipt_match_status` | select | yes | Must be `clear` or `exception` |
| `expense_match_status` | select | yes | Must be `clear` or `exception` |
| `pm_fee_posting_status` | select | yes | `PM_FEE_POSTING_OPTIONS` |
| `maintenance_evidence_status` | select | yes | `MAINTENANCE_EVIDENCE_OPTIONS` |
| `target_date` | date | yes | Review submission target |

**Success message:** `"Finance match confirmed. Report is draft ready."`

---

#### `reporting.generate_pack`
**Endpoint:** `{base}/{id}/generate-pack`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `next_action` | text | yes | |
| `target_date` | date | yes | |
| `as_of_date` | date | no | Snapshot date for the pack — defaults to end of reporting month |

**Success message:** `"Report pack generated."`

---

#### `reporting.submit_for_review`
**target_status:** `under_review`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `review_status` | select | yes | Must be `requested` |
| `report_reference` | reference-text | no | Draft report document reference |
| `target_date` | date | yes | Review completion deadline |

**Success message:** `"Report submitted for review."`

---

#### `reporting.approve_report`
**target_status:** `send_ready`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `PM Head`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `review_status` | select | yes | Must be `approved` |
| `target_date` | date | yes | Send target date |

**Success message:** `"Report approved for sending."`

---

#### `reporting.send_report`
**target_status:** `sent`
**Mode:** Modal
**Allowed roles:** `PM Coordinator`, `PM Manager / Senior PM Coordinator`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `report_reference` | reference-text | yes | Final sent report document reference |
| `sent_at` | date | yes | Date report was sent to landlord |
| `target_date` | date | yes | |

**Success message:** `"Report sent to landlord."`

---

#### `reporting.request_correction`
**target_status:** `correction_required`
**Mode:** Modal
**Allowed roles:** `PM Manager / Senior PM Coordinator`, `PM Head`
**Fields:**

| key | type | required | notes |
|-----|------|----------|-------|
| `correction_reference` | reference-text | yes | Correction notes or document reference |
| `review_status` | select | yes | Must be `corrections_required` |
| `target_date` | date | yes | Correction completion deadline |

**Success message:** `"Correction requested."`

---

## 4. Unresolved Inputs Requiring Backend Clarification

### 4.1 Artifact Codes for `start_document_collection`

**RESOLVED.** The `required_artifact_codes` field is populated from the onboarding case's `field_snapshot`. The backend already includes `required_artifact_codes` and `missing_artifact_codes` as fields in the case detail response (`GET /api/v1/operator-shell/cases/Onboarding Case/{id}`).

The `start_document_collection` runner must:
1. Read `field_snapshot.required_artifact_codes` from the case detail response opened before the runner starts
2. Render these as a checklist — one checkbox per code
3. Submit the array of checked codes as `artifact_documents` (or similar per API spec)

No separate endpoint is needed. No hardcoded code list is acceptable.

### 4.2 `recommendation_snapshot` in Renewal Packet

The `generate-recommendation-packet` endpoint requires `recommendation_snapshot: object` (required). This is meant to be a snapshot of the case's current state at packet generation time. The frontend must:

1. Fetch the current case detail immediately before submission
2. Assemble `recommendation_snapshot` from the live case detail fields (market data, tenant score, recommendation status, etc.)
3. Not present this as a user-editable field

---

## 5. Error Handling Standards

Every runner must handle the following error cases explicitly — not with a generic "Something went wrong" toast:

| Error | User-facing message |
|-------|-------------------|
| 422 Unprocessable Entity | Parse `detail` array from response and show the first validation error in ControlDesk terminology, not raw field names |
| 403 Forbidden | `"Your current role does not have permission to perform this action."` |
| 409 Conflict | `"This case has been updated by another user. Please refresh and try again."` |
| 400 Bad Request | Parse `detail` from response. Show as field-level error if the field key matches a field in the form. |
| Network error | `"Unable to reach the server. Check your connection and try again."` |
| 500 Server Error | `"A server error occurred. The action was not completed. Please try again or contact support."` |

**Prohibited:** Displaying raw Python tracebacks, raw HTTP status codes, or the string `"detail"` as a user-visible error message.

**Prohibited:** Closing the runner on API error. The runner must stay open with the error displayed in the `WizardShell` error banner or the `GuidedRunner` error state, allowing the user to correct and resubmit.

---

## 6. `next_action` and `target_date` Conventions

These two fields appear as required on virtually every advance endpoint. They must always carry meaningful values:

**`next_action`:** If not collected from the user as an explicit field, it must be derived from the runner config `id` as a human-readable string:
```typescript
// e.g. for runner id: 'maintenance.dispatch_vendor'
next_action = 'Dispatch vendor and confirm scheduled visit date'
```
Each runner config must define a `defaultNextAction: string` for this case.

**`target_date`:** If not collected from the user, it must be calculated:
- Default: today + 3 business days
- Document any cases where a different default applies in the runner config via `defaultTargetDateOffsetDays: number`
- Never submit `target_date: ""` or `target_date: null` when the API marks it required

---

## 7. Prohibited Patterns

The following patterns are explicitly banned. Any implementation containing them will be rejected:

```typescript
// BANNED: Generic next_action
next_action: "complete"
next_action: "done"
next_action: "action"
next_action: ""

// BANNED: Empty or placeholder dates
target_date: ""
target_date: "2024-01-01"   // hardcoded past date
target_date: new Date().toISOString()  // full ISO timestamp — must be YYYY-MM-DD

// BANNED: Role stub
actor_role: userRoles[0] ?? ""
actor_role: "System Manager"  // hardcoded

// BANNED: Placeholder field labels
label: "Field 1"
label: "Enter value"
placeholder: "e.g. value"
hint: "Enter the value"

// BANNED: Unsubmitted fields
// A field rendered in the UI that is not present in the assembled payload

// BANNED: Missing required fields
// A field marked required in the API schema absent from the runner

// BANNED: Swallowed errors
onError: () => {}
onError: () => toast({ title: "Error" })  // no message content

// BANNED: Hardcoded option lists not matching backend enums
options: [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]
// when backend expects specific status strings

// BANNED: Toast-only success without query invalidation
onSuccess: () => toast(...)  // missing invalidateQueries

// BANNED: Console.log in submitted code
console.log(payload)
console.log("submitting")
```

---

## 8. Accessibility Requirements

Every runner must meet these requirements:

- All form fields have associated `<label>` elements with `htmlFor` matching field `id`
- Error messages are associated with their field via `aria-describedby`
- Required fields are marked with `aria-required="true"` and a visual indicator
- The first field in each step receives focus on step mount (`autoFocus` or `ref.focus()`)
- Date fields do not rely solely on colour to indicate invalid state
- Select fields are keyboard navigable with full option announcement
- The runner modal/page has a logical tab order: fields → back → cancel/next
- `aria-live` region announces step transitions and submission states

---

## 9. Build Order

Build in this sequence to unblock the most cases earliest:

1. `FieldRenderer` + `RunnerConfig` types (unblocks all runners)
2. `TransitionRunner` component (modal variant)
3. Onboarding runners (4 runners + 6 confirm actions)
4. Maintenance runners (10 runners) — highest operational frequency
5. Moveout runners (7 runners) — highest data complexity
6. Vacancy runners (7 runners)
7. Tenancy case-openers (4 runners)
8. Receivables runners (6 runners)
9. Renewal runners (6 runners + 3 confirms)
10. Service Recovery runners (5 runners)
11. Reporting runners (8 runners)
12. Full-page runner variants (`GuidedRunner` integration for complex runners)

---

*End of governance document.*
