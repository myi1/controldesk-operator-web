// ---------------------------------------------------------------------------
// CaseStagePanel — persistent right-column info strip for CaseDetailPage
//
// Shows:
//   1. Current stage / status (human-readable, prominent)
//   2. Missing artifacts (document sections with unfilled fields)
//   3. Active blocker (if any)
//   4. Limitations (informational notices from the backend)
// ---------------------------------------------------------------------------

import { useMemo } from "react";
import { ShieldAlert, FileWarning, AlertTriangle, Info } from "lucide-react";
import { cn } from "../../lib/cn";
import type { ContextSection } from "../../types/api";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface CaseStagePanelProps {
  /** Human-readable status string (from StatusBadge config or raw value) */
  statusLabel: string;
  /** CSS color class for the status text, e.g. "text-status-warning" */
  statusColorClass: string;
  /** Active blocker (if any) */
  blockerBanner?: { reason: string; message?: string };
  /** All context sections — used to identify missing artifacts */
  contextSections: ContextSection[];
  /** Backend limitations list */
  limitations: string[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Count document/artifact sections and their missing fields */
function computeMissingArtifacts(
  contextSections: ContextSection[],
): { sectionLabel: string; missingCount: number }[] {
  return contextSections
    .filter(
      (s) =>
        s.section_key.includes("document") ||
        s.section_key.includes("doc_pack") ||
        s.section_key.includes("artifact") ||
        s.section_key.includes("checklist"),
    )
    .map((s) => {
      const missing = s.fields.filter(
        (f) => f.value == null || f.value === "",
      ).length;
      return { sectionLabel: s.label, missingCount: missing };
    })
    .filter((s) => s.missingCount > 0);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function CaseStagePanel({
  statusLabel,
  statusColorClass,
  blockerBanner,
  contextSections,
  limitations,
}: CaseStagePanelProps) {
  const missingArtifacts = useMemo(
    () => computeMissingArtifacts(contextSections),
    [contextSections],
  );

  const totalMissing = missingArtifacts.reduce((n, s) => n + s.missingCount, 0);

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-border-default bg-bg-default",
        "overflow-hidden",
      )}
      aria-label="Case stage summary"
    >
      {/* Stage header */}
      <div className="px-4 pt-4 pb-3 border-b border-border-default">
        <p
          className={cn(
            "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
            "font-semibold uppercase tracking-wider text-fg-faint mb-1",
          )}
        >
          Current Stage
        </p>
        <p
          className={cn(
            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
            "font-semibold",
            statusColorClass,
          )}
        >
          {statusLabel}
        </p>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        {/* Active blocker */}
        {blockerBanner && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-[var(--radius-md)]",
              "bg-status-danger-subtle border border-status-danger/20 px-3 py-2",
            )}
            role="alert"
          >
            <ShieldAlert
              size={14}
              className="mt-0.5 shrink-0 text-status-danger"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                  "font-semibold text-status-danger",
                )}
              >
                {blockerBanner.reason}
              </p>
              {blockerBanner.message && (
                <p
                  className={cn(
                    "mt-0.5",
                    "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                    "text-status-danger/80",
                  )}
                >
                  {blockerBanner.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Missing artifacts */}
        {totalMissing > 0 && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-[var(--radius-md)]",
              "bg-status-warning-subtle border border-status-warning/20 px-3 py-2",
            )}
          >
            <FileWarning
              size={14}
              className="mt-0.5 shrink-0 text-status-warning"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p
                className={cn(
                  "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                  "font-semibold text-status-warning",
                )}
              >
                {totalMissing} artifact{totalMissing !== 1 ? "s" : ""} missing
              </p>
              <ul className="mt-1 space-y-0.5">
                {missingArtifacts.map((s) => (
                  <li
                    key={s.sectionLabel}
                    className={cn(
                      "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                      "text-fg-muted",
                    )}
                  >
                    {s.sectionLabel}: {s.missingCount} missing
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* No issues — all clear */}
        {!blockerBanner && totalMissing === 0 && limitations.length === 0 && (
          <div className="flex items-center gap-2 py-1">
            <div
              className={cn(
                "size-2 rounded-full bg-status-success shrink-0",
              )}
              aria-hidden="true"
            />
            <p
              className={cn(
                "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                "text-fg-muted",
              )}
            >
              No blockers or missing items
            </p>
          </div>
        )}

        {/* Limitations */}
        {limitations.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {limitations.map((lim) => (
              <div
                key={lim}
                className={cn(
                  "flex items-start gap-2 rounded-[var(--radius-md)]",
                  "bg-bg-muted border border-border-default px-3 py-2",
                )}
              >
                <Info
                  size={13}
                  className="mt-0.5 shrink-0 text-fg-muted"
                  aria-hidden="true"
                />
                <p
                  className={cn(
                    "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                    "text-fg-muted",
                  )}
                >
                  {lim}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Blocker-only footer note */}
      {blockerBanner && (
        <div className="px-4 pb-3 flex items-start gap-1.5">
          <AlertTriangle
            size={12}
            className="mt-0.5 shrink-0 text-fg-faint"
            aria-hidden="true"
          />
          <p
            className={cn(
              "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
              "text-fg-faint",
            )}
          >
            Resolve the blocker to progress this case.
          </p>
        </div>
      )}
    </div>
  );
}
