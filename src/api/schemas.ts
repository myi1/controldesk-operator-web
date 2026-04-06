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
  queue_key: z.string(),
  label: z.string(),
  count: z.number(),
  overdue_count: z.number(),
  blocked_count: z.number(),
  escalated_count: z.number(),
});

export const BootstrapResponseSchema = z.object({
  queue_summaries: z.array(QueueSummarySchema),
  default_role_inbox_key: z.string().nullable(),
  default_scope_key: z.string().nullable(),
  role_inbox_summaries: z.array(z.object({ key: z.string(), label: z.string(), count: z.number() })),
  scope_summaries: z.array(z.object({ key: z.string(), label: z.string(), count: z.number() })),
  saved_view_summaries: z.array(z.object({ key: z.string(), label: z.string(), count: z.number() })),
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
  overdue: z.boolean(),
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
    queue_key: z.string(),
    label: z.string(),
    description: z.string().optional(),
    status_options: z.array(z.string()).optional(),
  }),
  summary: QueueSummarySchema,
  scope_key: z.string().optional(),
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
  blocker_banner: z.object({ reason: z.string(), message: z.string() }).optional(),
  limitations: z.array(z.string()),
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
