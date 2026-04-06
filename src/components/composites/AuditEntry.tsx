import {
  RefreshCw,
  Play,
  MessageSquare,
  Plus,
  Activity,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { formatDateTime } from "../../lib/date";
import { Badge } from "../primitives/Badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface AuditEntryProps {
  eventType: string;
  beforeState?: string;
  afterState?: string;
  actor: string;
  timestamp: string;
  description?: string;
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

export function AuditEntry({
  eventType,
  beforeState,
  afterState,
  actor,
  timestamp,
  description,
  className,
}: AuditEntryProps) {
  const hasStateChange = beforeState || afterState;

  return (
    <div
      className={cn(
        "flex gap-3",
        "py-2",
        className,
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "mt-0.5 flex shrink-0 items-center justify-center",
          "size-7 rounded-full",
          "bg-bg-surface-inset text-fg-muted",
        )}
      >
        <EventIcon event={eventType} size={14} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Event type + timestamp */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default",
            )}
          >
            {eventType.replace(/_/g, " ")}
          </span>
          <span
            className={cn(
              "shrink-0",
              "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
              "text-fg-muted",
            )}
          >
            {formatDateTime(timestamp)}
          </span>
        </div>

        {/* State change: before → after */}
        {hasStateChange && (
          <div className="mt-1 flex items-center gap-1.5">
            {beforeState && (
              <Badge variant="neutral" size="sm">
                {beforeState}
              </Badge>
            )}
            {beforeState && afterState && (
              <ArrowRight size={12} className="shrink-0 text-fg-muted" aria-hidden="true" />
            )}
            {afterState && (
              <Badge variant="info" size="sm">
                {afterState}
              </Badge>
            )}
          </div>
        )}

        {/* Actor */}
        <p
          className={cn(
            "mt-1",
            "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
            "text-fg-muted",
          )}
        >
          by {actor}
        </p>

        {/* Description */}
        {description && (
          <p
            className={cn(
              "mt-1",
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "text-fg-muted",
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
