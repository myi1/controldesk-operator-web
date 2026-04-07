// ---------------------------------------------------------------------------
// LandlordsPage — route: /landlords
//
// Stub page — landlords API backend not yet implemented.
// Displayed while the backend team builds the landlords endpoints.
// ---------------------------------------------------------------------------

import { Briefcase, ExternalLink } from "lucide-react";
import { cn } from "../lib/cn";

export default function LandlordsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border-default bg-bg-surface px-6 py-4">
        <div className="flex items-center gap-2">
          <Briefcase size={18} className="text-fg-muted" aria-hidden="true" />
          <h1 className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default">
            Landlords
          </h1>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12">
        <div className={cn(
          "flex flex-col items-center gap-4 rounded-[var(--radius-lg)]",
          "border border-dashed border-border-default bg-bg-surface p-8 text-center",
          "max-w-md",
        )}>
          <div className="rounded-full bg-bg-muted p-4">
            <Briefcase size={28} className="text-fg-muted" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-[length:var(--text-body-size)] font-semibold text-fg-default">
              Landlords Module Coming Soon
            </h2>
            <p className="mt-2 text-[length:var(--text-small-size)] text-fg-muted leading-relaxed">
              The landlords list and detail views are under active development.
              Landlord account context is currently visible within property records.
            </p>
          </div>

          <div className={cn(
            "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-muted",
            "px-4 py-3 text-left",
          )}>
            <p className="text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
              Pending backend endpoints
            </p>
            <ul className="mt-2 space-y-1">
              {[
                "GET /api/v1/landlords/bootstrap",
                "GET /api/v1/landlords/:landlordId",
                "POST /api/v1/landlords",
                "PATCH /api/v1/landlords/:landlordId",
              ].map((ep) => (
                <li key={ep} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-fg-faint shrink-0" aria-hidden="true" />
                  <code className="text-[length:var(--text-caption-size)] font-mono text-fg-muted">
                    {ep}
                  </code>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 pt-1">
            <a
              href="https://github.com/anthropics/controldesk-operator-web/issues"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-[var(--radius-md)]",
                "border border-border-default bg-bg-surface px-4 py-2",
                "text-[length:var(--text-small-size)] text-fg-muted",
                "hover:bg-bg-muted hover:text-fg-default transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
              )}
            >
              <ExternalLink size={13} aria-hidden="true" />
              View GitHub Issues
            </a>
          </div>
        </div>

        <p className="text-[length:var(--text-caption-size)] text-fg-faint">
          In the meantime, landlord context is visible in the Properties and Portfolio views.
        </p>
      </div>
    </div>
  );
}
