// ---------------------------------------------------------------------------
// Status configuration — maps queue_key → status → display metadata
// ---------------------------------------------------------------------------

import type { StatusColor } from "../types/enums";

export interface StatusEntry {
  label: string;
  color: StatusColor;
  /** Sort order within the queue (lower = earlier in lifecycle). */
  order: number;
}

export type StatusMap = Record<string, StatusEntry>;

/**
 * Complete status mappings keyed by queue_key.
 * Status strings match the backend domain modules exactly.
 */
export const STATUS_CONFIG: Record<string, StatusMap> = {
  // ── Onboarding ────────────────────────────────────────────────────────
  onboarding_control: {
    new_intake: { label: "New Intake", color: "info", order: 0 },
    documents_pending: { label: "Documents Pending", color: "warning", order: 1 },
    owner_onboarding: { label: "Owner Onboarding", color: "primary", order: 2 },
    property_setup: { label: "Property Setup", color: "primary", order: 3 },
    unit_setup: { label: "Unit Setup", color: "primary", order: 4 },
    ejari_registration: { label: "Ejari Registration", color: "warning", order: 5 },
    listing_activation: { label: "Listing Activation", color: "info", order: 6 },
    completed: { label: "Completed", color: "success", order: 7 },
    on_hold: { label: "On Hold", color: "neutral", order: 8 },
    cancelled: { label: "Cancelled", color: "neutral", order: 9 },
  },

  // ── Vacancy ───────────────────────────────────────────────────────────
  vacancy_control: {
    vacant_available: { label: "Vacant Available", color: "info", order: 0 },
    listing_active: { label: "Listing Active", color: "primary", order: 1 },
    viewing_scheduled: { label: "Viewing Scheduled", color: "primary", order: 2 },
    application_received: { label: "Application Received", color: "warning", order: 3 },
    offer_sent: { label: "Offer Sent", color: "warning", order: 4 },
    contract_pending: { label: "Contract Pending", color: "warning", order: 5 },
    move_in_scheduled: { label: "Move-In Scheduled", color: "primary", order: 6 },
    occupied: { label: "Occupied", color: "success", order: 7 },
    on_hold: { label: "On Hold", color: "neutral", order: 8 },
  },

  // ── Maintenance ───────────────────────────────────────────────────────
  maintenance_control: {
    new_request: { label: "New Request", color: "info", order: 0 },
    triage: { label: "Triage", color: "warning", order: 1 },
    quote_pending: { label: "Quote Pending", color: "warning", order: 2 },
    approval_pending: { label: "Approval Pending", color: "warning", order: 3 },
    vendor_assigned: { label: "Vendor Assigned", color: "primary", order: 4 },
    work_in_progress: { label: "Work in Progress", color: "primary", order: 5 },
    verification_pending: { label: "Verification Pending", color: "warning", order: 6 },
    invoice_pending: { label: "Invoice Pending", color: "warning", order: 7 },
    completed: { label: "Completed", color: "success", order: 8 },
    cancelled: { label: "Cancelled", color: "neutral", order: 9 },
    on_hold: { label: "On Hold", color: "neutral", order: 10 },
  },

  // ── Receivables ───────────────────────────────────────────────────────
  receivables_control: {
    upcoming: { label: "Upcoming", color: "info", order: 0 },
    due: { label: "Due", color: "warning", order: 1 },
    overdue: { label: "Overdue", color: "danger", order: 2 },
    partially_paid: { label: "Partially Paid", color: "warning", order: 3 },
    paid: { label: "Paid", color: "success", order: 4 },
    bounced: { label: "Bounced", color: "danger", order: 5 },
    under_dispute: { label: "Under Dispute", color: "danger", order: 6 },
    write_off_pending: { label: "Write-Off Pending", color: "neutral", order: 7 },
    written_off: { label: "Written Off", color: "neutral", order: 8 },
  },

  // ── Renewals ──────────────────────────────────────────────────────────
  renewal_control: {
    upcoming_renewal: { label: "Upcoming Renewal", color: "info", order: 0 },
    notice_sent: { label: "Notice Sent", color: "primary", order: 1 },
    tenant_response_pending: { label: "Tenant Response Pending", color: "warning", order: 2 },
    negotiation: { label: "Negotiation", color: "warning", order: 3 },
    owner_approval_pending: { label: "Owner Approval Pending", color: "warning", order: 4 },
    contract_renewal: { label: "Contract Renewal", color: "primary", order: 5 },
    ejari_renewal: { label: "Ejari Renewal", color: "primary", order: 6 },
    renewed: { label: "Renewed", color: "success", order: 7 },
    non_renewal: { label: "Non-Renewal", color: "neutral", order: 8 },
    cancelled: { label: "Cancelled", color: "neutral", order: 9 },
  },

  // ── Move-Out ──────────────────────────────────────────────────────────
  moveout_control: {
    notice_received: { label: "Notice Received", color: "info", order: 0 },
    inspection_scheduled: { label: "Inspection Scheduled", color: "primary", order: 1 },
    inspection_completed: { label: "Inspection Completed", color: "primary", order: 2 },
    deductions_pending: { label: "Deductions Pending", color: "warning", order: 3 },
    tenant_clearance: { label: "Tenant Clearance", color: "warning", order: 4 },
    deposit_settlement: { label: "Deposit Settlement", color: "warning", order: 5 },
    ejari_cancellation: { label: "Ejari Cancellation", color: "primary", order: 6 },
    key_handover: { label: "Key Handover", color: "primary", order: 7 },
    closed: { label: "Closed", color: "success", order: 8 },
    cancelled: { label: "Cancelled", color: "neutral", order: 9 },
  },

  // ── Reporting ─────────────────────────────────────────────────────────
  reporting_control: {
    data_collection: { label: "Data Collection", color: "info", order: 0 },
    report_generation: { label: "Report Generation", color: "primary", order: 1 },
    review_pending: { label: "Review Pending", color: "warning", order: 2 },
    approved: { label: "Approved", color: "success", order: 3 },
    sent_to_owner: { label: "Sent to Owner", color: "success", order: 4 },
    revision_requested: { label: "Revision Requested", color: "danger", order: 5 },
  },

  // ── Service Recovery ──────────────────────────────────────────────────
  service_recovery_control: {
    new_complaint: { label: "New Complaint", color: "danger", order: 0 },
    investigating: { label: "Investigating", color: "warning", order: 1 },
    action_plan: { label: "Action Plan", color: "primary", order: 2 },
    in_progress: { label: "In Progress", color: "primary", order: 3 },
    follow_up: { label: "Follow-Up", color: "warning", order: 4 },
    resolved: { label: "Resolved", color: "success", order: 5 },
    closed: { label: "Closed", color: "success", order: 6 },
    escalated: { label: "Escalated", color: "danger", order: 7 },
  },

  // ── Commercial Intake (intake_exceptions) ─────────────────────────────
  intake_exceptions: {
    new_exception: { label: "New Exception", color: "info", order: 0 },
    under_review: { label: "Under Review", color: "warning", order: 1 },
    pending_info: { label: "Pending Info", color: "warning", order: 2 },
    approved: { label: "Approved", color: "success", order: 3 },
    rejected: { label: "Rejected", color: "danger", order: 4 },
    routed: { label: "Routed", color: "primary", order: 5 },
  },

  // ── Approvals ─────────────────────────────────────────────────────────
  approvals: {
    pending: { label: "Pending", color: "warning", order: 0 },
    approved: { label: "Approved", color: "success", order: 1 },
    rejected: { label: "Rejected", color: "danger", order: 2 },
    expired: { label: "Expired", color: "neutral", order: 3 },
  },

  // ── Integration Sync ──────────────────────────────────────────────────
  integration_sync: {
    pending_sync: { label: "Pending Sync", color: "warning", order: 0 },
    syncing: { label: "Syncing", color: "primary", order: 1 },
    synced: { label: "Synced", color: "success", order: 2 },
    sync_error: { label: "Sync Error", color: "danger", order: 3 },
    conflict: { label: "Conflict", color: "danger", order: 4 },
    skipped: { label: "Skipped", color: "neutral", order: 5 },
  },
} as const satisfies Record<string, StatusMap>;

/** Resolve display metadata for a status within a queue. Falls back to a neutral entry. */
export function getStatusEntry(
  queueKey: string,
  status: string,
): StatusEntry {
  const map = STATUS_CONFIG[queueKey];
  if (map && status in map) {
    return map[status];
  }
  // Humanise unknown status values (e.g. "file_check_pending" → "File Check Pending")
  const humanLabel = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
  return { label: humanLabel, color: "neutral", order: 999 };
}
