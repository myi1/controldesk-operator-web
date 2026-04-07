// ---------------------------------------------------------------------------
// Vendor CRUD runner configs
// Endpoint base: /api/v1/vendors
// ---------------------------------------------------------------------------

import type { RunnerConfig, ConfirmActionConfig } from "../../types/runner";

const INVALIDATES = ["vendors-bootstrap"];

const ALLOWED_CREATE_PROFILE = [
  "Maintenance / Vendor Coordinator",
  "PM Manager / Senior PM Coordinator",
  "PM Head",
];

const ALLOWED_VERIFICATION = [
  "PM Manager / Senior PM Coordinator",
  "PM Head",
];

const ALLOWED_BANK = [
  "Finance / Accounts Support",
  "PM Manager / Senior PM Coordinator",
];

const VENDOR_TYPE_OPTIONS = [
  { value: "contractor", label: "Contractor" },
  { value: "supplier", label: "Supplier" },
  { value: "cleaning", label: "Cleaning" },
  { value: "maintenance", label: "Maintenance" },
  { value: "landscaping", label: "Landscaping" },
  { value: "utilities", label: "Utilities" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
];

const SERVICE_CATEGORY_OPTIONS = [
  { value: "plumbing", label: "Plumbing" },
  { value: "electrical", label: "Electrical" },
  { value: "hvac", label: "HVAC" },
  { value: "painting", label: "Painting" },
  { value: "carpentry", label: "Carpentry" },
  { value: "cleaning", label: "Cleaning" },
  { value: "pest_control", label: "Pest Control" },
  { value: "landscaping", label: "Landscaping" },
  { value: "security", label: "Security" },
  { value: "general_maintenance", label: "General Maintenance" },
  { value: "moving", label: "Moving" },
  { value: "photography", label: "Photography" },
  { value: "other", label: "Other" },
];

const VERIFICATION_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "suspended", label: "Suspended" },
];

export const VENDOR_RUNNERS: RunnerConfig[] = [
  {
    id: "vendor.create",
    title: "Add Vendor",
    description: "Register a new vendor in the directory.",
    lifecycle: "vendor",
    endpoint: "/api/v1/vendors",
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Vendor Details",
        description: "Enter the core vendor information.",
        fields: [
          {
            key: "display_name",
            label: "Display Name",
            type: "text",
            required: true,
            placeholder: "e.g. Al Futtaim Contractors LLC",
          },
          {
            key: "vendor_type",
            label: "Vendor Type",
            type: "select",
            required: true,
            options: VENDOR_TYPE_OPTIONS,
          },
          {
            key: "primary_contact_name",
            label: "Primary Contact Name",
            type: "text",
            required: true,
            placeholder: "Full name",
          },
          {
            key: "primary_contact_phone",
            label: "Primary Contact Phone",
            type: "text",
            required: true,
            placeholder: "+971 50 000 0000",
          },
          {
            key: "primary_contact_email",
            label: "Primary Contact Email",
            type: "text",
            required: false,
            placeholder: "email@example.com",
          },
          {
            key: "service_categories",
            label: "Service Categories",
            type: "checklist",
            required: false,
            options: SERVICE_CATEGORY_OPTIONS,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Vendor created successfully.",
    allowedRoles: ALLOWED_CREATE_PROFILE,
  },

  {
    id: "vendor.update_profile",
    title: "Edit Vendor Profile",
    description: "Update vendor profile information.",
    lifecycle: "vendor",
    endpoint: "/api/v1/vendors/{id}/profile",
    method: "PUT",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Profile",
        description: "Update the vendor's profile details.",
        fields: [
          {
            key: "display_name",
            label: "Display Name",
            type: "text",
            required: false,
            placeholder: "e.g. Al Futtaim Contractors LLC",
          },
          {
            key: "trade_name",
            label: "Trade Name",
            type: "text",
            required: false,
            placeholder: "Registered trade name",
          },
          {
            key: "vendor_type",
            label: "Vendor Type",
            type: "select",
            required: false,
            options: VENDOR_TYPE_OPTIONS,
          },
          {
            key: "primary_contact_name",
            label: "Primary Contact Name",
            type: "text",
            required: false,
            placeholder: "Full name",
          },
          {
            key: "primary_contact_phone",
            label: "Primary Contact Phone",
            type: "text",
            required: false,
            placeholder: "+971 50 000 0000",
          },
          {
            key: "primary_contact_email",
            label: "Primary Contact Email",
            type: "text",
            required: false,
            placeholder: "email@example.com",
          },
          {
            key: "approval_limit_aed",
            label: "Approval Limit (AED)",
            type: "number",
            required: false,
            min: 0,
          },
          {
            key: "notes",
            label: "Notes",
            type: "textarea",
            required: false,
            placeholder: "Internal notes about this vendor",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Vendor profile updated.",
    allowedRoles: ALLOWED_CREATE_PROFILE,
  },

  {
    id: "vendor.update_verification",
    title: "Update Verification",
    description: "Update the vendor's verification status and compliance documents.",
    lifecycle: "vendor",
    endpoint: "/api/v1/vendors/{id}/verification",
    method: "PUT",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Verification",
        description: "Set verification status and document references.",
        fields: [
          {
            key: "verification_status",
            label: "Verification Status",
            type: "select",
            required: false,
            options: VERIFICATION_STATUS_OPTIONS,
          },
          {
            key: "trade_license_number",
            label: "Trade License Number",
            type: "reference-text",
            required: false,
            placeholder: "TL-XXXX-XXXX",
          },
          {
            key: "trade_license_expiry",
            label: "Trade License Expiry",
            type: "date",
            required: false,
          },
          {
            key: "insurance_reference",
            label: "Insurance Reference",
            type: "reference-text",
            required: false,
            placeholder: "INS-XXXX-XXXX",
          },
          {
            key: "insurance_expiry",
            label: "Insurance Expiry",
            type: "date",
            required: false,
          },
          {
            key: "verified_by",
            label: "Verified By",
            type: "text",
            required: false,
            placeholder: "Name of verifier",
          },
          {
            key: "suspension_reason",
            label: "Suspension Reason",
            type: "textarea",
            required: false,
            placeholder: "Reason for suspension (if applicable)",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Vendor verification updated.",
    allowedRoles: ALLOWED_VERIFICATION,
  },

  {
    id: "vendor.update_bank_details",
    title: "Update Bank Details",
    description: "Update the vendor's bank account information.",
    lifecycle: "vendor",
    endpoint: "/api/v1/vendors/{id}/bank-details",
    method: "PUT",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Bank Details",
        description: "Enter the vendor's banking information.",
        fields: [
          {
            key: "bank_name",
            label: "Bank Name",
            type: "text",
            required: true,
            placeholder: "e.g. Emirates NBD",
          },
          {
            key: "bank_iban",
            label: "Bank IBAN",
            type: "text",
            required: true,
            placeholder: "AE00 0000 0000 0000 0000 000",
          },
          {
            key: "bank_beneficiary_name",
            label: "Beneficiary Name",
            type: "text",
            required: true,
            placeholder: "Account holder name",
          },
          {
            key: "bank_details_verified_by",
            label: "Verified By",
            type: "text",
            required: true,
            placeholder: "Name of verifier",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Vendor bank details updated.",
    allowedRoles: ALLOWED_BANK,
  },
];

export const VENDOR_CONFIRM_ACTIONS: ConfirmActionConfig[] = [];
