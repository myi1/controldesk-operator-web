// ---------------------------------------------------------------------------
// Inspection lifecycle runner configs
// Endpoint base: /api/v1/operator-shell/inspections
// All advance transitions use: POST {base}/{id}/advance
// ---------------------------------------------------------------------------

import type { RunnerConfig } from "../../types/runner";

const BASE = "/api/v1/operator-shell/inspections";
const INVALIDATES = ["inspections-bootstrap"];

export const INSPECTION_RUNNERS: RunnerConfig[] = [
  {
    id: "inspection.schedule",
    title: "Schedule Inspection",
    description: "Create a new inspection case for a unit.",
    lifecycle: "inspection",
    endpoint: BASE,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Inspection Details",
        description: "Enter the unit and inspection schedule details.",
        fields: [
          {
            key: "property_unit_id",
            label: "Unit",
            type: "unit-picker",
            required: true,
            hint: "The unit this inspection is for.",
          },
          {
            key: "inspection_type",
            label: "Inspection Type",
            type: "select",
            required: true,
            options: [
              { value: "periodic", label: "Periodic" },
              { value: "move_in", label: "Move-In" },
              { value: "move_out", label: "Move-Out" },
              { value: "complaint_driven", label: "Complaint Driven" },
              { value: "handover", label: "Handover" },
            ],
            defaultValue: "periodic",
          },
          {
            key: "frequency",
            label: "Frequency",
            type: "select",
            required: true,
            options: [
              { value: "one_off", label: "One-Off" },
              { value: "quarterly", label: "Quarterly" },
              { value: "biannual", label: "Biannual" },
              { value: "annual", label: "Annual" },
            ],
            defaultValue: "one_off",
          },
          {
            key: "scheduled_date",
            label: "Scheduled Date",
            type: "date",
            required: false,
            hint: "Leave blank to schedule later.",
          },
          {
            key: "inspector_name",
            label: "Inspector Name",
            type: "text",
            required: false,
            placeholder: "e.g. Ahmed Al-Farsi",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Inspection scheduled.",
    allowedRoles: [
      "Inspections / Move Team",
      "PM Coordinator",
      "PM Manager / Senior PM Coordinator",
      "PM Head",
    ],
  },
  {
    id: "inspection.start",
    title: "Start Inspection",
    description: "Mark inspection as in-progress with inspector details.",
    lifecycle: "inspection",
    endpoint: `${BASE}/{id}/advance`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    fixedPayload: { target_status: "in_progress" },
    steps: [
      {
        label: "Start Inspection",
        description: "Record the inspector and actual inspection date.",
        fields: [
          {
            key: "inspector_name",
            label: "Inspector Name",
            type: "text",
            required: true,
            placeholder: "e.g. Ahmed Al-Farsi",
          },
          {
            key: "actual_date",
            label: "Inspection Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Inspection started.",
    allowedRoles: [
      "Inspections / Move Team",
      "PM Coordinator",
      "PM Manager / Senior PM Coordinator",
    ],
  },
  {
    id: "inspection.complete",
    title: "Complete Inspection",
    description: "Record findings, condition, and evidence for this inspection.",
    lifecycle: "inspection",
    endpoint: `${BASE}/{id}/advance`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    fixedPayload: { target_status: "completed" },
    steps: [
      {
        label: "Inspection Findings",
        description: "Record the overall condition and supporting evidence.",
        fields: [
          {
            key: "overall_condition",
            label: "Overall Condition",
            type: "select",
            required: true,
            options: [
              { value: "good", label: "Good — No issues" },
              { value: "fair", label: "Fair — Minor issues" },
              { value: "poor", label: "Poor — Significant issues" },
              { value: "unacceptable", label: "Unacceptable — Immediate action required" },
            ],
          },
          {
            key: "evidence_reference",
            label: "Evidence Reference",
            type: "reference-text",
            required: true,
            placeholder: "e.g. INSP-2026-00123",
            hint: "Reference to photo evidence or inspection report document.",
          },
          {
            key: "report_reference",
            label: "Report Reference",
            type: "reference-text",
            required: false,
            placeholder: "e.g. RPT-2026-00123",
          },
          {
            key: "make_good_required",
            label: "Make Good Required",
            type: "checkbox",
            required: false,
            defaultValue: false,
          },
          {
            key: "make_good_notes",
            label: "Make Good Notes",
            type: "textarea",
            required: false,
            placeholder: "Describe what needs to be remediated",
            hint: "Only required if Make Good is checked.",
          },
          {
            key: "next_inspection_due",
            label: "Next Inspection Due",
            type: "date",
            required: false,
            hint: "Leave blank for one-off inspections.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Inspection completed.",
    allowedRoles: [
      "Inspections / Move Team",
      "PM Coordinator",
      "PM Manager / Senior PM Coordinator",
    ],
  },
  {
    id: "inspection.close",
    title: "Close Inspection",
    description: "Close the inspection once all make-good work is resolved.",
    lifecycle: "inspection",
    endpoint: `${BASE}/{id}/advance`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    fixedPayload: { target_status: "closed" },
    steps: [
      {
        label: "Close Inspection",
        description: "Confirm all findings have been addressed.",
        fields: [
          {
            key: "make_good_commissioned_at",
            label: "Make Good Commissioned Date",
            type: "date",
            required: false,
            hint: "Date when remediation work was commissioned, if applicable.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Inspection closed.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },
];
