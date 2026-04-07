// ---------------------------------------------------------------------------
// Tenancy lifecycle runner configs
// Endpoint base: /api/v1/operator-shell/tenancy-records/{id}
// ---------------------------------------------------------------------------

import type { RunnerConfig } from "../../types/runner";

const BASE = "/api/v1/operator-shell/tenancy-records";
const ADVANCE = `${BASE}/{id}/advance`;
const INVALIDATES = ["operator-shell-bootstrap", "queue-rows", "case-detail"];

export const TENANCY_RUNNERS: RunnerConfig[] = [
  {
    id: "tenancy.Active",
    title: "Activate Tenancy",
    description: "Record the confirmed move-in date and activate the tenancy record.",
    lifecycle: "tenancy",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Move-In Details",
        description: "Confirm the actual move-in date and any tenancy registration details.",
        fields: [
          {
            key: "contract_start_date",
            label: "Confirmed Move-In Date",
            type: "date",
            required: true,
            hint: "Must be on or after today.",
          },
          {
            key: "contract_end_date",
            label: "Contract End Date",
            type: "date",
            required: false,
          },
          {
            key: "ejari_reference",
            label: "Ejari Reference",
            type: "reference-text",
            required: false,
            placeholder: "EJR-2026-00001",
            hint: "Ejari registration number from DLD.",
          },
          {
            key: "payment_schedule_summary",
            label: "Payment Schedule Summary",
            type: "textarea",
            required: false,
            placeholder: "4 post-dated cheques: AED 25,000 × 4, due quarterly from 1 June 2026",
          },
        ],
      },
    ],
    invalidates: [...INVALIDATES, "units-bootstrap"],
    successMessage: "Tenancy activated. Unit is now Occupied.",
    allowedRoles: ["PM Coordinator", "Admin / Ejari / Documentation", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "tenancy.Notice",
    title: "Record Notice",
    description: "Record the notice date to initiate the move-out process.",
    lifecycle: "tenancy",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Notice Details",
        description: "Record the date the notice was served or received.",
        fields: [
          {
            key: "notice_date",
            label: "Notice Date",
            type: "date",
            required: true,
            hint: "Date the notice was served or received by the property manager.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Notice recorded. Move-out case can now be opened.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "tenancy.open_moveout_case",
    title: "Open Move-Out Case",
    description: "Open a move-out case linked to this tenancy record.",
    lifecycle: "tenancy",
    endpoint: `${BASE}/{id}/open-moveout-case`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Move-Out Setup",
        description: "Set the first action and expected move-out date for the new move-out case.",
        fields: [
          {
            key: "next_action",
            label: "First Action",
            type: "text",
            required: true,
            placeholder: "Send offboarding pack and schedule move-out inspection",
          },
          {
            key: "target_date",
            label: "Expected Move-Out Date",
            type: "date",
            required: true,
          },
          {
            key: "notice_reference",
            label: "Notice Document Reference",
            type: "reference-text",
            required: false,
            placeholder: "NOT-2026-00123",
            hint: "Reference to the served notice document.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Move-out case opened.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "tenancy.open_renewal_case",
    title: "Open Renewal Case",
    description: "Open a renewal case to begin the 120-day renewal review process.",
    lifecycle: "tenancy",
    endpoint: `${BASE}/{id}/open-renewal-case`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Renewal Setup",
        description: "Set the renewal target milestone and first action.",
        fields: [
          {
            key: "next_action",
            label: "First Action",
            type: "text",
            required: true,
            placeholder: "Score tenant and begin 120-day market review",
          },
          {
            key: "target_date",
            label: "120-Day Milestone Target",
            type: "date",
            required: true,
            hint: "Target date for the 120-day renewal review milestone.",
          },
          {
            key: "current_date",
            label: "Current Date Override",
            type: "date",
            required: false,
            hint: "Defaults to today if left blank.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Renewal case opened.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "tenancy.record_ejari_update",
    title: "Update Ejari Status",
    description: "Record the Ejari registration status and related contract details.",
    lifecycle: "tenancy",
    endpoint: `${BASE}/{id}/ejari-status`,
    method: "PUT",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Ejari Registration",
        description: "Update the Ejari status and registration details for this tenancy.",
        fields: [
          {
            key: "ejari_status",
            label: "Ejari Status",
            type: "select",
            options: [
              { value: "pending", label: "Pending" },
              { value: "registered", label: "Registered" },
              { value: "expired", label: "Expired" },
              { value: "cancelled", label: "Cancelled" },
            ],
            required: true,
          },
          {
            key: "ejari_contract_number",
            label: "Ejari Contract Number",
            type: "text",
            required: false,
          },
          {
            key: "ejari_registered_at",
            label: "Registration Date",
            type: "date",
            required: false,
          },
          {
            key: "ejari_expires_at",
            label: "Expiry Date",
            type: "date",
            required: false,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Ejari status updated.",
    allowedRoles: ["PM Coordinator", "Admin / Ejari / Documentation", "PM Manager / Senior PM Coordinator"],
  },
];
