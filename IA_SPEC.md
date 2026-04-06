# Operator Web Information Architecture

## Purpose

This document describes the screen-level floor plan for the internal ControlDesk operator web product.

It is intentionally non-technical.
Its job is to answer:

- what main work areas exist
- where users should start
- how they move between queue, detail, and context views
- what should be visible at the same time
- what should wait until later phases

## Product Direction

ControlDesk operator web should be built as a layered workbench, not a single giant queue and not a dashboard maze.

Default experience:

- users land in a work surface
- the queue stays visible during triage
- detail appears beside the queue when possible
- full-page flows are reserved for complex work

## Core Principles

- Separate triage from execution.
- Default to split-pane on desktop.
- Keep ownership, blocker state, and next action visible.
- Use role-shaped defaults, not one universal homepage.
- Keep property context close, but do not force property-only navigation.
- Preserve a readable timeline and handoff history.
- Reserve guided flows for risky or procedural work.

## Top-Level Navigation

The final target navigation model has four work scopes:

1. `My Work`
2. `Intake & Exceptions`
3. `Role Inboxes`
4. `Property Context`

Because the current ControlDesk backend already has source-backed domain queue families, the first implementation should layer these scopes over existing queues instead of inventing a new backend queue model.

## Recommended Initial Navigation

### 1. My Work

This is the day-to-day execution surface for most operators.

It should include:

- assigned to me
- claimed by me
- snoozed by me
- waiting for my follow-up

Why it exists:

- reduces ambiguity
- lowers overwhelm
- improves personal accountability

### 2. Intake & Exceptions

This is the controlled landing zone for new, failed, ambiguous, or exceptional work.

Initial composition should be built from current queue families such as:

- `document_intake`
- `integration_sync`
- `approvals`
- `handoffs`
- `escalation`

Why it exists:

- gives shared visibility to risky or orphan-prone work
- keeps exception handling visible without turning it into the everyday inbox for everyone

### 3. Domain Queues

These are the current source-backed queue families already exposed by the operator-shell foundation.

Initial set:

- `onboarding_control`
- `document_completeness`
- `vacancy_control`
- `receivables_control`
- `maintenance_control`
- `reporting_control`
- `renewal_control`
- `moveout_control`
- `service_recovery_control`
- `approvals`
- `handoffs`
- `document_intake`
- `integration_sync`
- `escalation`

Why they remain visible:

- they are already grounded in the current ControlDesk queue model
- they avoid inventing role hubs before the product has enough live usage evidence

### 4. Property Context

This is a local work view anchored to a property, unit, resident, or vendor.

It should eventually show:

- open work
- blocked work
- upcoming deadlines
- recent communications
- related exceptions and alerts

Why it matters:

- many operational decisions are local
- property context reduces duplicate work and improves handoffs

Implementation posture:

- later phase
- read-only aggregation first

## Role Inboxes

Role inboxes should exist, but they should be introduced as curated views over current queue families rather than as new backend queue entities.

Recommended future role hubs:

- Maintenance Dispatch
- Resident Operations
- Approvals and Back Office
- Compliance and Inspections
- Alerts and Incidents

Important note:

- these names are directional recommendations from the research
- they should not be hard-coded as backend truth until owner-role and workflow evidence supports the mapping

## Default Landing Rules

The product should not have one universal home screen.

Recommended default behavior:

- frontline operators land in `My Work` or their role-shaped inbox
- managers can land in `Intake & Exceptions` or a shared oversight list
- deep domain specialists can land in their main domain queue

Do not default users into:

- a dashboard homepage
- the global intake queue
- a full-page form

## Primary Pages

## 1. Queue Workbench

This is the default desktop workspace.

Layout:

- left sidebar for queue scopes and saved views
- center pane for the queue list
- right pane for preview and quick actions

Primary job:

- triage quickly
- act without losing list context
- decide whether the item needs full detail

## 2. Full Detail Page

This is the execution surface for complex work.

Use it when the task becomes:

- communication-heavy
- evidence-heavy
- dependency-heavy
- approval-heavy
- procedure-driven

Primary job:

- complete nuanced work with full context and auditability

## 3. Guided Task Runner

This is a focused completion flow for high-risk and procedural work.

Use it for:

- inspections
- move-in and move-out
- compliance remediation
- make-ready and turn work
- other branching or omission-sensitive tasks

Do not use it for:

- routine triage
- simple assignment
- simple approvals
- normal note-taking or follow-up

## 4. Property Context Page

This is the local operational surface for one property, unit, resident, or vendor.

Primary job:

- bring together nearby work, deadlines, communications, and related records

## 5. Manager Oversight View

This is a secondary surface, not the frontline homepage.

Primary job:

- review queue health
- review pressure points
- review cross-property risk

It should never replace the workbench for everyday processing.

## Desktop Layout Rules

- default to split-pane workbench
- keep the queue visible during common actions
- preserve scroll position when preview changes
- keep full-page navigation for genuinely complex work
- allow keyboard-first movement through the list

## Mobile Direction

Desktop dominates triage and coordination.
Mobile should focus on field execution and quick status updates.

Mobile priorities:

- `My Work`
- guided task runners
- note capture
- evidence capture
- status updates

Do not force the full desktop queue workbench into mobile as a compressed copy.

## Recommended Phasing

## Phase 1

Ship the minimum strong workbench:

- `My Work`
- `Intake & Exceptions`
- current domain queue navigation
- split-pane queue workbench
- full detail page
- guided task runner entry points

## Phase 2

Add richer context surfaces:

- property context views
- curated role inboxes
- manager oversight views
- stronger saved-view sharing

## Phase 3

Add runtime-driven surfaces after the reliability slice settles:

- SLA watch surfaces
- alert-heavy incident grouping
- reminder and wakeup flows
- workload pressure views
- stronger cross-queue prioritization

## Out Of Scope For Now

- one giant universal queue
- dashboard-first homepage
- kanban-first operating model
- wizard-first product behavior
- an AI queue as a separate place to work
- live SLA or alert views before the reliability layer is ready

## Durable IA Decision

ControlDesk operator web should start as a read-only, split-pane operator workbench layered over the current source-backed queue families, with `My Work` and `Intake & Exceptions` added as navigation scopes and property context introduced as a later aggregation surface.
