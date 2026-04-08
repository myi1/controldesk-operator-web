// ---------------------------------------------------------------------------
// Property CRUD runner configs
// Endpoint base: /api/v1/properties
// ---------------------------------------------------------------------------

import type { RunnerConfig, ConfirmActionConfig } from "../../types/runner";

const INVALIDATES = ["properties-bootstrap"];

const ALLOWED_ROLES = [
  "PM Manager / Senior PM Coordinator",
  "PM Head",
  "System Manager",
];

export const PROPERTY_RUNNERS: RunnerConfig[] = [
  {
    id: "property.update",
    title: "Edit Building",
    description: "Update property label and details.",
    lifecycle: "property",
    endpoint: "/api/v1/properties/{id}",
    method: "PATCH",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Building Details",
        description: "Update the building's details.",
        fields: [
          {
            key: "property_label",
            label: "Building Label",
            type: "text",
            required: true,
            placeholder: "e.g. Marina Tower",
          },
          {
            key: "landlord_account_id",
            label: "Landlord Account ID",
            type: "text",
            required: false,
            placeholder: "e.g. LL-001",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Building updated successfully.",
    allowedRoles: ALLOWED_ROLES,
  },
];

export const PROPERTY_CONFIRM_ACTIONS: ConfirmActionConfig[] = [];
