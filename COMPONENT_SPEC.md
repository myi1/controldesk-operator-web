# Operator Web Component Spec

## Purpose

This document defines the main building blocks of the internal ControlDesk operator web product in plain language.

For each component, it explains:

- what it is for
- what it must show
- what users should be able to do with it
- when it belongs in the experience
- when it should not be overused

These are product behavior specs, not engineering implementation details.

## Component Rules

- Fast, low-risk actions should stay close to the queue.
- Complex actions should move into full detail or guided work.
- Ownership, blockers, due state, and history should never become hidden metadata.
- Reversible actions should feel fast.
- Risky actions should feel deliberate.

## Phase 1 Components

## 1. Queue Workbench Shell

Purpose:

- hold the main operator workspace together

Must show:

- queue navigation
- active view name
- result count
- queue list
- preview panel

Primary actions:

- switch queues
- switch saved views
- search
- open preview
- open full detail

Use when:

- the user is triaging and moving through work quickly

Avoid when:

- the task needs deep editing, long-form communication, or step-by-step execution

## 2. Queue Navigation

Purpose:

- help users move between `My Work`, `Intake & Exceptions`, domain queues, and later role hubs

Must show:

- queue groups
- counts
- clear active state

Primary actions:

- open a queue or scope
- pin or favorite common views later

Use when:

- users need to switch working context without losing orientation

Avoid when:

- the navigation becomes a dumping ground for every possible view

## 3. Saved View Manager

Purpose:

- let users keep reusable filtered views without rebuilding them each time

Must show:

- saved view name
- who the view is for
- active filters and sort

Primary actions:

- save view
- rename view
- share view
- reset to default

Use when:

- teams need stable working slices like overdue work, blocked work, or awaiting follow-up

Avoid when:

- saved views replace sensible defaults

## 4. Queue List

Purpose:

- support fast scanning and prioritization

Must show:

- dense rows
- stable sort order
- visible active filters
- selection state for bulk actions later

Primary actions:

- sort
- filter
- multi-select
- open preview

Use when:

- the user is deciding what to work on next

Avoid when:

- the table becomes a spreadsheet swamp with too many columns

## 5. Queue Row

Purpose:

- answer the critical decision questions in seconds

Must show:

- what the item is
- where it belongs
- who owns it
- why it matters now
- what should happen next

Minimum row content:

- title
- item type
- property or unit context when available
- current state
- owner
- due or overdue signal
- blocker signal
- duplicate or attachment signal when available

Primary actions:

- open preview
- assign
- assign to me
- snooze
- escalate
- open full detail

Use when:

- common triage and ownership decisions are being made

Avoid when:

- rows require horizontal scrolling or hide ownership and due state

## 6. Queue Preview Panel

Purpose:

- let users inspect and act without losing queue context

Must show:

- summary
- recommended next action
- key context
- recent activity
- blockers
- linked records

Primary actions:

- assign
- claim
- snooze
- escalate
- add note
- open full detail

Use when:

- the user can make a good decision with focused context

Avoid when:

- the panel turns into a cramped copy of the full application

## 7. Ownership Control

Purpose:

- make responsibility explicit and easy to change safely

Must show:

- current team owner
- current person owner
- whether the item is unassigned, claimable, assigned, or pending handoff

Primary actions:

- assign to person
- assign to team
- assign to me
- request acceptance later when needed

Use when:

- responsibility needs to move cleanly

Avoid when:

- reassignment becomes silent and untraceable

## 8. Snooze Control

Purpose:

- pause attention without losing accountability

Must show:

- current snooze state
- wake time
- optional reason

Primary actions:

- snooze until
- remove snooze

Use when:

- the item is waiting for a known future moment

Avoid when:

- snooze becomes a hiding place for unresolved work

## 9. Blocker Card

Purpose:

- explain why work cannot move forward

Must show:

- blocker type
- waiting on whom
- since when
- next follow-up date

Primary actions:

- remove block
- snooze until
- escalate
- request missing information

Use when:

- work is blocked or waiting externally

Avoid when:

- blocked work is hidden inside vague generic status labels

## 10. Activity Timeline

Purpose:

- preserve a readable history of what happened

Must show separate event types for:

- system events
- human actions
- internal notes
- external communication
- AI suggestions

Primary actions:

- filter timeline
- add internal note
- open related event context

Use when:

- users need to understand what already happened before acting

Avoid when:

- events become an unreadable wall of undifferentiated noise

## 11. Related Records Panel

Purpose:

- surface nearby context without forcing a page hunt

Must show links to:

- property
- unit
- resident
- vendor
- previous related work
- approvals, handoffs, or linked exceptions

Primary actions:

- open related record
- create linked work later where appropriate

Use when:

- the current item depends on nearby records or history

Avoid when:

- related records are scattered across tabs without priority

## 12. Full Detail Header

Purpose:

- orient the user immediately on complex pages

Must show:

- title
- current state
- owner
- due state
- top-level summary
- primary next action

Primary actions:

- execute primary action
- switch to timeline, files, communications, or related records

Use when:

- the task needs a full-page surface

Avoid when:

- simple triage is forced through the full page

## 13. Guided Task Runner

Purpose:

- help users finish risky or procedural work without missing steps

Must show:

- visible step indicator
- current step goal
- required evidence
- completion conditions

Primary actions:

- next
- back
- save draft
- pause
- complete

Use when:

- inspections
- move-in and move-out
- compliance remediation
- make-ready and turn workflows

Avoid when:

- the action is simple enough to finish inline

## 14. Bulk Action Bar

Purpose:

- support safe repeated actions on similar items

Must show:

- selected count
- valid actions
- why some actions are unavailable

Primary actions:

- bulk assign
- bulk acknowledge
- bulk snooze
- bulk tag

Use when:

- the selected items are homogeneous and low risk

Avoid when:

- the selection spans different workflows or risk levels

## 15. Empty State

Purpose:

- explain what an empty view means

Must show:

- whether there are truly no items or just no matching items
- active filters
- next likely action

Primary actions:

- clear filters
- switch view
- create item where appropriate later

Use when:

- a queue or view has no visible results

Avoid when:

- users face a blank screen with no explanation

## 16. Error Recovery Banner

Purpose:

- help users recover from failed actions without panic

Must show:

- what failed
- what was saved
- what must be retried

Primary actions:

- retry
- undo where safe
- reopen draft

Use when:

- notes, updates, or guided steps fail partway through

Avoid when:

- the product discards user input after long effort

## Phase 2 Components

These are important, but not part of the safest first UI slice:

- Property Work Feed
- Duplicate Suggestion Card
- Communication Shortcuts Panel
- Manager Queue Health Strip
- Shared Handoff Flow with acceptance logic

## Deferred Until Reliability Opens

- SLA Watch Surface
- Alert Grouping Panel
- Workload Pressure Panel
- Capacity Routing Controls
- Strong Attention Score Controls

## Anti-Components

Do not make these first-class defaults:

- dashboard homepage as the main work surface
- giant modal for complex completion
- kanban board as the primary queue view
- AI queue as a separate navigation object
- generic wizard for routine triage

## Durable Component Decision

The first strong Operator Web slice should center on a split-pane workbench, a dense row, a strong preview panel, explicit ownership and blocker controls, a readable activity timeline, and a guided task runner only for genuinely procedural work.
