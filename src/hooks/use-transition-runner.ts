// ---------------------------------------------------------------------------
// useTransitionRunner — state, validation, payload assembly, and mutation
// for a single RunnerConfig invocation
// ---------------------------------------------------------------------------

import { useState, useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useBootstrap } from "./use-bootstrap";
import { useRoleGate } from "./use-role-gate";
import { advanceLifecycle } from "../api/runners";
import { ApiError } from "../api/client";
import type { RunnerConfig, FieldDef, FieldValues, SelectOption } from "../types/runner";
import type { BootstrapFormOptions } from "../types/api";

/* ------------------------------------------------------------------ */
/*  Error mapping                                                       */
/* ------------------------------------------------------------------ */

function mapApiError(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.httpStatus === 400)
      return "The submitted data was rejected. Check required fields and try again.";
    if (err.httpStatus === 403)
      return "You do not have permission to perform this action.";
    if (err.httpStatus === 404)
      return "This record no longer exists. Refresh the page.";
    if (err.httpStatus === 409)
      return "This action conflicts with a concurrent change. Refresh and retry.";
    if (err.httpStatus === 422)
      return "Validation failed. Review your inputs.";
    if (err.httpStatus >= 500)
      return "A server error occurred. Please try again in a moment.";
    return err.message;
  }
  return "An unexpected error occurred. Please try again.";
}

/* ------------------------------------------------------------------ */
/*  Form options resolver                                               */
/* ------------------------------------------------------------------ */

/**
 * Given a lifecycle name and a field key, return the matching runtime options
 * from bootstrap form_options, or fall back to the field's static options.
 *
 * Lookup map:
 *   maintenance → urgency / issue_type / liability_view / blocker_reason
 *   onboarding  → blocker_reason
 *   moveout     → blocker_reason
 *   receivables → blocker_reason / payment_method
 *   vacancy     → stall_reason
 *   service_recovery → trigger_type / severity
 */
function getFormOptions(
  lifecycle: string,
  fieldKey: string,
  formOptions: BootstrapFormOptions | undefined,
): string[] | undefined {
  if (!formOptions) return undefined;

  const lc = lifecycle.replace(/-/g, "_"); // normalise hyphens

  switch (lc) {
    case "maintenance":
      if (fieldKey === "urgency") return formOptions.maintenance?.urgency;
      if (fieldKey === "issue_type") return formOptions.maintenance?.issue_type;
      if (fieldKey === "liability_view") return formOptions.maintenance?.liability_view;
      if (fieldKey === "blocker_reason") return formOptions.maintenance?.blocker_reason;
      break;
    case "onboarding":
      if (fieldKey === "blocker_reason") return formOptions.onboarding?.blocker_reason;
      break;
    case "moveout":
      if (fieldKey === "blocker_reason") return formOptions.moveout?.blocker_reason;
      break;
    case "receivables":
      if (fieldKey === "blocker_reason") return formOptions.receivables?.blocker_reason;
      if (fieldKey === "payment_method") return formOptions.receivables?.payment_method;
      break;
    case "vacancy":
      if (fieldKey === "stall_reason") return formOptions.vacancy?.stall_reason;
      break;
    case "service_recovery":
      if (fieldKey === "trigger_type") return formOptions.service_recovery?.trigger_type;
      if (fieldKey === "severity") return formOptions.service_recovery?.severity;
      break;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  Validation helpers                                                  */
/* ------------------------------------------------------------------ */

function isFieldValid(field: FieldDef, value: FieldValues[string]): boolean {
  if (!field.required) return true;

  switch (field.type) {
    case "text":
    case "reference-text":
    case "date":
    case "number":
    case "select":
    case "unit-picker":
    case "user-picker":
      return typeof value === "string" && value.trim().length > 0;
    case "textarea": {
      const str = typeof value === "string" ? value : "";
      if (str.trim().length === 0) return false;
      if (field.minLength !== undefined && str.length < field.minLength) return false;
      return true;
    }
    case "checkbox":
      return value === true;
    case "checklist":
      return Array.isArray(value) && (value as string[]).length > 0;
  }
}

function validateStep(fields: FieldDef[], values: FieldValues): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = values[field.key];
    if (!isFieldValid(field, value ?? "")) {
      if (field.type === "checklist") {
        errors[field.key] = `Select at least one option.`;
      } else if (field.type === "checkbox") {
        errors[field.key] = `This field is required.`;
      } else if (field.type === "textarea" && field.minLength !== undefined) {
        errors[field.key] = `Minimum ${field.minLength} characters required.`;
      } else if (field.type === "number" && field.min !== undefined && field.max !== undefined) {
        errors[field.key] = `Enter a value between ${field.min} and ${field.max}.`;
      } else {
        errors[field.key] = `This field is required.`;
      }
    }
  }
  return errors;
}

/* ------------------------------------------------------------------ */
/*  Payload assembly helpers                                            */
/* ------------------------------------------------------------------ */

/** T+3 in ISO date format (YYYY-MM-DD) */
function targetDateT3(): string {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return d.toISOString().slice(0, 10);
}

