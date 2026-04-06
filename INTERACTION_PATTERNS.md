# ControlDesk Operator Portal — Interaction Patterns

Status: Active design artifact
Date: 2026-04-06

---

## 1. Navigation Flow Map

```
                              ┌─────────────┐
                              │   Login      │
                              └──────┬───────┘
                                     │ auth success
                                     ▼
                         ┌───────────────────────┐
                         │  Role-Based Redirect   │
                         │  PM Coord → /work      │
                         │  PM Manager → /intake   │
                         │  Finance → /queue/recv  │
                         └───────────┬───────────┘
                                     │
              ┌──────────────────────┼──────────────────────┐
              │                      │                      │
              ▼                      ▼                      ▼
     ┌────────────┐        ┌────────────┐        ┌────────────┐
     │  My Work   │        │  Intake &  │        │  Domain    │
     │  /work     │◄──────►│  Exceptions│◄──────►│  Queues    │
     │            │        │  /intake   │        │  /queue/*  │
     └─────┬──────┘        └─────┬──────┘        └─────┬──────┘
           │                     │                      │
           │    click row        │    click row          │    click row
           ▼                     ▼                      ▼
     ┌─────────────────────────────────────────────────────┐
     │              Preview Panel (side panel)               │
     │              All queue views share this               │
     └──────────────────────┬──────────────────────────────┘
                            │
                            │ "Open Detail" or double-click
                            ▼
     ┌─────────────────────────────────────────────────────┐
     │              Full Detail Page                         │
     │              /case/:type/:id                          │
     │                                                      │
     │  [Overview] [Timeline] [Documents] [Related] [Actions]│
     └──────────────────────┬──────────────────────────────┘
                            │
                            │ "Start Runner" (for procedural work)
                            ▼
     ┌─────────────────────────────────────────────────────┐
     │              Guided Task Runner                       │
     │              /case/:type/:id/run                      │
     │              Step 1 → Step 2 → ... → Complete          │
     └─────────────────────────────────────────────────────┘
```

### Back Navigation Contract

| From | Back Goes To | State Preserved |
|------|-------------|-----------------|
| Preview panel | Closes panel, stays on queue | Scroll position, selection |
| Full detail | Queue view that opened it | Scroll position, active row |
| Guided runner | Full detail page | All detail state |
| Full detail (deep linked) | My Work (fallback) | None |
| Command palette result | Target page | None |

---

## 2. Role-Aware UI Behavior

### Role → Default Landing

| Role | Default Route | Rationale |
|------|---------------|-----------|
| PM Coordinator | `/work` | Personal task execution |
| PM Manager | `/intake` | Oversight + exception triage |
| Admin / Ejari | `/work` | Documentation tasks |
| Finance | `/queue/receivables_control` | Domain specialist |
| Head of Leasing | `/queue/vacancy_control` | Domain specialist |
| Leasing Support | `/work` | Task execution |
| Inspections / Move Team | `/work` | Field execution |
| Maintenance Coordinator | `/queue/maintenance_control` | Domain specialist |
| Landlord Success Manager | `/queue/service_recovery_control` | Relationship management |
| PM Head | `/intake` | Senior oversight |
| MD / Leadership | `/oversight` (Phase 2) | Strategic view |

### Role → UI Visibility

The `get_operator_shell_bootstrap()` API returns the user's roles and visible queues. The UI must:

1. **Sidebar:** Only show queues the user has access to
2. **Queue rows:** Show all rows in accessible queues (no row-level filtering by role)
3. **Preview actions:** Only show action buttons the user's role can execute
4. **Detail actions tab:** Show all possible actions, but visually distinguish:
   - **Available:** Filled/primary buttons the user can execute
   - **Unavailable:** Muted buttons with tooltip "Requires [Role] role"
5. **Guided runner:** Only launchable for actions the user can execute

### Multi-Role Handling

Users may have multiple roles (e.g., PM Coordinator + Admin/Ejari).
- Union of all role permissions applies
- Sidebar shows union of all accessible queues
- Action buttons show if ANY of the user's roles can execute

