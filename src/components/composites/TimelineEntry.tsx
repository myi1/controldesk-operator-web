import {
  RefreshCw,
  Play,
  MessageSquare,
  Plus,
  Activity,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { formatRelative } from "../../lib/date";
import type { AuditTimelineEntry } from "../../types/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface TimelineEntryProps {
  entry: AuditTimelineEntry;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Icon mapping                                                       */
/* ------------------------------------------------------------------ */

const eventIconMap: Record<string, LucideIcon> = {
  status_changed: RefreshCw,
  action_executed: Play,
  note_added: MessageSquare,
  created: Plus,
};

function EventIcon({ event, size }: { event: string; size: number }) {
  const Icon = eventIconMap[event] ?? Activity;
  return <Icon size={size} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function TimelineEntry({ entry, className }: TimelineEntryProps) {

  return (
    <div className={cn("relative flex gap-3", className)}>
      {/* Icon dot */}
      <div
        className={cn(
          "mt-0.5 flex shrink-0 items-center justify-center",
          "size-7 rounded-full",
          "bg-bg-surface-inset text-fg-muted",
        )}
      >
        <EventIcon event={entry.event} size={14} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Header row: title + timestamp */}
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              "truncate",
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default",
            )}
          >
            {entry.title}
          </span>
          <span
            className={cn(
              "shrink-0",
              "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
              "text-fg-muted",
            )}
          >
            {formatRelative(entry.occurred_at)}
          </span>
        </div>

        {/* Summary */}
        {entry.summary && (
          <p
            className={cn(
              "mt-0.5",
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "text-fg-muted",
            )}
          >
            {entry.summary}
          </p>
        )}

        {/* Evidence references */}
        {entry.evidence_references.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
            {entry.evidence_references.map((ref) => (
              <a
                key={`${ref.reference_type}-${ref.reference_id}`}
                href={ref.path ?? "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1",
                  "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                  "text-accent-primary",
                  "hover:underline",
                )}
              >
                <ExternalLink size={12} aria-hidden="true" />
                {ref.label}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
