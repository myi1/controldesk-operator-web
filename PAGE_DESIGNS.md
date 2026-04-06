# ControlDesk Operator Portal — Page Designs

Status: Active design artifact
Date: 2026-04-06
Dependency: DESIGN_SYSTEM.md (tokens, components, patterns)
Dependency: IA_SPEC.md (information architecture decisions)
Dependency: COMPONENT_SPEC.md (component behavior specs)

---

## Page Map

```
/                           → Redirect to role-appropriate default
/login                      → Authentication
/work                       → My Work (personal queue)
/intake                     → Intake & Exceptions (shared triage)
/queue/:queueKey            → Domain Queue View
/case/:caseType/:caseId     → Full Detail Page
/case/:caseType/:caseId/run → Guided Task Runner
/property/:propertyId       → Property Context (Phase 2)
/oversight                  → Manager Oversight (Phase 2)
/settings                   → User Preferences
```

---

## Page 1: Queue Workbench (Primary Surface)

**Routes:** `/work`, `/intake`, `/queue/:queueKey`
**This is the page operators spend 80% of their time on.**

### Layout Specification

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TOP BAR (48px, sticky)                                                  │
│ [≡] ControlDesk    [/ Search... Cmd+K]          [🔔] [◐] [👤 Yahya ▾] │
├──────────┬──────────────────────────────────────┬───────────────────────┤
│ SIDEBAR  │ QUEUE CONTENT                        │ PREVIEW PANEL         │
│ (240px)  │                                      │ (420px)               │
│          │ ┌────────────────────────────────┐   │                       │
│ ┌──────┐ │ │ FILTER BAR                     │   │ ┌───────────────────┐ │
│ │My    │ │ │ [Status ▾] [Owner ▾] [+Filter] │   │ │ CASE HEADER       │ │
│ │Work  │ │ │ [🔍 Search]    Showing 47 items│   │ │ ONB-2024-0047     │ │
│ │  12  │ │ └────────────────────────────────┘   │ │ Palm Jumeirah 4B  │ │
│ └──────┘ │                                      │ │ Status: file_check │ │
│          │ ┌────────────────────────────────┐   │ │ Owner: Sara K.    │ │
│ ┌──────┐ │ │ QUEUE ROW (selected)      ▸   │   │ │ Due: 2d overdue   │ │
│ │Intake│ │ │ ● ONB-2024-0047 | file_check  │   │ └───────────────────┘ │
│ │& Exc │ │ │   Palm Jumeirah 4B | Sara K.  │   │                       │
│ │   8  │ │ │   ⚠ 2d overdue | Missing docs │   │ ┌───────────────────┐ │
│ └──────┘ │ ├────────────────────────────────┤   │ │ STAGE CONTROL     │ │
│          │ │ ○ ONB-2024-0048 | authority    │   │ │ ┌─────┐ ┌──────┐ │ │
│ DOMAIN   │ │   Marina Gate 12 | Ahmad R.   │   │ │ │Blocker│ │Next  │ │ │
│ QUEUES   │ │   On track      | 3 artifacts │   │ │ │Missing│ │Action│ │ │
│ ┌──────┐ │ ├────────────────────────────────┤   │ │ │auth   │ │Review│ │ │
│ │Onbrd │ │ │ ○ ONB-2024-0049 | inspection  │   │ │ │docs   │ │file  │ │ │
│ │  23  │ │ │   JBR Walk 7A | Unassigned    │   │ │ └─────┘ └──────┘ │ │
│ ├──────┤ │ │   🔴 Escalated | Need access  │   │ └───────────────────┘ │
│ │Vacncy│ │ ├────────────────────────────────┤   │                       │
│ │  14  │ │ │ ○ MNT-2024-0312 | triaged     │   │ ┌───────────────────┐ │
│ ├──────┤ │ │   Downtown 22C | Fatima H.    │   │ │ RECENT ACTIVITY   │ │
│ │Maint │ │ │   Due tomorrow  | Vendor quote │   │ │ • Status changed  │ │
│ │  31  │ │ └────────────────────────────────┘   │ │   2h ago by System│ │
│ ├──────┤ │                                      │ │ • Note added      │ │
│ │Recvbl│ │                                      │ │   1d ago by Sara  │ │
│ │  18  │ │ ┌────────────────────────────────┐   │ │ • Handoff received│ │
│ ├──────┤ │ │ PAGINATION                     │   │ │   3d ago from CRM │ │
│ │Renwl │ │ │ ◀ 1 2 3 ... 5 ▶  47 items     │   │ └───────────────────┘ │
│ │   9  │ │ └────────────────────────────────┘   │                       │
│ ├──────┤ │                                      │ ┌───────────────────┐ │
│ │MoveOt│ │                                      │ │ QUICK ACTIONS     │ │
│ │   5  │ │                                      │ │ [Assign to Me]    │ │
│ ├──────┤ │                                      │ │ [Snooze] [Escalate│ │
│ │Rprtng│ │                                      │ │ [Open Detail →]   │ │
│ │   7  │ │                                      │ └───────────────────┘ │
│ ├──────┤ │                                      │                       │
│ │SvcRec│ │                                      │ ┌───────────────────┐ │
│ │   3  │ │                                      │ │ RELATED RECORDS   │ │
│ └──────┘ │                                      │ │ 📄 Doc Pack (3/5) │ │
│          │                                      │ │ ✍ Sig Packet sent │ │
│ SYSTEM   │                                      │ │ ⏱ SLA: 4h left   │ │
│ ┌──────┐ │                                      │ │ 🤝 Handoff pending│ │
│ │Apprvl│ │                                      │ └───────────────────┘ │
│ │   4  │ │                                      │                       │
│ ├──────┤ │                                      │                       │
│ │IntSyn│ │                                      │                       │
│ │   2  │ │                                      │                       │
│ ├──────┤ │                                      │                       │
│ │Escalt│ │                                      │                       │
│ │   1  │ │                                      │                       │
│ └──────┘ │                                      │                       │
└──────────┴──────────────────────────────────────┴───────────────────────┘
```

### Sidebar Specification

**Width:** 240px (desktop), 56px icon-only (tablet), hidden (mobile)
**Background:** `--bg-sidebar`
**Border right:** 1px `--border-default`

**Sections:**

1. **Personal Scopes**
   - My Work (count badge)
   - Intake & Exceptions (count badge)
   - Divider

2. **Domain Queues** (collapsible group, label "QUEUES")
   - Each queue: icon (from Lucide) + label + count badge
   - Count badge color: `--status-neutral` for normal, `--status-danger` when items overdue
   - Active state: `--bg-active` background + `--accent-primary` left border (3px)
   - Hover: `--bg-hover`
   - Queue-family color dot (4px) next to icon

3. **System Queues** (collapsible group, label "SYSTEM")
   - Approvals, Integration Sync, Escalations, SLA Watch, Handoffs, Documents

**Collapse behavior:**
- Desktop: Click sidebar header to toggle between full and icon-only
- Icon-only: Shows only icons + count badges, tooltip on hover with full name
- Transition: `--duration-normal`, width animates via `--ease-default`

### Queue Row Specification

**Height:** 48px (compact) / 64px (comfortable) — user preference toggle
**Hover:** `--bg-hover` background, `--duration-fast` transition
**Selected:** `--bg-active` background + 3px left border `--accent-primary`
**Keyboard selected:** Same as click selected + focus ring

**Row Content (left to right):**

```
[○/●] [QueueBadge] Title                    Property/Unit    Status        Owner      Due          Signals
 sel   ONB          Palm Jumeirah Villa 4B   PJ Community     file_check    Sara K.   2d overdue   ⚠🔗📎
```

| Column | Width | Content |
|--------|-------|---------|
| Selection | 32px | Checkbox (hidden until hover or bulk mode) |
| Queue badge | 48px | 3-letter code with queue-family color bg |
| Title | flex (min 200px) | Case title, truncated with tooltip |
| Property/Unit | 160px | Community or unit name |
| Status | 140px | `StatusBadge` component |
| Owner | 120px | `OwnerChip` (avatar + name) or "Unassigned" in muted |
| Due | 100px | `DueIndicator` with color coding |
| Signals | 80px | Icons: escalation, blocker, SLA, attachment, handoff |

**Row click:** Opens preview panel (does not navigate away)
**Row double-click:** Opens full detail page
**Row right-click:** Context menu: Assign, Snooze, Escalate, Open Detail

### Filter Bar Specification

**Position:** Sticky top of queue content area, below any breadcrumb
**Height:** 44px
**Background:** `--bg-surface`

**Contents:**
```
[Status ▾] [Owner ▾] [Escalation ▾] [+ Add Filter]    [🔍 Search...]    Showing 47 items    [≡ View ▾]
```

**Available filters (all server-backed):**
- Status (multi-select from domain status enum)
- Owner (multi-select from team members)
- Escalation state (normal, blocked, escalated)
- Overdue only (toggle)
- Queue-specific sub-status filters (dynamic per queue)
- Date range (created, due)

**Filter chips:** When active, show as `FilterChip` components between filter bar and queue list

**Saved views:**
- Click "View" dropdown to see saved views
- "Save current view" option
- Saved views appear in sidebar under the queue they were created from

### Preview Panel Specification

**Width:** 420px (desktop), full overlay (tablet/mobile)
**Border left:** 1px `--border-default`
**Background:** `--bg-surface`
**Open trigger:** Click any queue row
**Close:** Click close icon, Escape key, or click same row again

**Sections (top to bottom):**

1. **Case Header** (sticky top)
   - Case ID (mono font, clickable to copy)
   - Title (heading weight)
   - Property + Unit context
   - Status badge (large)
   - Owner chip
   - Due indicator
   - Escalation indicator

2. **Stage Control** (collapsible)
   - Current status in lifecycle visualization (horizontal stepper or progress)
   - Sub-status grid (2-column: label + badge)
   - Blocker card (if blocked)
   - Missing artifacts list (if any)
   - Next recommended action (highlighted)

3. **Quick Actions** (sticky or prominent)
   - Role-gated buttons: only show actions the current user can take
   - Primary: The recommended next action (filled button)
   - Secondary: Assign, Snooze, Escalate, Add Note (ghost buttons)
   - "Open Full Detail" link at bottom

4. **Recent Activity** (scrollable, max 5 entries)
   - Latest timeline entries
   - "See all in detail" link

5. **Related Records** (collapsible)
   - Document pack summary + completeness
   - Signature packet status
   - SLA clock summary
   - Linked handoffs
   - Linked approvals
   - External references (CRM, Finance, etc.)

---

## Page 2: Full Detail Page

**Route:** `/case/:caseType/:caseId`
**Purpose:** Complex work requiring full context, communication, and audit trail.

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                                 │
├──────────┬──────────────────────────────────────────────────────────────┤
│ SIDEBAR  │                                                              │
│          │  ← Back to queue                                             │
│          │                                                              │
│          │  ┌──────────────────────────────────────────────────────┐    │
│          │  │ DETAIL HEADER                                        │    │
│          │  │                                                      │    │
│          │  │ ONB-2024-0047                            [Assign ▾]  │    │
│          │  │ Palm Jumeirah Villa 4B                               │    │
│          │  │ Landlord: Abdullah Al-Rashid                         │    │
│          │  │                                                      │    │
│          │  │ [●file_check_pending]  [⚠ 2d overdue]  [👤 Sara K.] │    │
│          │  │                                                      │    │
│          │  │ [▶ Review File Completeness]  [Snooze] [Escalate]    │    │
│          │  └──────────────────────────────────────────────────────┘    │
│          │                                                              │
│          │  ┌──────────────────────────────────────────────────────┐    │
│          │  │ [Overview] [Timeline] [Documents] [Related] [Actions]│    │
│          │  └──────────────────────────────────────────────────────┘    │
│          │                                                              │
│          │  ════════════════════════════════════════════════════════    │
│          │                                                              │
│          │  (Tab content area — see below)                              │
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

### Detail Header

**Max width:** 960px, centered in content area
**Sticky:** Yes, collapses to compact form on scroll

**Contents:**
- Back link: "← Onboarding Queue" (returns to queue with preserved scroll)
- Case ID: Mono font, copy-on-click
- Title: `--text-heading-lg`
- Landlord/Property context line
- Status badge (large), due indicator, escalation indicator, owner chip
- Primary action button (role-gated, the system's recommended next step)
- Secondary action buttons: Snooze, Escalate, Add Note

**Compact header (on scroll):**
- Single line: Case ID + Title + Status + Primary Action
- Height: 48px

### Tab: Overview

Two-column layout on desktop, single column on tablet/mobile.

**Left column (60%):**

1. **Operational Context Card**
   - Landlord: name, contact, service tier
   - Property: community, unit, type
   - Management mandate: reference, status
   - Tenancy: tenant name, contract dates, ejari reference (if applicable)

2. **Stage Control Card**
   - Visual lifecycle stepper (horizontal)
     - All statuses shown as dots/nodes
     - Current status highlighted with accent color
     - Completed statuses: checkmark + success color
     - Future statuses: muted
     - Blocked/escalated: warning/danger color on current node
   - Sub-status grid (specific to the domain)
     - Example for Onboarding: authority_verified, file_check_status, inspection_status, finance_setup_status
     - Each sub-status: label + status badge
   - Blocker section (if blocked)
     - Blocker reason (from predefined list)
     - Since when
     - Waiting on
     - Actions: Remove block, Escalate
   - Missing artifacts section
     - List of required artifact codes not yet received
     - Upload/link action per artifact

3. **External References Card**
   - CRM reference (Clozr): lead ID, status
   - Finance reference (Zoho Books): invoice ID, payment status
   - Document storage references
   - Signing service references

**Right column (40%):**

1. **SLA Summary Card**
   - Active SLA clocks with meters
   - Breach state with time since/until breach
   - Recovery status

2. **Related Records Card**
   - Linked approvals (status, reviewer)
   - Linked handoffs (from, to, acceptance state)
   - Linked document packs (completeness)
   - Linked signature packets (status)

3. **Quick Notes Card**
   - Latest 3 notes
   - Add note inline (text area + submit)

### Tab: Timeline

Full-width activity timeline with filtering.

**Filter bar:**
```
[All] [Status Changes] [Actions] [Notes] [Handoffs] [Approvals] [Integration] [System]
```

**Timeline entry anatomy:**
```
┌──────────────────────────────────────────────────────────────────┐
│ 🔄 Status changed to file_check_pending                         │
│ by System Automations • 2 hours ago                              │
│                                                                  │
│ Previous: authority_verified                                     │
│ Trigger: File check gate passed                                  │
│ Correlation: sync-evt-2024-0891                                  │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ 📝 Note added                                                    │
│ by Sara K. (PM Coordinator) • 1 day ago                          │
│                                                                  │
│ "Called landlord about missing authority letter. He will send     │
│ by end of week. Follow up Thursday."                             │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ 🤝 Handoff received                                              │
│ from CRM (Clozr) → Onboarding Team • 3 days ago                 │
│                                                                  │
│ Qualification: Qualified                                         │
│ Service tier: Full Service                                       │
│ Source: Direct inquiry                                            │
└──────────────────────────────────────────────────────────────────┘
```

**Timeline entry types and icons:**
| Type | Icon | Color |
|------|------|-------|
| Status change | `RefreshCw` | `--accent-primary` |
| Human action | `User` | `--fg-default` |
| Note | `MessageSquare` | `--status-info` |
| Handoff | `ArrowRightLeft` | `--queue-handoffs` |
| Approval | `Shield` | `--queue-approvals` |
| Integration event | `Zap` | `--queue-integration` |
| System event | `Settings` | `--fg-muted` |
| Escalation | `AlertTriangle` | `--status-danger` |
| SLA event | `Clock` | `--queue-sla` |

### Tab: Documents

**Document Pack section:**
- Pack name and ID
- Completeness progress bar (X/Y artifacts received)
- Grid of required artifacts:
  ```
  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
  │ ✅ Authority Letter  │ │ ⬜ Ownership Proof   │ │ ⬜ Bank Details      │
  │ Received 2d ago     │ │ Missing              │ │ Missing              │
  │ [View]              │ │ [Request]            │ │ [Request]            │
  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘
  ```
- Release gate status: blocked/not_blocked/released

**Signature Packets section:**
- Packet name, status badge, signer roster
- Timeline: draft → sent → viewed → completed/declined
- Signed artifact link (when completed)

### Tab: Related

- **Linked Cases:** Other cases for the same property/landlord
- **Approvals:** Full approval request cards with decision history
- **Handoffs:** Full handoff cards with acceptance/rejection history
- **SLA Clocks:** Detailed clock view with elapsed time, policy, breach/recovery
- **Integration Events:** Sync records with retry state and conflict details

### Tab: Actions

This tab shows all available protected actions for the current user's role.

**Layout:** Card per action category

```
┌──────────────────────────────────────────────────────────────────┐
│ STATUS TRANSITIONS                                                │
│                                                                  │
│ Current: file_check_pending                                      │
│                                                                  │
│ Available transitions (for your role: PM Coordinator):            │
│ [▶ Advance to file_complete]  [⚠ Mark as file_blocked]          │
│                                                                  │
│ Unavailable (requires PM Manager role):                          │
│ ○ Advance to inspection_scheduled (grayed, tooltip explains)     │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ ESCALATION CONTROLS                                               │
│                                                                  │
│ [Escalate Case]  [Block Case ▾ reason picker]                    │
│ [Remove Block] (shown only when blocked)                         │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│ ASSIGNMENT                                                        │
│                                                                  │
│ Currently: Sara K. (PM Coordinator)                               │
│ [Reassign ▾]  [Claim for Myself]                                 │
└──────────────────────────────────────────────────────────────────┘
```

**Action execution flow:**
1. Click action button
2. If action requires payload (e.g., blocker reason): Show inline form or modal
3. Confirm dialog for protected actions (e.g., "Advance to file_complete?")
4. Loading state on button (spinner, disabled)
5. Success: Toast notification + timeline entry appears + status updates
6. Failure: Error banner with retry option

---

## Page 3: Guided Task Runner

**Route:** `/case/:caseType/:caseId/run`
**Purpose:** Step-by-step execution for procedural work (inspections, move-in/out, compliance).

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ← Exit Runner    ONB-2024-0047 — Onboarding File Review               │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐      │
│  │ STEP INDICATOR                                                 │      │
│  │ ● Authority ─── ● File Check ─── ○ Inspection ─── ○ Finance   │      │
│  │   Complete       Current          Upcoming         Upcoming    │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐      │
│  │ STEP CONTENT (max-width: 720px, centered)                      │      │
│  │                                                                │      │
│  │ Step 2 of 4: File Completeness Check                           │      │
│  │                                                                │      │
│  │ Review all required documents for this onboarding case.        │      │
│  │ Mark each artifact as received or flag as missing.             │      │
│  │                                                                │      │
│  │ ┌─────────────────────────────────────────────────────────┐   │      │
│  │ │ Required Artifacts                                       │   │      │
│  │ │                                                          │   │      │
│  │ │ ☑ Authority Letter          [View] [Replace]            │   │      │
│  │ │ ☐ Ownership Proof           [Upload] [Request]          │   │      │
│  │ │ ☐ Bank Details              [Upload] [Request]          │   │      │
│  │ │ ☑ Tenant ID Copy            [View] [Replace]            │   │      │
│  │ │ ☐ NOC Letter                [Upload] [Request]          │   │      │
│  │ └─────────────────────────────────────────────────────────┘   │      │
│  │                                                                │      │
│  │ Completion: 2 of 5 artifacts received                          │      │
│  │ [█████░░░░░░░░░░] 40%                                         │      │
│  │                                                                │      │
│  │ Note: You can proceed to the next step even with missing       │      │
│  │ artifacts, but the case will be marked as file_blocked.        │      │
│  │                                                                │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────┐      │
│  │ [◀ Back]            [Save Draft]            [Next Step ▶]      │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Step Types

| Step Type | Content | Evidence Required |
|-----------|---------|------------------|
| Artifact check | Checklist of required documents | Upload/link per artifact |
| Status gate | Confirm precondition is met | Acknowledgment checkbox |
| Evidence capture | Photo/document upload | File upload with metadata |
| Decision | Choose between options (e.g., route) | Selection + optional note |
| Review | Read-only summary of gathered data | Confirm accuracy |
| Completion | Final confirmation before action | Explicit confirm button |

### Runner Behavior

- **Auto-save:** Every field change auto-saves to draft (debounced 2s)
- **Back navigation:** Always available, preserves entered data
- **Exit:** Confirm dialog if unsaved changes, saves draft
- **Step validation:** Cannot advance past required fields (inline error)
- **Completion:** Executes the protected action, returns to queue with success toast

---

## Page 4: Authentication

**Route:** `/login`

### Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                     ┌──────────────────────────┐                        │
│                     │                          │                        │
│                     │     ControlDesk           │                        │
│                     │     Operator Portal       │                        │
│                     │                          │                        │
│                     │  ┌────────────────────┐  │                        │
│                     │  │ Email               │  │                        │
│                     │  └────────────────────┘  │                        │
│                     │  ┌────────────────────┐  │                        │
│                     │  │ Password         👁 │  │                        │
│                     │  └────────────────────┘  │                        │
│                     │                          │                        │
│                     │  [    Sign In         ]  │                        │
│                     │                          │                        │
│                     │  Forgot password?         │                        │
│                     │                          │                        │
│                     └──────────────────────────┘                        │
│                                                                         │
│                     ControlDesk v1.0                                     │
└─────────────────────────────────────────────────────────────────────────┘
```

- Centered card (max-width: 400px)
- Full-height page with `--bg-app` background
- No sidebar, no top bar
- Error messages inline below fields
- Loading state on submit button
- Redirect to role-appropriate default after success

---

## Page 5: Command Palette

**Trigger:** `Cmd/Ctrl + K` from any page
**Type:** Modal overlay with search input

### Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ 🔍 Search cases, queues, actions...                              │
├──────────────────────────────────────────────────────────────────┤
│ RECENT                                                            │
│ ○ ONB-2024-0047 — Palm Jumeirah Villa 4B          Onboarding     │
│ ○ MNT-2024-0312 — Downtown 22C AC Repair          Maintenance    │
│ ○ RCV-2024-0089 — Marina Gate Unit 5               Receivables    │
├──────────────────────────────────────────────────────────────────┤
│ QUICK ACTIONS                                                     │
│ ○ Go to My Work                                         ⌘⇧M     │
│ ○ Go to Intake & Exceptions                             ⌘⇧I     │
│ ○ Toggle dark mode                                      ⌘⇧D     │
│ ○ Open settings                                         ⌘,      │
├──────────────────────────────────────────────────────────────────┤
│ QUEUES                                                            │
│ ○ Onboarding (23)                                                │
│ ○ Maintenance (31)                                               │
│ ○ Receivables (18)                                               │
└──────────────────────────────────────────────────────────────────┘
```

**Behavior:**
- Fuzzy search across case IDs, titles, property names, queue names
- Arrow keys to navigate, Enter to select, Escape to close
- Recent items shown by default
- Results grouped: Cases, Queues, Actions
- Each result: icon + title + metadata + keyboard shortcut (if applicable)

---

## Page 6: Settings

**Route:** `/settings`
**Purpose:** User preferences and configuration.

### Sections

1. **Appearance**
   - Theme: System / Light / Dark
   - Queue row density: Compact / Comfortable
   - Sidebar: Expanded / Collapsed by default

2. **Notifications**
   - Browser notifications: on/off
   - Sound: on/off
   - Notification types to receive

3. **Keyboard Shortcuts**
   - Full shortcut reference table
   - Customization (Phase 2)

4. **Account**
   - Name, email, role display
   - Sign out

---

## Page 7: Manager Oversight View (Phase 2)

**Route:** `/oversight`
**Purpose:** Queue health and cross-property risk visibility.

### Layout Concept

```
┌─────────────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                                 │
├──────────┬──────────────────────────────────────────────────────────────┤
│ SIDEBAR  │                                                              │
│          │  Portfolio Health                                             │
│          │                                                              │
│          │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│          │  │Total    │ │Overdue  │ │Blocked  │ │Escalated│           │
│          │  │  247    │ │   18    │ │   12    │ │    5    │           │
│          │  │         │ │ 🔴      │ │ 🟡      │ │ 🔴      │           │
│          │  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│          │                                                              │
│          │  Queue Health Breakdown                                      │
│          │  ┌───────────────────────────────────────────────────────┐   │
│          │  │ Queue        │ Total │ Overdue │ Blocked │ Avg Age   │   │
│          │  ├──────────────┼───────┼─────────┼─────────┼───────────┤   │
│          │  │ Onboarding   │  23   │    4    │    3    │  12 days  │   │
│          │  │ Maintenance  │  31   │    7    │    2    │   5 days  │   │
│          │  │ Receivables  │  18   │    5    │    1    │   8 days  │   │
│          │  │ ...          │       │         │         │           │   │
│          │  └───────────────────────────────────────────────────────┘   │
│          │                                                              │
│          │  Pressure Points                                             │
│          │  ┌───────────────────────────────────────────────────────┐   │
│          │  │ ⚠ 5 receivables at day_15+ with no formal notice     │   │
│          │  │ ⚠ 3 onboarding cases blocked >7 days                 │   │
│          │  │ ⚠ 2 SLA clocks breached in maintenance               │   │
│          │  └───────────────────────────────────────────────────────┘   │
│          │                                                              │
└──────────┴──────────────────────────────────────────────────────────────┘
```

**Charts used:**
- KPI stat cards (count + trend): Overdue, Blocked, Escalated, SLA Breached
- Horizontal bar chart: Queue health comparison
- Bullet charts: Queue capacity vs target
- Heatmap: Activity by day/hour (optional)

---

## Page 8: Property Context (Phase 2)

**Route:** `/property/:propertyId`
**Purpose:** All operational activity for a single property/unit.

### Sections

1. **Property Header:** Name, community, landlord, service tier, unit count
2. **Active Cases:** All open cases across all queues for this property
3. **Upcoming Deadlines:** Renewal dates, SLA deadlines, reporting due dates
4. **Recent Activity:** Unified timeline across all cases
5. **Financial Summary:** Outstanding receivables, last report status
6. **Document Status:** Mandate status, document pack completeness