---

## 3. Queue Interaction Patterns

### 3.1 Row Selection

```
Single click    → Select row, open preview panel
Double click    → Navigate to full detail page
Cmd/Ctrl+click  → Toggle selection (for bulk)
Shift+click     → Range select (for bulk)
Right-click     → Context menu
```

### 3.2 Keyboard Navigation (Queue List)

```
↑ / K           → Move selection up
↓ / J           → Move selection down
Enter           → Open preview (or expand if preview open)
Cmd+Enter       → Open full detail page
Space           → Toggle checkbox selection
Escape          → Close preview panel / deselect
/               → Focus search input
```

### 3.3 Bulk Actions

**Activation:** First checkbox click or Cmd+click activates bulk mode.

**Bulk mode UI changes:**
- Checkbox column becomes visible on all rows
- Bulk action bar slides up from bottom
- Filter bar shows "X selected" count
- Preview panel closes

**Bulk action bar contents:**
```
┌─────────────────────────────────────────────────────────────────────┐
│  ✓ 5 selected    [Assign ▾]  [Snooze ▾]  [Acknowledge]    [Clear] │
└─────────────────────────────────────────────────────────────────────┘
```

**Available bulk actions:**
- Assign to person/team
- Snooze until date
- Acknowledge (for intake items)
- Add tag (Phase 2)

**Unavailable when selection spans different queue types:**
- Status transitions (different state machines)
- Domain-specific actions

### 3.4 Sorting

| Column | Sort Behavior |
|--------|---------------|
| Title | Alphabetical A-Z / Z-A |
| Status | By status sequence order in the lifecycle |
| Owner | Alphabetical, "Unassigned" first |
| Due | Nearest due first / farthest due first |
| Created | Newest first / oldest first |
| Signals | By severity (escalated > blocked > overdue > normal) |

**Default sort:** By due date (nearest first), then by escalation severity.

### 3.5 Infinite Scroll vs Pagination

**Decision: Paginated** (not infinite scroll)

Reasons:
- Operators need stable row positions for keyboard navigation
- Preserves "where am I" context when returning from detail
- Server API already supports page-based pagination
- Count visibility important for workload assessment

**Page size:** 50 rows (configurable in settings)
**Pagination UI:** Bottom of queue list, compact: `◀ 1 2 3 ... 5 ▶  Showing 1-50 of 247`

---

## 4. Data Loading Strategy

### 4.1 Loading States

| Scenario | Loading Pattern | Duration Threshold |
|----------|-----------------|-------------------|
| Initial page load | Full skeleton | Immediate |
| Queue switch | Skeleton rows (keep sidebar) | Immediate |
| Preview open | Skeleton sections | Immediate |
| Filter change | Skeleton rows (keep filter bar) | 300ms delay |
| Action execution | Button spinner | Immediate |
| Search | Skeleton results | 300ms delay |
| Page navigation | Top bar progress line | Immediate |

### 4.2 Skeleton Patterns

**Queue row skeleton:**
```
┌──────────────────────────────────────────────────────────────────┐
│ ░░░░░░  ░░░░░░░░░░░░░░░░░░░░  ░░░░░░░░░  ░░░░░  ░░░░  ░░░░░  │
│ ░░░░░░  ░░░░░░░░░░░░░░░░░░░░  ░░░░░░░░░  ░░░░░  ░░░░  ░░░░░  │
│ ░░░░░░  ░░░░░░░░░░░░░░░░░░░░  ░░░░░░░░░  ░░░░░  ░░░░  ░░░░░  │
│ ░░░░░░  ░░░░░░░░░░░░░░░░░░░░  ░░░░░░░░░  ░░░░░  ░░░░  ░░░░░  │
│ ░░░░░░  ░░░░░░░░░░░░░░░░░░░░  ░░░░░░░░░  ░░░░░  ░░░░  ░░░░░  │
└──────────────────────────────────────────────────────────────────┘
```

