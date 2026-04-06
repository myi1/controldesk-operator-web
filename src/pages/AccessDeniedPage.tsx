// ---------------------------------------------------------------------------
// AccessDeniedPage — 403
// ---------------------------------------------------------------------------

import { Link } from "react-router-dom";
import { ShieldOff } from "lucide-react";
import { cn } from "../lib/cn";
import { useRoleGate } from "../hooks/use-role-gate";
import { Button } from "../components/primitives/Button";
import { Badge } from "../components/primitives/Badge";

export default function AccessDeniedPage() {
  const { userRoles } = useRoleGate();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
      <ShieldOff
        size={64}
        className="text-fg-faint"
        aria-hidden
      />

      <h1
        className={cn(
          "text-[length:var(--text-heading-lg-size)] leading-[var(--text-heading-lg-leading)]",
          "font-semibold text-fg-default",
        )}
      >
        Access Denied
      </h1>

      <p className="text-[length:var(--text-body-size)] text-fg-muted text-center max-w-sm">
        You don&apos;t have permission to access this page.
      </p>

      {userRoles.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-[length:var(--text-caption-size)] text-fg-muted">
            Your roles:
          </span>
          {userRoles.map((role) => (
            <Badge key={role} variant="neutral" size="sm">
              {role}
            </Badge>
          ))}
        </div>
      )}

      <Link to="/work" className="mt-2">
        <Button variant="primary">Go to My Work</Button>
      </Link>
    </div>
  );
}
