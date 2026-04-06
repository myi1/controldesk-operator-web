// ---------------------------------------------------------------------------
// Keyboard shortcuts — declarative registry, resolved by the shortcut hook
// ---------------------------------------------------------------------------

export type ShortcutScope = "global" | "queue" | "detail";

export interface KeyboardShortcut {
  /** Hotkey string — "mod" is resolved to Cmd (macOS) / Ctrl (others). */
  key: string;
  /** Short human-readable label (for the shortcut palette). */
  label: string;
  /** Longer description shown in the help overlay. */
  description: string;
  /** Where the shortcut is active. */
  scope: ShortcutScope;
}

export const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  // ── Global ──────────────────────────────────────────────────────────
  {
    key: "mod+k",
    label: "Command palette",
    description: "Open the command palette to search queues, cases, and actions",
    scope: "global",
  },
  {
    key: "mod+/",
    label: "Keyboard shortcuts",
    description: "Show the keyboard shortcuts help overlay",
    scope: "global",
  },
  {
    key: "mod+b",
    label: "Toggle sidebar",
    description: "Collapse or expand the navigation sidebar",
    scope: "global",
  },
  {
    key: "mod+shift+f",
    label: "Global search",
    description: "Focus the global search input",
    scope: "global",
  },
  {
    key: "mod+,",
    label: "Settings",
    description: "Open user settings",
    scope: "global",
  },

  // ── Queue ───────────────────────────────────────────────────────────
  {
    key: "j",
    label: "Next row",
    description: "Move focus to the next queue row",
    scope: "queue",
  },
  {
    key: "k",
    label: "Previous row",
    description: "Move focus to the previous queue row",
    scope: "queue",
  },
  {
    key: "enter",
    label: "Open case",
    description: "Open the currently focused queue row",
    scope: "queue",
  },
  {
    key: "f",
    label: "Toggle filters",
    description: "Show or hide the filter panel",
    scope: "queue",
  },
  {
    key: "r",
    label: "Refresh",
    description: "Refresh the current queue data",
    scope: "queue",
  },
  {
    key: "s",
    label: "Cycle sort",
    description: "Cycle sort direction on the current column",
    scope: "queue",
  },
  {
    key: "1",
    label: "Filter: overdue",
    description: "Quick-filter to show only overdue items",
    scope: "queue",
  },
  {
    key: "2",
    label: "Filter: blocked",
    description: "Quick-filter to show only blocked items",
    scope: "queue",
  },
  {
    key: "3",
    label: "Filter: escalated",
    description: "Quick-filter to show only escalated items",
    scope: "queue",
  },

  // ── Detail ──────────────────────────────────────────────────────────
  {
    key: "escape",
    label: "Back to queue",
    description: "Close the case detail and return to the queue list",
    scope: "detail",
  },
  {
    key: "a",
    label: "Actions panel",
    description: "Open the protected actions panel for this case",
    scope: "detail",
  },
  {
    key: "t",
    label: "Timeline",
    description: "Jump to the audit timeline section",
    scope: "detail",
  },
  {
    key: "n",
    label: "Add note",
    description: "Open the decision note input for the current case",
    scope: "detail",
  },
  {
    key: "[",
    label: "Previous case",
    description: "Navigate to the previous case in the queue",
    scope: "detail",
  },
  {
    key: "]",
    label: "Next case",
    description: "Navigate to the next case in the queue",
    scope: "detail",
  },
];
