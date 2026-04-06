import { AlertCircle, RefreshCw, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ErrorBannerProps {
  title: string;
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ErrorBanner({
  title,
  message,
  onRetry,
  onDismiss,
  className,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3",
        "rounded-[var(--radius-md)]",
        "border border-status-danger/30",
        "bg-status-danger-subtle",
        "p-3",
        className,
      )}
    >
      <AlertCircle
        size={16}
        className="mt-0.5 shrink-0 text-status-danger"
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className="text-[length:var(--text-small-size)] leading-[var(--text-small-leading)] font-[number:var(--text-body-medium-weight)] text-status-danger">
          {title}
        </p>
        {message && (
          <p className="mt-0.5 text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)] text-fg-muted">
            {message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {onRetry && (
          <Button variant="ghost" size="sm" icon={RefreshCw} onClick={onRetry}>
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button variant="icon" size="sm" icon={X} onClick={onDismiss} aria-label="Dismiss error" />
        )}
      </div>
    </div>
  );
}
