// ---------------------------------------------------------------------------
// Commercial Intake lifecycle runner configs
// Phase 9 — Lead Qualification + Commercial Intake Enrichment
// Endpoint base: /api/v1/operator-shell/commercial-intake-cases
// ---------------------------------------------------------------------------

import type { RunnerConfig, ConfirmActionConfig } from "../../types/runner";

const BASE = "/api/v1/operator-shell/commercial-intake-cases";
const INVALIDATES = ["commercial-intake-cases", "operator-shell-bootstrap"];
const ALLOWED_ROLES = ["Landlord Success Manager", "PM Manager / Senior PM Coordinator"];

// ---------------------------------------------------------------------------
// Open a new commercial intake case (Phase 9 enriched form)
// ---------------------------------------------------------------------------

export const COMMERCIAL_INTAKE_OPEN_RUNNER: RunnerConfig = {
  id: "commercial_intake.open_case",
  title: "Open Commercial Intake Case",
  description: "Register a new commercial landlord lead with qualification scoring and compliance pathway.",
  lifecycle: "commercial_intake",
  endpoint: BASE,
  method: "POST",
  mode: "modal",
  autoFields: false,
  steps: [
    {
      label: "Lead Details",
      description: "Core contact and opportunity information for this commercial lead.",
      fields: [
        {
          key: "landlord_name",
          label: "Landlord / Company Name",
          type: "text",
          required: true,
          placeholder: "e.g. Gulf Properties LLC",
        },
        {
          key: "primary_contact_email",
          label: "Primary Contact Email",
          type: "text",
          required: true,
          placeholder: "contact@example.com",
        },
        {
          key: "clozr_opportunity_id",
          label: "Clozr Opportunity ID",
          type: "text",
          required: true,
          placeholder: "OPP-XXXXX",
          hint: "Reference from Clozr CRM — required to link the intake case.",
        },
        {
          key: "requested_service_tier",
          label: "Requested Service Tier",
          type: "select",
          required: true,
          options: [
            { value: "premium", label: "Premium" },
            { value: "standard", label: "Standard" },
            { value: "basic", label: "Basic" },
          ],
        },
        {
          key: "intake_channel",
          label: "Intake Channel",
          type: "select",
          required: true,
          options: [
            { value: "inbound", label: "Inbound" },
            { value: "outbound", label: "Outbound" },
            { value: "referral", label: "Referral" },
            { value: "portal", label: "Portal" },
            { value: "event", label: "Event" },
          ],
        },
        {
          key: "estimated_property_count",
          label: "Estimated Property Count",
          type: "number",
          required: false,
          placeholder: "1",
          min: 1,
          defaultValue: 1,
        },
        {
          key: "service_scope_summary",
          label: "Service Scope Summary",
          type: "textarea",
          required: false,
          placeholder: "Brief summary of the services requested...",
        },
      ],
    },
    {
      label: "Lead Source & Profile",
      description: "Enrich the lead with source attribution and landlord profile data.",
      fields: [
        {
          key: "lead_source",
          label: "Lead Source",
          type: "select",
          required: false,
          options: [
            { value: "referral", label: "Referral" },
            { value: "cold_outreach", label: "Cold Outreach" },
            { value: "inbound", label: "Inbound Inquiry" },
            { value: "portal", label: "Portal Listing" },
            { value: "event", label: "Event / Exhibition" },
          ],
        },
        {
          key: "landlord_type",
          label: "Landlord Type",
          type: "select",
          required: false,
          options: [
            { value: "individual", label: "Individual" },
            { value: "corporate", label: "Corporate" },
            { value: "institutional", label: "Institutional" },
          ],
        },
        {
          key: "community",
          label: "Community / Area",
          type: "text",
          required: false,
          placeholder: "e.g. Downtown Dubai, JVC",
        },
        {
          key: "unit_count_estimate",
          label: "Unit Count Estimate",
          type: "number",
          required: false,
          placeholder: "Number of units",
          min: 1,
        },
        {
          key: "occupancy_status",
          label: "Current Occupancy Status",
          type: "select",
          required: false,
          options: [
            { value: "fully_occupied", label: "Fully Occupied" },
            { value: "partially_occupied", label: "Partially Occupied" },
            { value: "vacant", label: "Vacant" },
          ],
        },
        {
          key: "urgency",
          label: "Urgency",
          type: "select",
          required: false,
          options: [
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ],
        },
        {
          key: "pain_point",
          label: "Primary Pain Point",
          type: "text",
          required: false,
          placeholder: "e.g. vacancy rate, rent collection issues",
        },
        {
          key: "relationship_route",
          label: "Relationship Route",
          type: "select",
          required: false,
          options: [
            { value: "direct", label: "Direct" },
            { value: "agent", label: "Via Agent" },
            { value: "referral_partner", label: "Referral Partner" },
          ],
        },
      ],
    },
    {
      label: "Qualification & Compliance",
      description: "Score the lead and determine the compliance pathway. Score ≥ 6 with a compliance path is required for a Qualified disposition.",
      fields: [
        {
          key: "qualification_score",
          label: "Qualification Score (1–10)",
          type: "number",
          required: false,
          placeholder: "1–10",
          min: 1,
          max: 10,
          hint: "Score ≥ 6 AND a compliance path are required to set disposition to Qualified.",
        },
        {
          key: "complexity_score",
          label: "Complexity Score (1–5)",
          type: "number",
          required: false,
          placeholder: "1–5",
          min: 1,
          max: 5,
        },
        {
          key: "commercial_fit",
          label: "Commercial Fit",
          type: "select",
          required: false,
          options: [
            { value: "strong", label: "Strong" },
            { value: "moderate", label: "Moderate" },
            { value: "weak", label: "Weak" },
          ],
        },
        {
          key: "compliance_path",
          label: "Compliance Path",
          type: "select",
          required: false,
          options: [
            { value: "standard", label: "Standard" },
            { value: "trakheesi", label: "Trakheesi" },
            { value: "ejari_only", label: "Ejari Only" },
            { value: "mixed", label: "Mixed" },
          ],
          hint: "Required for Qualified disposition.",
        },
        {
          key: "trakheesi_readiness",
          label: "Trakheesi Readiness",
          type: "select",
          required: false,
          options: [
            { value: "ready", label: "Ready" },
            { value: "pending", label: "Pending" },
            { value: "not_required", label: "Not Required" },
          ],
        },
        {
          key: "ejari_readiness",
          label: "Ejari Readiness",
          type: "select",
          required: false,
          options: [
            { value: "ready", label: "Ready" },
            { value: "pending", label: "Pending" },
            { value: "not_required", label: "Not Required" },
          ],
        },
        {
          key: "legal_path",
          label: "Legal Path",
          type: "text",
          required: false,
          placeholder: "e.g. RERA dispute, court order",
          hint: "Required if compliance is blocked by a legal issue.",
        },
        {
          key: "white_label_status",
          label: "White Label Status",
          type: "select",
          required: false,
          options: [
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "not_applicable", label: "Not Applicable" },
          ],
        },
      ],
    },
    {
      label: "Disposition & Next Step",
      description: "Set the initial lead disposition and schedule the next follow-up date.",
      fields: [
        {
          key: "disposition",
          label: "Initial Disposition",
          type: "select",
          required: true,
          options: [
            { value: "new", label: "New" },
            { value: "nurture", label: "Nurture" },
          ],
          defaultValue: "new",
          hint: "Use Nurture for leads that need time before qualifying.",
        },
        {
          key: "next_step_date",
          label: "Next Step Date",
          type: "date",
          required: true,
          hint: "Date of next planned action. Cases where this date passes without update are marked Overdue.",
        },
      ],
    },
  ],
  invalidates: INVALIDATES,
  successMessage: "Commercial intake case opened. Lead registered in the pipeline.",
  allowedRoles: ALLOWED_ROLES,
};

