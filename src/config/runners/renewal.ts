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
          {
            key: "override_justification",
            label: "RERA Override Justification",
            type: "textarea",
            required: false,
            placeholder: "Rent increase exceeds RERA cap by 5%. Landlord-tenant mutual agreement documented in signed addendum REF-2026-00123.",
            hint: "RERA Rental Index: Verify the proposed rent against the DLD Rental Index (recorded via the DLD Index Check step). Increases exceeding the RERA-permitted range require override justification. This is a warning — you may proceed, but the override will be logged.",
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

export const RENEWAL_LEGAL_RUNNERS: RunnerConfig[] = [
  {
    id: "renewal.dld_index_check",
    title: "Record DLD Rental Index",
    description: "Record the DLD Rental Index check, permitted increase percentage, and reference document.",
    lifecycle: "renewal",
    endpoint: `${BASE}/{id}/dld-index`,
    method: "PUT",
    mode: "modal",
    steps: [
      {
        label: "DLD Rental Index",
        description: "Enter the DLD Rental Index data for this renewal.",
        fields: [
          {
            key: "dld_rental_index_current_market_aed",
            label: "Current Market Rent (AED)",
            type: "number",
            required: true,
          },
          {
            key: "dld_rental_index_increase_permitted_pct",
            label: "Permitted Increase (%)",
            type: "number",
            required: true,
          },
          {
            key: "dld_rental_index_reference",
            label: "DLD Index Reference",
            type: "text",
            required: true,
            placeholder: "DLD-IDX-2026-00001",
          },
          {
            key: "dld_rental_index_checked_by",
            label: "Checked By",
            type: "text",
            required: true,
            placeholder: "Staff name or ID",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "DLD Rental Index recorded.",
    allowedRoles: [
      "PM Coordinator",
      "PM Manager / Senior PM Coordinator",
      "Admin / Ejari / Documentation",
    ],
  },

  {
    id: "renewal.article_notice_record",
    title: "Record Article Notice Served",
    description: "Record that an Article 14 (rent increase) or Article 25 (eviction) legal notice has been served.",
    lifecycle: "renewal",
    endpoint: `${BASE}/{id}/article-notice`,
    method: "PUT",
    mode: "modal",
    steps: [
      {
        label: "Article Notice",
        description: "Record the legal notice type, service date, and method.",
        fields: [
          {
            key: "article_notice_type",
            label: "Notice Type",
            type: "select",
            required: true,
            options: [
              { value: "article_14", label: "Article 14 (Rent Increase)" },
              { value: "article_25", label: "Article 25 (Eviction)" },
            ],
          },
          {
            key: "article_notice_served_at",
            label: "Date Served",
            type: "date",
            required: true,
          },
          {
            key: "article_notice_service_method",
            label: "Service Method",
            type: "select",
            required: true,
            options: [
              { value: "email", label: "Email" },
              { value: "registered_post", label: "Registered Post" },
              { value: "notary", label: "Notary" },
            ],
          },
          {
            key: "article_notice_reference",
            label: "Notice Reference",
            type: "text",
            required: false,
            placeholder: "NTC-2026-00001",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Article notice recorded.",
    allowedRoles: [
      "PM Coordinator",
      "PM Manager / Senior PM Coordinator",
      "Admin / Ejari / Documentation",
    ],
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
