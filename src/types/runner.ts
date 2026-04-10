// ---------------------------------------------------------------------------
// Runner engine domain types
// ---------------------------------------------------------------------------

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "number"
  | "select"
  | "checkbox"
  | "checklist"
  | "reference-text"
  | "unit-picker"
  | "user-picker";

export interface SelectOption {
  value: string;
  label: string;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  hint?: string;
  /** Static options — runtime values injected by resolveFieldOptions() for form_options-backed fields */
  options?: SelectOption[];
  minLength?: number;
  min?: number;
  max?: number;
  defaultValue?: string | boolean | number;
  /** For user-picker fields: filter users by this role */
  filterRole?: string;
}

export interface RunnerStepDef {
  label: string;
  description: string;
  fields: FieldDef[];
}

export interface RunnerConfig {
  /** Matches action_key: '{lifecycle}.{target_status}' */
  id: string;
  title: string;
  description: string;
  lifecycle: string;
  /** Path template — {id} is replaced with the record docname at call time */
  endpoint: string;
  method: "POST" | "PUT" | "PATCH";
  mode: "modal" | "full-page";
  fixedPayload?: Record<string, unknown>;
  steps: RunnerStepDef[];
  /** TanStack Query keys to invalidate on success */
  invalidates: string[];
  successMessage: string;
  allowedRoles: string[];
  /**
   * When true (default for /advance endpoints), the hook auto-computes
   * target_status, next_action, and target_date and merges them into the payload.
   * Set to false for specific action endpoints (e.g. /start-document-collection)
   * where these fields are not required or are controlled by fixedPayload.
   */
  autoFields?: boolean;
}

export interface ConfirmActionConfig {
  /** Matches action_key: '{lifecycle}.{target_status}' */
  id: string;
  title: string;
  description: string;
  lifecycle: string;
  /** Path template — {id} is replaced with the record docname at POST time */
  endpoint: string;
  method: "POST";
  fixedPayload?: Record<string, unknown>;
  /** TanStack Query keys to invalidate on success */
  invalidates: string[];
  successMessage: string;
  allowedRoles: string[];
  confirmLabel: string;
  confirmVariant: "primary" | "danger";
}

export type AnyRunnerConfig = RunnerConfig | ConfirmActionConfig;

export function isConfirmActionConfig(c: AnyRunnerConfig): c is ConfirmActionConfig {
  return !("steps" in c);
}

export type FieldValues = Record<string, string | boolean | number | string[]>;
