import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type SkeletonVariant = "text" | "avatar" | "card" | "row";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Variant defaults                                                   */
/* ------------------------------------------------------------------ */

const variantStyles: Record<SkeletonVariant, string> = {
  text: "h-4 rounded-[var(--radius-md)]",
  avatar: "rounded-full",
  card: "w-full rounded-[var(--radius-lg)]",
  row: "h-12 w-full rounded-[var(--radius-md)]",
};

const variantDefaults: Record<SkeletonVariant, { width?: string; height?: string }> = {
  text: { width: "100%" },
  avatar: { width: "40px", height: "40px" },
  card: { height: "120px" },
  row: {},
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Skeleton({
  variant = "text",
  width,
  height,
  className,
}: SkeletonProps) {
  const defaults = variantDefaults[variant];

  const style: React.CSSProperties = {
    width: width ?? defaults.width,
    height: height ?? defaults.height,
  };

  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        "bg-bg-surface-inset animate-pulse",
        variantStyles[variant],
        className,
      )}
      style={style}
    />
  );
}