// ---------------------------------------------------------------------------
// Advance disposition — set to qualified / not_qualified / compliance_blocked / nurture
// ---------------------------------------------------------------------------

export const COMMERCIAL_INTAKE_DISPOSE_RUNNER: RunnerConfig = {
  id: "commercial_intake.dispose",
  title: "Set Lead Disposition",
  description: "Advance the lead disposition with qualification gate checks and schedule next step.",
  lifecycle: "commercial_intake",
  endpoint: `${BASE}/{id}/advance`,
  method: "POST",
  mode: "modal",
  autoFields: false,
  fixedPayload: { action: "dispose" },
  steps: [
    {
      label: "Disposition Decision",
      description: "Select the new disposition. Gates: Qualified requires score ≥ 6 + compliance path. Compliance Blocked requires a legal path.",
      fields: [
        {
          key: "actor_role",
          label: "Your Role",
          type: "select",
          required: true,
          options: [
            { value: "Landlord Success Manager", label: "Landlord Success Manager" },
            { value: "PM Manager / Senior PM Coordinator", label: "PM Manager" },
          ],
        },
        {
          key: "disposition",
          label: "New Disposition",
          type: "select",
          required: true,
          options: [
            { value: "qualified", label: "Qualified" },
            { value: "not_qualified", label: "Not Qualified" },
            { value: "compliance_blocked", label: "Compliance Blocked" },
            { value: "nurture", label: "Nurture" },
          ],
        },
        {
          key: "qualification_score",
          label: "Qualification Score (1–10)",
          type: "number",
          required: false,
          placeholder: "1–10",
          min: 1,
          max: 10,
          hint: "Required (≥ 6) when setting disposition to Qualified.",
        },
        {
          key: "compliance_path",
          label: "Compliance Path",
          type: "select",
          required: false,
          options: [
            { value: "standard", label: "Standard" },
            { value: "trakheesi", label: "Trakheesi" },
            { value: "ejari_only", label: "Ejari Only" },
            { value: "mixed", label: "Mixed" },
          ],
          hint: "Required when setting disposition to Qualified.",
        },
        {
          key: "legal_path",
          label: "Legal Path",
          type: "text",
          required: false,
          placeholder: "e.g. RERA dispute, court order",
          hint: "Required when setting disposition to Compliance Blocked.",
        },
        {
          key: "next_step_date",
          label: "Next Step Date",
          type: "date",
          required: false,
          hint: "Update the next planned action date.",
        },
        {
          key: "summary",
          label: "Notes",
          type: "textarea",
          required: false,
          placeholder: "Disposition rationale or next-step notes...",
        },
      ],
    },
  ],
  invalidates: INVALIDATES,
  successMessage: "Lead disposition updated.",
  allowedRoles: ALLOWED_ROLES,
};

// ---------------------------------------------------------------------------
// Withdraw intake case
// ---------------------------------------------------------------------------

export const COMMERCIAL_INTAKE_WITHDRAW_ACTION: ConfirmActionConfig = {
  id: "commercial_intake.withdraw",
  title: "Withdraw Intake Case",
  description: "Mark this commercial intake case as withdrawn. This cannot be undone from the open state.",
  lifecycle: "commercial_intake",
  endpoint: `${BASE}/{id}/advance`,
  method: "POST",
  fixedPayload: { action: "withdraw", actor_role: "Landlord Success Manager" },
  invalidates: INVALIDATES,
  successMessage: "Commercial intake case withdrawn.",
  allowedRoles: ALLOWED_ROLES,
  confirmLabel: "Withdraw Case",
  confirmVariant: "danger",
};

export const COMMERCIAL_INTAKE_RUNNERS: RunnerConfig[] = [
  COMMERCIAL_INTAKE_OPEN_RUNNER,
  COMMERCIAL_INTAKE_DISPOSE_RUNNER,
];

export const COMMERCIAL_INTAKE_CONFIRM_ACTIONS: ConfirmActionConfig[] = [
  COMMERCIAL_INTAKE_WITHDRAW_ACTION,
];
