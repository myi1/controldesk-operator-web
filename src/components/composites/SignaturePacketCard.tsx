import { Pen } from "lucide-react";
import { cn } from "../../lib/cn";
import { Badge, type BadgeVariant } from "../primitives/Badge";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SignaturePacketSigner {
  name: string;
  status: string;
}

export interface SignaturePacketCardProps {
  name: string;
  status: string;
  signers?: SignaturePacketSigner[];
  className?: string;
}

/* ------------------------------------------------------------------ */
/*  Status badge variant mapping                                       */
/* ------------------------------------------------------------------ */

const statusVariantMap: Record<string, BadgeVariant> = {
  draft: "neutral",
  sent: "info",
  viewed: "info",
  completed: "success",
  declined: "danger",
  voided: "danger",
};

function getStatusVariant(status: string): BadgeVariant {
  return statusVariantMap[status] ?? "neutral";
}

/* ------------------------------------------------------------------ */
/*  Signer status indicator                                            */
/* ------------------------------------------------------------------ */

const signerDotColor: Record<string, string> = {
  pending: "bg-status-neutral",
  sent: "bg-status-info",
  viewed: "bg-status-info",
  signed: "bg-status-success",
  declined: "bg-status-danger",
};

function getSignerDotColor(status: string): string {
  return signerDotColor[status] ?? "bg-status-neutral";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function SignaturePacketCard({
  name,
  status,
  signers,
  className,
}: SignaturePacketCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)]",
        "border border-border-default",
        "bg-bg-default",
        "p-4",
        className,
      )}
    >
      {/* Header: name + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Pen size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
          <span
            className={cn(
              "truncate",
              "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
              "font-[number:var(--text-body-medium-weight)]",
              "text-fg-default",
            )}
          >
            {name}
          </span>
        </div>
        <Badge variant={getStatusVariant(status)} size="sm">
          {status}
        </Badge>
      </div>

      {/* Signer list */}
      {signers && signers.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {signers.map((signer) => (
            <li
              key={signer.name}
              className="flex items-center gap-2"
            >
              <span
                className={cn(
                  "size-1.5 shrink-0 rounded-full",
                  getSignerDotColor(signer.status),
                )}
                aria-hidden="true"
              />
              <span
                className={cn(
                  "truncate flex-1",
                  "text-[length:var(--text-small-size)] leading-[var(--text-small-leading)]",
                  "text-fg-default",
                )}
              >
                {signer.name}
              </span>
              <span
                className={cn(
                  "shrink-0",
                  "text-[length:var(--text-caption-size)] leading-[var(--text-caption-leading)]",
                  "text-fg-muted",
                )}
              >
                {signer.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