/** 'maintenance.assign_technician' → 'Assign Technician' */
function deriveNextAction(configId: string): string {
  const parts = configId.split(".");
  const action = parts.slice(1).join("_");
  return action
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*  Hook return type                                                    */
/* ------------------------------------------------------------------ */

export interface TransitionRunnerState {
  currentStep: number;
  totalSteps: number;
  stepDef: RunnerConfig["steps"][number] | undefined;
  canAdvance: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  goNext: () => void;
  goBack: () => void;
  values: FieldValues;
  errors: Record<string, string>;
  setFieldValue: (key: string, value: FieldValues[string]) => void;
  isSubmitting: boolean;
  submitError: string | null;
  submit: () => Promise<void>;
  isDirty: boolean;
  hasRequiredRole: boolean;
  resolveFieldOptions: (field: FieldDef) => SelectOption[];
}

/* ------------------------------------------------------------------ */
/*  useTransitionRunner                                                 */
/* ------------------------------------------------------------------ */

export interface UseTransitionRunnerOptions {
  config: RunnerConfig;
  recordId: string;
  onSuccess: (message: string) => void;
  onClose: () => void;
}

export function useTransitionRunner({
  config,
  recordId,
  onSuccess,
  onClose,
}: UseTransitionRunnerOptions): TransitionRunnerState {
  const queryClient = useQueryClient();
  const { data: bootstrap } = useBootstrap();
  const { activeRoles } = useRoleGate();

  const [currentStep, setCurrentStep] = useState(0);
  const [values, setValues] = useState<FieldValues>(() => {
    // Seed default values from FieldDef.defaultValue
    const init: FieldValues = {};
    for (const step of config.steps) {
      for (const field of step.fields) {
        if (field.defaultValue !== undefined) {
          init[field.key] = field.defaultValue;
        }
      }
    }
    return init;
  });
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const totalSteps = config.steps.length;
  const stepDef = config.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  const isDirty = hasUserInteracted;

  const formOptions = bootstrap?.form_options;

  // Role check
  const hasRequiredRole = useMemo(
    () => config.allowedRoles.some((r) => activeRoles.includes(r)),
    [config.allowedRoles, activeRoles],
  );

  // canAdvance: all required fields in the current step are valid and role OK
  const canAdvance = useMemo(() => {
    if (!hasRequiredRole) return false;
    if (!stepDef) return false;
    return stepDef.fields.every((f) => isFieldValid(f, values[f.key] ?? ""));
  }, [hasRequiredRole, stepDef, values]);

  const setFieldValue = useCallback((key: string, value: FieldValues[string]) => {
    setHasUserInteracted(true);
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const goNext = useCallback(() => {
    if (!stepDef) return;
    const stepErrors = validateStep(stepDef.fields, values);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [stepDef, values, totalSteps]);

  const goBack = useCallback(() => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const resolveFieldOptions = useCallback(
    (field: FieldDef): SelectOption[] => {
      const raw = getFormOptions(config.lifecycle, field.key, formOptions);
      if (raw && raw.length > 0) {
        return raw.map((v) => ({ value: v, label: v }));
      }
      return field.options ?? [];
    },
    [config.lifecycle, formOptions],
  );

  const submit = useCallback(async () => {
    if (!isLastStep) return;

    // Final validation across all steps
    const allErrors: Record<string, string> = {};
    for (const step of config.steps) {
      Object.assign(allErrors, validateStep(step.fields, values));
    }
    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Collect non-empty field values from all steps
      const fieldValues: Record<string, unknown> = {};
      for (const step of config.steps) {
        for (const field of step.fields) {
          const val = values[field.key];
          if (val !== undefined && val !== "" && val !== false) {
            fieldValues[field.key] = val;
          }
        }
      }

      const payload: Record<string, unknown> = {};

      // Auto-compute lifecycle fields only for /advance runners (default: true)
      const useAutoFields = config.autoFields !== false;
      if (useAutoFields) {
        // target_status: everything after the first dot in config.id
        const target_status = config.id.split(".").slice(1).join(".");

        // next_action: from form field if present; else derive from config.id
        const next_action =
          typeof fieldValues["next_action"] === "string"
            ? fieldValues["next_action"]
            : deriveNextAction(config.id);
        delete fieldValues["next_action"];

        // target_date: from form field if present; else T+3
        const target_date =
          typeof fieldValues["target_date"] === "string" && fieldValues["target_date"]
            ? fieldValues["target_date"]
            : targetDateT3();
        delete fieldValues["target_date"];

        payload.target_status = target_status;
        payload.next_action = next_action;
        payload.target_date = target_date;
      }

      // Merge: fixedPayload overrides auto-fields; form values override fixedPayload
      Object.assign(payload, config.fixedPayload ?? {}, fieldValues);

      await advanceLifecycle(config.endpoint, recordId, payload, config.method);

      // Invalidate TanStack Query caches
      for (const key of config.invalidates) {
        await queryClient.invalidateQueries({ queryKey: [key] });
      }

      onSuccess(config.successMessage);
      onClose();
    } catch (err) {
      setSubmitError(mapApiError(err));
    } finally {
      setIsSubmitting(false);
    }
  }, [config, isLastStep, values, recordId, queryClient, onSuccess, onClose]);

  return {
    currentStep,
    totalSteps,
    stepDef,
    canAdvance,
    isFirstStep,
    isLastStep,
    goNext,
    goBack,
    values,
    errors,
    setFieldValue,
    isSubmitting,
    submitError,
    submit,
    isDirty,
    hasRequiredRole,
    resolveFieldOptions,
  };
}
