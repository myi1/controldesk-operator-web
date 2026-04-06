import { useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { cn } from "../../lib/cn";
import type { AuditTimelineEntry } from "../../types/api";
import { TimelineEntry } from "../composites/TimelineEntry";
import { EmptyState } from "../composites/EmptyState";
import { Skeleton } from "../primitives/Skeleton";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ActivityTimelineProps {
  entries: AuditTimelineEntry[];
  loading?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Filter categories                                                  */
/* ------------------------------------------------------------------ */

type FilterKey = "all" | "status" | "actions" | "notes" | "system";

interface FilterDef {
  key: FilterKey;
  label: string;
  matchFn: (entry: AuditTimelineEntry) => boolean;
}

const FILTERS: FilterDef[] = [
  { key: "all", label: "All", matchFn: () => true },
  {
    key: "status",
    label: "Status Changes",
    matchFn: (e) => e.event === "status_changed",
  },
  {
    key: "actions",
    label: "Actions",
    matchFn: (e) => e.event === "action_executed",
  },
  {
    key: "notes",
    label: "Notes",
    matchFn: (e) => e.event === "note_added",
  },
  {
    key: "system",
    label: "System",
    matchFn: (e) =>
      e.event !== "status_changed" &&
      e.event !== "action_executed" &&
      e.event !== "note_added",
  },
];

/* ------------------------------------------------------------------ */
/*  Skeleton loader                                                    */
/* ------------------------------------------------------------------ */

function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton variant="avatar" width="28px" height="28px" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="40%" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Filter chip button                                                 */
/* ------------------------------------------------------------------ */

function FilterChipButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "px-2.5 py-1",
        "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
        "rounded-[var(--radius-md)]",
        "cursor-pointer select-none",
        "border",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]",
        active
          ? "bg-accent-primary/10 text-accent-primary border-accent-primary/30 font-[number:var(--text-body-medium-weight)]"
          : "bg-bg-surface text-fg-muted border-border-default hover:bg-bg-hover hover:text-fg-default",
      )}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ActivityTimeline({
  entries,
  loading = false,
}: ActivityTimelineProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const filterDef = FILTERS.find((f) => f.key === activeFilter);
    if (!filterDef || activeFilter === "all") return entries;
    return entries.filter(filterDef.matchFn);
  }, [entries, activeFilter]);

  if (loading) {
    return <TimelineSkeleton />;
  }

  return (
    <div>
      {/* Filter toggles */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        {FILTERS.map((f) => (
          <FilterChipButton
            key={f.key}
            label={f.label}
            active={activeFilter === f.key}
            onClick={() => setActiveFilter(f.key)}
          />
        ))}
      </div>

      {/* Timeline entries */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="No activity recorded yet"
          description="Actions and status changes will appear here."
        />
      ) : (
        <div className="relative">
          {/* Vertical connector line */}
          <div
            className={cn(
              "absolute left-3.5 top-4 bottom-4",
              "w-px bg-border-default",
            )}
            aria-hidden="true"
          />

          {/* Entries */}
          <div className="space-y-4">
            {filtered.map((entry, idx) => (
              <TimelineEntry
                key={`${entry.event}-${entry.occurred_at}-${idx}`}
                entry={entry}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
