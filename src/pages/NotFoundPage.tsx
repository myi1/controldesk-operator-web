// ---------------------------------------------------------------------------
// NotFoundPage — 404
// ---------------------------------------------------------------------------

import { Link } from "react-router-dom";
import { cn } from "../lib/cn";
import { Button } from "../components/primitives/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
      <p
        className={cn(
          "text-[120px] leading-none font-bold",
          "text-fg-faint select-none",
        )}
      >
        404
      </p>

      <h1
        className={cn(
          "text-[length:var(--text-heading-lg-size)] leading-[var(--text-heading-lg-leading)]",
          "font-semibold text-fg-default",
        )}
      >
        Page not found
      </h1>

      <p className="text-[length:var(--text-body-size)] text-fg-muted text-center max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>

      <Link to="/work" className="mt-2">
        <Button variant="primary">Go to My Work</Button>
      </Link>
    </div>
  );
}
