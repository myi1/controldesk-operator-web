import React from "react";
import { cn } from "../../lib/cn";
import { getQueueConfig } from "../../config/queue-config";
import { Badge } from "../primitives/Badge";
import * as Icons from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface QueueCounterProps {
  queueKey: string;
  label: string;
  count: number;
  overdueCount?: number;
  isActive: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/**
 * Resolve a kebab-case Lucide icon name (e.g. "clipboard-check") to
 * a PascalCase component from the lucide-react barrel export.
 */
function resolveIcon(name: string): LucideIcon {
  const pascal = name
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
  const icon = (Icons as Record<string, unknown>)[pascal] as LucideIcon | undefined;
  return icon ?? Icons.CircleDot;
}

function QueueIcon({ name, size, className, style }: { name: string; size: number; className?: string; style?: React.CSSProperties }) {
  return React.createElement(resolveIcon(name), { size, className, style, "aria-hidden": "true" });
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function QueueCounter({
  queueKey,
  label,
  count,
  overdueCount = 0,
  isActive,
  onClick,
  collapsed = false,
  className,
}: QueueCounterProps) {
  const config = getQueueConfig(queueKey);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex w-full items-center gap-2",
        "rounded-[var(--radius-md)]",
        "px-2 py-1.5",
        "text-left",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]",
        "cursor-pointer select-none",

        isActive
          ? "bg-accent-primary-subtle border-l-2 border-l-accent-primary text-fg-default"
          : "text-fg-muted hover:bg-bg-hover hover:text-fg-default",

        className,
      )}
    >
      {/* Icon */}
      <QueueIcon
        name={config?.iconName ?? "circle-dot"}
        size={16}
        className="shrink-0"
        style={{ color: config?.color }}
      />

      {/* Label — hidden when collapsed */}
      {!collapsed && (
        <span
          className={cn(
            "flex-1 truncate",
            "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
            isActive && "font-[number:var(--text-body-medium-weight)]",
          )}
        >
          {label}
        </span>
      )}

      {/* Count badge */}
      {count > 0 && (
        <Badge variant={overdueCount > 0 ? "danger" : "neutral"} size="sm">
          {count}
        </Badge>
      )}
    </button>
  );
}
