import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";
import {
  KEYBOARD_SHORTCUTS,
  type ShortcutScope,
} from "../../config/keyboard-shortcuts";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Format a hotkey string into human-readable key badges. */
function formatKey(key: string): string[] {
  const isMac =
    typeof navigator !== "undefined" && /mac/i.test(navigator.platform);

  return key.split("+").map((k) => {
    if (k === "mod") return isMac ? "⌘" : "Ctrl";
    if (k === "shift") return "⇧";
    if (k === "alt") return isMac ? "⌥" : "Alt";
    if (k === "enter") return "↵";
    if (k === "escape") return "Esc";
    if (k === "space") return "Space";
    return k.toUpperCase();
  });
}

const SCOPE_LABELS: Record<ShortcutScope, string> = {
  global: "Global",
  queue: "Queue",
  detail: "Case Detail",
};

const SCOPE_ORDER: ShortcutScope[] = ["global", "queue", "detail"];

/* ------------------------------------------------------------------ */
/*  Key badge                                                          */
/* ------------------------------------------------------------------ */

function KeyBadge({ label }: { label: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center",
        "min-w-[24px] rounded-[var(--radius-sm)] border border-border-default",
        "bg-bg-surface px-1.5 py-0.5",
        "font-mono text-[length:var(--text-caption-size)] text-fg-muted",
      )}
    >
      {label}
    </kbd>
  );
}

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

export interface ShortcutsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ShortcutsModal({ open, onOpenChange }: ShortcutsModalProps) {
  const byScope = new Map<ShortcutScope, typeof KEYBOARD_SHORTCUTS>();
  for (const shortcut of KEYBOARD_SHORTCUTS) {
    const list = byScope.get(shortcut.scope) ?? [];
    list.push(shortcut);
    byScope.set(shortcut.scope, list);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-[rgba(0,0,0,0.48)]",
            "animate-in fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
            "duration-[var(--duration-fast)]",
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
            "w-full max-w-lg max-h-[80vh]",
            "bg-bg-default border border-border-default",
            "rounded-[var(--radius-lg)] shadow-lg",
            "flex flex-col",
            "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            "duration-[var(--duration-fast)]",
            "focus:outline-none",
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-default px-5 py-3.5">
            <Dialog.Title
              className={cn(
                "text-[length:var(--text-body-size)] font-[number:var(--text-body-medium-weight)]",
                "text-fg-default",
              )}
            >
              Keyboard Shortcuts
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="icon" size="sm" aria-label="Close">
                <X size={16} aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>

          {/* Body — scrollable */}
          <div className="overflow-y-auto px-5 py-4 space-y-6">
            {SCOPE_ORDER.map((scope) => {
              const shortcuts = byScope.get(scope);
              if (!shortcuts?.length) return null;
              return (
                <section key={scope}>
                  <h2
                    className={cn(
                      "mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider",
                      "text-fg-faint",
                    )}
                  >
                    {SCOPE_LABELS[scope]}
                  </h2>
                  <div className="divide-y divide-border-default">
                    {shortcuts.map((s) => (
                      <div
                        key={s.key}
                        className="flex items-center justify-between gap-4 py-2"
                      >
                        <span
                          className={cn(
                            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                            "text-fg-default",
                          )}
                        >
                          {s.label}
                        </span>
                        <div className="flex shrink-0 items-center gap-1">
                          {formatKey(s.key).map((k, i) => (
                            <KeyBadge key={i} label={k} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
