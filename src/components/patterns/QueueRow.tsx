import { memo } from "react";
import { AlertTriangle, Link2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { getQueueConfig } from "../../config/queue-config";
import { useUIStore } from "../../stores/ui-store";
import { Checkbox } from "../primitives/Checkbox";
import { StatusBadge } from "../composites/StatusBadge";
import { OwnerChip } from "../composites/OwnerChip";
import { DueIndicator } from "../composites/DueIndicator";
import { EscalationIndicator } from "../composites/EscalationIndicator";
import type { QueueRow as QueueRowType } from "../../types/api";
import type { EscalationState } from "../../types/enums";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface QueueRowProps {
  row: QueueRowType;
  isSelected: boolean;
  isActive: boolean;
  onSelect: () => void;
  onClick: () => void;
  onDoubleClick: () => void;
  queueKey: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export const QueueRow = memo(function QueueRow({
  row,
  isSelected,
  isActive,
  onSelect,
  onClick,
  onDoubleClick,
  queueKey,
}: QueueRowProps) {
  const rowDensity = useUIStore((s) => s.rowDensity);
  const queueConfig = getQueueConfig(row.queue_key ?? queueKey);
  const linkedCount = row.linked_references?.length ?? 0;
  const escalation = row.escalation_state as EscalationState;

  return (
    <tr
      className={cn(
        "group cursor-pointer border-b border-border-default",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]",
        rowDensity === "compact"
          ? "h-[var(--queue-row-compact-height,36px)]"
          : "h-[var(--queue-row-comfortable-height,44px)]",
        isSelected && "bg-accent-primary-subtle",
        isActive && !isSelected && "bg-bg-active",
        !isSelected && !isActive && "hover:bg-bg-hover",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring-focus)] focus-visible:ring-inset",
      )}
      tabIndex={0}
      aria-label={`${row.title} — ${row.status}`}
      aria-selected={isSelected}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") { e.preventDefault(); onClick(); }
        if (e.key === " ") { e.preventDefault(); onSelect(); }
      }}
      data-active={isActive || undefined}
    >
      {/* Selection checkbox */}
      <td className="w-8 pl-2 pr-0">
        <div
          className={cn(
            "opacity-0 transition-opacity duration-[var(--duration-fast)]",
            "group-hover:opacity-100",
            isSelected && "opacity-100",
          )}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onSelect()}
          />
        </div>
      </td>

      {/* Queue badge */}
      <td className="w-12 px-1">
        {queueConfig && (
          <span
            className={cn(
              "inline-flex items-center justify-center",
              "h-5 min-w-[32px] px-1 rounded-[var(--radius-full)]",
              "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
              "font-[number:var(--text-caption-medium-weight)]",
              "text-white",
            )}
            style={{ backgroundColor: queueConfig.color }}
          >
            {queueConfig.shortLabel}
          </span>
        )}
      </td>

      {/* Title */}
      <td className="min-w-[200px] px-2">
        <div className={cn("flex items-center", isActive && "border-l-[3px] border-l-accent-primary pl-2")}>
          <span
            className={cn(
              "truncate",
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default",
            )}
            title={row.title}
          >
            {row.title}
          </span>
        </div>
      </td>

      {/* Property / Unit context — hidden on small screens */}
      <td className="hidden lg:table-cell w-[160px] px-2">
        <span
          className={cn(
            "block truncate",
            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
            "text-fg-muted",
          )}
          title={row.property_context ?? row.unit_context ?? ""}
        >
          {row.property_context ?? row.unit_context ?? "\u2014"}
        </span>
      </td>

      {/* Status */}
      <td className="w-[140px] px-2">
        <StatusBadge
          status={row.status}
          queueKey={row.queue_key ?? queueKey}
          size="sm"
        />
      </td>

      {/* Owner — hidden on small screens */}
      <td className="hidden md:table-cell w-[120px] px-2">
        <OwnerChip owner={row.current_owner} />
      </td>

      {/* Due — hidden on small screens */}
      <td className="hidden md:table-cell w-[100px] px-2">
        <DueIndicator
          targetDate={row.target_date}
          isOverdue={row.is_overdue || row.overdue === true}
        />
      </td>

      {/* Signals */}
      <td className="w-20 px-2">
        <div className="flex items-center gap-1.5">
          {escalation !== "normal" && (
            <EscalationIndicator state={escalation} />
          )}
          {row.blocker_summary && (
            <AlertTriangle
              size={14}
              className="text-status-warning"
              aria-label="Has blocker"
            />
          )}
          {linkedCount > 0 && (
            <span className="inline-flex items-center gap-0.5 text-fg-muted">
              <Link2 size={12} aria-hidden="true" />
              <span className="text-[length:var(--text-caption-size)]">
                {linkedCount}
              </span>
            </span>
          )}
        </div>
      </td>
    </tr>
  );
});
