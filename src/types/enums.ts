// ---------------------------------------------------------------------------
// Domain enums — string union types (not TS enums) for type-safety + JSON compat
// ---------------------------------------------------------------------------

/** The 12 internal operator roles recognised by ControlDesk. */
export type OperatorRole =
  | "PM Head"
  | "PM Manager"
  | "PM Coordinator"
  | "Admin / Ejari / Documentation"
  | "Finance / Accounts Support"
  | "Head of Leasing"
  | "Leasing Support Interface"
  | "Inspections / Move Team"
  | "Maintenance / Vendor Coordinator"
  | "Landlord Success Manager"
  | "MD / Leadership"
  | "System Automations";

export const ALL_OPERATOR_ROLES: OperatorRole[] = [
  "PM Head",
  "PM Manager",
  "PM Coordinator",
  "Admin / Ejari / Documentation",
  "Finance / Accounts Support",
  "Head of Leasing",
  "Leasing Support Interface",
  "Inspections / Move Team",
  "Maintenance / Vendor Coordinator",
  "Landlord Success Manager",
  "MD / Leadership",
  "System Automations",
];

/** Escalation lifecycle of a queue item. */
export type EscalationState = "normal" | "blocked" | "escalated";

export const ALL_ESCALATION_STATES: EscalationState[] = [
  "normal",
  "blocked",
  "escalated",
];

/** Top-level grouping for queues. */
export type QueueGroup = "personal" | "domain" | "system";

export const ALL_QUEUE_GROUPS: QueueGroup[] = [
  "personal",
  "domain",
  "system",
];

/** Semantic colour bucket — maps to design tokens at render time. */
export type StatusColor =
  | "info"
  | "primary"
  | "warning"
  | "danger"
  | "success"
  | "neutral";

/** Risk classification applied to protected actions. */
export type ActionRiskLevel = "low" | "medium" | "high" | "critical";
