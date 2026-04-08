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
    id: "maintenance.open",
    title: "Open Maintenance Ticket",
    description: "Open a new maintenance ticket for a unit. Assign urgency, issue type, and liability before triaging.",
    lifecycle: "maintenance",
    endpoint: "/api/v1/operator-shell/maintenance-tickets",
    method: "POST",
    mode: "modal",
    autoFields: false,
    // approval_threshold_snapshot is a required backend field that captures the landlord's
    // approval threshold at the time of ticket creation. Sending 0 is the safe default —
    // the backend will record this value and use it when determining if approval is needed
    // during the quote/approval flow. If the landlord has a real threshold, coordinators
    // should update it via the triage/approval steps.
    fixedPayload: { approval_threshold_snapshot: 0 },
    steps: [
      {
        label: "Ticket Details",
        description: "Describe the maintenance issue and assign the key attributes.",
        fields: [
          {
            key: "property_unit_id",
            label: "Unit",
            type: "unit-picker",
            required: true,
            hint: "Select the unit this maintenance ticket is for.",
          },
          {
            key: "issue_type",
            label: "Issue Type",
            type: "select",
            required: true,
            options: ISSUE_TYPE_OPTIONS,
          },
          {
            key: "urgency",
            label: "Urgency",
            type: "select",
            required: true,
            options: URGENCY_OPTIONS,
          },
          {
            key: "liability_view",
            label: "Liability",
            type: "select",
            required: true,
            options: LIABILITY_OPTIONS,
          },
          {
            key: "report_summary",
            label: "Issue Description",
            type: "textarea",
            required: true,
            placeholder: "Describe the maintenance issue in detail — location, symptoms, and any relevant history.",
            minLength: 10,
          },
          {
            key: "estimated_cost",
            label: "Estimated Cost (AED)",
            type: "number",
            required: false,
            min: 0,
            hint: "Optional. Provide if a rough cost is known.",
          },
          {
            key: "target_date",
            label: "Target Resolution Date",
            type: "date",
            required: true,
          },
          {
            key: "next_action",
            label: "First Action",
            type: "text",
            required: true,
            placeholder: "Contact tenant to arrange access for inspection",
          },
        ],
      },
    ],
    invalidates: ["operator-shell-bootstrap", "queue-rows", "case-detail"],
    successMessage: "Maintenance ticket opened.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator", "Maintenance / Vendor Coordinator"],
  },

  // ISSUE-007: Building-level (common area) maintenance tickets require property_reference_id support.
  // Backend gap: MaintenanceTicketOpenRequest.property_unit_id is required; property_reference_id is not accepted.
  // When backend adds property_reference_id support, add a "maintenance.open_building" runner here.

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

  {
    id: "maintenance.approved",
    title: "Confirm Approval",
    description: "Record that maintenance spend has been approved and proceed to dispatch.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    fixedPayload: { target_status: "approved" },
    steps: [
      {
        label: "Approval Confirmation",
        description: "Confirm the approval decision and set the dispatch target date.",
        fields: [
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "Dispatch vendor following approval confirmation",
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
    successMessage: "Maintenance spend approved.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },

  {
    id: "maintenance.approval_blocked",
    title: "Log Approval Block",
    description: "Record that approval has been blocked and log the reason and next steps.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    fixedPayload: { target_status: "approval_blocked" },
    steps: [
      {
        label: "Approval Block",
        description: "Document why approval was blocked and what action is being taken.",
        fields: [
          {
            key: "report_summary",
            label: "Report Summary",
            type: "textarea",
            required: true,
            placeholder: "Landlord declined to approve cost. Requesting revised quote from vendor.",
            hint: "Describe the reason for the approval block.",
            minLength: 10,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "Request revised quote from vendor within 48 hours",
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
    successMessage: "Approval block logged.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator", "Maintenance / Vendor Coordinator"],
  },

  {
    id: "maintenance.escalated",
    title: "Escalate Ticket",
    description: "Escalate this maintenance ticket for urgent management attention.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    fixedPayload: { target_status: "escalated" },
    steps: [
      {
        label: "Escalation",
        description: "Document the escalation reason and set the resolution target.",
        fields: [
          {
            key: "report_summary",
            label: "Report Summary",
            type: "textarea",
            required: true,
            placeholder: "Tenant complaint unresolved for 14 days. Vendor has not responded. Requires immediate management intervention.",
            hint: "Describe why this ticket is being escalated.",
            minLength: 10,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "PM Manager to contact vendor directly and set hard deadline",
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
    successMessage: "Maintenance ticket escalated.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator", "Maintenance / Vendor Coordinator", "PM Head"],
  },

  {
    id: "maintenance.retrospective_review",
    title: "Open Retrospective Review",
    description: "Flag this resolved ticket for retrospective review — process improvement or SLA analysis.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    fixedPayload: { target_status: "retrospective_review" },
    steps: [
      {
        label: "Retrospective",
        description: "Record the reason this ticket requires retrospective review.",
        fields: [
          {
            key: "report_summary",
            label: "Report Summary",
            type: "textarea",
            required: true,
            placeholder: "Ticket exceeded SLA by 12 days due to vendor coordination breakdown. Review recommended for process improvement.",
            hint: "Describe what should be reviewed and why.",
            minLength: 10,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "Schedule retrospective with Maintenance Coordinator within 7 days",
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
    successMessage: "Ticket flagged for retrospective review.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },

  {
    id: "maintenance.closed",
    title: "Close Ticket",
    description: "Formally close this maintenance ticket after all work is complete and confirmed.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    fixedPayload: { target_status: "closed" },
    steps: [
      {
        label: "Ticket Closure",
        description: "Confirm all work is complete and close this ticket.",
        fields: [
          {
            key: "resolution_summary",
            label: "Resolution Summary",
            type: "textarea",
            required: true,
            placeholder: "All maintenance work completed and verified. Unit inspected. No further action required.",
            minLength: 10,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "Archive job order and update unit maintenance log",
          },
          {
            key: "target_date",
            label: "Closure Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Maintenance ticket closed.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator", "Maintenance / Vendor Coordinator"],
  },

  {
    id: "maintenance.reopened",
    title: "Reopen Ticket",
    description: "Reopen this maintenance ticket — use when work is found to be incomplete or a new fault is discovered.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    fixedPayload: { target_status: "reopened" },
    steps: [
      {
        label: "Reopen",
        description: "Describe why this ticket is being reopened.",
        fields: [
          {
            key: "report_summary",
            label: "Report Summary",
            type: "textarea",
            required: true,
            placeholder: "Pipe leak has recurred 5 days after initial repair. Vendor must return for follow-up inspection and fix.",
            hint: "Describe the reason for reopening.",
            minLength: 10,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "Contact vendor to arrange return visit within 24 hours",
          },
          {
            key: "target_date",
            label: "New Target Resolution Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Maintenance ticket reopened.",
    allowedRoles: ["PM Coordinator", "PM Manager / Senior PM Coordinator", "Maintenance / Vendor Coordinator"],
  },

  {
    id: "maintenance.cancelled_or_not_proceeding",
    title: "Cancel Ticket",
    description: "Cancel this maintenance ticket — use when the work is no longer required or will not proceed.",
    lifecycle: "maintenance",
    endpoint: ADVANCE,
    method: "POST",
    mode: "modal",
    fixedPayload: { target_status: "cancelled_or_not_proceeding" },
    steps: [
      {
        label: "Cancellation",
        description: "Record the reason for cancellation before closing this ticket.",
        fields: [
          {
            key: "report_summary",
            label: "Report Summary",
            type: "textarea",
            required: true,
            placeholder: "Tenant vacated unit before repair could be completed. Work no longer required.",
            hint: "Describe why this ticket is being cancelled.",
            minLength: 10,
          },
          {
            key: "next_action",
            label: "Next Action",
            type: "text",
            required: true,
            placeholder: "Update unit maintenance log and notify landlord",
          },
          {
            key: "target_date",
            label: "Cancellation Date",
            type: "date",
            required: true,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Maintenance ticket cancelled.",
    allowedRoles: ["PM Manager / Senior PM Coordinator", "PM Head"],
  },
];

// Keep these for use when populating options statically
export { URGENCY_OPTIONS, ISSUE_TYPE_OPTIONS, LIABILITY_OPTIONS };
