// ---------------------------------------------------------------------------
// Keyboard shortcut manager
// ---------------------------------------------------------------------------

import { useEffect, useRef } from "react";

export interface KeyboardShortcut {
  /** Key descriptor, e.g. "k", "mod+k", "Escape". */
  key: string;
  handler: () => void;
  enabled?: boolean;
}

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);

function matchesShortcut(e: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split("+");
  const targetKey = parts.pop()!;
  const modifiers = new Set(parts);

  const needsMod = modifiers.has("mod");
  const needsShift = modifiers.has("shift");
  const needsAlt = modifiers.has("alt");

  const modPressed = isMac ? e.metaKey : e.ctrlKey;

  if (needsMod && !modPressed) return false;
  if (!needsMod && modPressed) return false;
  if (needsShift && !e.shiftKey) return false;
  if (needsAlt && !e.altKey) return false;

  return e.key.toLowerCase() === targetKey;
}

/**
 * Register keyboard shortcuts. Uses a ref to avoid re-registering
 * listeners when handler functions change identity.
 */
export function useKeyboard(shortcuts: KeyboardShortcut[]): void {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // Don't intercept shortcuts when the user is typing in an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;
        if (matchesShortcut(e, shortcut.key)) {
          e.preventDefault();
          shortcut.handler();
          return;
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []); // stable — reads from ref
}
