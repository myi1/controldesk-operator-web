// ---------------------------------------------------------------------------
// Unit CRUD runner configs
// Endpoint base: /api/v1/units
// ---------------------------------------------------------------------------

import type { RunnerConfig, ConfirmActionConfig } from "../../types/runner";

const INVALIDATES = ["units-bootstrap"];

const ALLOWED_ROLES = [
  "PM Coordinator",
  "PM Manager / Senior PM Coordinator",
  "PM Head",
];

const STOCK_TYPE_OPTIONS = [
  { value: "Apartment", label: "Apartment" },
  { value: "Villa", label: "Villa" },
  { value: "Townhouse", label: "Townhouse" },
  { value: "Studio", label: "Studio" },
  { value: "Office", label: "Office" },
  { value: "Retail", label: "Retail" },
  { value: "Warehouse", label: "Warehouse" },
  { value: "Penthouse", label: "Penthouse" },
  { value: "Duplex", label: "Duplex" },
];

const OCCUPANCY_STATE_OPTIONS = [
  { value: "Vacant", label: "Vacant" },
  { value: "Occupied", label: "Occupied" },
  { value: "Notice Given", label: "Notice Given" },
  { value: "Void", label: "Void" },
];

const ATTENTION_STATE_OPTIONS = [
  { value: "Normal", label: "Normal" },
  { value: "Due Soon", label: "Due Soon" },
  { value: "Overdue", label: "Overdue" },
  { value: "Blocked", label: "Blocked" },
];

export const UNIT_RUNNERS: RunnerConfig[] = [
  {
    id: "unit.create",
    title: "Add Unit",
    description: "Register a new property unit.",
    lifecycle: "unit",
    endpoint: "/api/v1/units",
    method: "POST",
    mode: "modal",
    autoFields: false,
    // System-managed fields injected as payload defaults.
    // ManagedUnitPayload (extra="forbid") requires all fields; these provide
    // sensible initial values for fields not exposed in the user-facing form.
    fixedPayload: {
      attention_state: "Normal",
      occupancy_state: "Vacant",
      readiness_posture: "pending",
      tenancy_posture: "vacant",
      lifecycle_summary: "",
      resident_label: "",
      tenant_label: "",
      current_owner: "",
      target_date: "",
      view_keys: [],
    },
    steps: [
      {
        label: "Unit Details",
        description: "Enter the core unit information.",
        fields: [
          {
            key: "unit_id",
            label: "Unit ID",
            type: "text",
            required: true,
            placeholder: "e.g. UNIT-001",
          },
          {
            key: "title",
            label: "Unit Title",
            type: "text",
            required: true,
            placeholder: "e.g. Apartment 4B, Marina Tower",
          },
          {
            key: "property_reference_id",
            label: "Property Reference ID",
            type: "text",
            required: true,
            placeholder: "e.g. PROP-001",
          },
          {
            key: "property_label",
            label: "Property Label",
            type: "text",
            required: true,
            placeholder: "e.g. Marina Tower",
          },
          {
            key: "landlord_account_id",
            label: "Landlord Account ID",
            type: "text",
            required: true,
            placeholder: "e.g. LL-001",
          },
          {
            key: "stock_type",
            label: "Stock Type",
            type: "select",
            required: true,
            options: STOCK_TYPE_OPTIONS,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Unit created successfully.",
    allowedRoles: ALLOWED_ROLES,
  },
  {
    id: "unit.update",
    title: "Edit Unit",
    description: "Update unit details and current state.",
    lifecycle: "unit",
    endpoint: "/api/v1/units/{id}",
    method: "PUT",
    mode: "modal",
    autoFields: false,
    // fixedPayload is empty here; UnitsPage builds a dynamic copy with
    // the existing unit's system-managed fields before launching this runner.
    steps: [
      {
        label: "Unit Details",
        description: "Update the unit's details and current state.",
        fields: [
          {
            key: "title",
            label: "Unit Title",
            type: "text",
            required: true,
          },
          {
            key: "stock_type",
            label: "Stock Type",
            type: "select",
            required: true,
            options: STOCK_TYPE_OPTIONS,
          },
          {
            key: "occupancy_state",
            label: "Occupancy State",
            type: "select",
            required: true,
            options: OCCUPANCY_STATE_OPTIONS,
          },
          {
            key: "attention_state",
            label: "Attention State",
            type: "select",
            required: true,
            options: ATTENTION_STATE_OPTIONS,
          },
          {
            key: "landlord_account_id",
            label: "Landlord Account ID",
            type: "text",
            required: true,
          },
          {
            key: "current_owner",
            label: "Current Owner",
            type: "text",
            required: false,
            placeholder: "Assigned PM (leave blank to unassign)",
          },
          {
            key: "target_date",
            label: "Target Date",
            type: "date",
            required: false,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Unit updated successfully.",
    allowedRoles: ALLOWED_ROLES,
  },
];

export const UNIT_CONFIRM_ACTIONS: ConfirmActionConfig[] = [];