**Preview panel skeleton:**
```
┌───────────────────────┐
│ ░░░░░░ (badge)        │
│ ░░░░░░░░░░░░ (title)  │
│ ░░░░░░░░ (context)    │
│                       │
│ ─────────────────     │
│ ░░░░░ ░░░░░░░        │
│ ░░░░░ ░░░░░░░        │
│ ░░░░░ ░░░░░░░        │
│                       │
│ ─────────────────     │
│ ░░░░░░░░░░░░         │
│ ░░░░░░░░░░░░         │
└───────────────────────┘
```

### 4.3 Optimistic Updates

| Action | Optimistic Behavior | Rollback on Failure |
|--------|--------------------|--------------------|
| Assign to me | Immediately update owner chip | Revert owner, show error toast |
| Snooze | Immediately show snoozed state | Revert, show error toast |
| Status transition | Immediately update status badge | Revert status, show error banner |
| Add note | Immediately add to timeline | Remove note, show error + retry |
| Escalate | Immediately show escalated indicator | Revert, show error toast |

### 4.4 Stale Data Handling

- **Queue counts:** Refresh on sidebar visibility (every 30s when tab active)
- **Queue rows:** Refresh on queue switch, filter change, or action completion
- **Case detail:** Refresh on tab focus and after any action
- **No WebSockets in v1** — polling-based refresh is sufficient
- **Visual staleness indicator:** Show "Updated 2m ago" in queue header; dim to muted after 5m

---

## 5. Action Execution Patterns

### 5.1 Action Classification

| Risk Level | Pattern | Examples |
|------------|---------|----------|
| **Low (reversible)** | Execute immediately with toast | Assign, snooze, add note, claim |
| **Medium (state change)** | Inline confirmation | Status transition, block, unblock |
| **High (protected)** | Modal confirmation with summary | Escalate, approve, reject, complete |
| **Critical (irreversible)** | Modal + explicit text confirmation | Close case, cancel, legal escalation |

### 5.2 Low-Risk Action Flow

```
User clicks [Assign to Me]
  → Button shows spinner (100ms)
  → Optimistic update: Owner chip changes to current user
  → API call: execute_operator_action()
  → Success: Toast "Assigned to you" (auto-dismiss 3s)
  → Failure: Revert optimistic update + Error toast with retry
```

### 5.3 Medium-Risk Action Flow (Inline Confirm)

```
User clicks [Advance to file_complete]
  → Inline confirmation appears below button:
    ┌────────────────────────────────────────────┐
    │ Advance ONB-2024-0047 to file_complete?    │
    │ This will trigger the inspection gate.     │
    │                                            │
    │ [Cancel]  [Confirm Advance]                │
    └────────────────────────────────────────────┘
  → User clicks [Confirm Advance]
  → Button shows spinner
  → API call
  → Success: Status badge updates + timeline entry + toast
  → Failure: Error banner "Action failed: [reason]. [Retry]"
```

### 5.4 High-Risk Action Flow (Modal Confirm)

```
User clicks [Escalate Case]
  → Modal opens:
    ┌──────────────────────────────────────────────────────────┐
    │ Escalate ONB-2024-0047                                    │
    │                                                          │
    │ This case will be flagged for senior review.              │
    │                                                          │
    │ Escalation reason: *                                     │
    │ ┌──────────────────────────────────────────────────────┐ │
    │ │ [Select reason ▾]                                    │ │
    │ └──────────────────────────────────────────────────────┘ │
    │                                                          │
    │ Additional notes:                                        │
    │ ┌──────────────────────────────────────────────────────┐ │
    │ │                                                      │ │
    │ └──────────────────────────────────────────────────────┘ │
    │                                                          │
    │                    [Cancel]  [🔴 Escalate Case]           │
    └──────────────────────────────────────────────────────────┘
```

### 5.5 Blocker Action Flow

```
User clicks [Block Case]
  → Dropdown: Select blocker reason from predefined list
    - Missing authority docs
    - Missing ownership docs
    - Missing bank details
    - Waiting landlord approval
    - Waiting tenant response
    - Waiting vendor quote
    - External system issue
    - ... (domain-specific reasons)
  → Selected reason populates blocker card
  → Confirmation modal with reason summary
  → Execute
```

