// ---------------------------------------------------------------------------
// VendorsPage — route: /vendors
//
// Vendor directory: verification status, service categories, compliance
// state, and a slide-in detail panel.
// ---------------------------------------------------------------------------

import { useState, useMemo, useCallback } from "react";
import {
  Wrench, AlertCircle, Clock, CheckCircle2, Search,
  ChevronRight, X, RefreshCw, AlertTriangle, Plus,
} from "lucide-react";
import { cn } from "../lib/cn";
import { useVendorsBootstrap } from "../hooks/use-properties";
import type { VendorRow } from "../types/api";
import { TransitionRunner } from "../components/runners";
import { RUNNER_REGISTRY } from "../config/runners";
import type { RunnerConfig } from "../types/runner";

const CREATE_VENDOR_RUNNER = RUNNER_REGISTRY.get("vendor.create") as RunnerConfig | undefined;

/* ------------------------------------------------------------------ */
/*  Verification status badge config                                    */
/* ------------------------------------------------------------------ */

const VERIFICATION_CONFIG: Record<string, {
  label: string;
  className: string;
  icon: React.ReactNode;
}> = {
  verified: {
    label: "Verified",
    className: "bg-status-success-subtle text-status-success border-status-success/20",
    icon: <CheckCircle2 size={11} aria-hidden="true" />,
  },
  pending: {
    label: "Pending",
    className: "bg-status-warning-subtle text-status-warning border-status-warning/20",
    icon: <Clock size={11} aria-hidden="true" />,
  },
  suspended: {
    label: "Suspended",
    className: "bg-status-danger-subtle text-status-danger border-status-danger/20",
    icon: <AlertCircle size={11} aria-hidden="true" />,
  },
};

function VerificationBadge({ status }: { status: string }) {
  const config = VERIFICATION_CONFIG[status] ?? VERIFICATION_CONFIG.pending;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
      "text-[length:var(--text-caption-size)] font-medium leading-none",
      config.className,
    )}>
      {config.icon}
      {config.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  License expiry attention badge                                      */
/* ------------------------------------------------------------------ */

function getLicenseExpiryState(expiryStr: string): "expired" | "due_soon" | "ok" | "none" {
  if (!expiryStr) return "none";
  const expiry = new Date(expiryStr);
  if (isNaN(expiry.getTime())) return "none";
  const now = new Date();
  const diffDays = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= 30) return "due_soon";
  return "ok";
}

