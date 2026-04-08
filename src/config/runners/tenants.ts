// ---------------------------------------------------------------------------
// Tenant CRUD runner configs
// Endpoint base: /api/v1/tenants
// ---------------------------------------------------------------------------

import type { RunnerConfig, ConfirmActionConfig } from "../../types/runner";

const INVALIDATES = ["tenants-bootstrap"];

const ALLOWED_ROLES = [
  "PM Coordinator",
  "PM Manager / Senior PM Coordinator",
  "PM Head",
];

const TENANCY_STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Notice Given", label: "Notice Given" },
  { value: "Closed", label: "Closed" },
  { value: "Pending", label: "Pending" },
];

export const TENANT_RUNNERS: RunnerConfig[] = [
  {
    id: "tenant.create",
    title: "Add Tenant",
    description: "Register a new tenancy record.",
    lifecycle: "tenant",
    endpoint: "/api/v1/tenants",
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Tenancy Details",
        description: "Enter the core tenancy information.",
        fields: [
          {
            key: "property_unit_id",
            label: "Unit ID",
            type: "text",
            required: true,
            placeholder: "e.g. UNIT-001",
          },
          {
            key: "landlord_account_id",
            label: "Landlord Account ID",
            type: "text",
            required: true,
            placeholder: "e.g. LL-001",
          },
          {
            key: "contract_start_date",
            label: "Contract Start Date",
            type: "date",
            required: false,
          },
          {
            key: "contract_end_date",
            label: "Contract End Date",
            type: "date",
            required: false,
          },
          {
            key: "ejari_reference",
            label: "Ejari Reference",
            type: "reference-text",
            required: false,
            placeholder: "e.g. EJARI-XXXX",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Tenancy record created successfully.",
    allowedRoles: ALLOWED_ROLES,
  },
  {
    id: "tenant.update",
    title: "Update Tenancy",
    description: "Update contract dates, status, or references.",
    lifecycle: "tenant",
    endpoint: "/api/v1/tenants/{id}",
    method: "PATCH",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Tenancy Update",
        description: "Modify contract details or status.",
        fields: [
          {
            key: "tenancy_status",
            label: "Status",
            type: "select",
            required: false,
            options: TENANCY_STATUS_OPTIONS,
          },
          {
            key: "contract_start_date",
            label: "Contract Start Date",
            type: "date",
            required: false,
          },
          {
            key: "contract_end_date",
            label: "Contract End Date",
            type: "date",
            required: false,
          },
          {
            key: "notice_date",
            label: "Notice Date",
            type: "date",
            required: false,
          },
          {
            key: "ejari_reference",
            label: "Ejari Reference",
            type: "reference-text",
            required: false,
            placeholder: "e.g. EJARI-XXXX",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Tenancy updated successfully.",
    allowedRoles: ALLOWED_ROLES,
  },
];

export const TENANT_CONFIRM_ACTIONS: ConfirmActionConfig[] = [];
