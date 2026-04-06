import { useState, useCallback } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../lib/cn";
import { CommandItem } from "../composites/CommandItem";
import { useCommandPaletteStore } from "../../stores/command-palette-store";
import { useKeyboard } from "../../hooks/use-keyboard";
import { QUEUE_CONFIG } from "../../config/queue-config";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PaletteResult {
  id: string;
  label: string;
  description?: string;
  group: string;
  path: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function queuePath(key: string): string {
  if (key === "my_work") return "/work";
  if (key === "intake_exceptions") return "/intake";
  return `/queue/${key}`;
}

function buildQueueResults(): PaletteResult[] {
  return QUEUE_CONFIG.map((q) => ({
    id: `queue-${q.key}`,
    label: q.label,
    description: `${q.group} queue`,
    group: "QUEUES",
    path: queuePath(q.key),
  }));
}

const STATIC_ACTIONS: PaletteResult[] = [
  {
    id: "action-settings",
    label: "Settings",
    description: "Open user settings",
    group: "ACTIONS",
    path: "/settings",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CommandPalette() {
  const { isOpen, close, open, toggle } = useCommandPaletteStore();
  const recentItems = useCommandPaletteStore((s) => s.recentItems);
  const addRecent = useCommandPaletteStore((s) => s.addRecent);
  const navigate = useNavigate();

  const [query, setQueryState] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  // Register Cmd+K
  useKeyboard([{ key: "mod+k", handler: toggle }]);

  // Wrapper that also resets activeIndex on query change
  function setQuery(value: string) {
    setQueryState(value);
    setActiveIndex(0);
  }

  // Handle Dialog open/close — reset state when opening
  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setQueryState("");
      setActiveIndex(0);
      open();
    } else {
      close();
    }
  }

  // Build results
  const queueResults = buildQueueResults();
  const allResults: PaletteResult[] = [];

  // Filter
  const q = query.toLowerCase().trim();

  // Recent (only when no search)
  if (!q) {
    const recentResults: PaletteResult[] = recentItems.slice(0, 5).map((r) => ({
      id: r.id,
      label: r.title,
      description: r.type,
      group: "RECENT",
      path: r.path,
    }));
    allResults.push(...recentResults);
  }

  // Queues
  const matchedQueues = q
    ? queueResults.filter((r) => r.label.toLowerCase().includes(q))
    : queueResults;
  allResults.push(...matchedQueues);

  // Actions
  const matchedActions = q
    ? STATIC_ACTIONS.filter((r) => r.label.toLowerCase().includes(q))
    : STATIC_ACTIONS;
  allResults.push(...matchedActions);

  // Group them for rendering
  const groups = new Map<string, PaletteResult[]>();
  for (const r of allResults) {
    const group = groups.get(r.group) ?? [];
    group.push(r);
    groups.set(r.group, group);
  }

  const flatResults = allResults;

  const selectResult = useCallback(
    (result: PaletteResult) => {
      addRecent({
        id: result.id,
        title: result.label,
        type: result.group,
        path: result.path,
      });
      close();
      navigate(result.path);
    },
    [addRecent, close, navigate],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const result = flatResults[activeIndex];
      if (result) selectResult(result);
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-[var(--z-command-palette)]",
            "bg-black/50",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        />
        <Dialog.Content
          aria-label="Command palette"
          onKeyDown={handleKeyDown}
          className={cn(
            "fixed left-1/2 top-[20%] z-[var(--z-command-palette)]",
            "-translate-x-1/2",
            "w-full max-w-[560px]",
            "rounded-[var(--radius-xl)] border border-border-default",
            "bg-bg-surface-raised shadow-lg",
            "flex flex-col overflow-hidden",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
          )}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border-default px-3">
            <Search size={16} className="shrink-0 text-fg-faint" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search queues, cases, and actions..."
              autoFocus
              className={cn(
                "flex-1 bg-transparent py-3",
                "text-[length:var(--text-body-size)] text-fg-default",
                "placeholder:text-fg-faint",
                "outline-none",
              )}
            />
            <Dialog.Close asChild>
              <button
                type="button"
                className="shrink-0 rounded-[var(--radius-sm)] p-0.5 text-fg-faint hover:text-fg-muted cursor-pointer"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </div>

          {/* Results */}
          <div
            role="listbox"
            className="max-h-[360px] overflow-y-auto p-2"
          >
            {flatResults.length === 0 && (
              <div className="px-2 py-6 text-center text-[length:var(--text-small-size)] text-fg-muted">
                No results found
              </div>
            )}

            {Array.from(groups.entries()).map(([groupLabel, items]) => (
              <div key={groupLabel} className="mb-1">
                <div className="px-2 py-1 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                  {groupLabel}
                </div>
                {items.map((item) => {
                  const globalIdx = flatResults.indexOf(item);
                  return (
                    <CommandItem
                      key={item.id}
                      label={item.label}
                      description={item.description}
                      active={globalIdx === activeIndex}
                      onSelect={() => selectResult(item)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
