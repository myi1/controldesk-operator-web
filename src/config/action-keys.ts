// ---------------------------------------------------------------------------
// Well-known action keys — used when the client initiates a system action
// rather than executing a backend-defined ProtectedAction.
//
// These must match the action_key values registered in controldesk_core.
// ---------------------------------------------------------------------------

export const ACTION_KEYS = {
  /** Add a plain-text note to a case's audit timeline. */
  ADD_NOTE: "add_note",

  /** Mark a guided runner workflow as complete. */
  COMPLETE_RUNNER: "complete_runner",

  /** Bulk assign cases to a new owner. */
  BULK_ASSIGN: "assign",

  /** Bulk snooze cases until a future date. */
  BULK_SNOOZE: "snooze",

  /** Bulk acknowledge cases (clear escalation). */
  BULK_ACKNOWLEDGE: "acknowledge",
} as const;

export type ActionKey = (typeof ACTION_KEYS)[keyof typeof ACTION_KEYS];
