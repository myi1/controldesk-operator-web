// ---------------------------------------------------------------------------
// Runtime API response schemas — validated with Zod at the API boundary.
//
// These guard against backend contract changes silently corrupting the UI.
// Only required fields are enforced; optional/unknown fields are stripped
// (z.object strips by default) so schema evolution doesn't break the client.
// ---------------------------------------------------------------------------

import { z } from "zod";

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

const FieldSnapshot = z.object({
  key: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

const LinkedReference = z.object({
  label: z.string(),
  reference_type: z.string(),
  reference_id: z.string(),
  system: z.string().optional(),
  path: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

const QueueSummarySchema = z.object({
  key: z.string(),
  label: z.string(),
  count: z.number(),
  overdue_count: z.number().optional(),
  blocked_count: z.number().optional(),
  escalated_count: z.number().optional(),
});

const QueueRowsSummarySchema = z.object({
  count: z.number(),
  overdue_count: z.number().optional(),
});

const BootstrapFormOptionsSchema = z.object({
  maintenance: z.object({
    urgency: z.array(z.string()),
    issue_type: z.array(z.string()),
    liability_view: z.array(z.string()),
    blocker_reason: z.array(z.string()),
  }).optional(),
  onboarding: z.object({ blocker_reason: z.array(z.string()) }).optional(),
  moveout: z.object({ blocker_reason: z.array(z.string()) }).optional(),
  receivables: z.object({
    blocker_reason: z.array(z.string()),
    payment_method: z.array(z.string()),
  }).optional(),
  vacancy: z.object({ stall_reason: z.array(z.string()) }).optional(),
  service_recovery: z.object({
    trigger_type: z.array(z.string()),
    severity: z.array(z.string()),
  }).optional(),
}).optional();

export const BootstrapResponseSchema = z.object({
  queue_summaries: z.array(QueueSummarySchema),
  default_role_inbox_key: z.string().nullable(),
  default_scope_key: z.string().nullable(),
  role_inbox_summaries: z.array(z.object({ key: z.string(), label: z.string(), count: z.number() })),
  scope_summaries: z.array(z.object({ key: z.string(), label: z.string(), count: z.number() })),
  saved_view_summaries: z.array(z.object({ key: z.string(), label: z.string(), count: z.number() })),
  form_options: BootstrapFormOptionsSchema,
});

// ---------------------------------------------------------------------------
// Queue rows
// ---------------------------------------------------------------------------

const QueueRowSchema = z.object({
  doctype: z.string(),
  docname: z.string(),
  title: z.string(),
  status: z.string(),
  current_owner: z.string().nullable(),
  target_date: z.string().nullable(),
  is_overdue: z.boolean(),
  overdue: z.boolean().optional(),
  escalation_state: z.string(),
  blocker_summary: z.string().nullable(),
  next_action: z.string().nullable(),
  linked_references: z.array(LinkedReference),
  property_context: z.string().optional(),
  unit_context: z.string().optional(),
  landlord_context: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  search_match: z.boolean().optional(),
  queue_key: z.string().optional(),
});

export const QueueRowsResponseSchema = z.object({
  rows: z.array(QueueRowSchema),
  queue_context: z.object({
    key: z.string(),
    label: z.string(),
    description: z.string().optional(),
    status_options: z.array(z.string()).optional(),
  }),
  summary: QueueRowsSummarySchema,
  scope_key: z.string().nullish(),
  view_kind: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Case detail
// ---------------------------------------------------------------------------

const ContextSectionSchema = z.object({
  section_key: z.string(),
  label: z.string(),
  fields: z.array(FieldSnapshot),
});

const ProtectedActionSchema = z.object({
  action_key: z.string(),
  label: z.string(),
  requires_human_release: z.boolean(),
  permission_scope: z.string(),
  available_roles: z.array(z.string()),
  ref_doctype: z.string().optional(),
});

const AvailableActionSchema = z.object({
  action_key: z.string(),
  target_status: z.string().optional(),
  label: z.string(),
  confirmation_required: z.boolean(),
});

// Kept for consumers that already hold a normalised CaseDetailResponse.
export const CaseDetailResponseSchema = z.object({
  detail: z.object({
    doctype: z.string(),
    docname: z.string(),
    title: z.string(),
    status: z.string(),
    current_owner: z.string().nullable(),
    escalation_state: z.string(),
    target_date: z.string().nullable(),
    is_overdue: z.boolean(),
    queue_key: z.string(),
  }),
  field_snapshot: z.array(FieldSnapshot),
  context_sections: z.array(ContextSectionSchema),
  protected_actions: z.array(ProtectedActionSchema),
  available_actions: z.array(AvailableActionSchema).optional(),
  blocker_banner: z.object({ reason: z.string(), message: z.string() }).optional(),
  limitations: z.array(z.string()),
});

// Raw shape as returned by the backend — nested under detail.record / detail.*
const RawFieldSnapshotSchema = z.object({
  fieldname: z.string(),
  label: z.string(),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]),
});

const RawContextSectionSchema = z.object({
  key: z.string(),
  title: z.string(),
  items: z.array(RawFieldSnapshotSchema),
});

const RawAvailableActionSchema = z.object({
  action_key: z.string(),
  label: z.string(),
  confirmation_required: z.boolean(),
  target_status: z.string().optional(),
});

export const RawCaseDetailResponseSchema = z.object({
  detail: z.object({
    record: z.object({
      doctype: z.string(),
      docname: z.string(),
      title: z.string(),
      status: z.string(),
      current_owner: z.string().nullable(),
      escalation_state: z.string(),
      target_date: z.string().nullable(),
      is_overdue: z.boolean(),
      queue_key: z.string(),
    }),
    available_actions: z.array(RawAvailableActionSchema).nullable().optional(),
    blocker_banner: z.object({
      tone: z.string().optional(),
      title: z.string().optional(),
      message: z.string(),
    }).nullable().optional(),
    context_sections: z.array(RawContextSectionSchema).optional(),
    field_snapshot: z.array(RawFieldSnapshotSchema).optional(),
    limitations: z.array(z.string()).optional(),
  }),
  queue_key: z.string().optional(),
  status: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Action execution
// ---------------------------------------------------------------------------

export const ActionResponseSchema = z.object({
  status: z.string(),
  queue_key: z.string().optional(),
}).passthrough(); // allow extra fields from backend

// ---------------------------------------------------------------------------
// Audit timeline
// ---------------------------------------------------------------------------

export const AuditTimelineResponseSchema = z.object({
  audit_timeline: z.array(
    z.object({
      event: z.string(),
      occurred_at: z.string(),
      title: z.string(),
      summary: z.string(),
      evidence_references: z.array(
        z.object({
          label: z.string(),
          reference_type: z.string(),
          reference_id: z.string(),
          system: z.string(),
          path: z.string().optional(),
        }),
      ),
    }),
  ),
});

// ---------------------------------------------------------------------------
// Tenants bootstrap
// ---------------------------------------------------------------------------

const SummaryCardSchema = z.object({
  key: z.string(),
  label: z.string(),
  value: z.number(),
});

const ViewSummarySchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string(),
  count: z.number(),
});

const TenantRowSchema = z
  .object({
    tenancy_id: z.string(),
    title: z.string(),
    unit_id: z.string(),
    property_reference_id: z.string(),
    property_label: z.string(),
    landlord_account_id: z.string(),
    occupancy_state: z.string(),
    contract_start_date: z.string().nullable(),
    contract_end_date: z.string().nullable(),
    status: z.string(),
    attention_state: z.string(),
    target_date: z.string().nullable(),
    is_overdue: z.boolean(),
    view_keys: z.array(z.string()),
  })
  .passthrough();

export const TenantsBootstrapResponseSchema = z.object({
  rows: z.array(TenantRowSchema),
  summary_cards: z.array(SummaryCardSchema),
  view_summaries: z.array(ViewSummarySchema),
  default_view_key: z.string(),
  filter_options: z.object({
    occupancy_states: z.array(z.string()),
    landlord_accounts: z.array(z.string()),
    properties: z.array(
      z.object({ label: z.string(), property_reference_id: z.string() }),
    ),
  }),
});

// ---------------------------------------------------------------------------
// Landlords bootstrap
// ---------------------------------------------------------------------------

const LandlordRowSchema = z
  .object({
    landlord_account_id: z.string(),
    display_name: z.string(),
    service_tier: z.string().nullable(),
    status: z.string(),
    unit_count: z.number(),
    active_tenancy_count: z.number(),
    attention_state: z.string(),
    target_date: z.string().nullable(),
    view_keys: z.array(z.string()),
  })
  .passthrough();

export const LandlordsBootstrapResponseSchema = z.object({
  rows: z.array(LandlordRowSchema),
  summary_cards: z.array(SummaryCardSchema),
  view_summaries: z.array(ViewSummarySchema),
  default_view_key: z.string(),
});
