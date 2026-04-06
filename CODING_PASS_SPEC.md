# ControlDesk Operator Portal — Coding Pass Specification

Status: Active build artifact
Date: 2026-04-06
Prerequisite reads: DESIGN_SYSTEM.md, PAGE_DESIGNS.md, INTERACTION_PATTERNS.md

---

## 1. Technology Stack

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Framework | React | 19 | Concurrent features, Suspense, use() hook |
| Language | TypeScript | 5.5+ | Strict mode, satisfies operator |
| Build | Vite | 6+ | Fast HMR, native ESM |
| Routing | React Router | 7+ | Nested routes, loaders, URL-driven state |
| State (server) | TanStack Query | 5+ | Cache, dedup, optimistic updates, polling |
| State (client) | Zustand | 5+ | Lightweight, no boilerplate, devtools |
| Styling | Tailwind CSS | 4+ | Utility-first, CSS variable theming |
| Components | Radix UI Primitives | Latest | Unstyled, accessible, composable |
| Icons | Lucide React | Latest | Tree-shakeable, consistent 24px/1.5px |
| Forms | React Hook Form + Zod | Latest | Performant, schema validation |
| Tables | TanStack Table | 8+ | Headless, sorting, filtering, selection |
| Charts (Phase 2) | Recharts | Latest | React-native, responsive, accessible |
| Testing | Vitest + Testing Library | Latest | Fast, React 19 compatible |
| Linting | ESLint + Prettier | Latest | Existing config from scaffold |

---

## 2. Project Structure

