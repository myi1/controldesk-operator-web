# Operator UX Slice 01 Build Spec

## Purpose

This document records the corrected next UI slice for `ControlDesk`.

The next operator UI implementation must expand the bounded Frappe experiment control tower into `ControlDesk`. It must not continue the earlier drift toward a standalone-first `operator-web` client as the canonical surface.

## Current Status

The exploratory client scaffold under `clients/operator-web/` remains in the repo, but it is not the next implementation target.

Issue `#33` should implement the first bounded `ControlDesk Control Tower` slice as a Frappe Desk page/workspace adapted from the preserved experiment.

## Canonical Source Basis

- `experiment_repo/docs/54_SLICE4A_OPERATOR_SHELL_FOUNDATION_NOTE.md`
- `experiment_repo/docs/55_SLICE4B_CASE_DETAIL_AND_ACTIONS_NOTE.md`
- `experiment_repo/.../page/remax_pm_control_tower/remax_pm_control_tower.js`
- `experiment_repo/.../page/remax_pm_control_tower/remax_pm_control_tower.json`
- `experiment_repo/.../workspace/remax_pm_control_tower/remax_pm_control_tower.json`
- `apps/controldesk_core/controldesk_core/operator_shell.py`

## Slice Decision

Slice 01 should ship as an experiment-faithful Frappe control-tower foundation layered over the current `operator_shell` bootstrap and queue-row payloads.

This slice must not invent:

- a new backend queue model
- person-scoped assignment truth
- a separate standalone-first host app as the primary operator surface
- generic protected-action APIs that `ControlDesk` does not expose yet

## Build-Now Scope

### 1. Desk Page And Workspace

Create the `ControlDesk Control Tower` as:

- a Frappe Desk page
- a Frappe workspace entry
- role-gated operator navigation that mirrors the bounded experiment surface

The naming and navigation posture should stay close to the experiment's control-tower base, adapted for current `ControlDesk` terminology and routes.

### 2. Queue Shell

Build the page around the experiment's proven shell shape:

- queue summary area
- queue pills in governed order
- filter strip
- dense row table
- side detail panel

The shell should use the current `operator_shell` bootstrap payload as its source of truth for:

- `page_route`
- `workspace_label`
- `default_queue_key`
- `queue_summaries`
- visible queues

### 3. Row Table

Render rows from the current normalized payload without inventing new fields.

Each row should expose current backend truth only:

- `record_id`
- `title`
- `doctype`
- `status`
- `current_owner`
- `target_date`
- `is_overdue`
- `escalation_state`
- `blocker_summary`
- `next_action`
- `linked_references`

The layout should stay triage-first and close to the bounded experiment table posture.

### 4. Detail Panel

Slice 01 should include a read-only side panel that feels like the experiment control tower, but it must stay bounded by the backend contract that actually exists now.

It should show:

- selected row summary
- blocker and due context
- next action
- linked records
- current flags already present in the normalized row payload

If a richer record detail surface is not yet backed by `ControlDesk` server APIs, the panel must not fake it.

### 5. Filter Behavior

The page may support only the filters already grounded by the current service contract:

- search
- status
- escalation state
- overdue-only
- any queue-scoped filter already supported by the existing read APIs

Do not widen filter semantics beyond what the current service shape proves.

## Backend Contract Boundaries

Slice 01 must stay anchored to the existing `operator_shell` service shape.

### Bootstrap contract

Use:

- `get_operator_shell_bootstrap`
- `page_route`
- `workspace_label`
- `default_queue_key`
- `queue_summaries`

### Queue rows contract

Use:

- `list_operator_queue_rows`
- `queue_context`
- `summary`
- `rows`

Do not require new backend fields just to make the first UI slice feel richer.

## Experiment-Faithful UI Rules

- keep the Frappe page/workspace posture as the primary operator surface
- keep the queue visible while side-panel context changes
- preserve selection and scroll context during row inspection
- avoid dashboard-first or card-first simplification
- show owner, blocker, due state, and linked references without hover-only dependence
- treat the experiment control tower as the base to expand, not as inspiration to replace

## Not In This Slice

Do not ship these as generic operator controls in slice 01 unless matching `ControlDesk` server-side support lands first:

- approval decisions
- handoff accept / return dialogs
- escalation progression dialogs
- assign / assign to me / claim
- snooze
- add note
- generic action bars

The bounded experiment proved those patterns, but `ControlDesk` still needs matching detail/action APIs before the UI can carry them safely.

## Acceptance Criteria

- a permitted operator role can load the `ControlDesk Control Tower` page and workspace
- queue counts in the UI match the bootstrap queue summaries
- queue rows render from the normalized payload without invented data
- the shell is clearly derived from the bounded experiment control-tower base
- the side panel stays read-only and truthful to current backend data
- the slice does not present a fake person-scoped inbox
- the slice does not expand the exploratory standalone client as the primary operator surface

## Deferred Memory Register

These remain real future requirements, but they are not slice-01 requirements until backend support and scope reopen together:

- richer case detail and audit timeline from the experiment's Slice 4B posture
- bounded protected-action dialogs once matching `ControlDesk` detail/action APIs exist
- true person-scoped `My Work`
- saved views
- unified activity timeline
- property context aggregation
- guided runners
- oversight and risk surfaces
- mobile-specific operator flows

## Reopen Trigger

The runtime proof is complete.

The next blocker is no longer frontend tooling; it is implementation alignment.

Issue `#33` may proceed only as the experiment-faithful Frappe control-tower adaptation described here.
