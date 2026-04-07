// ---------------------------------------------------------------------------
// Move-out lifecycle runner configs
// Endpoint base: /api/v1/operator-shell/moveout-cases/{id}
// All advance transitions use: POST {base}/advance
// ---------------------------------------------------------------------------

import type { RunnerConfig, ConfirmActionConfig } from "../../types/runner";

const BASE = "/api/v1/operator-shell/moveout-cases";
const ADVANCE = `${BASE}/{id}/advance`;
const INVALIDATES = ["operator-shell-bootstrap", "queue-rows", "case-detail"];

export const MOVEOUT_RUNNERS: RunnerConfig[] = [
  {
    id: "moveout.offboarding_pack_sent",
    title: "Send Offboarding Pack",
    description: "Record the offboarding pack sent to the tenant and set the target move-out date.",
    lifecycle: "moveout",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Offboarding Pack",
        description: "Enter the offboarding pack reference and target move-out date.",
        fields: [
          {
            key: "offboarding_pack_reference",
            label: "Offboarding Pack Reference",
            type: "reference-text",
            required: true,
            placeholder: "OBP-2026-00123",
            hint: "Document reference for the offboarding pack sent to the tenant.",
          },
          {
            key: "notice_reference",
            label: "Notice Document Reference",
            type: "reference-text",
            required: false,
            placeholder: "NOT-2026-00123",
          },
          {
            key: "target_date",
            label: "Target Move-Out Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Offboarding pack sent.",
    allowedRoles: ["PM Coordinator", "Admin / Ejari / Documentation", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "moveout.moveout_scheduled",
    title: "Schedule Move-Out",
    description: "Confirm the scheduled move-out date and key return status.",
    lifecycle: "moveout",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Move-Out Schedule",
        description: "Set the confirmed move-out date and record key return status.",
        fields: [
          {
            key: "scheduled_moveout_date",
            label: "Confirmed Move-Out Date",
            type: "date",
            required: true,
          },
          {
            key: "key_return_status",
            label: "Key Return Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Not Yet Returned" },
              { value: "logged", label: "Keys Logged / Received" },
            ],
          },
          {
            key: "target_date",
            label: "Target Date",
            type: "date",
            required: true,
            hint: "Must equal or be after the scheduled move-out date.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Move-out date scheduled.",
    allowedRoles: ["Move Team", "PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "moveout.inspection_complete",
    title: "Record Move-Out Inspection",
    description: "Record the move-out inspection evidence and make-good status.",
    lifecycle: "moveout",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Inspection",
        description: "Upload the inspection evidence and record the make-good status.",
        fields: [
          {
            key: "inspection_evidence_reference",
            label: "Inspection Report Reference",
            type: "reference-text",
            required: true,
            placeholder: "INS-2026-00456",
            hint: "Reference to the move-out inspection report.",
          },
          {
            key: "make_good_status",
            label: "Make-Good Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Pending Assessment" },
              { value: "complete", label: "Complete" },
              { value: "handed_over", label: "Handed Over to Contractor" },
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
    successMessage: "Move-out inspection recorded.",
    allowedRoles: ["Move Team", "PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "moveout.utility_and_ejari_closure_tracked",
    title: "Track Utility & Ejari Closure",
    description: "Record the closure status for utilities and Ejari cancellation.",
    lifecycle: "moveout",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Utility & Ejari",
        description: "Record the current closure status for both utilities and Ejari.",
        fields: [
          {
            key: "utility_closure_status",
            label: "Utility Closure Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Pending" },
              { value: "tracked", label: "In Progress / Tracked" },
              { value: "complete", label: "Complete" },
            ],
          },
          {
            key: "ejari_closure_status",
            label: "Ejari Closure Status",
            type: "select",
            required: true,
            options: [
              { value: "pending", label: "Pending" },
              { value: "tracked", label: "In Progress / Tracked" },
              { value: "complete", label: "Complete" },
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
    successMessage: "Utility and Ejari closure tracked.",
    allowedRoles: ["Documentation", "PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "moveout.deposit_reconciliation_prepared",
    title: "Prepare Deposit Reconciliation",
    description: "Record the deposit reconciliation document reference.",
    lifecycle: "moveout",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Deposit Reconciliation",
        description: "Enter the reconciliation document reference and target completion date.",
        fields: [
          {
            key: "deposit_reconciliation_reference",
            label: "Reconciliation Document Reference",
            type: "reference-text",
            required: true,
            placeholder: "REC-2026-00789",
            hint: "Reference to the deposit reconciliation document.",
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
    successMessage: "Deposit reconciliation prepared.",
    allowedRoles: ["Finance / Accounts Support", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "moveout.reletting_ready",
    title: "Confirm Reletting Ready",
    description: "Confirm the unit is ready for re-letting and handoff to the leasing team.",
    lifecycle: "moveout",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Reletting Readiness",
        description: "Confirm the unit is in a state ready for re-letting.",
        fields: [
          {
            key: "target_date",
            label: "Target Date",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: false,
            placeholder: "Send reletting handoff to leasing team",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Unit confirmed as reletting ready.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },

  {
    id: "moveout.closure_approved",
    title: "Approve Move-Out Closure",
    description: "Approve the move-out case for closure and archive the case record.",
    lifecycle: "moveout",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Closure",
        description: "Enter the archive document reference and confirm closure.",
        fields: [
          {
            key: "archive_pack_reference",
            label: "Archive Document Pack Reference",
            type: "reference-text",
            required: false,
            placeholder: "ARC-2026-00001",
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
    invalidates: [...INVALIDATES, "units-bootstrap"],
    successMessage: "Move-out closure approved.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },

  {
    id: "moveout.set_deposit_deductions",
    title: "Record Deposit Deductions",
    description: "Record structured deductions from the tenant deposit before reconciliation.",
    lifecycle: "moveout",
    endpoint: `${BASE}/{id}/deposit-deductions`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Deposit Deductions",
        description: "Enter the deduction details. Run this action once per deduction line.",
        fields: [
          {
            key: "category",
            label: "Deduction Category",
            type: "select",
            required: true,
            options: [
              { value: "cleaning", label: "Cleaning" },
              { value: "repairs", label: "Repairs" },
              { value: "damage", label: "Damage" },
              { value: "rent_arrears", label: "Rent Arrears" },
              { value: "utility_arrears", label: "Utility Arrears" },
              { value: "other", label: "Other" },
            ],
          },
          {
            key: "description",
            label: "Description",
            type: "textarea",
            required: true,
            placeholder: "e.g. Deep clean of kitchen and bathrooms",
            hint: "Describe the reason for this deduction clearly.",
          },
          {
            key: "amount_aed",
            label: "Amount (AED)",
            type: "number",
            required: true,
            min: 0,
            hint: "Enter the deduction amount in AED.",
          },
          {
            key: "evidence_reference",
            label: "Evidence Reference",
            type: "reference-text",
            required: false,
            placeholder: "e.g. PHOTO-2026-001",
            hint: "Reference to supporting evidence (photos, invoices, etc.).",
          },
          {
            key: "deposit_reconciliation_status",
            label: "Reconciliation Status",
            type: "select",
            required: true,
            options: [
              { value: "prepared", label: "Prepared" },
              { value: "approved", label: "Approved" },
              { value: "disbursed", label: "Disbursed" },
            ],
            defaultValue: "prepared",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Deposit deductions recorded.",
    allowedRoles: ["Finance / Accounts Support", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "moveout.set_dilapidation",
    title: "Record Dilapidation Items",
    description: "Record the condition of each area inspected during the move-out inspection.",
    lifecycle: "moveout",
    endpoint: `${BASE}/{id}/dilapidation`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Dilapidation Item",
        description: "Enter the condition and make-good details for each room or area.",
        fields: [
          {
            key: "room_area",
            label: "Room / Area",
            type: "text",
            required: true,
            placeholder: "e.g. Living Room, Master Bedroom, Kitchen",
          },
          {
            key: "condition",
            label: "Condition",
            type: "select",
            required: true,
            options: [
              { value: "good", label: "Good" },
              { value: "fair", label: "Fair" },
              { value: "damaged", label: "Damaged" },
              { value: "missing", label: "Missing" },
            ],
          },
          {
            key: "description",
            label: "Description",
            type: "textarea",
            required: true,
            placeholder: "e.g. Scuff marks on walls, broken door handle",
            hint: "Describe the condition in detail to support any make-good work.",
          },
          {
            key: "make_good_required",
            label: "Make Good Required",
            type: "checkbox",
            required: false,
            defaultValue: false,
          },
          {
            key: "make_good_cost_estimate_aed",
            label: "Make Good Cost Estimate (AED)",
            type: "number",
            required: false,
            min: 0,
            hint: "Estimated cost to restore this area to move-in condition.",
          },
          {
            key: "vendor_job_id",
            label: "Vendor Job Reference",
            type: "reference-text",
            required: false,
            placeholder: "e.g. VJ-2026-001",
            hint: "Link to a vendor job if remediation has been commissioned.",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Dilapidation items recorded.",
    allowedRoles: ["Inspections / Move Team", "PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },
];

export const MOVEOUT_CONFIRM_ACTIONS: ConfirmActionConfig[] = [
  {
    id: "moveout.send_reletting_handoff",
    title: "Send Reletting Handoff",
    description: "Send the reletting handoff to the leasing team to begin the vacancy process.",
    lifecycle: "moveout",
    endpoint: `${BASE}/{id}/send-reletting-handoff`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Reletting handoff sent.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Send Reletting Handoff",
    confirmVariant: "primary",
  },
  {
    id: "moveout.complete_reletting_handoff",
    title: "Complete Reletting Handoff",
    description: "Confirm the reletting handoff has been accepted by the leasing team.",
    lifecycle: "moveout",
    endpoint: `${BASE}/{id}/complete-reletting-handoff`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Reletting handoff complete.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Confirm Reletting Handoff Complete",
    confirmVariant: "primary",
  },
  {
    id: "moveout.open_vacancy_case",
    title: "Open Vacancy Case",
    description: "Open a vacancy case for this unit to begin the re-letting process.",
    lifecycle: "moveout",
    endpoint: `${BASE}/{id}/open-vacancy-case`,
    method: "POST",
    invalidates: INVALIDATES,
    successMessage: "Vacancy case opened for re-letting.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
    confirmLabel: "Open Vacancy Case",
    confirmVariant: "primary",
  },
];
