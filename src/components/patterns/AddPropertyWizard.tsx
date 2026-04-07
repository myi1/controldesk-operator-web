// ---------------------------------------------------------------------------
// AddPropertyWizard — 4-step property creation wizard
//
// Step 1: Identity   — label, reference ID
// Step 2: Address    — UAE/Dubai format: building, unit, community, emirate
// Step 3: Details    — stock types (multi-select), landlord accounts, notes
// Step 4: Review     — read-only summary before submit
//
// Uses WizardShell for chrome, usePropertiesBootstrap for filter options,
// createProperty mutation for submission.
// ---------------------------------------------------------------------------

import { useState, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Building2, MapPin, Tag, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "../../lib/cn";
import { WizardShell, type WizardStep } from "./WizardShell";
import { Input } from "../primitives/Input";
import { Checkbox } from "../primitives/Checkbox";
import { createProperty } from "../../api/property-surfaces";
import { usePropertiesBootstrap } from "../../hooks/use-properties";
import type { CreatePropertyPayload } from "../../types/api";

/* ------------------------------------------------------------------ */
/*  Constants                                                           */
/* ------------------------------------------------------------------ */

const WIZARD_STEPS: WizardStep[] = [
  { label: "Identity" },
  { label: "Address" },
  { label: "Details" },
  { label: "Review" },
];

const UAE_EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

const FALLBACK_STOCK_TYPES = [
  "Residential",
  "Commercial",
  "Retail",
  "Mixed Use",
  "Villa",
  "Townhouse",
  "Serviced Apartment",
  "Labour Accommodation",
];

/* ------------------------------------------------------------------ */
/*  Form state                                                          */
/* ------------------------------------------------------------------ */

interface FormData {
  property_label: string;
  property_reference_id: string;
  // UAE address fields
  building_name: string;
  unit_number: string;
  community: string;
  emirate: string;
  stock_types: string[];
  landlord_account_ids: string[];
  notes: string;
}

const EMPTY_FORM: FormData = {
  property_label: "",
  property_reference_id: "",
  building_name: "",
  unit_number: "",
  community: "",
  emirate: "Dubai",
  stock_types: [],
  landlord_account_ids: [],
  notes: "",
};

type FieldErrors = Partial<Record<keyof FormData | "stock_types_root" | "landlord_root", string>>;

/* ------------------------------------------------------------------ */
/*  Field row helpers                                                   */
/* ------------------------------------------------------------------ */

function FieldRow({ label, required, error, children }: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1">
        <span className="text-[length:var(--text-small-size)] font-medium text-fg-default">
          {label}
        </span>
        {required && (
          <span className="text-status-danger" aria-hidden="true">*</span>
        )}
      </div>
      {children}
      {error && (
        <p role="alert" className="text-[length:var(--text-caption-size)] text-status-danger">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 1 — Identity                                                   */
/* ------------------------------------------------------------------ */

function StepIdentity({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: FieldErrors;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-fg-muted">
        <Building2 size={16} aria-hidden="true" />
        <p className="text-[length:var(--text-small-size)]">
          Basic identity information for the property.
        </p>
      </div>

      <FieldRow label="Property Name" required error={errors.property_label}>
        <Input
          inputSize="lg"
          placeholder="e.g. Marina Gate Tower 1 – Unit 1204"
          value={data.property_label}
          onChange={(e) => onChange({ property_label: e.target.value })}
          aria-required="true"
          autoFocus
        />
      </FieldRow>

      <FieldRow
        label="Reference ID"
        error={errors.property_reference_id}
      >
        <Input
          inputSize="lg"
          placeholder="e.g. PROP-001 (auto-generated if left blank)"
          value={data.property_reference_id}
          onChange={(e) => onChange({ property_reference_id: e.target.value })}
        />
        <p className="text-[length:var(--text-caption-size)] text-fg-muted">
          Leave blank to auto-generate. Must be unique if provided.
        </p>
      </FieldRow>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 2 — Address (UAE/Dubai)                                        */
/* ------------------------------------------------------------------ */

function StepAddress({
  data,
  errors,
  onChange,
}: {
  data: FormData;
  errors: FieldErrors;
  onChange: (patch: Partial<FormData>) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-fg-muted">
        <MapPin size={16} aria-hidden="true" />
        <p className="text-[length:var(--text-small-size)]">
          Property location within the UAE.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldRow label="Building Name" required error={errors.building_name}>
          <Input
            inputSize="lg"
            placeholder="e.g. Marina Gate Tower 1"
            value={data.building_name}
            onChange={(e) => onChange({ building_name: e.target.value })}
            autoFocus
          />
        </FieldRow>

        <FieldRow label="Unit / Apartment No." error={errors.unit_number}>
          <Input
            inputSize="lg"
            placeholder="e.g. 1204"
            value={data.unit_number}
            onChange={(e) => onChange({ unit_number: e.target.value })}
          />
        </FieldRow>
      </div>

      <FieldRow label="Community / Area" required error={errors.community}>
        <Input
          inputSize="lg"
          placeholder="e.g. Dubai Marina, Downtown Dubai, JBR"
          value={data.community}
          onChange={(e) => onChange({ community: e.target.value })}
        />
      </FieldRow>

      <FieldRow label="Emirate" required error={errors.emirate}>
        <div className="relative">
          <select
            value={data.emirate}
            onChange={(e) => onChange({ emirate: e.target.value })}
            className={cn(
              "w-full appearance-none rounded-[var(--radius-md)] border border-border-default",
              "bg-bg-surface px-3 py-2.5 text-[length:var(--text-small-size)] text-fg-default",
              "outline-none transition-[border-color] duration-[var(--duration-fast)]",
              "focus:border-border-focus focus:outline-2 focus:outline-offset-2 focus:outline-border-focus",
              "cursor-pointer pr-8",
            )}
          >
            {UAE_EMIRATES.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-fg-muted">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </FieldRow>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 3 — Details (stock types, landlord, notes)                    */
/* ------------------------------------------------------------------ */

function StepDetails({
  data,
  errors,
  onChange,
  stockTypeOptions,
  landlordOptions,
}: {
  data: FormData;
  errors: FieldErrors;
  onChange: (patch: Partial<FormData>) => void;
  stockTypeOptions: string[];
  landlordOptions: Array<{ label: string; property_reference_id: string }>;
}) {
  const toggleStockType = useCallback((type: string) => {
    onChange({
      stock_types: data.stock_types.includes(type)
        ? data.stock_types.filter((t) => t !== type)
        : [...data.stock_types, type],
    });
  }, [data.stock_types, onChange]);

  const toggleLandlord = useCallback((id: string) => {
    onChange({
      landlord_account_ids: data.landlord_account_ids.includes(id)
        ? data.landlord_account_ids.filter((l) => l !== id)
        : [...data.landlord_account_ids, id],
    });
  }, [data.landlord_account_ids, onChange]);

  return (
    <div className="flex flex-col gap-6">
      {/* Stock types */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-1">
          <Tag size={14} className="text-fg-muted" aria-hidden="true" />
          <span className="text-[length:var(--text-small-size)] font-medium text-fg-default">
            Stock Type
          </span>
          <span className="text-status-danger" aria-hidden="true">*</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {stockTypeOptions.map((type) => (
            <label
              key={type}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border px-3 py-2.5 transition-colors",
                data.stock_types.includes(type)
                  ? "border-accent-primary/50 bg-accent-primary/5 text-fg-default"
                  : "border-border-default bg-bg-surface text-fg-muted hover:bg-bg-muted",
              )}
            >
              <Checkbox
                checked={data.stock_types.includes(type)}
                onCheckedChange={() => toggleStockType(type)}
              />
              <span className="text-[length:var(--text-small-size)]">{type}</span>
            </label>
          ))}
        </div>
        {errors.stock_types_root && (
          <p role="alert" className="text-[length:var(--text-caption-size)] text-status-danger">
            {errors.stock_types_root}
          </p>
        )}
      </div>

      {/* Landlord accounts */}
      {landlordOptions.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[length:var(--text-small-size)] font-medium text-fg-default">
              Landlord Account
            </span>
            <span className="text-status-danger" aria-hidden="true">*</span>
          </div>
          <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto pr-1">
            {landlordOptions.map((l) => (
              <label
                key={l.property_reference_id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border px-3 py-2 transition-colors",
                  data.landlord_account_ids.includes(l.property_reference_id)
                    ? "border-accent-primary/50 bg-accent-primary/5"
                    : "border-border-default bg-bg-surface hover:bg-bg-muted",
                )}
              >
                <Checkbox
                  checked={data.landlord_account_ids.includes(l.property_reference_id)}
                  onCheckedChange={() => toggleLandlord(l.property_reference_id)}
                />
                <span className="text-[length:var(--text-small-size)] text-fg-default">
                  {l.label}
                </span>
              </label>
            ))}
          </div>
          {errors.landlord_root && (
            <p role="alert" className="text-[length:var(--text-caption-size)] text-status-danger">
              {errors.landlord_root}
            </p>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-fg-muted" aria-hidden="true" />
          <span className="text-[length:var(--text-small-size)] font-medium text-fg-default">
            Internal Notes
          </span>
          <span className="text-[length:var(--text-caption-size)] text-fg-faint">(optional)</span>
        </div>
        <textarea
          value={data.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Any internal notes about this property…"
          rows={3}
          className={cn(
            "w-full resize-none rounded-[var(--radius-md)] border border-border-default bg-bg-surface",
            "px-3 py-2 text-[length:var(--text-small-size)] text-fg-default placeholder:text-fg-faint",
            "outline-none transition-[border-color] duration-[var(--duration-fast)]",
            "focus:border-border-focus focus:outline-2 focus:outline-offset-2 focus:outline-border-focus",
          )}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step 4 — Review                                                     */
/* ------------------------------------------------------------------ */

function ReviewRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-2.5 border-b border-border-default last:border-0">
      <dt className="text-[length:var(--text-small-size)] text-fg-muted">{label}</dt>
      <dd className="text-[length:var(--text-small-size)] font-medium text-fg-default">{value}</dd>
    </div>
  );
}

function StepReview({
  data,
  landlordOptions,
}: {
  data: FormData;
  landlordOptions: Array<{ label: string; property_reference_id: string }>;
}) {
  const landlordLabels = landlordOptions
    .filter((l) => data.landlord_account_ids.includes(l.property_reference_id))
    .map((l) => l.label)
    .join(", ") || "—";

  const address = [
    data.unit_number ? `Unit ${data.unit_number}` : "",
    data.building_name,
    data.community,
    data.emirate,
  ].filter(Boolean).join(", ");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 text-status-success">
        <CheckCircle2 size={16} aria-hidden="true" />
        <p className="text-[length:var(--text-small-size)] font-medium">
          Review your details before submitting.
        </p>
      </div>

      <dl className="rounded-[var(--radius-lg)] border border-border-default bg-bg-surface px-4">
        <ReviewRow label="Property Name" value={data.property_label} />
        {data.property_reference_id && (
          <ReviewRow label="Reference ID" value={data.property_reference_id} />
        )}
        <ReviewRow label="Address" value={address || "—"} />
        <ReviewRow
          label="Stock Types"
          value={data.stock_types.length > 0 ? data.stock_types.join(", ") : "—"}
        />
        <ReviewRow label="Landlord(s)" value={landlordLabels} />
        {data.notes && <ReviewRow label="Notes" value={data.notes} />}
      </dl>

      <p className="text-[length:var(--text-caption-size)] text-fg-faint">
        Clicking Submit will create this property. You can edit it afterwards from the Properties page.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main wizard                                                         */
/* ------------------------------------------------------------------ */

interface AddPropertyWizardProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (propertyReferenceId: string) => void;
}

export function AddPropertyWizard({ open, onClose, onSuccess }: AddPropertyWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});

  const queryClient = useQueryClient();
  const { data: bootstrap } = usePropertiesBootstrap();

  const stockTypeOptions = useMemo(
    () => bootstrap?.filter_options?.stock_types?.length
      ? bootstrap.filter_options.stock_types
      : FALLBACK_STOCK_TYPES,
    [bootstrap],
  );

  const landlordOptions = useMemo(
    () => bootstrap?.filter_options?.properties ?? [],
    [bootstrap],
  );

  const mutation = useMutation({
    mutationFn: (payload: CreatePropertyPayload) => createProperty(payload),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["properties-bootstrap"] });
      onSuccess?.(data.property_reference_id);
      handleClose();
    },
  });

  const patch = useCallback((update: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...update }));
    // Clear errors for touched fields
    setErrors((prev) => {
      const next = { ...prev };
      for (const key of Object.keys(update)) {
        delete next[key as keyof FieldErrors];
      }
      return next;
    });
  }, []);

  const handleClose = () => {
    setCurrentStep(0);
    setFormData(EMPTY_FORM);
    setErrors({});
    mutation.reset();
    onClose();
  };

  // Validate current step — return true if valid
  const validateStep = (step: number): boolean => {
    const errs: FieldErrors = {};

    if (step === 0) {
      if (!formData.property_label.trim()) {
        errs.property_label = "Property name is required.";
      }
    }

    if (step === 1) {
      if (!formData.building_name.trim()) errs.building_name = "Building name is required.";
      if (!formData.community.trim()) errs.community = "Community / area is required.";
      if (!formData.emirate.trim()) errs.emirate = "Emirate is required.";
    }

    if (step === 2) {
      if (formData.stock_types.length === 0) {
        errs.stock_types_root = "Select at least one stock type.";
      }
      if (landlordOptions.length > 0 && formData.landlord_account_ids.length === 0) {
        errs.landlord_root = "Select at least one landlord account.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (!validateStep(currentStep)) return;

    const payload: CreatePropertyPayload = {
      property_label: formData.property_label.trim(),
      ...(formData.property_reference_id.trim() && {
        property_reference_id: formData.property_reference_id.trim(),
      }),
      address: {
        // Map UAE fields → generic address schema for the API
        line1: [
          formData.unit_number.trim() ? `Unit ${formData.unit_number.trim()}` : "",
          formData.building_name.trim(),
        ].filter(Boolean).join(", "),
        line2: formData.community.trim() || undefined,
        city: formData.emirate.trim(),
        country: "UAE",
      },
      stock_types: formData.stock_types,
      landlord_account_ids: formData.landlord_account_ids,
      ...(formData.notes.trim() && { notes: formData.notes.trim() }),
    };

    mutation.mutate(payload);
  };

  const isDirty = JSON.stringify(formData) !== JSON.stringify(EMPTY_FORM);

  const stepContent = [
    <StepIdentity key={0} data={formData} errors={errors} onChange={patch} />,
    <StepAddress key={1} data={formData} errors={errors} onChange={patch} />,
    <StepDetails
      key={2}
      data={formData}
      errors={errors}
      onChange={patch}
      stockTypeOptions={stockTypeOptions}
      landlordOptions={landlordOptions}
    />,
    <StepReview key={3} data={formData} landlordOptions={landlordOptions} />,
  ];

  return (
    <WizardShell
      open={open}
      onOpenChange={(next) => { if (!next) handleClose(); }}
      title="Add Property"
      steps={WIZARD_STEPS}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={handleSubmit}
      canAdvance={true}
      isSubmitting={mutation.isPending}
      submitError={mutation.error?.message ?? null}
      isDirty={isDirty}
    >
      {stepContent[currentStep]}
    </WizardShell>
  );
}
