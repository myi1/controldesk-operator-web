/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import * as Toast from "@radix-ui/react-toast";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "../../lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title: string;
  description?: string;
  variant: ToastVariant;
  action?: { label: string; onClick: () => void };
  duration?: number;
}

interface ToastEntry extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a <ToastProvider>");
  }
  return ctx;
}

/* ------------------------------------------------------------------ */
/*  Variant config                                                     */
/* ------------------------------------------------------------------ */

const variantConfig: Record<
  ToastVariant,
  { icon: LucideIcon; borderColor: string; iconColor: string }
> = {
  success: {
    icon: CheckCircle2,
    borderColor: "border-l-status-success",
    iconColor: "text-status-success",
  },
  error: {
    icon: XCircle,
    borderColor: "border-l-status-danger",
    iconColor: "text-status-danger",
  },
  warning: {
    icon: AlertTriangle,
    borderColor: "border-l-status-warning",
    iconColor: "text-status-warning",
  },
  info: {
    icon: Info,
    borderColor: "border-l-status-info",
    iconColor: "text-status-info",
  },
};

/* ------------------------------------------------------------------ */
/*  Single toast item                                                  */
/* ------------------------------------------------------------------ */

function ToastItem({
  entry,
  onRemove,
}: {
  entry: ToastEntry;
  onRemove: (id: string) => void;
}) {
  const config = variantConfig[entry.variant];
  const Icon = config.icon;

  return (
    <Toast.Root
      duration={entry.duration ?? 5000}
      onOpenChange={(open) => {
        if (!open) onRemove(entry.id);
      }}
      className={cn(
        "group pointer-events-auto",
        "flex items-start gap-3",
        "w-[360px] rounded-[var(--radius-lg)]",
        "border border-border-default border-l-4",
        config.borderColor,
        "bg-bg-surface-raised p-3 shadow-lg",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-full",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-full",
        "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform",
        "data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full",
      )}
    >
      <Icon size={18} className={cn("mt-0.5 shrink-0", config.iconColor)} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <Toast.Title className="text-[length:var(--text-small-size)] font-semibold text-fg-default">
          {entry.title}
        </Toast.Title>
        {entry.description && (
          <Toast.Description className="text-[length:var(--text-caption-size)] text-fg-muted">
            {entry.description}
          </Toast.Description>
        )}
        {entry.action && (
          <Toast.Action altText={entry.action.label} asChild>
            <button
              type="button"
              onClick={entry.action.onClick}
              className={cn(
                "mt-1 inline-flex h-6 items-center rounded-[var(--radius-md)] px-2",
                "text-[length:var(--text-caption-size)] font-medium",
                "text-accent-primary hover:underline",
                "cursor-pointer",
              )}
            >
              {entry.action.label}
            </button>
          </Toast.Action>
        )}
      </div>

      <Toast.Close
        aria-label="Close"
        className={cn(
          "shrink-0 rounded-[var(--radius-sm)] p-0.5",
          "text-fg-faint hover:text-fg-muted",
          "cursor-pointer",
        )}
      >
        <X size={14} />
      </Toast.Close>
    </Toast.Root>
  );
}

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

const MAX_VISIBLE = 3;

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = `toast-${++toastIdCounter}`;
    setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { ...options, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      <Toast.Provider swipeDirection="right">
        {children}

        {toasts.map((entry) => (
          <ToastItem key={entry.id} entry={entry} onRemove={removeToast} />
        ))}

        <Toast.Viewport
          className={cn(
            "fixed bottom-4 right-4 z-[var(--z-toast)]",
            "flex flex-col gap-2",
            "outline-none",
          )}
        />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