```
clients/operator-web/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx                          # Entry point
│   ├── App.tsx                           # Root component with providers
│   │
│   ├── design-tokens/                    # CSS custom properties
│   │   ├── index.css                     # Imports all token files
│   │   ├── colors.css                    # Color tokens (light + dark)
│   │   ├── typography.css                # Font, scale, weights
│   │   ├── spacing.css                   # Spacing scale
│   │   ├── shadows.css                   # Shadow tokens
│   │   ├── motion.css                    # Duration, easing
│   │   └── layout.css                    # Breakpoints, z-index, radius
│   │
│   ├── api/                              # API client layer
│   │   ├── client.ts                     # Base fetch wrapper (auth, error handling)
│   │   ├── types.ts                      # API response types (mirrors backend contracts)
│   │   ├── bootstrap.ts                  # get_operator_shell_bootstrap
│   │   ├── queue.ts                      # list_operator_queue_rows
│   │   ├── detail.ts                     # get_operator_case_detail
│   │   └── actions.ts                    # execute_operator_action
│   │
│   ├── hooks/                            # Shared React hooks
│   │   ├── use-bootstrap.ts              # Bootstrap data query
│   │   ├── use-queue-rows.ts             # Queue rows query with filters
│   │   ├── use-case-detail.ts            # Case detail query
│   │   ├── use-action.ts                 # Action mutation with optimistic update
│   │   ├── use-keyboard.ts              # Keyboard shortcut manager
│   │   ├── use-theme.ts                  # Theme toggle
│   │   └── use-role-gate.ts              # Role-based feature gating
│   │
│   ├── stores/                           # Zustand client stores
│   │   ├── ui-store.ts                   # Sidebar state, row density, selected row
│   │   ├── selection-store.ts            # Bulk selection state
│   │   └── command-palette-store.ts      # Command palette open/close, recent
│   │
│   ├── components/                       # Component library
│   │   ├── primitives/                   # Atoms (design system level)
│   │   │   ├── Button.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Checkbox.tsx
│   │   │   ├── Toggle.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   ├── Kbd.tsx
│   │   │   ├── Separator.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Spinner.tsx
│   │   │   ├── Progress.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── composites/                   # Molecules (domain-aware)
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── EscalationIndicator.tsx
│   │   │   ├── OwnerChip.tsx
│   │   │   ├── DueIndicator.tsx
│   │   │   ├── BlockerCard.tsx
│   │   │   ├── SLAMeter.tsx
│   │   │   ├── QueueCounter.tsx
│   │   │   ├── FilterChip.tsx
│   │   │   ├── ActionButton.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   ├── CommandItem.tsx
│   │   │   ├── TimelineEntry.tsx
│   │   │   ├── RelatedRecordLink.tsx
│   │   │   ├── DocumentPackCard.tsx
│   │   │   ├── SignaturePacketCard.tsx
│   │   │   ├── HandoffCard.tsx
│   │   │   ├── ApprovalCard.tsx
│   │   │   ├── SubStatusRow.tsx
│   │   │   ├── AuditEntry.tsx
│   │   │   ├── IntegrationSyncRow.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBanner.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── patterns/                     # Organisms (page-level)
│   │       ├── TopBar.tsx
│   │       ├── Sidebar.tsx
│   │       ├── QueueList.tsx
│   │       ├── QueueRow.tsx
│   │       ├── PreviewPanel.tsx
│   │       ├── DetailHeader.tsx
│   │       ├── DetailTabBar.tsx
│   │       ├── ActivityTimeline.tsx
│   │       ├── StageControl.tsx
│   │       ├── GuidedRunner.tsx
│   │       ├── BulkActionBar.tsx
│   │       ├── CommandPalette.tsx
│   │       ├── FilterBar.tsx
│   │       ├── SavedViewManager.tsx
│   │       ├── NotificationToast.tsx
│   │       └── index.ts
│   │
│   ├── pages/                            # Route-level page components
│   │   ├── LoginPage.tsx
│   │   ├── QueueWorkbenchPage.tsx        # /work, /intake, /queue/:key
│   │   ├── CaseDetailPage.tsx            # /case/:type/:id
│   │   ├── GuidedRunnerPage.tsx          # /case/:type/:id/run
│   │   ├── SettingsPage.tsx              # /settings
│   │   ├── OversightPage.tsx             # /oversight (Phase 2)
│   │   ├── PropertyContextPage.tsx       # /property/:id (Phase 2)
│   │   ├── NotFoundPage.tsx              # 404
│   │   └── AccessDeniedPage.tsx          # 403
│   │
│   ├── config/                           # Static configuration
│   │   ├── routes.ts                     # Route definitions
│   │   ├── status-config.ts              # Status → color/label mapping per domain
│   │   ├── queue-config.ts               # Queue → icon/color/label mapping
│   │   ├── role-config.ts                # Role → default route, queue access
│   │   ├── keyboard-shortcuts.ts         # Shortcut definitions
│   │   └── blocker-reasons.ts            # Blocker reason enums per domain
│   │
│   ├── lib/                              # Shared utilities
│   │   ├── cn.ts                         # Tailwind class merge utility
│   │   ├── date.ts                       # Date formatting (relative, absolute)
│   │   ├── currency.ts                   # AED formatting
│   │   └── auth.ts                       # Token storage, refresh, redirect
│   │
│   └── types/                            # Shared TypeScript types
│       ├── domain.ts                     # Domain entity types
│       ├── api.ts                        # API request/response types
│       ├── ui.ts                         # UI-specific types (filters, sorts)
│       └── enums.ts                      # All status, role, queue enums
```

---

## 3. API Client Contract

The frontend talks to exactly 4 backend endpoints. All other data is derived.

### 3.1 Type Definitions

