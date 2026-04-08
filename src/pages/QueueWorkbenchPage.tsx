import { useState, useCallback, useMemo, lazy, Suspense } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useAuthCheck } from "../hooks/use-auth-check";
import { cn } from "../lib/cn";
import { useUIStore } from "../stores/ui-store";
import { useKeyboard } from "../hooks/use-keyboard";
import { useUrlFilters } from "../hooks/use-url-filters";
import { ErrorBoundary } from "../ui/ErrorBoundary";
import { FilterBar } from "../components/patterns/FilterBar";
import { QueueList } from "../components/patterns/QueueList";
const PreviewPanel = lazy(() =>
  import("../components/patterns/PreviewPanel").then((m) => ({ default: m.PreviewPanel })),
);
import { STATUS_CONFIG } from "../config/status-config";
import type { QueueRow } from "../types/api";

/* ------------------------------------------------------------------ */
/*  Route → queue/scope resolution                                     */
/* ------------------------------------------------------------------ */

function useQueueContext() {
  const { queueKey } = useParams<{ queueKey?: string }>();
  const location = useLocation();
  const pathname = location.pathname;

  return useMemo(() => {
    // /work → scope_name = "my_work"
    if (pathname === "/work" || pathname.startsWith("/work")) {
      return { queueKey: "my_work", scopeName: "my_work" as string | undefined };
    }
    // /intake → scope_name = "intake_exceptions"
    if (pathname === "/intake" || pathname.startsWith("/intake")) {
      return { queueKey: "intake_exceptions", scopeName: "intake_exceptions" as string | undefined };
    }
    // /queue/:queueKey → queue_name
    return { queueKey: queueKey ?? "", scopeName: undefined as string | undefined };
  }, [pathname, queueKey]);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function QueueWorkbenchPage() {
  const navigate = useNavigate();
  const { queueKey, scopeName } = useQueueContext();
  const { data: currentUser } = useAuthCheck();

  // On My Work, pin current_owner to the user's default role so only their cases appear.
  const ownerOverride = scopeName === "my_work" ? (currentUser?.default_actor_role ?? undefined) : undefined;

  const [dynamicStatusOptions, setDynamicStatusOptions] = useState<string[]>([]);

  // Filters (URL-synced — survives page refresh)
  const [filters, setFilters] = useUrlFilters();

  // Preview panel state (from UI store)
  const previewOpen = useUIStore((s) => s.previewOpen);
  const setPreviewOpen = useUIStore((s) => s.setPreviewOpen);
  const selectedRowId = useUIStore((s) => s.selectedRowId);
  const setSelectedRowId = useUIStore((s) => s.setSelectedRowId);

  // Track the selected row's doctype for the preview
  const [previewDoctype, setPreviewDoctype] = useState<string>("");

  // Status options for filter bar
  const statusOptions = useMemo(() => {
    if (dynamicStatusOptions.length > 0) return dynamicStatusOptions;
    const map = STATUS_CONFIG[queueKey];
    return map ? Object.keys(map) : [];
  }, [queueKey, dynamicStatusOptions]);

  // Row click → open preview
  const handleRowClick = useCallback(
    (row: QueueRow) => {
      setSelectedRowId(row.docname);
      setPreviewDoctype(row.doctype);
      setPreviewOpen(true);
    },
    [setSelectedRowId, setPreviewOpen],
  );

  // Row double-click → navigate to case detail
  const handleRowDoubleClick = useCallback(
    (row: QueueRow) => {
      navigate(`/case/${row.doctype}/${row.docname}`);
    },
    [navigate],
  );

  // Close preview
  const handleClosePreview = useCallback(() => {
    setPreviewOpen(false);
    setSelectedRowId(null);
  }, [setPreviewOpen, setSelectedRowId]);

  // Open full detail from preview
  const handleOpenDetail = useCallback(() => {
    if (selectedRowId && previewDoctype) {
      navigate(`/case/${previewDoctype}/${selectedRowId}`);
    }
  }, [navigate, selectedRowId, previewDoctype]);

  // Escape to close preview
  useKeyboard([
    {
      key: "Escape",
      handler: handleClosePreview,
      enabled: previewOpen,
    },
  ]);

  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div
        className={cn(
          "flex flex-1 flex-col min-w-0",
          "transition-[margin] duration-[var(--duration-normal,200ms)]",
          // On mobile the panel overlays full-width; only shift content on sm+
          previewOpen && "sm:mr-[var(--preview-panel-width,420px)]",
        )}
      >
        {/* Filter bar */}
        <div className="shrink-0 border-b border-border-default px-[var(--space-4)] py-[var(--space-3)]">
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            statusOptions={statusOptions}
            queueKey={queueKey}
          />
        </div>

        {/* Queue list */}
        <div className="flex-1 overflow-auto">
          <QueueList
            queueKey={queueKey}
            scopeName={scopeName}
            filters={filters}
            onFiltersChange={setFilters}
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            ownerOverride={ownerOverride}
            onStatusOptionsReady={setDynamicStatusOptions}
          />
        </div>
      </div>

      {/* Preview panel — lazy-loaded; ErrorBoundary ensures a load failure
          doesn't crash the workbench, just collapses the panel gracefully */}
      {previewOpen && selectedRowId && previewDoctype && (
        <ErrorBoundary inline>
          <Suspense fallback={null}>
            <PreviewPanel
              doctype={previewDoctype}
              docname={selectedRowId}
              queueKey={queueKey}
              onClose={handleClosePreview}
              onOpenDetail={handleOpenDetail}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
}