### 5.6 Action Payload Forms

Some actions require structured input. These appear inline (in preview) or in a modal (on detail page).

| Action | Required Payload |
|--------|-----------------|
| Block case | Blocker reason (enum select) |
| Transition with gate | Gate evidence acknowledgment |
| Approval decision | Approve/reject + notes |
| Handoff acceptance | Accept/return + input codes |
| Snooze | Wake date/time picker |
| Reassign | Target person/team selector |
| Add note | Text content |

---

## 6. Status Badge Mapping

### 6.1 Universal Status Colors

| Status Category | Examples | Color Token |
|----------------|----------|-------------|
| **New/Pending** | intake_pending, reported, open, pending | `--status-info` |
| **In Progress** | authority_verified, triaged, acknowledged | `--accent-primary` |
| **Awaiting Input** | quote_requested, approval_required, pending_acceptance | `--status-warning` |
| **Blocked** | file_blocked, approval_blocked, closure_blocked | `--status-danger` |
| **Escalated** | escalated, closure_escalated | `--status-danger` |
| **Ready/Complete** | file_complete, approved, portal_ready | `--status-success` |
| **Closed/Done** | closed, resolved, sent, completed | `--status-neutral` |
| **Cancelled** | cancelled_or_not_proceeding | `--status-neutral` (strikethrough) |

### 6.2 Domain-Specific Status Rendering

Each queue family maps its status enum to the universal status colors above.
The mapping is defined once in a `statusConfig` object and drives all badge rendering.

Example (Onboarding):
```
intake_pending          → info     "Intake Pending"
authority_verified      → primary  "Authority Verified"
file_check_pending      → primary  "File Check"
file_blocked            → danger   "File Blocked"
file_complete           → success  "File Complete"
inspection_scheduled    → primary  "Inspection Scheduled"
inspection_baseline_complete → success "Inspection Done"
finance_setup_complete  → success  "Finance Setup"
portal_ready            → success  "Portal Ready"
ready_to_market_approved → success "Market Approved"
leasing_handoff_complete → neutral "Leasing Handoff"
escalated               → danger   "Escalated"
cancelled_or_not_proceeding → neutral "Cancelled"
```

### 6.3 Escalation State Rendering

| State | Visual |
|-------|--------|
| Normal | No indicator (clean) |
| Blocked | Amber left border on row + ⚠ icon + "Blocked" badge |
| Escalated | Red left border on row + 🔴 icon + "Escalated" badge |

### 6.4 Due/Overdue Rendering

| State | Visual |
|-------|--------|
| On track (>3 days) | Muted text: "Due in 5d" |
| Approaching (1-3 days) | Warning text: "Due in 2d" |
| Due today | Warning text + bold: "Due today" |
| Overdue (1-3 days) | Danger text: "1d overdue" |
| Overdue (>3 days) | Danger text + pulse dot: "5d overdue" |
| No due date | Muted text: "No due date" |

---

## 7. Search & Filtering

### 7.1 Global Search (Command Palette)

**Trigger:** `Cmd+K` or click search in top bar
**Scope:** All cases across all accessible queues
**Search fields:** Case ID, title, property name, landlord name, tenant name
**Results:** Grouped by type (Cases, Queues, Actions), max 10 per group
**Behavior:** Debounced 300ms, fuzzy matching, highlights matching text

### 7.2 Queue-Level Search

**Position:** In filter bar, right side
**Scope:** Current queue only
**Search fields:** Case ID, title, property name
**Behavior:** Debounced 300ms, filters rows in current queue
**Clear:** X button or Escape

### 7.3 Filter Architecture

Filters are additive (AND logic). Each filter is a separate chip.

**Filter creation flow:**
1. Click [+ Add Filter]
2. Dropdown: Select filter dimension (Status, Owner, Escalation, Due, ...)
3. Select values (multi-select for most, date picker for date range)
4. Filter chip appears in filter bar
5. Queue reloads with filter applied

