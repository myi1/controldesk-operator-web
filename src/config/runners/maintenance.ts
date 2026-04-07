// ---------------------------------------------------------------------------
// Maintenance lifecycle runner configs
// Endpoint base: /api/v1/operator-shell/maintenance-tickets/{id}
// ---------------------------------------------------------------------------

import type { RunnerConfig } from "../../types/runner";

const BASE_TICKET = "/api/v1/operator-shell/maintenance-tickets";
const ADVANCE = `${BASE_TICKET}/{id}/advance`;
const INVALIDATES = ["operator-shell-bootstrap", "queue-rows", "case-detail"];

// Form options backed by backend frozensets — injected at runtime via resolveFieldOptions
// These are also available from bootstrap form_options.maintenance.*
const URGENCY_OPTIONS = [
  { value: "Routine", label: "Routine — Non-urgent, schedule in next cycle" },
  { value: "Urgent", label: "Urgent — Action required within 48 hours" },
  { value: "Emergency", label: "Emergency — Immediate dispatch required" },
];

const ISSUE_TYPE_OPTIONS = [
  { value: "Access", label: "Access" },
  { value: "Appliance", label: "Appliance" },
  { value: "Cleaning", label: "Cleaning" },
  { value: "Electrical", label: "Electrical" },
  { value: "General Repair", label: "General Repair" },
  { value: "HVAC", label: "HVAC" },
  { value: "Other", label: "Other" },
  { value: "Pest Control", label: "Pest Control" },
  { value: "Plumbing", label: "Plumbing" },
  { value: "Safety", label: "Safety" },
];

const LIABILITY_OPTIONS = [
  { value: "Landlord", label: "Landlord Liability" },
  { value: "Shared", label: "Shared Liability" },
  { value: "Tenant", label: "Tenant Liability" },
  { value: "Under Review", label: "Under Review — Liability TBD" },
];

