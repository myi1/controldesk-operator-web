// ---------------------------------------------------------------------------
// UserPickerField — searchable combobox for selecting a user (by role) from
// the auth users endpoint. Mirrors UnitPickerField UX patterns.
// UX: progressive-disclosure + touch-target-size + no-precision-required
// ---------------------------------------------------------------------------

import { useState, useId, useRef, useEffect, useMemo } from "react";
import { Search, User, X, ChevronDown } from "lucide-react";
import { cn } from "../../lib/cn";
import { useUsersByRole } from "../../hooks/use-auth";

interface UserPickerFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (username: string) => void;
  error?: string;
  hint?: string;
  /** Restrict the list to users who have this role */
  filterRole?: string;
}

export function UserPickerField({
  label,
  required,
  value,
  onChange,
  error,
  hint,
  filterRole,
}: UserPickerFieldProps) {
  const fieldId = `user-picker-${useId()}`;
  const listId = `user-picker-list-${useId()}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const { data: users = [], isLoading } = useUsersByRole(filterRole);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtered list based on search query
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users.slice(0, 50);
    return users.filter((u) => u.username.toLowerCase().includes(q));
  }, [users, query]);

  // Close on outside click
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

  const handleSelect = (username: string) => {
    onChange(username);
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

      {/* Trigger button */}
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
              <User size={13} className="shrink-0 text-fg-muted" aria-hidden="true" />
              <span className="truncate">{value}</span>
            </>
          ) : (
            <span>Search for a team member…</span>
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
              placeholder="Type to filter…"
              aria-label="Filter team members"
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
            aria-label="Team members"
            className="max-h-48 overflow-y-auto py-1"
          >
            {isLoading && (
              <li className="px-3 py-2 text-[length:var(--text-small-size)] text-fg-faint">
                Loading…
              </li>
            )}
            {!isLoading && filtered.length === 0 && (
              <li className="px-3 py-2 text-[length:var(--text-small-size)] text-fg-faint">
                No team members found.
              </li>
            )}
            {filtered.map((user) => (
              <li
                key={user.username}
                role="option"
                aria-selected={user.username === value}
                onClick={() => handleSelect(user.username)}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 px-3 py-2.5",
                  "text-[length:var(--text-small-size)] transition-colors duration-100",
                  user.username === value
                    ? "bg-accent-primary/10 text-fg-default"
                    : "text-fg-default hover:bg-bg-hover",
                )}
              >
                <User size={13} className="shrink-0 text-fg-muted" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.username}</p>
                  {user.default_actor_role && (
                    <p className="truncate text-[length:var(--text-caption-size)] text-fg-muted">
                      {user.default_actor_role}
                    </p>
                  )}
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
