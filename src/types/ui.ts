// ---------------------------------------------------------------------------
// UI-layer types — client-only view-state that never crosses the wire
// ---------------------------------------------------------------------------

import type { EscalationState } from "./enums";

/** Filters applied to a queue row listing. */
export interface QueueFilters {
  status?: string;
  owner?: string;
  escalation_state?: EscalationState;
  only_overdue?: boolean;
  search_text?: string;
}

export type SortDirection = "asc" | "desc";

/** Current sort state for a queue table. */
export interface QueueSort {
  column: string;
  direction: SortDirection;
}

/** Row density preference. */
export type RowDensity = "compact" | "comfortable";

/** Theme mode — "system" follows OS preference. */
export type ThemeMode = "system" | "light" | "dark";