```typescript
// api/types.ts

// === Bootstrap ===
interface BootstrapResponse {
  page_route: string;
  workspace_label: string;
  default_queue_key: string;
  user_roles: string[];
  actor_id: string;
  queue_summaries: QueueSummary[];
}

interface QueueSummary {
  queue_key: string;
  label: string;
  count: number;
  overdue_count: number;
  blocked_count: number;
  escalated_count: number;
}

// === Queue Rows ===
interface QueueRowsRequest {
  queue_key: string;
  user_roles: string[];
  filters?: {
    status?: string[];
    owner?: string[];
    escalation_state?: string[];
    overdue_only?: boolean;
    search?: string;
  };
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  page?: number;
  page_size?: number;
}

interface QueueRowsResponse {
  queue_context: QueueContext;
  summary: QueueSummary;
  rows: QueueRow[];
  total_count: number;
  page: number;
  page_size: number;
}

interface QueueRow {
  record_id: string;
  title: string;
  doctype: string;
  queue_key: string;
  status: string;
  current_owner: string | null;
  target_date: string | null;
  is_overdue: boolean;
  escalation_state: 'normal' | 'blocked' | 'escalated';
  blocker_summary: string | null;
  next_action: string | null;
  linked_references: LinkedReference[];
  property_context?: string;
  unit_context?: string;
  landlord_context?: string;
  created_at: string;
  updated_at: string;
}

// === Case Detail ===
interface CaseDetailRequest {
  case_type: string;
  case_id: string;
  user_roles: string[];
}

interface CaseDetailResponse {
  case_type: string;
  case_id: string;
  title: string;
  status: string;
  escalation_state: string;
  current_owner: string | null;
  target_date: string | null;
  is_overdue: boolean;

  operational_context: OperationalContext;
  stage_control: StageControl;
  timeline: TimelineEvent[];
  related_records: RelatedRecords;
  available_actions: AvailableAction[];
  detail_sections: DetailSection[];
}

interface OperationalContext {
  landlord: { name: string; contact: string; service_tier: string } | null;
  property: { name: string; community: string; unit_type: string } | null;
  mandate: { reference: string; status: string; service_tier: string } | null;
  tenancy: { tenant: string; start: string; end: string; ejari: string } | null;
}

interface StageControl {
  lifecycle_statuses: string[];
  current_status: string;
  sub_statuses: Record<string, string>;
  blocker: { reason: string; since: string; waiting_on: string } | null;
  missing_artifacts: string[];
  allowed_transitions: string[];
}

interface TimelineEvent {
  event_id: string;
  event_type: string;
  timestamp: string;
  actor: string;
  actor_role: string;
  description: string;
  before_state?: string;
  after_state?: string;
  payload?: Record<string, unknown>;
}

interface RelatedRecords {
  approvals: ApprovalRecord[];
  handoffs: HandoffRecord[];
  sla_clocks: SLAClockRecord[];
  document_packs: DocumentPackRecord[];
  signature_packets: SignaturePacketRecord[];
  external_references: ExternalReference[];
  linked_cases: LinkedCaseRecord[];
}

interface AvailableAction {
  action_key: string;
  label: string;
  description: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  required_roles: string[];
  current_user_can_execute: boolean;
  payload_schema?: PayloadField[];
}

interface PayloadField {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'boolean' | 'textarea';
  required: boolean;
  options?: { value: string; label: string }[];
}

// === Action Execution ===
interface ActionRequest {
  case_type: string;
  case_id: string;
  action_key: string;
  actor_id: string;
  actor_role: string;
  action_payload: Record<string, unknown>;
}

interface ActionResponse {
  success: boolean;
  message: string;
  new_status?: string;
  audit_event_id?: string;
  error?: string;
}
```

### 3.2 TanStack Query Keys

```typescript
// Consistent query key factory
const queryKeys = {
  bootstrap: () => ['bootstrap'] as const,
  queueRows: (queueKey: string, filters: Filters) =>
    ['queue-rows', queueKey, filters] as const,
  caseDetail: (caseType: string, caseId: string) =>
    ['case-detail', caseType, caseId] as const,
};
```

### 3.3 Polling Configuration

```typescript
const POLL_INTERVALS = {
  queueCounts: 30_000,      // 30s — sidebar counts
  queueRows: 0,              // No auto-poll — manual refresh
  caseDetail: 0,              // No auto-poll — refresh on focus
};
```

---

## 4. Routing Configuration

```typescript
// config/routes.ts
const routes = [
  { path: '/login', element: LoginPage, public: true },
  {
    path: '/',
    element: AppShell, // TopBar + Sidebar + Outlet
    children: [
      { index: true, element: RoleRedirect },
      { path: 'work', element: QueueWorkbenchPage, props: { scope: 'my-work' } },
      { path: 'intake', element: QueueWorkbenchPage, props: { scope: 'intake' } },
      { path: 'queue/:queueKey', element: QueueWorkbenchPage },
      { path: 'case/:caseType/:caseId', element: CaseDetailPage },
      { path: 'case/:caseType/:caseId/run', element: GuidedRunnerPage },
      { path: 'settings', element: SettingsPage },
      { path: 'oversight', element: OversightPage },
      { path: 'property/:propertyId', element: PropertyContextPage },
    ],
  },
  { path: '*', element: NotFoundPage },
];
```

---

## 5. Component Build Order

### Phase 1a: Foundation (Weeks 1-2)

Build in this exact order — each step depends on the previous.

