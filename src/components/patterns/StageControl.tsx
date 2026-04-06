import { AlertTriangle } from "lucide-react";
import { cn } from "../../lib/cn";
import { STATUS_CONFIG, getStatusEntry } from "../../config/status-config";
import { SubStatusRow } from "../composites/SubStatusRow";
import { BlockerCard } from "../composites/BlockerCard";
import type { BlockerBanner } from "../../types/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface StageControlProps {
  queueKey: string;
  currentStatus: string;
  subStatuses: Record<string, string>;
  blockerBanner?: BlockerBanner;
  limitations?: string[];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function StageControl({
  queueKey,
  currentStatus,
  subStatuses,
  blockerBanner,
  limitations,
}: StageControlProps) {
  const statusMap = STATUS_CONFIG[queueKey];

  // Build ordered list of statuses
  const orderedStatuses = statusMap
    ? Object.entries(statusMap)
        .sort(([, a], [, b]) => a.order - b.order)
        .map(([key, entry]) => ({ key, ...entry }))
    : [];

  const currentEntry = getStatusEntry(queueKey, currentStatus);
  const currentOrder = currentEntry.order;

  // Check if blocked or escalated
  const isDanger = blockerBanner != null;

  return (
    <div className="flex flex-col gap-4">
      {/* Horizontal stepper */}
      {orderedStatuses.length > 0 && (
        <div className="flex items-center gap-0 px-2">
          {orderedStatuses.map((status, idx) => {
            const isCompleted = status.order < currentOrder;
            const isCurrent = status.key === currentStatus;
            const isFuture = status.order > currentOrder;

            return (
              <div key={status.key} className="flex items-center flex-1 last:flex-none">
                {/* Dot */}
                <div className="relative group">
                  <div
                    className={cn(
                      "rounded-full transition-all",
                      isCompleted && "size-2.5 bg-status-success",
                      isCurrent && !isDanger && "size-4 bg-accent-primary",
                      isCurrent && isDanger && "size-4 bg-status-danger animate-pulse",
                      isFuture && "size-2.5 border-2 border-fg-faint bg-transparent",
                    )}
                  />
                  {/* Tooltip label */}
                  <span
                    className={cn(
                      "absolute left-1/2 -translate-x-1/2 top-full mt-1",
                      "whitespace-nowrap",
                      "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                      "text-fg-muted",
                      "opacity-0 group-hover:opacity-100 transition-opacity",
                      isCurrent && "opacity-100 font-[number:var(--text-caption-medium-weight)] text-fg-default",
                    )}
                  >
                    {status.label}
                  </span>
                </div>

                {/* Connecting line (not after last) */}
                {idx < orderedStatuses.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-0.5",
                      isCompleted ? "bg-status-success" : "bg-border-default",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Spacer for tooltip labels */}
      {orderedStatuses.length > 0 && <div className="h-2" />}

      {/* Sub-status grid */}
      {Object.keys(subStatuses).length > 0 && (
        <div className="grid grid-cols-1 gap-x-4 gap-y-0 sm:grid-cols-2">
          {Object.entries(subStatuses).map(([key, value]) => (
            <SubStatusRow
              key={key}
              label={key
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" ")}
              value={value}
            />
          ))}
        </div>
      )}

      {/* Blocker card */}
      {blockerBanner && (
        <BlockerCard reason={blockerBanner.reason} />
      )}

      {/* Limitations list */}
      {limitations && limitations.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 text-status-warning">
            <AlertTriangle size={14} aria-hidden="true" />
            <span
              className={cn(
                "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                "font-[number:var(--text-body-medium-weight)]",
              )}
            >
              Missing Artifacts
            </span>
          </div>
          <ul className="space-y-0.5 pl-5">
            {limitations.map((item) => (
              <li
                key={item}
                className={cn(
                  "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                  "text-fg-muted",
                  "list-disc",
                )}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
