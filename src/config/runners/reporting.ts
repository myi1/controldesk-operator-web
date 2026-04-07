// ---------------------------------------------------------------------------
// Reporting lifecycle runner configs
// Endpoint base: /api/v1/operator-shell/report-cycles/{id}
// All advance transitions use: POST {base}/advance
// ---------------------------------------------------------------------------

import type { RunnerConfig } from "../../types/runner";

const BASE = "/api/v1/operator-shell/report-cycles";
const ADVANCE = `${BASE}/{id}/advance`;
const INVALIDATES = ["operator-shell-bootstrap", "queue-rows", "case-detail"];

const REPORT_MATCH_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "clear", label: "Clear" },
  { value: "exception", label: "Exception — Requires Review" },
];

const PM_FEE_POSTING_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "posted", label: "Posted" },
  { value: "not_applicable", label: "Not Applicable" },
];

const MAINTENANCE_EVIDENCE_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "complete", label: "Complete" },
];

const REVIEW_STATUS_OPTIONS = [
  { value: "not_requested", label: "Not Requested" },
  { value: "requested", label: "Requested" },
  { value: "approved", label: "Approved" },
  { value: "corrections_required", label: "Corrections Required" },
];

export const REPORTING_RUNNERS: RunnerConfig[] = [
  {
    id: "reporting.finance_match_pending",
    title: "Submit for Finance Match",
    description: "Submit the report cycle for finance matching and reconciliation.",
    lifecycle: "reporting",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Finance Match",
        description: "Record the current receipt and expense match status.",
        fields: [
          {
            key: "receipt_match_status",
            label: "Receipt Match Status",
            type: "select",
            required: true,
            options: REPORT_MATCH_OPTIONS,
          },
          {
            key: "expense_match_status",
            label: "Expense Match Status",
            type: "select",
            required: true,
            options: REPORT_MATCH_OPTIONS,
          },
          {
            key: "target_date",
            label: "Finance Match Completion Target",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Report submitted for finance matching.",
    allowedRoles: ["PM Coordinator", "Finance / Accounts Support"],
  },

  {
    id: "reporting.draft_ready",
    title: "Confirm Finance Match",
    description: "Confirm finance matching is complete and mark the report as draft ready.",
    lifecycle: "reporting",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Finance Confirmation",
        description: "Confirm match statuses, PM fee posting, and maintenance evidence status.",
        fields: [
          {
            key: "receipt_match_status",
            label: "Receipt Match Status",
            type: "select",
            required: true,
            options: REPORT_MATCH_OPTIONS,
          },
          {
            key: "expense_match_status",
            label: "Expense Match Status",
            type: "select",
            required: true,
            options: REPORT_MATCH_OPTIONS,
          },
          {
            key: "pm_fee_posting_status",
            label: "PM Fee Posting Status",
            type: "select",
            required: true,
            options: PM_FEE_POSTING_OPTIONS,
          },
          {
            key: "maintenance_evidence_status",
            label: "Maintenance Evidence Status",
            type: "select",
            required: true,
            options: MAINTENANCE_EVIDENCE_OPTIONS,
          },
          {
            key: "target_date",
            label: "Review Submission Target",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Finance match confirmed. Report is draft ready.",
    allowedRoles: ["Finance / Accounts Support", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "reporting.generate_pack",
    title: "Generate Report Pack",
    description: "Generate the landlord report pack for this report cycle.",
    lifecycle: "reporting",
    endpoint: `${BASE}/{id}/generate-pack`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Pack Generation",
        description: "Confirm the next action and target date for the generated report pack.",
        fields: [
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "Submit generated pack to PM Manager for review",
          },
          {
            key: "target_date",
            label: "Target Date",
            type: "date",
            required: true,
          },
          {
            key: "as_of_date",
            label: "Snapshot Date",
            type: "date",
            required: false,
            hint: "Snapshot date for the pack — defaults to end of reporting month if blank.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Report pack generated.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "reporting.under_review",
    title: "Submit for Review",
    description: "Submit the report pack for PM Manager review.",
    lifecycle: "reporting",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Submit for Review",
        description: "Set the review status and target review completion date.",
        fields: [
          {
            key: "review_status",
            label: "Review Status",
            type: "select",
            required: true,
            options: REVIEW_STATUS_OPTIONS,
          },
          {
            key: "report_reference",
            label: "Draft Report Reference",
            type: "reference-text",
            required: false,
            placeholder: "RPT-2026-00123",
          },
          {
            key: "target_date",
            label: "Review Completion Deadline",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Report submitted for review.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "reporting.send_ready",
    title: "Approve Report",
    description: "Approve the report pack and mark it ready to send to the landlord.",
    lifecycle: "reporting",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Approval",
        description: "Set the review status to approved and target send date.",
        fields: [
          {
            key: "review_status",
            label: "Review Status",
            type: "select",
            required: true,
            options: REVIEW_STATUS_OPTIONS,
          },
          {
            key: "target_date",
            label: "Send Target Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Report approved for sending.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },

  {
    id: "reporting.sent",
    title: "Send Report to Landlord",
    description: "Record the final report sent to the landlord.",
    lifecycle: "reporting",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Send Report",
        description: "Enter the sent report reference and date of delivery.",
        fields: [
          {
            key: "report_reference",
            label: "Final Report Reference",
            type: "reference-text",
            required: true,
            placeholder: "RPT-FINAL-2026-00123",
          },
          {
            key: "sent_at",
            label: "Date Sent",
            type: "date",
            required: true,
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
    successMessage: "Report sent to landlord.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "reporting.correction_required",
    title: "Request Correction",
    description: "Return the report for corrections and set the correction deadline.",
    lifecycle: "reporting",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Correction Request",
        description: "Enter the correction notes and deadline.",
        fields: [
          {
            key: "correction_reference",
            label: "Correction Notes Reference",
            type: "reference-text",
            required: true,
            placeholder: "COR-2026-00456",
            hint: "Reference to correction notes or document.",
          },
          {
            key: "review_status",
            label: "Review Status",
            type: "select",
            required: true,
            options: REVIEW_STATUS_OPTIONS,
          },
          {
            key: "target_date",
            label: "Correction Completion Deadline",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Correction requested.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },
];