| # | Component/Feature | Depends On | Acceptance |
|---|-------------------|------------|------------|
| 1 | Design tokens (CSS files) | Nothing | All tokens render in both themes |
| 2 | Tailwind config wired to tokens | #1 | Utility classes use CSS vars |
| 3 | Theme provider + toggle | #1 | System/light/dark toggle works |
| 4 | Button primitive | #1-3 | All variants, sizes, states |
| 5 | Badge primitive | #1-3 | Status colors, sizes |
| 6 | Input + Select primitives | #1-3 | With label, error, helper text |
| 7 | Skeleton primitive | #1-3 | Text, avatar, row variants |
| 8 | Tooltip + Kbd | #1-3 | Hover/focus appearance |
| 9 | Avatar primitive | #1-3 | Image, initials, icon variants |
| 10 | Checkbox + Toggle | #1-3 | Accessible, keyboard operable |

### Phase 1b: Composites (Weeks 2-3)

| # | Component | Depends On |
|---|-----------|------------|
| 11 | StatusBadge | Badge, status-config |
| 12 | EscalationIndicator | Badge |
| 13 | OwnerChip | Avatar, Tooltip |
| 14 | DueIndicator | Badge, date utils |
| 15 | FilterChip | Badge, Button |
| 16 | EmptyState | — |
| 17 | ErrorBanner | Button |
| 18 | ConfirmDialog (Radix Dialog) | Button |
| 19 | TimelineEntry | Avatar, StatusBadge |
| 20 | CommandItem | Kbd |

### Phase 1c: API + Hooks (Weeks 2-3, parallel with composites)

| # | Feature | Depends On |
|---|---------|------------|
| 21 | API client (fetch wrapper) | — |
| 22 | Auth module (token, refresh) | API client |
| 23 | Bootstrap hook + provider | API client |
| 24 | Queue rows hook | API client |
| 25 | Case detail hook | API client |
| 26 | Action mutation hook | API client |
| 27 | Keyboard hook | — |
| 28 | Role gate hook | Bootstrap |

### Phase 1d: Patterns + Pages (Weeks 3-5)

| # | Component | Depends On |
|---|-----------|------------|
| 29 | TopBar | Button, Avatar, Kbd, theme toggle |
| 30 | Sidebar | QueueCounter, bootstrap hook |
| 31 | FilterBar | FilterChip, Select, Input |
| 32 | QueueRow | StatusBadge, OwnerChip, DueIndicator, EscalationIndicator |
| 33 | QueueList (TanStack Table) | QueueRow, FilterBar, Checkbox, Skeleton |
| 34 | PreviewPanel | All composites, action mutation hook |
| 35 | LoginPage | Input, Button, auth module |
| 36 | QueueWorkbenchPage | TopBar, Sidebar, QueueList, PreviewPanel |
| 37 | CommandPalette (Radix Dialog) | CommandItem, Input, keyboard hook |
| 38 | BulkActionBar | selection store, Button, ConfirmDialog |
| 39 | NotificationToast (Radix Toast) | — |

### Phase 1e: Detail + Runner (Weeks 5-7)

| # | Component | Depends On |
|---|-----------|------------|
| 40 | DetailHeader | StatusBadge, OwnerChip, DueIndicator, ActionButton |
| 41 | DetailTabBar | — |
| 42 | StageControl | StatusBadge, SubStatusRow, BlockerCard |
| 43 | ActivityTimeline | TimelineEntry, FilterBar |
| 44 | DocumentPackCard | Progress, Badge |
| 45 | SignaturePacketCard | StatusBadge |
| 46 | HandoffCard | Avatar, StatusBadge, ActionButton |
| 47 | ApprovalCard | Avatar, StatusBadge, ActionButton |
| 48 | SLAMeter | Progress |
| 49 | RelatedRecordLink | Badge, Tooltip |
| 50 | IntegrationSyncRow | StatusBadge |
| 51 | CaseDetailPage | All detail components |
| 52 | GuidedRunner | Progress, Button, Input, Checkbox |
| 53 | GuidedRunnerPage | GuidedRunner, detail hook, action hook |

### Phase 2 (After Phase 1 ships)

| # | Feature |
|---|---------|
| 54 | OversightPage (KPI cards, charts) |
| 55 | PropertyContextPage |
| 56 | SavedViewManager |
| 57 | Role Inboxes (curated views) |
| 58 | Notification system |
| 59 | Offline detection + recovery |

---

## 6. Status Configuration Reference

Every domain's statuses must be configured in `status-config.ts`. This is the single source of truth for badge rendering.

