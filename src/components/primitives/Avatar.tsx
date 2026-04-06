import { useState, type ImgHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type AvatarSize = "xs" | "sm" | "md" | "lg";

export interface AvatarProps {
  /** Image source. Falls back to initials or icon when missing or on error. */
  src?: string | null;
  /** Full name — first letters of first two words become the initials fallback. */
  name?: string;
  /** Lucide icon used when no src and no name are provided. */
  icon?: LucideIcon;
  size?: AvatarSize;
  className?: string;
  /** Passed through to the inner <img> when src is provided. */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "alt">;
}

/* ------------------------------------------------------------------ */
/*  Size maps                                                          */
/* ------------------------------------------------------------------ */

const containerSize: Record<AvatarSize, string> = {
  xs: "size-5",   /* 20px */
  sm: "size-6",   /* 24px */
  md: "size-8",   /* 32px */
  lg: "size-10",  /* 40px */
};

const textSize: Record<AvatarSize, string> = {
  xs: "text-[0.625rem] leading-none",
  sm: "text-[length:var(--text-caption-size)] leading-none",
  md: "text-[length:var(--text-small-size)]  leading-none",
  lg: "text-[length:var(--text-body-size)]   leading-none",
};

const iconPx: Record<AvatarSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Deterministic color from a name string so the same person always gets
 * the same avatar hue. Uses a small palette derived from the queue colors.
 */
const palette = [
  { bg: "bg-[#eff6ff]",  fg: "text-[#2563eb]" }, // blue
  { bg: "bg-[#f0fdf4]",  fg: "text-[#059669]" }, // green
  { bg: "bg-[#fef3c7]",  fg: "text-[#d97706]" }, // amber
  { bg: "bg-[#ede9fe]",  fg: "text-[#7c3aed]" }, // violet
  { bg: "bg-[#fce7f3]",  fg: "text-[#db2777]" }, // pink
  { bg: "bg-[#ecfeff]",  fg: "text-[#0891b2]" }, // cyan
  { bg: "bg-[#fef2f2]",  fg: "text-[#dc2626]" }, // red
  { bg: "bg-[#f5f3ff]",  fg: "text-[#6366f1]" }, // indigo
];

function colorFromName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return palette[Math.abs(hash) % palette.length];
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Avatar({
  src,
  name,
  icon: Icon,
  size = "md",
  className,
  imgProps,
}: AvatarProps) {
  const [imgError, setImgError] = useState(false);

  const showImage = !!src && !imgError;
  const initials = name ? getInitials(name) : "";
  const showInitials = !showImage && !!initials;
  const showIcon = !showImage && !showInitials && !!Icon;
  const showFallback = !showImage && !showInitials && !showIcon;

  const nameColor = name ? colorFromName(name) : palette[0];

  return (
    <span
      role="img"
      aria-label={name ?? "avatar"}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        "overflow-hidden rounded-full",
        "select-none",
        containerSize[size],

        // Background for non-image states
        !showImage && nameColor.bg,
        !showImage && nameColor.fg,

        // Fallback (no name, no icon) gets neutral bg
        showFallback && "bg-status-neutral-subtle text-status-neutral",

        className,
      )}
    >
      {showImage && (
        <img
          src={src!}
          alt={name ?? ""}
          onError={() => setImgError(true)}
          className="h-full w-full object-cover"
          {...imgProps}
        />
      )}

      {showInitials && (
        <span
          aria-hidden="true"
          className={cn(
            "font-[number:var(--text-body-medium-weight)]",
            textSize[size],
          )}
        >
          {initials}
        </span>
      )}

      {showIcon && Icon && (
        <Icon size={iconPx[size]} aria-hidden="true" />
      )}

      {showFallback && (
        <span
          aria-hidden="true"
          className={cn(
            "font-[number:var(--text-body-medium-weight)]",
            textSize[size],
          )}
        >
          ?
        </span>
      )}
    </span>
  );
}
