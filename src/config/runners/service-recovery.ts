// ---------------------------------------------------------------------------
// Service Recovery lifecycle runner configs
// Endpoint base: /api/v1/operator-shell/service-recovery-cases/{id}
// All advance transitions use: POST {base}/advance
// ---------------------------------------------------------------------------

import type { RunnerConfig } from "../../types/runner";

const BASE = "/api/v1/operator-shell/service-recovery-cases";
const ADVANCE = `${BASE}/{id}/advance`;
const INVALIDATES = ["operator-shell-bootstrap", "queue-rows", "case-detail"];

export const SERVICE_RECOVERY_RUNNERS: RunnerConfig[] = [
  {
    id: "service_recovery.acknowledged",
    title: "Acknowledge Complaint",
    description: "Record the acknowledgement sent to the client and set the plan-set target date.",
    lifecycle: "service_recovery",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Acknowledgement",
        description: "Enter the acknowledgement reference and plan-set target date.",
        fields: [
          {
            key: "acknowledgement_reference",
            label: "Acknowledgement Reference",
            type: "reference-text",
            required: true,
            placeholder: "ACK-2026-00123",
            hint: "Reference to the acknowledgement sent to the client.",
          },
          {
            key: "target_date",
            label: "Plan-Set Target Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Complaint acknowledged.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "Landlord Success Manager"],
  },

  {
    id: "service_recovery.recovery_plan_set",
    title: "Set Recovery Plan",
    description: "Document the recovery plan and target resolution date for this service complaint.",
    lifecycle: "service_recovery",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Recovery Plan",
        description: "Describe the recovery plan and set the resolution target.",
        fields: [
          {
            key: "recovery_plan_summary",
            label: "Recovery Plan Summary",
            type: "textarea",
            required: true,
            placeholder:
              "Immediate landlord call scheduled. Maintenance team dispatched. Weekly progress updates committed.",
            minLength: 30,
          },
          {
            key: "target_date",
            label: "Target Resolution Date",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "Call landlord to confirm receipt of recovery plan",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Recovery plan set.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "Landlord Success Manager"],
  },

  {
    id: "service_recovery.root_cause_logged",
    title: "Log Root Cause",
    description: "Document the root cause analysis for this service failure.",
    lifecycle: "service_recovery",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Root Cause Analysis",
        description: "Analyse and document the root cause of the service failure.",
        fields: [
          {
            key: "root_cause_summary",
            label: "Root Cause Summary",
            type: "textarea",
            required: true,
            placeholder:
              "Repeated maintenance scheduling failures due to vendor coordination gaps. Process breakdown at triage → dispatch handover.",
            minLength: 30,
          },
          {
            key: "target_date",
            label: "Resolution Target",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: false,
            placeholder: "Share root cause summary with PM Head and implement corrective action",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Root cause logged.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "Landlord Success Manager"],
  },

  {
    id: "service_recovery.resolved",
    title: "Record Resolution",
    description: "Record the resolution outcome for this service recovery case.",
    lifecycle: "service_recovery",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Resolution",
        description: "Describe how the complaint was resolved and any commitments made.",
        fields: [
          {
            key: "written_summary_reference",
            label: "Written Resolution Summary Reference",
            type: "reference-text",
            required: false,
            placeholder: "RES-2026-00456",
          },
          {
            key: "notes",
            label: "Resolution Notes",
            type: "textarea",
            required: true,
            placeholder:
              "Landlord accepted apology and corrective action plan. Maintenance completed. Goodwill gesture of fee reduction applied.",
            minLength: 20,
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
    successMessage: "Service recovery case resolved.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "Landlord Success Manager"],
  },

  {
    id: "service_recovery.service_recovery_escalated",
    title: "Escalate Case",
    description: "Escalate this service recovery case to senior management for direct intervention.",
    lifecycle: "service_recovery",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    fixedPayload: { target_status: "service_recovery_escalated" },
    steps: [
      {
        label: "Escalation Details",
        description: "Document the escalation reason and recovery plan before senior handoff.",
        fields: [
          {
            key: "acknowledgement_reference",
            label: "Escalation Reference",
            type: "reference-text",
            required: true,
            placeholder: "ESC-2026-00123",
            hint: "Reference for the escalation communication sent to the client.",
          },
          {
            key: "recovery_plan_summary",
            label: "Escalation Reason & Recovery Plan",
            type: "textarea",
            required: true,
            placeholder:
              "Case escalated due to unresolved complaint beyond standard SLA. Senior PM to take ownership and contact landlord directly.",
            minLength: 30,
          },
          {
            key: "target_date",
            label: "Escalation Resolution Target",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Immediate Next Action",
            type: "text",
            required: true,
            placeholder: "PM Head to call landlord within 24 hours",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Case escalated to senior management.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },

  {
    id: "service_recovery.closed",
    title: "Close Case",
    description: "Formally close this service recovery case after resolution is confirmed.",
    lifecycle: "service_recovery",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    fixedPayload: { target_status: "closed" },
    steps: [
      {
        label: "Case Closure",
        description: "Confirm resolution, document outcomes, and formally close the case.",
        fields: [
          {
            key: "acknowledgement_reference",
            label: "Closure Acknowledgement Reference",
            type: "reference-text",
            required: false,
            placeholder: "ACK-2026-00456",
            hint: "Reference to the final closure communication sent to the client.",
          },
          {
            key: "root_cause_summary",
            label: "Root Cause Summary",
            type: "textarea",
            required: true,
            placeholder:
              "Root cause identified and addressed. Process improvement implemented to prevent recurrence.",
            minLength: 20,
          },
          {
            key: "written_summary_reference",
            label: "Written Summary Reference",
            type: "reference-text",
            required: false,
            placeholder: "RPT-2026-00789",
          },
          {
            key: "notes",
            label: "Closure Notes",
            type: "textarea",
            required: true,
            placeholder:
              "Landlord confirmed satisfaction. All commitments fulfilled. Case closed with no outstanding actions.",
            minLength: 20,
          },
          {
            key: "target_date",
            label: "Closure Date",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Post-Closure Action",
            type: "text",
            required: false,
            placeholder: "30-day follow-up call to confirm continued satisfaction",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Service recovery case closed.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },

  {
    id: "service_recovery.cancelled_or_not_proceeding",
    title: "Cancel Case",
    description:
      "Cancel this service recovery case — use when the complaint is withdrawn or no longer applicable.",
    lifecycle: "service_recovery",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    fixedPayload: { target_status: "cancelled_or_not_proceeding" },
    steps: [
      {
        label: "Cancellation",
        description: "Record the reason for cancellation before closing this case.",
        fields: [
          {
            key: "notes",
            label: "Cancellation Reason",
            type: "textarea",
            required: true,
            placeholder: "Landlord withdrew complaint. No further action required.",
            minLength: 10,
          },
          {
            key: "target_date",
            label: "Cancellation Date",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Follow-Up Action",
            type: "text",
            required: false,
            placeholder: "Log in CRM and notify PM Coordinator",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Service recovery case cancelled.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },
];
