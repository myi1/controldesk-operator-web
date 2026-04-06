import {
  FileText,
  Home,
  Users,
  Wrench,
  DollarSign,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { Badge } from "../primitives/Badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface RelatedRecordLinkProps {
  label: string;
  referenceType: string;
  referenceId: string;
  status?: string;
  onClick?: () => void;
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Reference type icon mapping                                        */
/* ------------------------------------------------------------------ */

const typeIconMap: Record<string, LucideIcon> = {
  lease: FileText,
  property: Home,
  tenant: Users,
  maintenance: Wrench,
  invoice: DollarSign,
  task: ClipboardList,
};

function TypeIcon({ referenceType, size, className }: { referenceType: string; size: number; className?: string }) {
  const Icon = typeIconMap[referenceType] ?? FileText;
  return <Icon size={size} className={className} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function RelatedRecordLink({
  label,
  referenceType,
  referenceId,
  status,
  onClick,
  className,
}: RelatedRecordLinkProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5",
        "px-1.5 py-0.5",
        "rounded-[var(--radius-sm)]",
        "text-left",
        "cursor-pointer select-none",
        "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-default)]",
        "hover:bg-bg-hover",
        "focus-ring",
        className,
      )}
    >
      <TypeIcon referenceType={referenceType} size={14} className="shrink-0 text-fg-muted" />

      <span
        className={cn(
          "truncate",
          "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
          "text-accent-primary",
        )}
        title={`${referenceType}:${referenceId}`}
      >
        {label}
      </span>

      {status && (
        <Badge variant="neutral" size="sm">
          {status}
        </Badge>
      )}
    </button>
  );
}