export const MAINTENANCE_RUNNERS: RunnerConfig[] = [
  {
    id: "maintenance.triaged",
    title: "Triage Maintenance Ticket",
    description: "Triage the maintenance issue by assigning urgency, liability view, and target resolution date.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Triage",
        description: "Assess the issue and assign urgency, liability, and target date.",
        fields: [
          {
            key: "urgency",
            label: "Urgency",
            type: "select",
            required: true,
            // Injected at runtime from bootstrap form_options.maintenance.urgency
            options: [],
          },
          {
            key: "liability_view",
            label: "Liability View",
            type: "select",
            required: true,
            // Injected at runtime from bootstrap form_options.maintenance.liability_view
            options: [],
          },
          {
            key: "issue_type",
            label: "Issue Type (Refined)",
            type: "select",
            required: false,
            hint: "Refine the issue type after physical assessment.",
            // Injected at runtime from bootstrap form_options.maintenance.issue_type
            options: [],
          },
          {
            key: "report_summary",
            label: "Updated Description",
            type: "textarea",
            required: false,
            placeholder: "Leaking pipe under kitchen sink confirmed. Water damage to cabinet visible.",
          },
          {
            key: "target_date",
            label: "Target Resolution Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Maintenance ticket triaged.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator", "Maintenance / Vendor Coordinator"],
  },

  {
    id: "maintenance.quote_requested",
    title: "Request Quote",
    description: "Request a quote from a vendor for the maintenance work.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Quote Request",
        description: "Enter the vendor name and quote deadline.",
        fields: [
          {
            key: "vendor_name",
            label: "Vendor / Contractor Name",
            type: "text",
            required: true,
            placeholder: "Al Baraka Plumbing & Maintenance LLC",
          },
          {
            key: "target_date",
            label: "Quote Deadline",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: false,
            placeholder: "Follow up with vendor if no quote received by deadline",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Quote requested from vendor.",
    allowedRoles: ["PM Coordinator", "Maintenance / Vendor Coordinator"],
  },

  {
    id: "maintenance.quote_received",
    title: "Log Quote",
    description: "Log the received vendor quote and amount.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Quote Details",
        description: "Enter the quote document reference and quoted amount.",
        fields: [
          {
            key: "quote_reference",
            label: "Quote Document Reference",
            type: "reference-text",
            required: true,
            placeholder: "QT-2026-00456",
          },
          {
            key: "quote_amount",
            label: "Quoted Amount (AED)",
            type: "number",
            required: true,
            placeholder: "3500",
            min: 0.01,
          },
          {
            key: "vendor_name",
            label: "Vendor Name",
            type: "text",
            required: false,
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
    successMessage: "Quote logged.",
    allowedRoles: ["PM Coordinator", "Maintenance / Vendor Coordinator"],
  },

  {
    id: "maintenance.approval_required",
    title: "Submit for Approval",
    description: "Submit the maintenance work for landlord or management approval.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Approval Request",
        description: "Confirm the cost for approval and set the approval deadline.",
        fields: [
          {
            key: "estimated_cost",
            label: "Confirmed Cost for Approval (AED)",
            type: "number",
            required: true,
            placeholder: "3500",
            min: 0,
          },
          {
            key: "target_date",
            label: "Approval Deadline",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: false,
            placeholder: "Send cost estimate to landlord for approval",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Submitted for approval.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },

  {
    id: "maintenance.record_approval_decision",
    title: "Record Approval Decision",
    description: "Record the approval decision for a maintenance spend above threshold.",
    lifecycle: "maintenance",
    endpoint: `${BASE_TICKET}/{id}/record-approval-decision`,
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Approval Decision",
        description: "Enter the approval request details and record the decision.",
        fields: [
          {
            key: "approval_request_id",
            label: "Approval Request Record ID",
            type: "reference-text",
            required: true,
            placeholder: "APR-2026-00789",
          },
          {
            key: "approved",
            label: "I approve this maintenance spend",
            type: "checkbox",
            required: true,
          },
          {
            key: "decision_note",
            label: "Decision Note",
            type: "textarea",
            required: false,
            placeholder: "Approved. Quote is within threshold. Proceed with dispatch.",
            hint: "Minimum 10 characters if rejecting.",
            minLength: 10,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "Proceed with vendor dispatch following approval",
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
    successMessage: "Approval decision recorded.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head", "Landlord"],
  },

  {
    id: "maintenance.dispatched",
    title: "Dispatch Vendor",
    description: "Record the vendor dispatch and scheduled visit date.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Dispatch",
        description: "Enter the dispatch reference and scheduled visit date.",
        fields: [
          {
            key: "dispatch_reference",
            label: "Dispatch / Job Order Reference",
            type: "reference-text",
            required: true,
            placeholder: "JO-2026-00321",
          },
          {
            key: "scheduled_for",
            label: "Scheduled Visit Date",
            type: "date",
            required: true,
          },
          {
            key: "vendor_name",
            label: "Vendor Name",
            type: "text",
            required: false,
          },
          {
            key: "target_date",
            label: "Expected Completion Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Vendor dispatched.",
    allowedRoles: ["PM Coordinator", "Maintenance / Vendor Coordinator"],
  },

  {
    id: "maintenance.evidence_received",
    title: "Record Completion Evidence",
    description: "Record the completion evidence and resolution summary for the maintenance work.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Completion Evidence",
        description: "Upload the completion evidence and describe the work completed.",
        fields: [
          {
            key: "completion_evidence_reference",
            label: "Completion Evidence Reference",
            type: "reference-text",
            required: true,
            placeholder: "EVD-2026-00654",
          },
          {
            key: "resolution_summary",
            label: "Work Completed Description",
            type: "textarea",
            required: true,
            placeholder: "Pipe replaced and tested. No further leaks observed. Cabinet dried and treated.",
            minLength: 10,
          },
          {
            key: "resolved_at",
            label: "Date Work Completed",
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
    successMessage: "Completion evidence recorded.",
    allowedRoles: ["PM Coordinator", "Maintenance / Vendor Coordinator"],
  },

  {
    id: "maintenance.emergency_dispatch_authorized",
    title: "Authorize Emergency Dispatch",
    description: "Authorize emergency dispatch, bypassing the standard quote process.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Emergency Authorization",
        description: "Provide justification for emergency dispatch and authorize the spend.",
        fields: [
          {
            key: "emergency_justification",
            label: "Emergency Justification",
            type: "textarea",
            required: true,
            placeholder: "Gas leak detected in kitchen. Immediate shutdown and repair required. Life-safety risk.",
            minLength: 20,
          },
          {
            key: "emergency_authorized_by",
            label: "Authorized By",
            type: "text",
            required: true,
            placeholder: "Ahmed Al Rashid — PM Head",
          },
          {
            key: "estimated_cost",
            label: "Estimated Cost (AED)",
            type: "number",
            required: false,
            min: 0,
          },
          {
            key: "target_date",
            label: "Expected Completion Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Emergency dispatch authorized.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },

  {
    id: "maintenance.landlord_notified",
    title: "Notify Landlord of Emergency Works",
    description: "Record that the landlord has been notified of emergency maintenance works.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    steps: [
      {
        label: "Landlord Notification",
        description: "Enter the notification communication reference.",
        fields: [
          {
            key: "landlord_notification_reference",
            label: "Notification Reference",
            type: "reference-text",
            required: true,
            placeholder: "NOT-2026-00987",
            hint: "Reference to the notification record or communication.",
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
    successMessage: "Landlord notified of emergency works.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator"],
  },
];

// Keep these for use when populating options statically
export { URGENCY_OPTIONS, ISSUE_TYPE_OPTIONS, LIABILITY_OPTIONS };
