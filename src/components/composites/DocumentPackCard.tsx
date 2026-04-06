import { AlertTriangle } from "lucide-react";
import { cn } from "../../lib/cn";
import { Badge } from "../primitives/Badge";
import { Progress } from "../primitives/Progress";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DocumentPackCardProps {
  name: string;
  totalArtifacts: number;
  receivedArtifacts: number;
  missingArtifacts?: string[];
  releaseState?: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Release state badge variant                                        */
/* ------------------------------------------------------------------ */

function releaseVariant(state: string) {
  switch (state) {
    case "released":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "blocked":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DocumentPackCard({
  name,
  totalArtifacts,
  receivedArtifacts,
  missingArtifacts,
  releaseState,
  className,
}: DocumentPackCardProps) {
  const pct = totalArtifacts > 0
    ? Math.round((receivedArtifacts / totalArtifacts) * 100)
    : 0;

  const isComplete = receivedArtifacts >= totalArtifacts;
  const progressVariant = isComplete ? "success" : "default";

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)]",
        "border border-border-default",
        "bg-bg-default",
        "p-4",
        className,
      )}
    >
      {/* Header: name + release state */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "truncate",
            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
            "font-[number:var(--text-body-medium-weight)]",
            "text-fg-default",
          )}
        >
          {name}
        </span>
        {releaseState && (
          <Badge variant={releaseVariant(releaseState)} size="sm">
            {releaseState}
          </Badge>
        )}
      </div>

      {/* Progress */}
      <div className="mt-3 flex items-center gap-2">
        <Progress
          value={receivedArtifacts}
          max={totalArtifacts}
          variant={progressVariant}
          size="sm"
          className="flex-1"
        />
        <span
          className={cn(
            "shrink-0",
            "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
            "text-fg-muted",
          )}
        >
          {pct}%
        </span>
      </div>

      {/* Counts */}
      <p
        className={cn(
          "mt-1",
          "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
          "text-fg-muted",
        )}
      >
        {receivedArtifacts} of {totalArtifacts} artifacts received
      </p>

      {/* Missing artifacts */}
      {missingArtifacts && missingArtifacts.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center gap-1 text-status-warning">
            <AlertTriangle size={12} aria-hidden="true" />
            <span
              className={cn(
                "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                "font-[number:var(--text-body-medium-weight)]",
              )}
            >
              Missing
            </span>
          </div>
          <ul className="mt-1 space-y-0.5">
            {missingArtifacts.map((artifact) => (
              <li
                key={artifact}
                className={cn(
                  "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                  "text-fg-muted",
                  "pl-4",
                )}
              >
                {artifact}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
