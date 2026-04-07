// ---------------------------------------------------------------------------
// FieldRenderer — maps a FieldDef to the appropriate primitive component
// ---------------------------------------------------------------------------

import { useId } from "react";
import { cn } from "../../lib/cn";
import { Input } from "../primitives/Input";
import { Select } from "../primitives/Select";
import { Checkbox } from "../primitives/Checkbox";
import type { FieldDef, SelectOption, FieldValues } from "../../types/runner";
import { UnitPickerField } from "./UnitPickerField";
import { UserPickerField } from "./UserPickerField";

interface FieldRendererProps {
  field: FieldDef;
  value: FieldValues[string];
  onChange: (value: FieldValues[string]) => void;
  error?: string;
  /** Runtime options from bootstrap form_options — overrides field.options */
  optionsOverride?: SelectOption[];
}

export function FieldRenderer({
  field,
  value,
  onChange,
  error,
  optionsOverride,
}: FieldRendererProps) {
  const autoId = useId();
  const fieldId = `field-${field.key}-${autoId}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  // ---------------------------------------------------------------------------
  // Label with required indicator
  // ---------------------------------------------------------------------------
  const LabelEl = (
    <label
      htmlFor={fieldId}
      className="text-[length:var(--text-small-size)] font-medium text-fg-default block mb-1"
    >
      {field.label}
      {field.required && (
        <span className="ml-0.5 text-status-danger" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );

  // ---------------------------------------------------------------------------
  // Hint text
  // ---------------------------------------------------------------------------
  const HintEl = field.hint && !error ? (
    <p id={hintId} className="text-[length:var(--text-caption-size)] text-fg-muted mt-1">
      {field.hint}
    </p>
  ) : null;

  // ---------------------------------------------------------------------------
  // Error text
  // ---------------------------------------------------------------------------
  const ErrorEl = error ? (
    <p
      id={errorId}
      role="alert"
      className="text-[length:var(--text-caption-size)] text-status-danger mt-1"
    >
      {error}
    </p>
  ) : null;

  // ---------------------------------------------------------------------------
  // text / reference-text / date / number → Input
  // ---------------------------------------------------------------------------
  if (
    field.type === "text" ||
    field.type === "reference-text" ||
    field.type === "date" ||
    field.type === "number"
  ) {
    const inputType =
      field.type === "date"
        ? "date"
        : field.type === "number"
          ? "number"
          : "text";

    return (
      <div>
        <Input
          id={fieldId}
          type={inputType}
          label={field.label}
          placeholder={field.placeholder}
          helperText={field.hint}
          error={error}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          min={field.min !== undefined ? String(field.min) : undefined}
          max={field.max !== undefined ? String(field.max) : undefined}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // textarea
  // ---------------------------------------------------------------------------
  if (field.type === "textarea") {
    return (
      <div>
        {LabelEl}
        <textarea
          id={fieldId}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : field.hint ? hintId : undefined}
          className={cn(
            "w-full rounded-[var(--radius-md)] border border-border-default bg-bg-surface px-3 py-2",
            "text-[length:var(--text-small-size)] text-fg-default placeholder:text-fg-faint",
            "outline-none resize-none",
            "focus-visible:border-[var(--ring-focus)] focus-visible:shadow-[var(--shadow-focus)]",
            "transition-[border-color,box-shadow] duration-[var(--duration-fast)]",
            error
              ? "border-status-danger"
              : "border-border-default",
          )}
        />
        {ErrorEl}
        {HintEl}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // select
  // ---------------------------------------------------------------------------
  if (field.type === "select") {
    const options = optionsOverride ?? field.options ?? [];
    return (
      <div>
        <Select
          label={field.label}
          placeholder={field.placeholder ?? "Select…"}
          options={options}
          value={typeof value === "string" ? value : ""}
          onValueChange={(v) => onChange(v)}
          error={error}
        />
        {HintEl}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // checkbox — single boolean toggle
  // ---------------------------------------------------------------------------
  if (field.type === "checkbox") {
    return (
      <div>
        <Checkbox
          label={field.label}
          checked={Boolean(value)}
          onCheckedChange={(checked) => onChange(Boolean(checked))}
        />
        {field.hint && (
          <p className="text-[length:var(--text-caption-size)] text-fg-muted mt-1 ml-6">
            {field.hint}
          </p>
        )}
        {ErrorEl}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // checklist — multi-select via array of strings
  // ---------------------------------------------------------------------------
  if (field.type === "checklist") {
    const selected: string[] = Array.isArray(value) ? (value as string[]) : [];
    const options = optionsOverride ?? field.options ?? [];

    const toggle = (optValue: string) => {
      const next = selected.includes(optValue)
        ? selected.filter((v) => v !== optValue)
        : [...selected, optValue];
      onChange(next);
    };

    return (
      <div>
        {LabelEl}
        <div className="flex flex-col gap-2 mt-1">
          {options.map((opt) => (
            <Checkbox
              key={opt.value}
              label={opt.label}
              checked={selected.includes(opt.value)}
              onCheckedChange={() => toggle(opt.value)}
            />
          ))}
        </div>
        {ErrorEl}
        {HintEl}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // unit-picker — searchable combobox populated from units bootstrap
  // ---------------------------------------------------------------------------
  if (field.type === "unit-picker") {
    return (
      <UnitPickerField
        label={field.label}
        required={field.required}
        value={typeof value === "string" ? value : ""}
        onChange={(unitId) => onChange(unitId)}
        error={error}
        hint={field.hint}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // user-picker — searchable combobox populated from auth users endpoint
  // ---------------------------------------------------------------------------
  if (field.type === "user-picker") {
    return (
      <UserPickerField
        label={field.label}
        required={field.required}
        value={typeof value === "string" ? value : ""}
        onChange={(username) => onChange(username)}
        error={error}
        hint={field.hint}
        filterRole={field.filterRole}
      />
    );
  }

  // Fallback — should never be reached if FieldDef types are exhaustive
  return null;
}
