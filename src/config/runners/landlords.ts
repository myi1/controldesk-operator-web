// ---------------------------------------------------------------------------
// Landlord CRUD runner configs
// Endpoint base: /api/v1/landlords
// ---------------------------------------------------------------------------

import type { RunnerConfig, ConfirmActionConfig } from "../../types/runner";

const INVALIDATES = ["landlords-bootstrap"];

const ALLOWED_ROLES = [
  "Landlord Success Manager",
  "PM Manager / Senior PM Coordinator",
  "PM Head",
];

const SERVICE_TIER_OPTIONS = [
  { value: "standard", label: "Standard" },
  { value: "premium", label: "Premium" },
  { value: "vip", label: "VIP" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
];

const BANK_CURRENCY_OPTIONS = [
  { value: "AED", label: "AED" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "GBP", label: "GBP" },
];

const FEE_BASIS_OPTIONS = [
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed" },
];

const BILLING_CYCLE_OPTIONS = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
];

const APPROVAL_CONTACT_CHANNEL_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
  { value: "portal", label: "Portal" },
];

export const LANDLORD_RUNNERS: RunnerConfig[] = [
  {
    id: "landlord.create",
    title: "Add Landlord",
    description: "Register a new landlord account.",
    lifecycle: "landlord",
    endpoint: "/api/v1/landlords",
    method: "POST",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Landlord Details",
        description: "Enter the core landlord information.",
        fields: [
          {
            key: "display_name",
            label: "Display Name",
            type: "text",
            required: true,
            placeholder: "e.g. Al Maktoum Family Trust",
          },
          {
            key: "service_tier",
            label: "Service Tier",
            type: "select",
            required: false,
            options: SERVICE_TIER_OPTIONS,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Landlord account created successfully.",
    allowedRoles: ALLOWED_ROLES,
  },

  {
    id: "landlord.update_status",
    title: "Update Landlord",
    description: "Update landlord display name, service tier, or status.",
    lifecycle: "landlord",
    endpoint: "/api/v1/landlords/{id}",
    method: "PATCH",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Update Details",
        description: "Modify landlord account fields.",
        fields: [
          {
            key: "display_name",
            label: "Display Name",
            type: "text",
            required: false,
            placeholder: "e.g. Al Maktoum Family Trust",
          },
          {
            key: "service_tier",
            label: "Service Tier",
            type: "select",
            required: false,
            options: SERVICE_TIER_OPTIONS,
          },
          {
            key: "status",
            label: "Status",
            type: "select",
            required: false,
            options: STATUS_OPTIONS,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Landlord updated.",
    allowedRoles: ALLOWED_ROLES,
  },

  {
    id: "landlord.update_kyc",
    title: "Update KYC",
    description: "Update the landlord's KYC document references.",
    lifecycle: "landlord",
    endpoint: "/api/v1/landlords/{id}/kyc",
    method: "PUT",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "KYC Documents",
        description: "Enter document references for KYC verification.",
        fields: [
          {
            key: "kyc_passport_ref",
            label: "Passport Reference",
            type: "reference-text",
            required: false,
            placeholder: "DOC-XXXX-XXXX",
          },
          {
            key: "kyc_visa_ref",
            label: "Visa Reference",
            type: "reference-text",
            required: false,
            placeholder: "DOC-XXXX-XXXX",
          },
          {
            key: "kyc_title_deed_ref",
            label: "Title Deed Reference",
            type: "reference-text",
            required: false,
            placeholder: "DOC-XXXX-XXXX",
          },
          {
            key: "kyc_company_docs_ref",
            label: "Company Documents Reference",
            type: "reference-text",
            required: false,
            placeholder: "DOC-XXXX-XXXX",
          },
          {
            key: "kyc_poa_ref",
            label: "Power of Attorney Reference",
            type: "reference-text",
            required: false,
            placeholder: "DOC-XXXX-XXXX",
          },
          {
            key: "kyc_completed_at",
            label: "KYC Completed At",
            type: "date",
            required: false,
          },
          {
            key: "kyc_verified_by",
            label: "Verified By",
            type: "text",
            required: false,
            placeholder: "Name of verifier",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Landlord KYC updated.",
    allowedRoles: ALLOWED_ROLES,
  },

  {
    id: "landlord.update_bank_details",
    title: "Update Bank Details",
    description: "Update the landlord's bank account information.",
    lifecycle: "landlord",
    endpoint: "/api/v1/landlords/{id}/bank-details",
    method: "PUT",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Bank Details",
        description: "Enter the landlord's banking information.",
        fields: [
          {
            key: "bank_beneficiary_name",
            label: "Beneficiary Name",
            type: "text",
            required: false,
            placeholder: "Account holder name",
          },
          {
            key: "bank_name",
            label: "Bank Name",
            type: "text",
            required: false,
            placeholder: "e.g. Emirates NBD",
          },
          {
            key: "bank_iban",
            label: "Bank IBAN",
            type: "text",
            required: false,
            placeholder: "AE00 0000 0000 0000 0000 000",
          },
          {
            key: "bank_currency",
            label: "Currency",
            type: "select",
            required: false,
            options: BANK_CURRENCY_OPTIONS,
          },
          {
            key: "bank_details_verified_by",
            label: "Verified By",
            type: "text",
            required: false,
            placeholder: "Name of verifier",
          },
          {
            key: "bank_authority_proof_ref",
            label: "Authority Proof Reference",
            type: "reference-text",
            required: false,
            placeholder: "DOC-XXXX-XXXX",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Landlord bank details updated.",
    allowedRoles: ALLOWED_ROLES,
  },

  {
    id: "landlord.update_fee_agreement",
    title: "Update Fee Agreement",
    description: "Update the landlord's management fee agreement.",
    lifecycle: "landlord",
    endpoint: "/api/v1/landlords/{id}/fee-agreement",
    method: "PUT",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Fee Agreement",
        description: "Set the management fee structure for this landlord.",
        fields: [
          {
            key: "fee_basis_type",
            label: "Fee Basis",
            type: "select",
            required: false,
            options: FEE_BASIS_OPTIONS,
          },
          {
            key: "fee_percentage",
            label: "Fee Percentage",
            type: "number",
            required: false,
            min: 0,
          },
          {
            key: "fixed_fee_amount_aed",
            label: "Fixed Fee Amount (AED)",
            type: "number",
            required: false,
            min: 0,
          },
          {
            key: "vat_applicable",
            label: "VAT Applicable",
            type: "checkbox",
            required: false,
          },
          {
            key: "billing_cycle",
            label: "Billing Cycle",
            type: "select",
            required: false,
            options: BILLING_CYCLE_OPTIONS,
          },
          {
            key: "internal_family_account",
            label: "Internal Family Account",
            type: "checkbox",
            required: false,
          },
          {
            key: "fee_exception_note",
            label: "Fee Exception Note",
            type: "textarea",
            required: false,
            placeholder: "Note any exceptions to the standard fee arrangement",
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Landlord fee agreement updated.",
    allowedRoles: ALLOWED_ROLES,
  },

  {
    id: "landlord.update_approval_matrix",
    title: "Update Approval Matrix",
    description: "Update the landlord's maintenance approval thresholds and contact preferences.",
    lifecycle: "landlord",
    endpoint: "/api/v1/landlords/{id}/approval-matrix",
    method: "PUT",
    mode: "modal",
    autoFields: false,
    steps: [
      {
        label: "Approval Matrix",
        description: "Configure approval thresholds and contact channel.",
        fields: [
          {
            key: "maintenance_threshold_per_job_aed",
            label: "Maintenance Threshold Per Job (AED)",
            type: "number",
            required: false,
            min: 0,
          },
          {
            key: "emergency_authority_aed",
            label: "Emergency Authority (AED)",
            type: "number",
            required: false,
            min: 0,
          },
          {
            key: "approval_contact_name",
            label: "Approval Contact Name",
            type: "text",
            required: false,
            placeholder: "Full name",
          },
          {
            key: "approval_contact_channel",
            label: "Approval Contact Channel",
            type: "select",
            required: false,
            options: APPROVAL_CONTACT_CHANNEL_OPTIONS,
          },
          {
            key: "response_window_hours",
            label: "Response Window (Hours)",
            type: "number",
            required: false,
            min: 1,
          },
        ],
      },
    ],
    invalidates: INVALIDATES,
    successMessage: "Landlord approval matrix updated.",
    allowedRoles: ALLOWED_ROLES,
  },
];

export const LANDLORD_CONFIRM_ACTIONS: ConfirmActionConfig[] = [];
