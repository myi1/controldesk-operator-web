// ---------------------------------------------------------------------------
// TenantsPage — route: /tenants
//
// Stub page — tenants API backend not yet implemented.
// Displayed while the backend team builds the tenants endpoints.
// ---------------------------------------------------------------------------

import { Users, ExternalLink } from "lucide-react";
import { cn } from "../lib/cn";

export default function TenantsPage() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border-default bg-bg-surface px-6 py-4">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-fg-muted" aria-hidden="true" />
          <h1 className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default">
            Tenants
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
            <Users size={28} className="text-fg-muted" aria-hidden="true" />
          </div>

          <div>
            <h2 className="text-[length:var(--text-body-size)] font-semibold text-fg-default">
              Tenants Module Coming Soon
            </h2>
            <p className="mt-2 text-[length:var(--text-small-size)] text-fg-muted leading-relaxed">
              The tenants list and detail views are under active development.
              Tenant data is currently accessible via individual property and unit records.
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
                "GET /api/v1/tenants/bootstrap",
                "GET /api/v1/tenants/:tenantId",
                "POST /api/v1/tenants",
                "PATCH /api/v1/tenants/:tenantId",
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
          In the meantime, tenant context is visible in the Properties and Units views.
        </p>
      </div>
    </div>
  );
}
