import { Inbox, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "py-12 px-4",
        "text-center",
        className,
      )}
    >
      <Icon
        size={40}
        className="text-fg-muted/40 mb-3"
        aria-hidden="true"
        strokeWidth={1.5}
      />

      <h3 className="text-[length:var(--text-body-size)] leading-[var(--text-body-leading)] font-[number:var(--text-body-medium-weight)] text-fg-default">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-sm text-[length:var(--text-small-size)] leading-[var(--text-small-leading)] text-fg-muted">
          {description}
        </p>
      )}

      {action && (
        <Button
          variant="secondary"
          size="sm"
          onClick={action.onClick}
          className="mt-4"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