```typescript
// config/status-config.ts
type StatusColor = 'info' | 'primary' | 'warning' | 'danger' | 'success' | 'neutral';

interface StatusConfig {
  label: string;
  color: StatusColor;
  order: number; // for lifecycle stepper position
}

const ONBOARDING_STATUSES: Record<string, StatusConfig> = {
  intake_pending:                   { label: 'Intake Pending',      color: 'info',    order: 0 },
  authority_verified:               { label: 'Authority Verified',  color: 'primary', order: 1 },
  file_check_pending:               { label: 'File Check',          color: 'primary', order: 2 },
  file_blocked:                     { label: 'File Blocked',        color: 'danger',  order: 2 },
  file_complete:                    { label: 'File Complete',       color: 'success', order: 3 },
  inspection_scheduled:             { label: 'Inspection Scheduled',color: 'primary', order: 4 },
  inspection_baseline_complete:     { label: 'Inspection Done',     color: 'success', order: 5 },
  finance_setup_complete:           { label: 'Finance Setup',       color: 'success', order: 6 },
  portal_ready:                     { label: 'Portal Ready',        color: 'success', order: 7 },
  ready_to_market_approved:         { label: 'Market Approved',     color: 'success', order: 8 },
  leasing_handoff_complete:         { label: 'Leasing Handoff',     color: 'neutral', order: 9 },
  escalated:                        { label: 'Escalated',           color: 'danger',  order: -1 },
  cancelled_or_not_proceeding:      { label: 'Cancelled',           color: 'neutral', order: -2 },
};

// Same pattern for: VACANCY, MAINTENANCE, RECEIVABLES, RENEWALS,
// MOVEOUT, REPORTING, SERVICE_RECOVERY, COMMERCIAL_INTAKE,
// APPROVALS, INTEGRATION_SYNC, DOCUMENT_COMPLETENESS, HANDOFFS,
// ESCALATION, SLA_WATCH
```

---

## 7. Queue Configuration Reference

```typescript
// config/queue-config.ts
import { Clipboard, Home, Wrench, DollarSign, RefreshCw, LogOut,
         FileText, Heart, Building, Shield, Zap, AlertTriangle,
         Clock, FileCheck, ArrowRightLeft } from 'lucide-react';

interface QueueConfig {
  key: string;
  label: string;
  shortLabel: string;  // 3-4 chars for badge
  icon: LucideIcon;
  color: string;       // Hex for queue-family badge
  group: 'personal' | 'domain' | 'system';
}

const QUEUE_CONFIG: QueueConfig[] = [
  // Personal scopes
  { key: 'my_work',             label: 'My Work',              shortLabel: 'MY',   icon: Clipboard,     color: '#2563EB', group: 'personal' },
  { key: 'intake_exceptions',   label: 'Intake & Exceptions',  shortLabel: 'INT',  icon: AlertTriangle, color: '#EA580C', group: 'personal' },

  // Domain queues
  { key: 'onboarding_control',  label: 'Onboarding',           shortLabel: 'ONB',  icon: Home,          color: '#6366F1', group: 'domain' },
  { key: 'vacancy_control',     label: 'Vacancy',              shortLabel: 'VAC',  icon: Building,      color: '#7C3AED', group: 'domain' },
  { key: 'maintenance_control', label: 'Maintenance',          shortLabel: 'MNT',  icon: Wrench,        color: '#D97706', group: 'domain' },
  { key: 'receivables_control', label: 'Receivables',          shortLabel: 'RCV',  icon: DollarSign,    color: '#DC2626', group: 'domain' },
  { key: 'renewal_control',     label: 'Renewals',             shortLabel: 'RNW',  icon: RefreshCw,     color: '#0D9488', group: 'domain' },
  { key: 'moveout_control',     label: 'Move-Out',             shortLabel: 'MVO',  icon: LogOut,        color: '#475569', group: 'domain' },
  { key: 'reporting_control',   label: 'Reporting',            shortLabel: 'RPT',  icon: FileText,      color: '#0284C7', group: 'domain' },
  { key: 'service_recovery_control', label: 'Service Recovery', shortLabel: 'SRC', icon: Heart,         color: '#E11D48', group: 'domain' },

  // System queues
  { key: 'approvals',           label: 'Approvals',            shortLabel: 'APR',  icon: Shield,        color: '#2563EB', group: 'system' },
  { key: 'integration_sync',    label: 'Integration Sync',     shortLabel: 'SYN',  icon: Zap,           color: '#0891B2', group: 'system' },
  { key: 'escalation',          label: 'Escalations',          shortLabel: 'ESC',  icon: AlertTriangle, color: '#EA580C', group: 'system' },
  { key: 'sla_watch',           label: 'SLA Watch',            shortLabel: 'SLA',  icon: Clock,         color: '#DB2777', group: 'system' },
  { key: 'handoffs',            label: 'Handoffs',             shortLabel: 'HND',  icon: ArrowRightLeft,color: '#9333EA', group: 'system' },
  { key: 'document_completeness', label: 'Documents',          shortLabel: 'DOC',  icon: FileCheck,     color: '#78716C', group: 'system' },
];
```

