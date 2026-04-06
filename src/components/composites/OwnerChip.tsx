import { cn } from "../../lib/cn";
import { Avatar } from "../primitives/Avatar";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface OwnerChipProps {
  owner: string | null;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function OwnerChip({ owner, className }: OwnerChipProps) {
  if (!owner) {
    return (
      <span
        className={cn(
          "inline-flex items-center",
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "text-fg-muted",
          className,
        )}
      >
        Unassigned
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5",
        "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
        "text-fg-default",
        className,
      )}
    >
      <Avatar name={owner} size="xs" />
      <span className="truncate">{owner}</span>
    </span>
  );
}
