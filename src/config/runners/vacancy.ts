// ---------------------------------------------------------------------------
// Vacancy lifecycle runner configs
// Endpoint base: /api/v1/operator-shell/vacancy-cases/{id}
// All advance transitions use: POST {base}/advance
// ---------------------------------------------------------------------------

import type { RunnerConfig, ConfirmActionConfig } from "../../types/runner";

const BASE = "/api/v1/operator-shell/vacancy-cases";
const ADVANCE = `${BASE}/{id}/advance`;
const INVALIDATES = ["operator-shell-bootstrap", "queue-rows", "case-detail"];

export const VACANCY_RUNNERS: RunnerConfig[] = [
  {
    id: "vacancy.pricing_pending",
    title: "Set Pricing",
    description: "Set the asking rent and listing configuration to move the vacancy into Pricing Pending.",
    lifecycle: "vacancy",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Pricing",
        description: "Enter the asking rent and current listing status for this vacancy.",
        fields: [
          {
            key: "asking_rent",
            label: "Asking Rent (AED / month)",
            type: "number",
            required: true,
            placeholder: "85000",
            hint: "Monthly rent in AED. Must be greater than 0.",
            min: 1,
          },
          {
            key: "pricing_status",
            label: "Pricing Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Pending Approval" },
              { value: "approved", label: "Approved" },
              { value: "reset_requested", label: "Reset Requested" },
            ],
          },
          {
            key: "pre_listing_works_status",
            label: "Pre-Listing Works",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Pending" },
              { value: "completed", label: "Completed" },
              { value: "waived", label: "Waived — Not Required" },
            ],
          },
          {
            key: "target_tenant_profile_status",
            label: "Target Tenant Profile",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Not Yet Defined" },
              { value: "defined", label: "Profile Defined" },
            ],
          },
          {
            key: "target_date",
            label: "Target Market-Live Date",
            type: "date",
            required: true,
            hint: "Target date to go market-live with this unit.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Pricing set. Vacancy case is now in Pricing Pending.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator", "Head of Leasing"],
  },

  {
    id: "vacancy.lease_readiness_pending",
    title: "Confirm Lease Readiness",
    description: "Confirm that the unit, listing pack, and access are ready for lease-up to proceed.",
    lifecycle: "vacancy",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Readiness Check",
        description: "Confirm the lease readiness gate status, listing pack, and access for this unit.",
        fields: [
          {
            key: "lease_readiness_gate_status",
            label: "Lease Readiness Gate",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "blocked", label: "Blocked" },
            ],
          },
          {
            key: "listing_pack_status",
            label: "Listing Pack Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Not Ready" },
              { value: "ready", label: "Ready" },
            ],
          },
          {
            key: "listing_pack_reference",
            label: "Listing Pack Reference",
            type: "reference-text",
            required: false,
            placeholder: "LP-2026-00456",
            hint: "Listing pack document reference (if available).",
          },
          {
            key: "access_status",
            label: "Access Status",
            type: "select",
            required: true,
            options: [
              { value: "blocked", label: "Access Blocked" },
              { value: "ready", label: "Access Ready" },
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
    successMessage: "Lease readiness confirmed.",
    allowedRoles: ["Head of Leasing", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "vacancy.market_live",
    title: "Go Market Live",
    description: "Mark the unit as market-live and open for viewings.",
    lifecycle: "vacancy",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Market Live",
        description: "Set the expected date of first viewings and any initial leasing notes.",
        fields: [
          {
            key: "target_date",
            label: "Expected First Viewings Date",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: false,
            placeholder: "Schedule first viewing appointments and update listing portals",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Unit is now Market Live.",
    allowedRoles: ["Head of Leasing", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "vacancy.applications_pending",
    title: "Record Applications",
    description: "Record received applications and upload the offer summary for landlord review.",
    lifecycle: "vacancy",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Applications",
        description: "Record the offer summary status and set the landlord decision deadline.",
        fields: [
          {
            key: "offer_summary_status",
            label: "Offer Summary Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Awaiting Upload" },
              { value: "uploaded", label: "Uploaded" },
            ],
          },
          {
            key: "offer_summary_reference",
            label: "Offer Summary Reference",
            type: "reference-text",
            required: false,
            placeholder: "OS-2026-00789",
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
    successMessage: "Applications recorded. Awaiting landlord decision.",
    allowedRoles: ["Head of Leasing", "PM Coordinator"],
  },

  {
    id: "vacancy.landlord_decision_pending",
    title: "Request Landlord Decision",
    description: "Escalate to landlord for a decision on the received applications.",
    lifecycle: "vacancy",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Landlord Decision",
        description: "Set the decision deadline and any instructions for the landlord.",
        fields: [
          {
            key: "target_date",
            label: "Decision Deadline",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: false,
            placeholder: "Follow up with landlord by phone if no response within 48 hours",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Landlord decision requested.",
    allowedRoles: ["Head of Leasing", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "vacancy.contract_ejari_pending",
    title: "Record Contract & Ejari",
    description: "Record the contract pack and initiate the Ejari registration process.",
    lifecycle: "vacancy",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Contract & Ejari",
        description: "Confirm contract pack readiness, Ejari gate status, and target move-in date.",
        fields: [
          {
            key: "contract_pack_status",
            label: "Contract Pack Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Not Ready" },
              { value: "ready", label: "Ready" },
            ],
          },
          {
            key: "contract_pack_reference",
            label: "Contract Pack Reference",
            type: "reference-text",
            required: false,
            placeholder: "CP-2026-00321",
          },
          {
            key: "contract_to_move_in_gate_status",
            label: "Contract to Move-In Gate",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Pending" },
              { value: "approved", label: "Approved" },
              { value: "blocked", label: "Blocked" },
            ],
          },
          {
            key: "target_date",
            label: "Target Ejari / Move-In Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Contract and Ejari process initiated.",
    allowedRoles: ["Head of Leasing", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "vacancy.configure_tenancy",
    title: "Configure Tenancy Record",
    description: "Set up the tenancy record with contract dates, Ejari reference, and payment schedule.",
    lifecycle: "vacancy",
    endpoint: `${BASE}/{id}/configure-tenancy-record`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Tenancy Setup",
        description: "Enter the tenancy contract dates and Ejari registration details.",
        fields: [
          {
            key: "contract_start_date",
            label: "Contract Start Date",
            type: "date",
            required: true,
            hint: "Confirmed tenancy start date.",
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
    successMessage: "Tenancy record configured. Tenancy is now active.",
    allowedRoles: ["Head of Leasing", "PM Manager / Senior PM Coordinator"],
  },
];

export const VACANCY_CONFIRM_ACTIONS: ConfirmActionConfig[] = [
  {
    id: "vacancy.send_contract_handoff",
    title: "Send Contract Handoff",
    description: "Send the contract handoff to the documentation team. This will initiate the Ejari process.",
    lifecycle: "vacancy",
    endpoint: `${BASE}/{id}/send-contract-handoff`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Contract handoff sent.",
    allowedRoles: ["Head of Leasing", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Send Contract Handoff",
    confirmVariant: "primary",
  },
  {
    id: "vacancy.complete_contract_handoff",
    title: "Complete Contract Handoff",
    description: "Confirm the contract handoff is complete and all documentation has been received.",
    lifecycle: "vacancy",
    endpoint: `${BASE}/{id}/complete-contract-handoff`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Contract handoff complete.",
    allowedRoles: ["Head of Leasing", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Confirm Contract Handoff Complete",
    confirmVariant: "primary",
  },
];
