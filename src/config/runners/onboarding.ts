// ---------------------------------------------------------------------------
// Onboarding lifecycle runner configs
// Endpoint base: /api/v1/operator-shell/onboarding-cases/{id}
// ---------------------------------------------------------------------------

import type { RunnerConfig, ConfirmActionConfig } from "../../types/runner";

const BASE = "/api/v1/operator-shell/onboarding-cases";
const INVALIDATES = ["operator-shell-bootstrap", "queue-rows", "case-detail"];

// ---------------------------------------------------------------------------
// Runners (require form input)
// ---------------------------------------------------------------------------

export const ONBOARDING_RUNNERS: RunnerConfig[] = [
  {
    id: "onboarding.start_document_collection",
    title: "Start Document Collection",
    description: "Register required artifact codes and initiate the document collection process.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/start-document-collection`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Artifact Codes",
        description:
          "Select the artifact codes required for this onboarding case. The missing codes list identifies documents not yet received.",
        fields: [
          {
            key: "required_artifact_codes",
            label: "Required Artifact Codes",
            type: "checklist",
            required: true,
            hint: "Codes loaded from case field snapshot — at least one must be selected.",
            // Options are injected at runtime from case field_snapshot
            options: [],
          },
          {
            key: "missing_artifact_codes",
            label: "Missing Artifact Codes",
            type: "checklist",
            required: false,
            hint: "Subset of required codes known to be missing at time of collection.",
            options: [],
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Document collection started. Artifact codes registered.",
    allowedRoles: ["Documentation", "PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "onboarding.approve_ready_to_market",
    title: "Approve Ready to Market",
    description: "Record the management authority approval threshold and mark the property as ready to market.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/approve-ready-to-market`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Approval Threshold",
        description: "Set the approved spend threshold for this property before it goes to market.",
        fields: [
          {
            key: "approval_threshold",
            label: "Approval Threshold (AED)",
            type: "number",
            required: true,
            placeholder: "5000",
            hint: "The maximum maintenance spend that can be approved without escalation.",
            min: 0,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Ready-to-market approval recorded.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },

  {
    id: "onboarding.record_leasing_handoff",
    title: "Record Leasing Handoff",
    description: "Record the leasing handoff details and set the target date for handoff acceptance.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/record-leasing-handoff`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Handoff Details",
        description: "Enter the handoff record reference and current status with the leasing team.",
        fields: [
          {
            key: "leasing_handoff_id",
            label: "Leasing Handoff ID",
            type: "reference-text",
            required: true,
            placeholder: "HND-2026-00123",
            hint: "Handoff record ID from the Handoffs queue.",
          },
          {
            key: "leasing_handoff_status",
            label: "Handoff Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Pending Acceptance" },
              { value: "prepared", label: "Prepared — Awaiting Send" },
              { value: "sent", label: "Sent to Leasing" },
              { value: "accepted", label: "Accepted by Leasing" },
            ],
          },
          {
            key: "next_action",
            label: "Next Action for Leasing",
            type: "text",
            required: false,
            placeholder: "Await leasing team confirmation of property readiness",
          },
          {
            key: "target_date",
            label: "Target Handoff Acceptance Date",
            type: "date",
            required: true,
            hint: "Target date for leasing team to accept the handoff.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Leasing handoff recorded.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator", "Leasing Head"],
  },
];

// ---------------------------------------------------------------------------
// Confirm actions (no form — POST with empty body)
// ---------------------------------------------------------------------------

export const ONBOARDING_CONFIRM_ACTIONS: ConfirmActionConfig[] = [
  {
    id: "onboarding.verify_authority",
    title: "Verify Management Authority",
    description:
      "Confirm that management authority documentation has been received and verified. This cannot be undone.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/verify-authority`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Management authority verified.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Confirm Authority Verified",
    confirmVariant: "primary",
  },
  {
    id: "onboarding.schedule_inspection",
    title: "Schedule Inspection",
    description: "Mark the move-in inspection as scheduled. The inspection team will be notified.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/schedule-inspection`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Inspection marked as scheduled.",
    allowedRoles: ["Move Team", "PM Coordinator"],
    confirmLabel: "Confirm Inspection Scheduled",
    confirmVariant: "primary",
  },
  {
    id: "onboarding.complete_inspection_baseline",
    title: "Complete Inspection Baseline",
    description: "Mark the baseline inspection as complete. This records the property's initial condition.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/complete-inspection-baseline`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Inspection baseline recorded.",
    allowedRoles: ["Move Team", "PM Coordinator"],
    confirmLabel: "Mark Inspection Baseline Complete",
    confirmVariant: "primary",
  },
  {
    id: "onboarding.complete_finance_setup",
    title: "Complete Finance Setup",
    description:
      "Confirm that finance setup (bank details, payment schedule, Zoho Books configuration) is complete.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/complete-finance-setup`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Finance setup marked complete.",
    allowedRoles: ["Finance", "PM Coordinator"],
    confirmLabel: "Confirm Finance Setup Complete",
    confirmVariant: "primary",
  },
  {
    id: "onboarding.record_portal_ready",
    title: "Mark Portal Ready",
    description: "Mark the property as portal-ready. This confirms all portal documentation is live.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/record-portal-ready`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Property marked as portal ready.",
    allowedRoles: ["Documentation", "PM Coordinator"],
    confirmLabel: "Mark Portal Ready",
    confirmVariant: "primary",
  },
  {
    id: "onboarding.complete_leasing_handoff",
    title: "Complete Leasing Handoff",
    description:
      "Confirm the leasing handoff is complete. This will trigger opening of a vacancy case for the property.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/complete-leasing-handoff`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Leasing handoff completed. Vacancy case will be opened.",
    allowedRoles: ["Leasing Head", "PM Head"],
    confirmLabel: "Confirm Leasing Handoff Complete",
    confirmVariant: "primary",
  },
];

// ---------------------------------------------------------------------------
// Phase 7: Occupied-Unit Takeover runners
// ---------------------------------------------------------------------------

export const ONBOARDING_TAKEOVER_RUNNERS: RunnerConfig[] = [
  {
    id: "onboarding.record_takeover_gap",
    title: "Record Takeover Gap",
    description: "Record a gap identified during the occupied-unit takeover audit.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/takeover-gaps`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Gap Details",
        description: "Describe the gap found during the takeover audit.",
        fields: [
          {
            key: "gap_category",
            label: "Gap Category",
            type: "select",
            required: true,
            options: [
              { label: "Documentation", value: "documentation" },
              { label: "Financial", value: "financial" },
              { label: "Legal / Compliance", value: "legal_compliance" },
              { label: "Maintenance / Condition", value: "maintenance_condition" },
              { label: "Tenant Obligations", value: "tenant_obligations" },
              { label: "Other", value: "other" },
            ],
          },
          {
            key: "description",
            label: "Description",
            type: "textarea",
            required: true,
            placeholder: "Describe the gap in detail...",
          },
          {
            key: "severity",
            label: "Severity",
            type: "select",
            required: true,
            options: [
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Critical", value: "critical" },
            ],
          },
          {
            key: "owner",
            label: "Owner",
            type: "text",
            required: true,
            placeholder: "Person or team responsible",
          },
          {
            key: "due_date",
            label: "Due Date",
            type: "date",
            required: false,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Takeover gap recorded.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "onboarding.update_takeover_gap",
    title: "Update Takeover Gap",
    description: "Update the status or details of a previously recorded takeover gap.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/takeover-gaps/{gap_id}`,
    method: "PUT",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Update Gap",
        description: "Update the gap status and provide closure evidence if applicable.",
        fields: [
          {
            key: "status",
            label: "Status",
            type: "select",
            required: false,
            options: [
              { label: "Open", value: "open" },
              { label: "In Progress", value: "in_progress" },
              { label: "Closed", value: "closed" },
              { label: "Accepted Risk", value: "accepted_risk" },
            ],
          },
          {
            key: "severity",
            label: "Severity",
            type: "select",
            required: false,
            options: [
              { label: "Low", value: "low" },
              { label: "Medium", value: "medium" },
              { label: "High", value: "high" },
              { label: "Critical", value: "critical" },
            ],
          },
          {
            key: "closure_evidence",
            label: "Closure Evidence",
            type: "textarea",
            required: false,
            placeholder: "Describe how the gap was resolved or why the risk is accepted...",
          },
          {
            key: "due_date",
            label: "Due Date",
            type: "date",
            required: false,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Takeover gap updated.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "onboarding.set_opening_balance",
    title: "Set Opening Balance",
    description: "Record the financial opening balance for the occupied-unit takeover.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/opening-balance`,
    method: "PUT",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Opening Balance",
        description: "Enter the financial details at the point of takeover.",
        fields: [
          {
            key: "outstanding_rent_aed",
            label: "Outstanding Rent (AED)",
            type: "number",
            required: true,
            min: 0,
            placeholder: "0.00",
            hint: "Rent arrears owed at time of takeover.",
          },
          {
            key: "deposit_holder",
            label: "Deposit Holder",
            type: "text",
            required: true,
            placeholder: "Previous agent or landlord",
          },
          {
            key: "deposit_amount_aed",
            label: "Deposit Amount (AED)",
            type: "number",
            required: true,
            min: 0,
            placeholder: "0.00",
          },
          {
            key: "deposit_basis",
            label: "Deposit Basis",
            type: "select",
            required: true,
            options: [
              { label: "One month", value: "one_month" },
              { label: "Two months", value: "two_months" },
              { label: "Negotiated", value: "negotiated" },
              { label: "Waived", value: "waived" },
            ],
          },
          {
            key: "pending_utility_bills_aed",
            label: "Pending Utility Bills (AED)",
            type: "number",
            required: true,
            min: 0,
            placeholder: "0.00",
          },
          {
            key: "pending_maintenance_issues",
            label: "Pending Maintenance Issues",
            type: "textarea",
            required: false,
            placeholder: "Describe any open maintenance issues inherited at takeover...",
          },
          {
            key: "arrears_acknowledged",
            label: "Arrears Acknowledged by Landlord",
            type: "checkbox",
            required: true,
          },
          {
            key: "arrears_acknowledged_by",
            label: "Acknowledged By",
            type: "text",
            required: false,
            placeholder: "Name or contact",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Opening balance recorded and locked.",
    allowedRoles: ["Finance", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "onboarding.confirm_portal_activation",
    title: "Confirm Portal Activation",
    description: "Confirm tenant portal access has been set up for the occupied-unit takeover.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/confirm-portal-activation`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Portal Activation",
        description: "Confirm the tenant portal has been activated and access has been shared.",
        fields: [
          {
            key: "tenant_email",
            label: "Tenant Email",
            type: "text",
            required: true,
            placeholder: "tenant@example.com",
          },
          {
            key: "activation_confirmed",
            label: "Activation Confirmed",
            type: "checkbox",
            required: true,
            hint: "Check this once the tenant can log in to the portal.",
          },
          {
            key: "training_sent_at",
            label: "Training Sent At",
            type: "date",
            required: false,
            hint: "Date the portal training materials were sent to the tenant.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Portal activation confirmed.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },
];

export const ONBOARDING_TAKEOVER_CONFIRM_ACTIONS: ConfirmActionConfig[] = [
  {
    id: "onboarding.advance_takeover_audit",
    title: "Begin Takeover Audit",
    description:
      "Advance this onboarding case to the takeover audit stage. Only valid for occupied-unit takeover cases.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/advance-takeover-audit`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Takeover audit started.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Start Takeover Audit",
    confirmVariant: "primary",
  },
  {
    id: "onboarding.advance_takeover_gaps_recorded",
    title: "Mark Gaps Recorded",
    description: "Confirm all takeover gaps have been identified and recorded.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/advance-takeover-gaps-recorded`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Takeover gaps recorded.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Confirm All Gaps Recorded",
    confirmVariant: "primary",
  },
  {
    id: "onboarding.advance_takeover_opening_balance",
    title: "Lock Opening Balance",
    description: "Advance to opening balance set. The opening balance must be saved first.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/advance-takeover-opening-balance`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Opening balance locked.",
    allowedRoles: ["Finance", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Lock Opening Balance",
    confirmVariant: "primary",
  },
  {
    id: "onboarding.advance_takeover_portal_activated",
    title: "Confirm Portal Activated",
    description: "Advance to portal activated. Portal activation must be confirmed first.",
    lifecycle: "onboarding",
    endpoint: `${BASE}/{id}/confirm-portal-activated`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Portal activated.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Confirm Portal Activated",
    confirmVariant: "primary",
  },
];
