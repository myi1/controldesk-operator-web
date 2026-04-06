import { useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../lib/cn";
import { Button } from "../primitives/Button";
import { Select } from "../primitives/Select";
import { Toggle } from "../primitives/Toggle";
import { FilterChip } from "../composites/FilterChip";
import { ALL_ESCALATION_STATES, type EscalationState } from "../../types/enums";
import type { QueueFilters } from "../../types/ui";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface FilterBarProps {
  filters: QueueFilters;
  onFiltersChange: (filters: QueueFilters) => void;
  statusOptions?: string[];
  queueKey?: string;
  totalCount?: number;
}

/* ------------------------------------------------------------------ */
/*  Debounced text input sub-component                                 */
/* ------------------------------------------------------------------ */

/**
 * Generic debounced text input. Maintains its own local state so every
 * keystroke does not trigger a re-render of the parent. Parent resets
 * the input via `key` prop when the external value changes.
 */
function DebouncedInput({
  initialValue,
  onCommit,
  placeholder,
  className,
  icon: Icon,
}: {
  initialValue: string;
  onCommit: (value: string) => void;
  placeholder: string;
  className?: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onCommit(value), 300);
    },
    [onCommit],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={cn("relative", className ?? "w-[180px]")}>
      {Icon && (
        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5">
          <Icon size={14} className="text-fg-faint" />
        </span>
      )}
      <input
        type="search"
        placeholder={placeholder}
        defaultValue={initialValue}
        onChange={handleChange}
        className={cn(
          "h-8 w-full rounded-[var(--radius-md)] border border-border-default bg-bg-surface pr-3",
          Icon ? "pl-8" : "pl-3",
          "text-[length:var(--text-small-size)] text-fg-default placeholder:text-fg-faint",
          "outline-none transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
          "focus-visible:border-[var(--ring-focus)] focus-visible:shadow-[var(--shadow-focus)]",
        )}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function FilterBar({
  filters,
  onFiltersChange,
  statusOptions = [],
  totalCount,
}: FilterBarProps) {
  const handleSearch = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, search_text: value || undefined });
    },
    [filters, onFiltersChange],
  );

  const handleOwner = useCallback(
    (value: string) => {
      onFiltersChange({ ...filters, owner: value || undefined });
    },
    [filters, onFiltersChange],
  );

  // Collect active filter chips
  const chips: { key: string; label: string; value: string }[] = [];
  if (filters.status) chips.push({ key: "status", label: "Status", value: filters.status });
  if (filters.owner) chips.push({ key: "owner", label: "Owner", value: filters.owner });
  if (filters.escalation_state) {
    chips.push({ key: "escalation", label: "Escalation", value: filters.escalation_state });
  }
  if (filters.only_overdue) chips.push({ key: "overdue", label: "Overdue", value: "Yes" });

  function removeFilter(key: string) {
    const next = { ...filters };
    if (key === "status") next.status = undefined;
    else if (key === "owner") next.owner = undefined;
    else if (key === "escalation") next.escalation_state = undefined;
    else if (key === "overdue") next.only_overdue = undefined;
    onFiltersChange(next);
  }

  function clearAllFilters() {
    onFiltersChange({});
  }

  const escalationOptions = ALL_ESCALATION_STATES.map((s) => ({
    value: s,
    label: s.charAt(0).toUpperCase() + s.slice(1),
  }));

  const statusSelectOptions = statusOptions.map((s) => ({
    value: s,
    label: s
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" "),
  }));

  return (
    <div className="flex flex-col gap-2">
      {/* Main filter row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Status filter */}
        {statusSelectOptions.length > 0 && (
          <Select
            placeholder="Status"
            options={statusSelectOptions}
            value={filters.status}
            onValueChange={(v) =>
              onFiltersChange({ ...filters, status: v || undefined })
            }
            className="w-[140px]"
          />
        )}

        {/* Escalation filter */}
        <Select
          placeholder="Escalation"
          options={escalationOptions}
          value={filters.escalation_state}
          onValueChange={(v) =>
            onFiltersChange({
              ...filters,
              escalation_state: (v as EscalationState) || undefined,
            })
          }
          className="w-[140px]"
        />

        {/* Owner filter — debounced text search */}
        <DebouncedInput
          key={filters.owner ?? "owner"}
          initialValue={filters.owner ?? ""}
          onCommit={handleOwner}
          placeholder="Owner..."
          className="w-[150px]"
        />

        {/* Overdue toggle */}
        <Toggle
          label="Overdue"
          checked={filters.only_overdue ?? false}
          onCheckedChange={(checked) =>
            onFiltersChange({
              ...filters,
              only_overdue: checked || undefined,
            })
          }
        />

        {/* Clear all — visible only when at least one filter is active */}
        {chips.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={clearAllFilters}
          >
            Clear
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Debounced search input */}
        <DebouncedInput
          key={filters.search_text ?? "search"}
          initialValue={filters.search_text ?? ""}
          onCommit={handleSearch}
          placeholder="Search..."
          className="w-[200px]"
          icon={Search}
        />

        {/* Count display */}
        {totalCount != null && (
          <span className="text-[length:var(--text-caption-size)] text-fg-muted whitespace-nowrap">
            {totalCount.toLocaleString()} items
          </span>
        )}
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((chip) => (
            <FilterChip
              key={chip.key}
              label={chip.label}
              value={chip.value}
              onRemove={() => removeFilter(chip.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