---

## 8. Testing Strategy

### 8.1 Test Types

| Type | Tool | Coverage Target | What to Test |
|------|------|----------------|--------------|
| Unit | Vitest | All primitives | Render, variants, states, accessibility |
| Component | Testing Library | All composites | Props → render, user events → callbacks |
| Integration | Testing Library | Pages | Route → load → interact → state change |
| E2E | Playwright (Phase 2) | Critical paths | Login → queue → action → verify |
| Visual | Storybook (optional) | Design system | All component variants + themes |

### 8.2 Accessibility Testing

- Every component test includes `axe-core` check
- Keyboard navigation tested for all interactive components
- Screen reader announcements verified for dynamic content
- Both light and dark mode contrast verified

---

## 9. Performance Budget

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | <1.5s | Lighthouse |
| Largest Contentful Paint | <2.5s | Lighthouse |
| Cumulative Layout Shift | <0.1 | Lighthouse |
| Interaction to Next Paint | <200ms | Lighthouse |
| Bundle size (initial) | <200KB gzipped | Vite build |
| Queue row render (50 rows) | <100ms | Performance API |
| Action execution (perceived) | <300ms | Optimistic update |

### 9.1 Code Splitting Strategy

- Route-level lazy loading for all pages
- Heavy libraries (charts, markdown) loaded on demand
- Command palette loaded on first `Cmd+K`
- Guided runner loaded on navigation

---

## 10. Environment Configuration

```typescript
// Expected env vars (via Vite import.meta.env)
VITE_API_BASE_URL=http://206.189.128.22:8000/api/method
VITE_APP_NAME=ControlDesk
VITE_APP_VERSION=1.0.0
```

### 10.1 API Call Pattern

All backend calls go through a single base URL pattern:

```
POST {VITE_API_BASE_URL}/controldesk_core.api.{method_name}
Content-Type: application/json
Authorization: token {api_key}:{api_secret}

{
  "user_roles": [...],
  "actor_id": "...",
  ...
}
```

---

## 11. Quality Checklist (Pre-Ship)

### Visual
- [ ] No emojis as icons (all Lucide SVG)
- [ ] All clickable elements have `cursor-pointer`
- [ ] Hover states with 150ms transition on all interactive elements
- [ ] Text contrast >=4.5:1 in both light and dark mode
- [ ] Focus rings visible on all interactive elements
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive at 375px, 768px, 1024px, 1280px, 1536px
- [ ] Both themes tested independently before delivery

### Interaction
- [ ] All keyboard shortcuts functional
- [ ] Tab order matches visual layout
- [ ] Escape closes all overlays (modal, panel, dropdown)
- [ ] Back navigation preserves queue state
- [ ] Loading skeletons for all async content
- [ ] Error states for all failure modes
- [ ] Empty states for all empty views
- [ ] Optimistic updates for low-risk actions
- [ ] Confirmation dialogs for protected actions

### Data
- [ ] All 4 API endpoints integrated
- [ ] All domain queue statuses mapped to visual config
- [ ] All 12 operator roles handled in role gating
- [ ] Queue counts poll at 30s interval
- [ ] URL reflects current view state (deep linkable)
- [ ] Session state persists across page reloads

### Accessibility
- [ ] axe-core passes on all pages
- [ ] Screen reader landmarks defined
- [ ] Skip-to-main-content link
- [ ] ARIA labels on all icon-only buttons
- [ ] Live regions for dynamic content (toasts, errors)
- [ ] Color never sole indicator of state
