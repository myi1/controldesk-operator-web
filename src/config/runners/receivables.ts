// ---------------------------------------------------------------------------
// Receivables lifecycle runner configs
// Endpoint base: /api/v1/operator-shell/receivables-cases/{id}
// All transitions use: POST {base}/advance
// ---------------------------------------------------------------------------

import type { RunnerConfig } from "../../types/runner";

const BASE = "/api/v1/operator-shell/receivables-cases";
const ADVANCE = `${BASE}/{id}/advance`;
const INVALIDATES = ["operator-shell-bootstrap", "queue-rows", "case-detail"];

// Form options backed by backend frozensets — injected at runtime via resolveFieldOptions
const RECEIPT_STATUS_OPTIONS = [
  { value: "upcoming", label: "Upcoming — Not Yet Due" },
  { value: "due_unpaid", label: "Due and Unpaid" },
  { value: "receipt_pending_match", label: "Receipt Received — Pending Match" },
  { value: "receipt_matched", label: "Matched" },
  { value: "bounced_or_reversed", label: "Bounced / Reversed" },
  { value: "cured", label: "Cured" },
];

const PAYMENT_MATCH_OPTIONS = [
  { value: "clear", label: "Matched and Clear" },
  { value: "pending_review", label: "Pending Manual Review" },
  { value: "unmatched_receipt", label: "Unmatched Receipt" },
];

const FORMAL_NOTICE_APPROVAL_OPTIONS = [
  { value: "not_required", label: "Not Required" },
  { value: "pending", label: "Pending Approval" },
  { value: "approved", label: "Approved" },
];