function LicenseExpiryCell({ expiry }: { expiry: string }) {
  const state = getLicenseExpiryState(expiry);
  if (!expiry) {
    return <span className="text-[length:var(--text-caption-size)] text-fg-faint">—</span>;
  }
  return (
    <span className={cn(
      "text-[length:var(--text-small-size)] tabular-nums",
      state === "expired" && "text-status-danger font-medium",
      state === "due_soon" && "text-status-warning font-medium",
      state === "ok" && "text-fg-default",
    )}>
      {expiry}
      {state === "expired" && (
        <span className="ml-1.5 inline-flex items-center gap-0.5 text-[length:var(--text-caption-size)]">
          <AlertTriangle size={10} aria-hidden="true" />
          Expired
        </span>
      )}
      {state === "due_soon" && (
        <span className="ml-1.5 inline-flex items-center gap-0.5 text-[length:var(--text-caption-size)]">
          <Clock size={10} aria-hidden="true" />
          Due Soon
        </span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Service category pills                                              */
/* ------------------------------------------------------------------ */

function CategoryPills({ categories }: { categories: string[] }) {
  if (!categories.length) {
    return <span className="text-[length:var(--text-caption-size)] text-fg-faint">—</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {categories.slice(0, 3).map((cat) => (
        <span
          key={cat}
          className={cn(
            "inline-flex items-center rounded border border-border-default bg-bg-muted",
            "px-1.5 py-0.5 text-[length:var(--text-caption-size)] text-fg-muted",
          )}
        >
          {cat}
        </span>
      ))}
      {categories.length > 3 && (
        <span className="text-[length:var(--text-caption-size)] text-fg-faint">
          +{categories.length - 3}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  KPI card                                                            */
/* ------------------------------------------------------------------ */

function KpiCard({ label, value, icon, accent }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "success" | "warning" | "danger" | "default";
}) {
  return (
    <div className={cn(
      "rounded-[var(--radius-lg)] border border-border-default bg-bg-surface p-4",
      "flex items-start gap-3",
    )}>
      <div className={cn(
        "mt-0.5 rounded-[var(--radius-md)] p-1.5",
        accent === "success" && "bg-status-success-subtle text-status-success",
        accent === "warning" && "bg-status-warning-subtle text-status-warning",
        accent === "danger" && "bg-status-danger-subtle text-status-danger",
        (!accent || accent === "default") && "bg-bg-muted text-fg-muted",
      )}>
        {icon}
      </div>
      <div>
        <p className="text-[length:var(--text-small-size)] text-fg-muted">{label}</p>
        <p className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Vendor table row                                                    */
/* ------------------------------------------------------------------ */

function VendorTableRow({
  row,
  isSelected,
  onClick,
}: {
  row: VendorRow;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <tr
      onClick={onClick}
      tabIndex={0}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={cn(
        "group cursor-pointer border-b border-border-default transition-colors",
        "focus-visible:outline-2 focus-visible:-outline-offset-1 focus-visible:outline-border-focus",
        isSelected ? "bg-bg-surface-raised" : "hover:bg-bg-muted",
      )}
    >
      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Wrench size={14} className="shrink-0 text-fg-muted" aria-hidden="true" />
          <span className={cn(
            "text-[length:var(--text-body-size)] font-medium text-fg-default",
            "group-hover:text-fg-strong",
          )}>
            {row.display_name || row.entity_id}
          </span>
        </div>
        {row.vendor_type && (
          <p className="mt-0.5 pl-6 text-[length:var(--text-caption-size)] text-fg-faint capitalize">
            {row.vendor_type.replace(/_/g, " ")}
          </p>
        )}
      </td>

      {/* Contact */}
      <td className="px-4 py-3">
        <p className="text-[length:var(--text-small-size)] text-fg-default">
          {row.primary_contact_name || "—"}
        </p>
        {row.primary_contact_phone && (
          <p className="text-[length:var(--text-caption-size)] text-fg-faint">
            {row.primary_contact_phone}
          </p>
        )}
      </td>

      {/* Service categories */}
      <td className="px-4 py-3">
        <CategoryPills categories={row.service_categories} />
      </td>

      {/* Approval limit */}
      <td className="px-4 py-3 text-[length:var(--text-small-size)] text-fg-default tabular-nums">
        {row.approval_limit_aed != null
          ? `AED ${row.approval_limit_aed.toLocaleString()}`
          : <span className="text-fg-faint">—</span>}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <VerificationBadge status={row.verification_status} />
      </td>

      {/* License expiry */}
      <td className="px-4 py-3">
        <LicenseExpiryCell expiry={row.trade_license_expiry} />
      </td>

      {/* Chevron */}
      <td className="px-3 py-3">
        <ChevronRight
          size={14}
          className={cn(
            "text-fg-faint transition-transform",
            isSelected && "translate-x-0.5 text-fg-muted",
          )}
          aria-hidden="true"
        />
      </td>
    </tr>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail panel                                                        */
/* ------------------------------------------------------------------ */

function VendorDetailPanel({
  row,
  onClose,
  onRunAction,
}: {
  row: VendorRow;
  onClose: () => void;
  onRunAction: (runnerId: string, recordId: string) => void;
}) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col overflow-hidden",
        "border-l border-border-default bg-bg-surface",
      )}
      aria-label={`Vendor detail: ${row.display_name || row.entity_id}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border-default px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Wrench size={16} className="shrink-0 text-fg-muted" aria-hidden="true" />
            <h2 className="truncate text-[length:var(--text-body-size)] font-semibold text-fg-default">
              {row.display_name || row.entity_id}
            </h2>
          </div>
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <VerificationBadge status={row.verification_status} />
            {row.vendor_type && (
              <span className="text-[length:var(--text-caption-size)] text-fg-faint capitalize">
                {row.vendor_type.replace(/_/g, " ")}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className={cn(
            "shrink-0 rounded-[var(--radius-md)] p-1.5 text-fg-muted",
            "hover:bg-bg-muted hover:text-fg-default",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
          )}
          aria-label="Close detail panel"
        >
          <X size={16} aria-hidden="true" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        <section>
          <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
            Contact
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Name</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.primary_contact_name || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Phone</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.primary_contact_phone || "—"}
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Email</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.primary_contact_email || "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
            Service Profile
          </h3>
          <dl className="space-y-2">
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Categories</dt>
              <dd className="mt-1">
                <CategoryPills categories={row.service_categories} />
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Service Areas</dt>
              <dd className="mt-1">
                <CategoryPills categories={row.service_areas} />
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Approval Limit</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default tabular-nums">
                {row.approval_limit_aed != null
                  ? `AED ${row.approval_limit_aed.toLocaleString()}`
                  : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
            Compliance
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Trade License</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">
                {row.trade_license_number || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">License Expiry</dt>
              <dd>
                <LicenseExpiryCell expiry={row.trade_license_expiry} />
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Insurance Expiry</dt>
              <dd>
                <LicenseExpiryCell expiry={row.insurance_expiry} />
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Bank IBAN</dt>
              <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default font-mono">
                {row.bank_iban || "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
            Readiness
          </h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Bank Details</dt>
              <dd>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                  "text-[length:var(--text-caption-size)] font-medium leading-none",
                  row.bank_details_complete
                    ? "bg-status-success-subtle text-status-success border-status-success/20"
                    : "bg-bg-muted text-fg-muted border-border-default",
                )}>
                  {row.bank_details_complete ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                  {row.bank_details_complete ? "Complete" : "Incomplete"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[length:var(--text-caption-size)] text-fg-faint">Compliance Docs</dt>
              <dd>
                <span className={cn(
                  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5",
                  "text-[length:var(--text-caption-size)] font-medium leading-none",
                  row.compliance_complete
                    ? "bg-status-success-subtle text-status-success border-status-success/20"
                    : "bg-bg-muted text-fg-muted border-border-default",
                )}>
                  {row.compliance_complete ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                  {row.compliance_complete ? "Complete" : "Incomplete"}
                </span>
              </dd>
            </div>
          </dl>
        </section>

        <section>
          <h3 className="mb-2 text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
            Quick Actions
          </h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => onRunAction("vendor.update_profile", row.entity_id)}
              className={cn(
                "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-muted",
                "px-3 py-2 text-left text-[length:var(--text-small-size)] text-fg-default",
                "hover:bg-bg-surface-raised hover:text-fg-strong transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
              )}
            >
              Edit Profile
            </button>
            <button
              onClick={() => onRunAction("vendor.update_verification", row.entity_id)}
              className={cn(
                "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-muted",
                "px-3 py-2 text-left text-[length:var(--text-small-size)] text-fg-default",
                "hover:bg-bg-surface-raised hover:text-fg-strong transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
              )}
            >
              Update Verification
            </button>
            <button
              onClick={() => onRunAction("vendor.update_bank_details", row.entity_id)}
              className={cn(
                "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-muted",
                "px-3 py-2 text-left text-[length:var(--text-small-size)] text-fg-default",
                "hover:bg-bg-surface-raised hover:text-fg-strong transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
              )}
            >
              Update Bank Details
            </button>
          </div>
        </section>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */

export default function VendorsPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useVendorsBootstrap();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [activeRunner, setActiveRunner] = useState<RunnerConfig | null>(null);
  const [activeRunnerId, setActiveRunnerId] = useState<string>("");
  const [runnerOpen, setRunnerOpen] = useState(false);

  const handleRunAction = useCallback((runnerId: string, recordId: string) => {
    const cfg = RUNNER_REGISTRY.get(runnerId) as RunnerConfig | undefined;
    if (!cfg) return;
    setActiveRunner(cfg);
    setActiveRunnerId(recordId);
    setRunnerOpen(true);
  }, []);

  const filteredRows = useMemo(() => {
    if (!data) return [];
    let rows = data.vendor_rows;

    // Status filter
    if (statusFilter) {
      rows = rows.filter((r) => r.verification_status === statusFilter);
    }

    // Text search: name or service category
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.display_name.toLowerCase().includes(q) ||
          r.service_categories.some((c) => c.toLowerCase().includes(q)) ||
          r.primary_contact_name.toLowerCase().includes(q),
      );
    }

    return rows;
  }, [data, statusFilter, search]);

  const selectedRow = useMemo(
    () => filteredRows.find((r) => r.entity_id === selectedId) ?? null,
    [filteredRows, selectedId],
  );

  const handleRowClick = useCallback((row: VendorRow) => {
    setSelectedId((prev) => (prev === row.entity_id ? null : row.entity_id));
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <RefreshCw size={20} className="animate-spin text-fg-muted" aria-label="Loading vendors" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-[length:var(--text-small-size)] text-status-danger">
          {error?.message ?? "Failed to load vendors."}
        </p>
        <button
          onClick={() => void refetch()}
          className={cn(
            "rounded-[var(--radius-md)] border border-border-default bg-bg-surface px-4 py-2",
            "text-[length:var(--text-small-size)] text-fg-default hover:bg-bg-muted",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
          )}
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const STATUS_CHIPS = [
    { label: "Verified", value: "verified" },
    { label: "Pending", value: "pending" },
    { label: "Suspended", value: "suspended" },
  ];

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Page header */}
      <div className="border-b border-border-default bg-bg-surface px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Wrench size={18} className="text-fg-muted" aria-hidden="true" />
            <h1 className="text-[length:var(--text-heading-lg-size)] font-semibold text-fg-default">
              Vendors
            </h1>
            {isFetching && !isLoading && (
              <RefreshCw size={13} className="animate-spin text-fg-faint" aria-hidden="true" />
            )}
          </div>
          <div className="flex items-center gap-2">
            {CREATE_VENDOR_RUNNER && (
              <button
                onClick={() => setCreateOpen(true)}
                className={cn(
                  "flex items-center gap-1.5 rounded-[var(--radius-md)]",
                  "bg-action-primary-default px-3 py-1.5 text-[length:var(--text-small-size)] text-white",
                  "hover:bg-action-primary-hover transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                  "cursor-pointer",
                )}
              >
                <Plus size={13} aria-hidden="true" />
                Add Vendor
              </button>
            )}
            <button
              onClick={() => void refetch()}
              className={cn(
                "flex items-center gap-1.5 rounded-[var(--radius-md)] border border-border-default",
                "px-3 py-1.5 text-[length:var(--text-small-size)] text-fg-muted",
                "hover:bg-bg-muted hover:text-fg-default transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
              )}
            >
              <RefreshCw size={13} aria-hidden="true" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: list */}
        <div className={cn(
          "flex flex-col overflow-hidden transition-all duration-200",
          selectedRow ? "w-1/2 lg:w-3/5" : "w-full",
        )}>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 border-b border-border-default bg-bg-app px-6 py-4 lg:grid-cols-4">
            <KpiCard
              label="Total Vendors"
              value={data.total_count}
              icon={<Wrench size={14} />}
            />
            <KpiCard
              label="Verified"
              value={data.verified_count}
              icon={<CheckCircle2 size={14} />}
              accent="success"
            />
            <KpiCard
              label="Pending"
              value={data.pending_count}
              icon={<Clock size={14} />}
              accent="warning"
            />
            <KpiCard
              label="Suspended"
              value={data.suspended_count}
              icon={<AlertCircle size={14} />}
              accent="danger"
            />
          </div>

          {/* Status filter chips + search */}
          <div className="flex flex-col gap-3 border-b border-border-default bg-bg-surface px-6 py-3">
            {/* Status chips */}
            <div className="flex flex-wrap gap-1.5">
              {STATUS_CHIPS.map((chip) => (
                <button
                  key={chip.value}
                  onClick={() => setStatusFilter(statusFilter === chip.value ? null : chip.value)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-[length:var(--text-caption-size)] font-medium transition-colors",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
                    statusFilter === chip.value
                      ? "border-fg-accent bg-fg-accent/10 text-fg-accent"
                      : "border-border-default bg-bg-muted text-fg-muted hover:bg-bg-surface hover:text-fg-default",
                  )}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-faint"
                aria-hidden="true"
              />
              <input
                type="search"
                placeholder="Search by name or service category…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-muted",
                  "py-2 pl-9 pr-4 text-[length:var(--text-small-size)] text-fg-default",
                  "placeholder:text-fg-faint",
                  "focus:outline-2 focus:outline-offset-2 focus:outline-border-focus",
                )}
              />
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            {filteredRows.length === 0 ? (
              <div className="flex h-48 flex-col items-center justify-center gap-2">
                <Wrench size={32} className="text-fg-faint" aria-hidden="true" />
                <p className="text-[length:var(--text-small-size)] text-fg-muted">
                  {search || statusFilter
                    ? "No vendors match your filters"
                    : "No vendors in the directory yet"}
                </p>
                {(search || statusFilter) && (
                  <button
                    onClick={() => { setSearch(""); setStatusFilter(null); }}
                    className="text-[length:var(--text-small-size)] text-fg-accent underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <table className="w-full border-collapse" aria-label="Vendors list">
                <thead className="sticky top-0 z-10 bg-bg-surface shadow-sm">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Vendor
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Contact
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Services
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Approval Limit
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      Status
                    </th>
                    <th className="px-4 py-2.5 text-left text-[length:var(--text-caption-size)] font-semibold uppercase tracking-wider text-fg-faint">
                      License Expiry
                    </th>
                    <th className="w-8 px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row) => (
                    <VendorTableRow
                      key={row.entity_id}
                      row={row}
                      isSelected={selectedId === row.entity_id}
                      onClick={() => handleRowClick(row)}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: detail panel */}
        {selectedRow && (
          <VendorDetailPanel
            row={selectedRow}
            onClose={() => setSelectedId(null)}
            onRunAction={handleRunAction}
          />
        )}
      </div>

      {CREATE_VENDOR_RUNNER && (
        <TransitionRunner
          open={createOpen}
          onOpenChange={setCreateOpen}
          config={CREATE_VENDOR_RUNNER}
          recordId=""
        />
      )}

      {activeRunner && (
        <TransitionRunner
          open={runnerOpen}
          onOpenChange={setRunnerOpen}
          config={activeRunner}
          recordId={activeRunnerId}
        />
      )}
    </div>
  );
}
