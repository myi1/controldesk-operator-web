import { memo, useState, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { Separator } from "../primitives/Separator";
import { Tooltip } from "../primitives/Tooltip";
import { QueueCounter } from "../composites/QueueCounter";
import { useUIStore } from "../../stores/ui-store";
import { useBootstrap } from "../../hooks/use-bootstrap";
import { QUEUE_CONFIG, type QueueConfigEntry } from "../../config/queue-config";
import { queuePath } from "../../config/routes";
import type { QueueGroup } from "../../types/enums";

const GROUP_LABELS: Record<QueueGroup, string> = {
  personal: "Personal Scopes",
  domain: "Domain Queues",
  system: "System",
};

/* ------------------------------------------------------------------ */
/*  Collapsible group                                                  */
/* ------------------------------------------------------------------ */

const SidebarGroup = memo(function SidebarGroup({
  group,
  entries,
  collapsed,
  queueCounts,
}: {
  group: QueueGroup;
  entries: readonly QueueConfigEntry[];
  collapsed: boolean;
  queueCounts: Map<string, { count: number; overdueCount: number }>;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div>
      {/* Group header */}
      {!collapsed && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "flex w-full items-center gap-1 px-3 py-1.5",
            "text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider",
            "text-fg-faint",
            "cursor-pointer select-none",
            "hover:text-fg-muted",
          )}
        >
          <ChevronDown
            size={12}
            className={cn(
              "shrink-0 transition-transform duration-[var(--duration-fast)]",
              !open && "-rotate-90",
            )}
          />
          {GROUP_LABELS[group]}
        </button>
      )}

      {/* Items */}
      {(collapsed || open) && (
        <div className="flex flex-col gap-0.5 px-2">
          {entries.map((entry) => {
            const counts = queueCounts.get(entry.key);
            const count = counts?.count ?? 0;
            const overdueCount = counts?.overdueCount ?? 0;

            const item = (
              <NavLink
                key={entry.key}
                to={queuePath(entry.key)}
                className="block"
              >
                {({ isActive }) => (
                  <QueueCounter
                    queueKey={entry.key}
                    label={entry.label}
                    count={count}
                    overdueCount={overdueCount}
                    isActive={isActive}
                    collapsed={collapsed}
                  />
                )}
              </NavLink>
            );

            if (collapsed) {
              return (
                <Tooltip key={entry.key} content={entry.label} side="right">
                  {item}
                </Tooltip>
              );
            }

            return item;
          })}
        </div>
      )}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/*  Main Sidebar                                                       */
/* ------------------------------------------------------------------ */

export const Sidebar = memo(function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const { data } = useBootstrap();

  // Build a lookup map from queue_key -> counts
  const queueCounts = useMemo(() => {
    const map = new Map<string, { count: number; overdueCount: number }>();
    if (data?.queue_summaries) {
      for (const qs of data.queue_summaries) {
        map.set(qs.queue_key, {
          count: qs.count,
          overdueCount: qs.overdue_count,
        });
      }
    }
    return map;
  }, [data?.queue_summaries]);

  // Group entries — QUEUE_CONFIG is module-level const, so these never change.
  // useMemo here is mostly for future-proofing if QUEUE_CONFIG ever becomes dynamic.
  const personalEntries = useMemo(
    () => QUEUE_CONFIG.filter((q) => q.group === "personal"),
    [],
  );
  const domainEntries = useMemo(
    () => QUEUE_CONFIG.filter((q) => q.group === "domain"),
    [],
  );
  const systemEntries = useMemo(
    () => QUEUE_CONFIG.filter((q) => q.group === "system"),
    [],
  );

  return (
    <aside
      aria-label="Navigation"
      className={cn(
        "fixed left-0 top-[var(--topbar-height)] bottom-0",
        "z-[var(--z-sidebar)]",
        "flex flex-col",
        "border-r border-border-default bg-bg-sidebar",
        "overflow-y-auto overflow-x-hidden",
        "transition-[width] duration-[var(--duration-normal)] ease-[var(--ease-default)]",
        collapsed
          ? "w-[var(--sidebar-collapsed-width)]"
          : "w-[var(--sidebar-width)]",
      )}
    >
      <nav className="flex flex-1 flex-col gap-1 py-2">
        {/* Personal scopes */}
        <SidebarGroup
          group="personal"
          entries={personalEntries}
          collapsed={collapsed}
          queueCounts={queueCounts}
        />

        <div className="px-3 py-1">
          <Separator />
        </div>

        {/* Domain queues */}
        <SidebarGroup
          group="domain"
          entries={domainEntries}
          collapsed={collapsed}
          queueCounts={queueCounts}
        />

        <div className="px-3 py-1">
          <Separator />
        </div>

        {/* System */}
        <SidebarGroup
          group="system"
          entries={systemEntries}
          collapsed={collapsed}
          queueCounts={queueCounts}
        />
      </nav>
    </aside>
  );
});
