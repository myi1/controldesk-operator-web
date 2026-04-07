// ---------------------------------------------------------------------------
// Renewal lifecycle runner configs
// Endpoint base: /api/v1/operator-shell/renewal-cases/{id}
// All advance transitions use: POST {base}/advance
// ---------------------------------------------------------------------------

import type { RunnerConfig, ConfirmActionConfig } from "../../types/runner";

const BASE = "/api/v1/operator-shell/renewal-cases";
const ADVANCE = `${BASE}/{id}/advance`;
const INVALIDATES = ["operator-shell-bootstrap", "queue-rows", "case-detail"];

export const RENEWAL_RUNNERS: RunnerConfig[] = [
  {
    id: "renewal.prep_120_day_due",
    title: "Trigger Renewal Preparation",
    description: "Score the tenant and open the 120-day renewal review window.",
    lifecycle: "renewal",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Tenant Scoring",
        description: "Score the tenant and set the 120-day review deadline.",
        fields: [
          {
            key: "tenant_score",
            label: "Tenant Score",
            type: "select",
            required: true,
            options: [
              { value: "unscored", label: "Not Yet Scored" },
              { value: "strong", label: "Strong — Highly Recommended" },
              { value: "neutral", label: "Neutral" },
              { value: "weak", label: "Weak — Concerns Noted" },
            ],
          },
          {
            key: "target_date",
            label: "120-Day Market Review Deadline",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Renewal preparation started. 120-day review window open.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "renewal.market_review_complete",
    title: "Complete Market Review",
    description: "Record the completed market review and recommendation document.",
    lifecycle: "renewal",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Market Review",
        description: "Confirm the market review is complete and enter the reference document.",
        fields: [
          {
            key: "market_review_status",
            label: "Market Review Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Pending" },
              { value: "complete", label: "Complete" },
            ],
          },
          {
            key: "market_review_reference",
            label: "Market Comparable Report Reference",
            type: "reference-text",
            required: false,
            placeholder: "MKT-2026-00456",
          },
          {
            key: "target_date",
            label: "Target Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Market review complete.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "renewal.landlord_recommendation_due",
    title: "Issue Landlord Recommendation",
    description: "Issue the renewal recommendation to the landlord for their decision.",
    lifecycle: "renewal",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Recommendation",
        description: "Record the recommendation status and document reference.",
        fields: [
          {
            key: "landlord_recommendation_status",
            label: "Recommendation Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Pending" },
              { value: "issued", label: "Issued to Landlord" },
              { value: "rejected", label: "Rejected by Landlord" },
            ],
          },
          {
            key: "landlord_recommendation_reference",
            label: "Recommendation Document Reference",
            type: "reference-text",
            required: false,
            placeholder: "REC-2026-00123",
          },
          {
            key: "target_date",
            label: "Landlord Decision Deadline",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Recommendation issued to landlord.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "renewal.renew_or_amend_or_nonrenew",
    title: "Record Renewal Decision",
    description: "Record the landlord's renewal decision and prepare the notice pack if required.",
    lifecycle: "renewal",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Decision",
        description: "Record the decision route and notice pack status.",
        fields: [
          {
            key: "decision_route",
            label: "Renewal Decision",
            type: "select",
            required: true,
            options: [
              { value: "renew", label: "Renew — Same Terms" },
              { value: "amend", label: "Amend — Modified Terms" },
              { value: "nonrenew", label: "Non-Renewal — Tenant Exiting" },
            ],
          },
          {
            key: "notice_pack_status",
            label: "Notice Pack Status",
            type: "select",
            required: true,
            options: [
              { value: "not_required", label: "Not Required" },
              { value: "pending", label: "Pending Preparation" },
              { value: "ready", label: "Ready" },
              { value: "issued", label: "Issued to Tenant" },
              { value: "signed", label: "Signed" },
            ],
          },
          {
            key: "notice_pack_reference",
            label: "Notice Pack Reference",
            type: "reference-text",
            required: false,
            placeholder: "NPC-2026-00789",
          },
        ],
      },
      {
        label: "Confirmation",
        description: "Set the target date and any action notes for the next step.",
        fields: [
          {
            key: "target_date",
            label: "Target Signed Pack / Exit Date",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "Prepare renewal documents and send to tenant for signing",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Renewal decision recorded.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "renewal.signed_pack_complete",
    title: "Record Signed Pack",
    description: "Record the signed renewal or notice pack document reference.",
    lifecycle: "renewal",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Signed Pack",
        description: "Enter the signed document reference and confirm the pack is complete.",
        fields: [
          {
            key: "signed_artifact_reference",
            label: "Signed Document Reference",
            type: "reference-text",
            required: true,
            placeholder: "SGN-2026-00001",
          },
          {
            key: "notice_pack_status",
            label: "Notice Pack Status",
            type: "select",
            required: true,
            options: [
              { value: "not_required", label: "Not Required" },
              { value: "pending", label: "Pending Preparation" },
              { value: "ready", label: "Ready" },
              { value: "issued", label: "Issued to Tenant" },
              { value: "signed", label: "Signed" },
            ],
          },
          {
            key: "target_date",
            label: "Target Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Signed pack recorded.",
    allowedRoles: ["PM Coordinator", "Admin / Ejari / Documentation"],
  },

  {
    id: "renewal.next_cycle_scheduled",
    title: "Schedule Next Renewal Cycle",
    description: "Schedule the next renewal trigger date to maintain renewal continuity.",
    lifecycle: "renewal",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Next Cycle",
        description: "Set the trigger date for the next renewal review cycle.",
        fields: [
          {
            key: "target_date",
            label: "Next Renewal Trigger Date",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: false,
            placeholder: "Initiate next renewal review at 120-day mark",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Next renewal cycle scheduled.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },
];

export const RENEWAL_CONFIRM_ACTIONS: ConfirmActionConfig[] = [
  {
    id: "renewal.send_reletting_handoff",
    title: "Send Reletting Handoff",
    description: "Send the reletting handoff to the leasing team after a non-renewal decision.",
    lifecycle: "renewal",
    endpoint: `${BASE}/{id}/send-reletting-handoff`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Reletting handoff sent.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Send Reletting Handoff",
    confirmVariant: "primary",
  },
  {
    id: "renewal.complete_reletting_handoff",
    title: "Complete Reletting Handoff",
    description: "Confirm the reletting handoff has been accepted by the leasing team.",
    lifecycle: "renewal",
    endpoint: `${BASE}/{id}/complete-reletting-handoff`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Reletting handoff complete.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Confirm Reletting Handoff Complete",
    confirmVariant: "primary",
  },
  {
    id: "renewal.open_vacancy_case",
    title: "Open Vacancy Case",
    description: "Open a vacancy case for this unit following a non-renewal decision.",
    lifecycle: "renewal",
    endpoint: `${BASE}/{id}/open-vacancy-case`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Vacancy case opened.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Open Vacancy Case",
    confirmVariant: "primary",
  },
];
