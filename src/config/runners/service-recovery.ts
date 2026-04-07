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
];