export const RECEIVABLES_RUNNERS: RunnerConfig[] = [
  {
    id: "receivables.day_3_check_due",
    title: "Log Day 3 Check",
    description: "Record the outcome of the Day 3 arrears check and set the Day 5 reminder date.",
    lifecycle: "receivables",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Day 3 Check",
        description: "Record the date, outcome, and payment status of the Day 3 arrears check.",
        fields: [
          {
            key: "day_3_checked_at",
            label: "Check Date",
            type: "date",
            required: true,
          },
          {
            key: "day_3_check_outcome",
            label: "Check Outcome",
            type: "textarea",
            required: true,
            placeholder: "Contacted tenant via phone. Confirmed payment initiated via bank transfer on 5 Apr.",
            minLength: 10,
          },
          {
            key: "receipt_status",
            label: "Receipt Status",
            type: "select",
            required: true,
            options: RECEIPT_STATUS_OPTIONS,
          },
          {
            key: "payment_match_status",
            label: "Payment Match Status",
            type: "select",
            required: true,
            options: PAYMENT_MATCH_OPTIONS,
          },
          {
            key: "target_date",
            label: "Day 5 Reminder Target Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Day 3 check logged.",
    allowedRoles: ["PM Coordinator", "Finance / Accounts Support", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "receivables.day_5_reminder_due",
    title: "Log Day 5 Reminder",
    description: "Record the Day 5 payment reminder sent to the tenant.",
    lifecycle: "receivables",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Day 5 Reminder",
        description: "Record the date and method of the Day 5 reminder.",
        fields: [
          {
            key: "reminder_sent_at",
            label: "Reminder Date",
            type: "date",
            required: true,
          },
          {
            key: "reminder_summary",
            label: "Reminder Summary",
            type: "textarea",
            required: true,
            placeholder: "WhatsApp message and email sent to tenant. Requested payment by 12 Apr.",
            minLength: 10,
          },
          {
            key: "target_date",
            label: "Day 10 Call Target Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Day 5 reminder logged.",
    allowedRoles: ["PM Coordinator", "Finance / Accounts Support", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "receivables.day_10_call_due",
    title: "Log Day 10 Call",
    description: "Record the outcome of the Day 10 collections call with the tenant.",
    lifecycle: "receivables",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Day 10 Call",
        description: "Record the date and outcome of the Day 10 call.",
        fields: [
          {
            key: "day_10_call_at",
            label: "Call Date",
            type: "date",
            required: true,
          },
          {
            key: "day_10_call_outcome",
            label: "Call Outcome",
            type: "textarea",
            required: true,
            placeholder: "Tenant confirmed payment will be made by 15 Apr. Agreed to daily check-ins.",
            minLength: 10,
          },
          {
            key: "target_date",
            label: "Day 15 Notice Target Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Day 10 call logged.",
    allowedRoles: ["PM Coordinator", "Finance / Accounts Support", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "receivables.day_15_notice_due",
    title: "Log Day 15 Formal Notice",
    description: "Record the formal notice status and set the Day 30 legal review deadline.",
    lifecycle: "receivables",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Formal Notice",
        description: "Record the formal notice approval and send date.",
        fields: [
          {
            key: "formal_notice_approval_status",
            label: "Formal Notice Approval",
            type: "select",
            required: true,
            options: FORMAL_NOTICE_APPROVAL_OPTIONS,
          },
          {
            key: "formal_notice_reference",
            label: "Formal Notice Reference",
            type: "reference-text",
            required: false,
            placeholder: "FN-2026-00123",
          },
          {
            key: "formal_notice_sent_at",
            label: "Notice Sent Date",
            type: "date",
            required: false,
          },
          {
            key: "target_date",
            label: "Day 30 Legal Review Target Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Day 15 formal notice logged.",
    allowedRoles: ["PM Coordinator", "Finance / Accounts Support", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "receivables.day_30_legal_escalation_review",
    title: "Log Day 30 Legal Review",
    description: "Record the legal escalation review and set the referral or resolution target.",
    lifecycle: "receivables",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Legal Review",
        description: "Record evidence of formal notice and current payment match status.",
        fields: [
          {
            key: "formal_notice_reference",
            label: "Formal Notice Reference",
            type: "reference-text",
            required: true,
            placeholder: "FN-2026-00123",
            hint: "Evidence that formal notice was issued.",
          },
          {
            key: "payment_match_status",
            label: "Payment Match Status",
            type: "select",
            required: true,
            options: PAYMENT_MATCH_OPTIONS,
          },
          {
            key: "target_date",
            label: "Legal Referral / Resolution Target",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Day 30 legal escalation review logged.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "Finance / Accounts Support"],
  },

  {
    id: "receivables.resolved_or_escalated",
    title: "Record Resolution",
    description: "Record the resolution or escalation outcome for this receivables case.",
    lifecycle: "receivables",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Resolution",
        description: "Summarise how the arrears were resolved or escalated.",
        fields: [
          {
            key: "resolution_summary",
            label: "Resolution Summary",
            type: "textarea",
            required: true,
            placeholder: "Payment received in full on 20 Apr. Matched to rent event. Case closed.",
            minLength: 20,
          },
          {
            key: "resolved_at",
            label: "Resolution Date",
            type: "date",
            required: true,
          },
          {
            key: "payment_match_status",
            label: "Payment Match Status",
            type: "select",
            required: true,
            options: PAYMENT_MATCH_OPTIONS,
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
    successMessage: "Receivables case resolved.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },

  {
    id: "receivables.arrears_action_blocked",
    title: "Log Blocked Action",
    description: "This case has been flagged as blocked. Record the reason and the action being taken before progressing to resolution.",
    lifecycle: "receivables",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    autoFields: false,
    fixedPayload: { target_status: "arrears_action_blocked" },
    steps: [
      {
        label: "Log Blocking Action",
        description: "This case has been flagged as blocked. Record the reason and the action being taken before progressing to resolution.",
        fields: [
          {
            key: "block_reason",
            label: "Block Reason",
            type: "select",
            required: true,
            options: [
              { value: "legal_referral", label: "Legal Referral" },
              { value: "landlord_hold", label: "Landlord Hold Requested" },
              { value: "disputed_amount", label: "Disputed Amount" },
              { value: "payment_arrangement", label: "Payment Arrangement Agreed" },
              { value: "write_off_review", label: "Write-Off Review" },
              { value: "other", label: "Other" },
            ],
          },
          {
            key: "resolution_notes",
            label: "Action Notes",
            type: "textarea",
            required: true,
            placeholder: "Describe the action being taken and next steps...",
          },
          {
            key: "next_review_date",
            label: "Next Review Date",
            type: "date",
            required: false,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Blocked action logged.",
    allowedRoles: ["PM Coordinator", "Finance / Accounts Support", "PM Manager / Senior PM Coordinator"],
  },
];