**Server-side filtering:** All filters map directly to `list_operator_queue_rows()` parameters.

---

## 8. Error Handling & Edge Cases

### 8.1 Error Hierarchy

| Severity | Treatment | Example |
|----------|-----------|---------|
| **Fatal** | Full-page error with retry | API unreachable, auth expired |
| **Page-level** | Error banner at top of content | Queue load failed |
| **Action-level** | Toast + retry button | Action execution failed |
| **Field-level** | Inline error message | Invalid form input |
| **Network** | Banner "You're offline" | Connection lost |

### 8.2 Auth Error Handling

- **401:** Redirect to `/login` with return URL
- **403:** Show "Access Denied" page with explanation and "Go to My Work" link
- **Token expiry:** Auto-refresh token; if refresh fails, redirect to login

### 8.3 Empty States

| Context | Message | Action |
|---------|---------|--------|
| Queue with no items | "No items in [Queue]. Everything is caught up." | Switch to another queue |
| Queue with filters, no matches | "No items match your filters." | [Clear Filters] |
| My Work, nothing assigned | "Nothing assigned to you right now." | "Browse [Intake] for new work" |
| Search, no results | "No results for '[query]'" | "Try different keywords" |
| Preview, no case selected | "Select a case to see details" | Arrow points to queue list |

### 8.4 Conflict Handling

When an action fails because another user already changed the case:

```
┌──────────────────────────────────────────────────────────────────┐
│ ⚠ This case was updated while you were working                   │
│                                                                  │
│ Sara K. changed the status to inspection_scheduled 2 minutes ago.│
│                                                                  │
│ [Refresh Case]  [Try Action Anyway]                              │
└──────────────────────────────────────────────────────────────────┘
```

---

## 9. Toast Notification Spec

**Position:** Bottom-right corner, stacked upward
**Max visible:** 3 (older toasts dismiss when 4th appears)
**Auto-dismiss:** 5 seconds
**Width:** 360px
**Animation:** Slide up + fade in (200ms), slide down + fade out (150ms)

**Toast anatomy:**
```
┌───────────────────────────────────────┐
│ ✅ Assigned to you                     │  ← icon + title
│ ONB-2024-0047 is now in your queue     │  ← description
│                                [Undo]  │  ← action (optional)
└───────────────────────────────────────┘
```

**Toast types:**
| Type | Icon | Border Color |
|------|------|-------------|
| Success | `CheckCircle` | `--status-success` |
| Error | `XCircle` | `--status-danger` |
| Warning | `AlertTriangle` | `--status-warning` |
| Info | `Info` | `--status-info` |

---

## 10. URL Deep Linking & State Persistence

### 10.1 URL Structure

All meaningful UI state is reflected in the URL for deep linking and sharing.

| State | URL Pattern |
|-------|-------------|
| My Work queue | `/work` |
| My Work + filters | `/work?status=blocked&overdue=true` |
| Intake queue | `/intake` |
| Domain queue | `/queue/onboarding_control` |
| Queue with filters | `/queue/maintenance_control?status=triaged&owner=sara` |
| Queue with search | `/queue/receivables_control?q=marina` |
| Case detail | `/case/onboarding/ONB-2024-0047` |
| Case detail tab | `/case/onboarding/ONB-2024-0047?tab=timeline` |
| Guided runner | `/case/onboarding/ONB-2024-0047/run` |
| Runner step | `/case/onboarding/ONB-2024-0047/run?step=2` |

### 10.2 Browser History

- Queue switches push to history
- Filter changes replace current history entry (no history spam)
- Row selection does NOT push to history
- Detail page pushes to history
- Tab changes on detail page replace history entry

### 10.3 State Persistence (Session)

Stored in `sessionStorage`:
- Last active queue per session
- Scroll position per queue
- Selected row per queue
- Sidebar collapsed state
- Queue row density preference

Stored in `localStorage`:
- Theme preference
- Sidebar default state
- Row density preference
- Recently visited cases (last 20)
