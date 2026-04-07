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
