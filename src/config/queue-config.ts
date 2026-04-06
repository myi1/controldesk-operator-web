// ---------------------------------------------------------------------------
// Queue registry — single source of truth for queue metadata
// ---------------------------------------------------------------------------

import type { QueueGroup } from "../types/enums";

export interface QueueConfigEntry {
  /** Unique key matching backend queue_key. */
  key: string;
  /** Human-readable label. */
  label: string;
  /** 3-4 character abbreviation for tight layouts. */
  shortLabel: string;
  /** Lucide icon name (resolved at render time, not imported here). */
  iconName: string;
  /** Brand hex colour for the queue pill / sidebar indicator. */
  color: string;
  /** Top-level grouping. */
  group: QueueGroup;
}

export const QUEUE_CONFIG = [
  // ── Personal ──────────────────────────────────────────────────────────
  {
    key: "my_work",
    label: "My Work",
    shortLabel: "MY",
    iconName: "user",
    color: "#6366F1",
    group: "personal",
  },
  {
    key: "intake_exceptions",
    label: "Intake Exceptions",
    shortLabel: "INX",
    iconName: "alert-triangle",
    color: "#F59E0B",
    group: "personal",
  },

  // ── Domain ────────────────────────────────────────────────────────────
  {
    key: "onboarding_control",
    label: "Onboarding Control",
    shortLabel: "ONB",
    iconName: "clipboard-check",
    color: "#10B981",
    group: "domain",
  },
  {
    key: "vacancy_control",
    label: "Vacancy Control",
    shortLabel: "VAC",
    iconName: "building",
    color: "#3B82F6",
    group: "domain",
  },
  {
    key: "maintenance_control",
    label: "Maintenance Control",
    shortLabel: "MNT",
    iconName: "wrench",
    color: "#F97316",
    group: "domain",
  },
  {
    key: "receivables_control",
    label: "Receivables Control",
    shortLabel: "RCV",
    iconName: "banknote",
    color: "#EF4444",
    group: "domain",
  },
  {
    key: "renewal_control",
    label: "Renewal Control",
    shortLabel: "RNW",
    iconName: "refresh-cw",
    color: "#8B5CF6",
    group: "domain",
  },
  {
    key: "moveout_control",
    label: "Move-Out Control",
    shortLabel: "MVO",
    iconName: "truck",
    color: "#EC4899",
    group: "domain",
  },
  {
    key: "reporting_control",
    label: "Reporting Control",
    shortLabel: "RPT",
    iconName: "bar-chart-2",
    color: "#0EA5E9",
    group: "domain",
  },
  {
    key: "service_recovery_control",
    label: "Service Recovery",
    shortLabel: "SRC",
    iconName: "heart-pulse",
    color: "#DC2626",
    group: "domain",
  },

  // ── System ────────────────────────────────────────────────────────────
  {
    key: "approvals",
    label: "Approvals",
    shortLabel: "APR",
    iconName: "shield-check",
    color: "#14B8A6",
    group: "system",
  },
  {
    key: "integration_sync",
    label: "Integration Sync",
    shortLabel: "SYN",
    iconName: "arrow-left-right",
    color: "#64748B",
    group: "system",
  },
  {
    key: "escalation",
    label: "Escalation",
    shortLabel: "ESC",
    iconName: "flame",
    color: "#EF4444",
    group: "system",
  },
  {
    key: "sla_watch",
    label: "SLA Watch",
    shortLabel: "SLA",
    iconName: "timer",
    color: "#F59E0B",
    group: "system",
  },
  {
    key: "handoffs",
    label: "Handoffs",
    shortLabel: "HND",
    iconName: "arrow-right-left",
    color: "#7C3AED",
    group: "system",
  },
  {
    key: "document_completeness",
    label: "Document Completeness",
    shortLabel: "DOC",
    iconName: "file-check",
    color: "#059669",
    group: "system",
  },
] as const satisfies readonly QueueConfigEntry[];

/** Lookup helper — returns undefined for unknown keys. */
export function getQueueConfig(key: string): QueueConfigEntry | undefined {
  return QUEUE_CONFIG.find((q) => q.key === key);
}

/** All queue keys as a typed union. */
export type QueueKey = (typeof QUEUE_CONFIG)[number]["key"];
