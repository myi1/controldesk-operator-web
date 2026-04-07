// ---------------------------------------------------------------------------
// UnitPickerField — searchable combobox for selecting a unit from the
// units bootstrap data. Avoids manual unit_id entry in runner forms.
// UX: progressive-disclosure + no-precision-required + touch-target-size
// ---------------------------------------------------------------------------

import { useState, useId, useRef, useEffect, useMemo } from "react";
import { Search, DoorOpen, X, ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { useUnitsBootstrap } from "../../hooks/use-properties";

interface UnitPickerFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (unitId: string) => void;
  error?: string;
  hint?: string;
}

export function UnitPickerField({
  label,
  required,
  value,
  onChange,
  error,
  hint,
}: UnitPickerFieldProps) {
  const fieldId = `unit-picker-${useId()}`;
  const listId = `unit-picker-list-${useId()}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const { data, isLoading } = useUnitsBootstrap();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Find the display label for the currently selected value
  const selectedUnit = useMemo(
    () => data?.rows.find((r) => r.unit_id === value) ?? null,
    [data, value],
  );

  const displayValue = selectedUnit
    ? `${selectedUnit.title || selectedUnit.unit_id}${selectedUnit.property_label ? ` — ${selectedUnit.property_label}` : ""}`
    : "";

  // Filtered list based on search query
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return data.rows.slice(0, 50); // show first 50 when no query
    return data.rows.filter(
      (r) =>
        r.unit_id.toLowerCase().includes(q) ||
        (r.title || "").toLowerCase().includes(q) ||
        (r.property_label || "").toLowerCase().includes(q),
    );
  }, [data, query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (unitId: string) => {
    onChange(unitId);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setQuery("");
    setOpen(false);
  };

  const openDropdown = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Label */}
      <label
        htmlFor={fieldId}
        className="mb-1 block text-[length:var(--text-small-size)] font-medium text-fg-default"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-status-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {/* Trigger button — shows selected value or placeholder */}
      <button
        type="button"
        id={fieldId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        onClick={openDropdown}
        className={cn(
          "flex min-h-[2.5rem] w-full items-center justify-between gap-2",
          "rounded-[var(--radius-md)] border px-3 py-2",
          "bg-bg-surface text-left text-[length:var(--text-small-size)]",
          "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus",
          "cursor-pointer",
          error
            ? "border-status-danger"
            : open
              ? "border-[var(--ring-focus)] shadow-[var(--shadow-focus)]"
              : "border-border-default hover:border-border-strong",
        )}
      >
        <span className={cn("flex min-w-0 items-center gap-2 truncate", !value && "text-fg-faint")}>
          {value ? (
            <>
              <DoorOpen size={13} className="shrink-0 text-fg-muted" aria-hidden="true" />
              <span className="truncate">{displayValue || value}</span>
            </>
          ) : (
            <span>Search for a unit…</span>
          )}
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {value && (
            <span
              role="button"
              aria-label="Clear selection"
              onClick={handleClear}
              className="rounded p-0.5 text-fg-faint hover:text-fg-default"
            >
              <X size={12} />
            </span>
          )}
          <ChevronDown
            size={14}
            className={cn("text-fg-faint transition-transform duration-150", open && "rotate-180")}
            aria-hidden="true"
          />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 w-full rounded-[var(--radius-md)] border border-border-default",
            "bg-bg-surface shadow-[var(--shadow-lg)]",
            "overflow-hidden",
          )}
        >
          {/* Search input */}
          <div className="flex items-center gap-2 border-b border-border-default px-3 py-2">
            <Search size={13} className="shrink-0 text-fg-faint" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter units…"
              aria-label="Filter units"
              className={cn(
                "flex-1 bg-transparent text-[length:var(--text-small-size)] text-fg-default",
                "placeholder:text-fg-faint outline-none",
              )}
            />
          </div>

          {/* Options list */}
          <ul
            id={listId}
            role="listbox"
            aria-label="Units"
            className="max-h-56 overflow-y-auto py-1"
          >
            {isLoading && (
              <li className="px-3 py-2 text-[length:var(--text-small-size)] text-fg-faint">
                Loading units…
              </li>
            )}
            {!isLoading && filtered.length === 0 && (
              <li className="px-3 py-2 text-[length:var(--text-small-size)] text-fg-faint">
                No units found.
              </li>
            )}
            {filtered.map((unit) => (
              <li
                key={unit.unit_id}
                role="option"
                aria-selected={unit.unit_id === value}
                onClick={() => handleSelect(unit.unit_id)}
                className={cn(
                  "flex cursor-pointer items-start gap-2.5 px-3 py-2.5",
                  "text-[length:var(--text-small-size)] transition-colors duration-100",
                  unit.unit_id === value
                    ? "bg-action-primary-default/10 text-fg-default"
                    : "text-fg-default hover:bg-bg-muted",
                )}
              >
                <DoorOpen size={13} className="mt-0.5 shrink-0 text-fg-muted" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{unit.title || unit.unit_id}</p>
                  {unit.property_label && (
                    <p className="truncate text-[length:var(--text-caption-size)] text-fg-muted">
                      {unit.property_label}
                    </p>
                  )}
                  <p className="font-mono text-[length:var(--text-caption-size)] text-fg-faint">
                    {unit.unit_id}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Error / Hint */}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-[length:var(--text-caption-size)] text-status-danger">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className="mt-1 text-[length:var(--text-caption-size)] text-fg-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
