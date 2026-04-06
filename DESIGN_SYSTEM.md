# ControlDesk Operator Portal — Design System

Status: Active design artifact
Date: 2026-04-06
Stack: React 19 + TypeScript + Vite
Target: `clients/operator-web/`

---

## 1. Design Philosophy

**Linear meets Notion meets Vercel Dashboard.**

ControlDesk Operator Portal is an operations workbench — not a dashboard, not a form-filling tool, not a CRM.
The design must optimize for:

- **Triage speed** — operators scan 50-200 items per session
- **Context density** — ownership, blocker, due state, next action visible without interaction
- **Split attention** — queue stays visible while detail is inspected
- **Role clarity** — UI adapts to the operator's role without requiring manual configuration
- **Auditability** — every action has visible provenance and reversibility signals

### Design Benchmarks

| Quality | Benchmark | Why |
|---------|-----------|-----|
| Information density | Linear issue tracker | Dense rows, fast scanning, keyboard-first |
| Navigation clarity | Notion sidebar | Collapsible sections, clear hierarchy, saved views |
| Visual polish | Vercel Dashboard | Clean surfaces, purposeful color, dark mode parity |
| Data presentation | Datadog / Grafana | Status indicators, time-based signals, severity coding |
| Action confidence | Stripe Dashboard | Deliberate confirmations, clear state after action |

---

## 2. Color System

### 2.1 Semantic Token Architecture

All colors are referenced via semantic tokens. No raw hex values in components.

#### Light Mode

| Token | Role | Value | Usage |
|-------|------|-------|-------|
| `--bg-app` | Application background | `#F8FAFC` | Page background |
| `--bg-surface` | Card/panel surface | `#FFFFFF` | Cards, panels, modals |
| `--bg-surface-raised` | Elevated surface | `#FFFFFF` | Popover, dropdown |
| `--bg-surface-inset` | Inset/recessed surface | `#F1F5F9` | Code blocks, input backgrounds |
| `--bg-sidebar` | Sidebar background | `#FAFBFC` | Left navigation |
| `--bg-hover` | Hover state | `#F1F5F9` | Row hover, button hover |
| `--bg-active` | Active/selected state | `#EFF6FF` | Selected row, active nav item |
| `--fg-default` | Primary text | `#0F172A` | Body text, headings |
| `--fg-muted` | Secondary text | `#64748B` | Labels, timestamps, metadata |
| `--fg-faint` | Tertiary text | `#94A3B8` | Placeholder, disabled text |
| `--fg-on-emphasis` | Text on colored bg | `#FFFFFF` | Button labels on primary |
| `--border-default` | Default border | `#E2E8F0` | Cards, inputs, dividers |
| `--border-muted` | Subtle border | `#F1F5F9` | Internal dividers |
| `--border-emphasis` | Strong border | `#CBD5E1` | Focus rings (secondary) |
| `--ring-focus` | Focus ring | `#2563EB` | Keyboard focus indicator |

#### Dark Mode

| Token | Role | Value |
|-------|------|-------|
| `--bg-app` | Application background | `#0B0F1A` |
| `--bg-surface` | Card/panel surface | `#111827` |
| `--bg-surface-raised` | Elevated surface | `#1E293B` |
| `--bg-surface-inset` | Inset/recessed surface | `#0F172A` |
| `--bg-sidebar` | Sidebar background | `#0D1117` |
| `--bg-hover` | Hover state | `#1E293B` |
| `--bg-active` | Active/selected state | `#172554` |
| `--fg-default` | Primary text | `#F1F5F9` |
| `--fg-muted` | Secondary text | `#94A3B8` |
| `--fg-faint` | Tertiary text | `#64748B` |
| `--fg-on-emphasis` | Text on colored bg | `#FFFFFF` |
| `--border-default` | Default border | `#1E293B` |
| `--border-muted` | Subtle border | `#1E293B` |
| `--border-emphasis` | Strong border | `#334155` |
| `--ring-focus` | Focus ring | `#3B82F6` |

### 2.2 Functional Colors (Same Both Modes Unless Noted)

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--accent-primary` | `#2563EB` | `#3B82F6` | Primary actions, active states, links |
| `--accent-primary-hover` | `#1D4ED8` | `#2563EB` | Primary button hover |
| `--accent-primary-subtle` | `#EFF6FF` | `#172554` | Primary badges, selected rows |
| `--status-success` | `#059669` | `#10B981` | Completed, approved, resolved |
| `--status-success-subtle` | `#ECFDF5` | `#064E3B` | Success badge backgrounds |
| `--status-warning` | `#D97706` | `#F59E0B` | Approaching deadline, review needed |
| `--status-warning-subtle` | `#FFFBEB` | `#78350F` | Warning badge backgrounds |
| `--status-danger` | `#DC2626` | `#EF4444` | Overdue, breached, failed, destructive |
| `--status-danger-subtle` | `#FEF2F2` | `#7F1D1D` | Danger badge backgrounds |
| `--status-info` | `#0284C7` | `#38BDF8` | Informational, pending |
| `--status-info-subtle` | `#F0F9FF` | `#0C4A6E` | Info badge backgrounds |
| `--status-neutral` | `#64748B` | `#94A3B8` | Inactive, snoozed |
| `--status-neutral-subtle` | `#F1F5F9` | `#1E293B` | Neutral badge backgrounds |

### 2.3 Escalation & Priority Colors

| State | Color Token | Light | Dark |
|-------|-------------|-------|------|
| Normal | `--escalation-normal` | `#059669` | `#10B981` |
| Blocked | `--escalation-blocked` | `#D97706` | `#F59E0B` |
| Escalated | `--escalation-escalated` | `#DC2626` | `#EF4444` |
| SLA Breached | `--sla-breached` | `#DC2626` | `#EF4444` |
| SLA At Risk | `--sla-at-risk` | `#D97706` | `#F59E0B` |
| SLA Healthy | `--sla-healthy` | `#059669` | `#10B981` |

### 2.4 Queue Family Colors

Each domain queue gets a subtle accent for visual identification (used on badges and sidebar indicators):

| Queue | Color | Hex (Light) |
|-------|-------|-------------|
| Onboarding | Indigo | `#6366F1` |
| Vacancy | Violet | `#7C3AED` |
| Maintenance | Amber | `#D97706` |
| Receivables | Red | `#DC2626` |
| Renewals | Teal | `#0D9488` |
| Move-Out | Slate | `#475569` |
| Reporting | Sky | `#0284C7` |
| Service Recovery | Rose | `#E11D48` |
| Commercial Intake | Emerald | `#059669` |
| Approvals | Blue | `#2563EB` |
| Integration Sync | Cyan | `#0891B2` |
| Documents | Stone | `#78716C` |
| Handoffs | Purple | `#9333EA` |
| Escalations | Orange | `#EA580C` |
| SLA Watch | Pink | `#DB2777` |

---

## 3. Typography

### 3.1 Font Stack

**Primary:** Inter
**Monospace:** JetBrains Mono (for IDs, timestamps, code references)

Inter is chosen over Plus Jakarta Sans for this context because:
- Superior tabular number support (critical for data-dense queue views)
- Native variable font with optical sizing
- Tighter x-height for higher density at small sizes
- Industry standard for enterprise tools (Linear, Vercel, Raycast)

### 3.2 Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| `--text-display` | 28px | 700 | 1.15 | -0.02em | Page titles (rare) |
| `--text-heading-lg` | 20px | 600 | 1.3 | -0.01em | Section headings |
| `--text-heading` | 16px | 600 | 1.4 | -0.01em | Card titles, panel headers |
| `--text-body` | 14px | 400 | 1.5 | 0 | Body text, descriptions |
| `--text-body-medium` | 14px | 500 | 1.5 | 0 | Labels, nav items |
| `--text-small` | 13px | 400 | 1.45 | 0 | Queue rows, metadata |
| `--text-small-medium` | 13px | 500 | 1.45 | 0 | Queue row emphasis |
| `--text-caption` | 12px | 400 | 1.4 | 0.01em | Timestamps, badges |
| `--text-caption-medium` | 12px | 500 | 1.4 | 0.01em | Badge labels, counts |
| `--text-mono` | 12px | 400 | 1.4 | 0 | IDs, references, codes |
| `--text-overline` | 11px | 600 | 1.3 | 0.06em | Section overlines (uppercase) |

### 3.3 Number Display

- All numbers in queue rows, counts, and data use `font-variant-numeric: tabular-nums`
- Dates use format: `06 Apr 2026` or relative (`2d ago`, `in 3h`)
- Currency: `AED 5,000.00` (tabular nums, right-aligned)

---

## 4. Spacing & Layout

### 4.1 Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | 0px | — |
| `--space-1` | 4px | Tight inline spacing |
| `--space-2` | 8px | Default inline gap, icon-to-text |
| `--space-3` | 12px | Small section padding |
| `--space-4` | 16px | Card padding, form field gap |
| `--space-5` | 20px | Panel padding |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Large section spacing |
| `--space-10` | 40px | Page section gaps |
| `--space-12` | 48px | Major layout gaps |

### 4.2 Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Badges, small inputs |
| `--radius-md` | 6px | Buttons, inputs, cards |
| `--radius-lg` | 8px | Panels, modals, large cards |
| `--radius-xl` | 12px | Popovers, sheets |
| `--radius-full` | 9999px | Avatars, circular buttons, pills |

### 4.3 Shadows

| Token | Light Value | Dark Value | Usage |
|-------|-------------|------------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | `0 1px 2px rgba(0,0,0,0.3)` | Cards, inputs |
| `--shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.07)` | `0 4px 6px -1px rgba(0,0,0,0.4)` | Dropdowns, popovers |
| `--shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.08)` | `0 10px 15px -3px rgba(0,0,0,0.5)` | Modals, sheets |
| `--shadow-focus` | `0 0 0 3px rgba(37,99,235,0.2)` | `0 0 0 3px rgba(59,130,246,0.3)` | Focus rings |

### 4.4 Layout Grid

```
Desktop (>=1280px):
┌─────────────────────────────────────────────────────────────────────┐
│ Top Bar (48px)                                                      │
├────────────┬────────────────────────────┬──────────────────────────┤
│ Sidebar    │ Queue List                 │ Preview/Detail Panel     │
│ (240px)    │ (flex: 1, min: 400px)      │ (420px, collapsible)     │
│            │                            │                          │
│            │                            │                          │
│            │                            │                          │
│            │                            │                          │
└────────────┴────────────────────────────┴──────────────────────────┘

Tablet (768-1279px):
┌──────────────────────────────────────────┐
│ Top Bar (48px)                            │
├──────┬───────────────────────────────────┤
│ Side │ Queue List (full width)            │
│ (56) │                                    │
│ icon │                                    │
│ only │                                    │
└──────┴───────────────────────────────────┘
  Detail opens as overlay sheet from right

Full Detail Page (any width):
┌─────────────────────────────────────────────────────────────────────┐
│ Top Bar (48px)                                                      │
├────────────┬────────────────────────────────────────────────────────┤
│ Sidebar    │ Detail Page (max-width: 960px, centered)               │
│ (240px)    │ ┌─────────────────────────────────────────────────┐    │
│            │ │ Detail Header                                    │    │
│            │ ├─────────────────────────────────────────────────┤    │
│            │ │ Content Tabs                                     │    │
│            │ │ (Overview | Timeline | Documents | Related)      │    │
│            │ └─────────────────────────────────────────────────┘    │
└────────────┴────────────────────────────────────────────────────────┘
```

### 4.5 Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default content |
| `--z-raised` | 10 | Sticky table headers |
| `--z-sidebar` | 20 | Navigation sidebar |
| `--z-topbar` | 30 | Top navigation bar |
| `--z-dropdown` | 40 | Dropdowns, popovers |
| `--z-modal-backdrop` | 50 | Modal scrim (50% black) |
| `--z-modal` | 60 | Modal content |
| `--z-toast` | 70 | Toast notifications |
| `--z-tooltip` | 80 | Tooltips |
| `--z-command-palette` | 90 | Command palette overlay |

---

## 5. Motion & Animation

### 5.1 Duration Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-instant` | 100ms | Button press, toggle |
| `--duration-fast` | 150ms | Hover, focus, tooltip appear |
| `--duration-normal` | 200ms | Panel slide, dropdown open |
| `--duration-slow` | 300ms | Modal enter, page transition |
| `--duration-exit` | 150ms | All exit animations (faster than enter) |

### 5.2 Easing

| Token | Value | Usage |
|-------|-------|-------|
| `--ease-default` | `cubic-bezier(0.16, 1, 0.3, 1)` | General UI transitions (expo out) |
| `--ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` | Elements exiting |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bounce-in for emphasis |

### 5.3 Animation Patterns

| Pattern | Implementation |
|---------|---------------|
| Sidebar collapse | Width transition, `--duration-normal`, `--ease-default` |
| Preview panel slide | Transform translateX, `--duration-normal`, `--ease-default` |
| Row hover | Background color, `--duration-fast` |
| Row selection | Background color + left border accent, `--duration-instant` |
| Modal enter | Opacity 0→1 + scale(0.97→1), `--duration-slow`, `--ease-default` |
| Modal exit | Opacity 1→0 + scale(1→0.97), `--duration-exit`, `--ease-in` |
| Toast enter | TranslateY(100%→0) + opacity, `--duration-normal` |
| Toast exit | TranslateY(0→100%) + opacity, `--duration-exit` |
| Dropdown open | Opacity + translateY(-4px→0), `--duration-fast` |
| Skeleton pulse | Opacity 0.4↔1.0, 1.5s infinite |
| Status badge pulse | Scale(1→1.05→1), `--duration-slow`, for live SLA breach |

### 5.4 Reduced Motion

When `prefers-reduced-motion: reduce`:
- All transitions become `--duration-instant` (100ms)
- No transform animations (use opacity-only crossfade)
- Skeleton pulse becomes a static shimmer
- No pulsing status badges

---

## 6. Iconography

### 6.1 Icon Library

**Primary:** Lucide React (`lucide-react`)

Reasons:
- Consistent 24px grid, 1.5px stroke weight
- Tree-shakeable (only imported icons ship)
- Active maintenance, MIT license
- Same visual language as Linear, shadcn/ui

### 6.2 Icon Sizing

| Context | Size | Usage |
|---------|------|-------|
| Inline with text | 16px | Queue row indicators, metadata |
| Button/nav icon | 18px | Sidebar nav, toolbar actions |
| Panel/header icon | 20px | Section headers, panel icons |
| Empty state | 48px | Empty state illustrations |

### 6.3 Icon Color Rules

- Icons inherit text color by default (`currentColor`)
- Status icons use corresponding status color tokens
- Navigation icons use `--fg-muted`, active uses `--accent-primary`
- Never use colored icons without an accompanying text label

---

## 7. Component Library Inventory

### 7.1 Primitives (atoms)

| Component | Variants | Notes |
|-----------|----------|-------|
| `Button` | primary, secondary, ghost, danger, icon-only | Sizes: sm (28px), md (32px), lg (36px). Loading state with spinner. |
| `Badge` | status, queue-family, count, dot | Maps to semantic color tokens |
| `Avatar` | image, initials, icon | Sizes: xs (20px), sm (24px), md (32px), lg (40px) |
| `Input` | text, search, number, date | With label, helper, error states |
| `Select` | single, multi, combobox | With search, clear, option groups |
| `Checkbox` | default, indeterminate | For bulk selection |
| `Toggle` | default | For binary settings |
| `Tooltip` | default | Max width 240px, appear on hover/focus |
| `Kbd` | default | Keyboard shortcut indicator |
| `Separator` | horizontal, vertical | Semantic `<hr>` with role |
| `Skeleton` | text, avatar, card, row | Placeholder during loading |
| `Spinner` | inline, overlay | Sizes matching icon sizes |
| `Progress` | bar, ring | Determinate and indeterminate |

### 7.2 Composites (molecules)

| Component | Description |
|-----------|-------------|
| `StatusBadge` | Status text + colored dot/bg, maps to domain status enums |
| `EscalationIndicator` | Visual indicator for normal/blocked/escalated state |
| `OwnerChip` | Avatar + name, click to reassign |
| `DueIndicator` | Relative time + color coding (on track / approaching / overdue) |
| `BlockerCard` | Type + reason + waiting-on + since-when + actions |
| `SLAMeter` | Clock icon + elapsed/budget + visual bar + breach state |
| `QueueCounter` | Queue name + count badge, active state |
| `FilterChip` | Active filter label + clear button |
| `ActionButton` | Role-gated button that auto-hides when user lacks permission |
| `ConfirmDialog` | Title + message + confirm/cancel, for protected actions |
| `CommandItem` | Icon + label + shortcut + description, for command palette |
| `TimelineEntry` | Timestamp + actor + event type icon + description |
| `RelatedRecordLink` | Type icon + title + status badge, navigable |
| `DocumentPackCard` | Pack name + completeness % + missing artifacts list |
| `SignaturePacketCard` | Packet name + status + signer list + completion state |
| `HandoffCard` | From → To + status + acceptance state + actions |
| `ApprovalCard` | Request type + requester + decision + reviewer |
| `SubStatusRow` | Sub-status label + current value badge |
| `AuditEntry` | Event type + before/after states + actor + timestamp |
| `IntegrationSyncRow` | System + direction + status + retry state |
| `EmptyState` | Icon + title + description + action button |
| `ErrorBanner` | What failed + what was saved + retry action |

### 7.3 Patterns (organisms)

| Component | Description |
|-----------|-------------|
| `TopBar` | App name + breadcrumb + search trigger + user menu + theme toggle |
| `Sidebar` | Queue navigation with collapsible groups + counts + active state |
| `QueueList` | Table with sortable columns + filter bar + bulk selection + pagination |
| `QueueRow` | Dense row: title, type badge, property, status, owner, due, blocker, next action |
| `PreviewPanel` | Summary + stage control + quick actions + recent activity + related records |
| `DetailHeader` | Title + status + owner + due + primary action + breadcrumb back |
| `DetailTabBar` | Overview / Timeline / Documents / Related tabs |
| `ActivityTimeline` | Filtered event list: system, human, notes, comms, integration |
| `StageControl` | Current status + allowed transitions + sub-status grid + artifacts |
| `GuidedRunner` | Step indicator + current step content + evidence capture + nav |
| `BulkActionBar` | Sticky bottom bar: selected count + available actions |
| `CommandPalette` | Global search + recent items + quick actions + keyboard shortcut (Cmd+K) |
| `FilterBar` | Active filters + add filter dropdown + clear all + saved views |
| `SavedViewManager` | List of saved views + save current + rename + share |
| `NotificationToast` | Stacked bottom-right, auto-dismiss 5s, action button |

---

## 8. Accessibility Standards

### 8.1 WCAG 2.1 AA Compliance (Mandatory)

| Criterion | Implementation |
|-----------|---------------|
| 1.1.1 Non-text content | All icons have `aria-label`; decorative icons have `aria-hidden="true"` |
| 1.3.1 Info and relationships | Semantic HTML: `<nav>`, `<main>`, `<aside>`, `<table>`, `<form>` |
| 1.4.1 Use of color | Status never communicated by color alone (always icon + text) |
| 1.4.3 Contrast minimum | 4.5:1 for normal text, 3:1 for large text — verified both modes |
| 1.4.11 Non-text contrast | 3:1 for UI components and graphical objects |
| 2.1.1 Keyboard | Full keyboard navigation: Tab, Shift+Tab, Arrow keys, Enter, Escape |
| 2.4.1 Bypass blocks | Skip-to-main-content link |
| 2.4.3 Focus order | Tab order matches visual layout |
| 2.4.7 Focus visible | 3px focus ring using `--ring-focus` on all interactive elements |
| 2.5.5 Target size | Minimum 44x44px click targets (extend via padding if visual is smaller) |
| 4.1.2 Name, role, value | ARIA attributes on all custom components |

### 8.2 Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `↑ / ↓` | Navigate queue rows |
| `Enter` | Open preview / expand |
| `Cmd/Ctrl + Enter` | Open full detail |
| `Escape` | Close panel / modal / palette |
| `J / K` | Next / previous row (vim-style) |
| `A` | Assign to me (when in preview) |
| `S` | Snooze (when in preview) |
| `E` | Escalate (when in preview) |
| `?` | Show keyboard shortcuts help |

### 8.3 Screen Reader Landmarks

```html
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header role="banner">         <!-- TopBar -->
  <nav role="navigation">         <!-- Sidebar -->
  <main id="main" role="main">    <!-- Queue/Detail content -->
  <aside role="complementary">    <!-- Preview panel -->
  <div role="status" aria-live="polite">  <!-- Toast region -->
</body>
```

---

## 9. Responsive Strategy

### 9.1 Breakpoints

| Name | Width | Layout |
|------|-------|--------|
| `sm` | 640px | Mobile: stack everything, bottom sheet for detail |
| `md` | 768px | Tablet: collapsed sidebar (icon-only) + full queue |
| `lg` | 1024px | Small desktop: sidebar + queue, preview as overlay |
| `xl` | 1280px | Desktop: sidebar + queue + preview (split pane) |
| `2xl` | 1536px | Large desktop: wider preview panel |

### 9.2 Adaptive Behavior

| Feature | Desktop (>=1280) | Tablet (768-1279) | Mobile (<768) |
|---------|-------------------|--------------------|----|
| Sidebar | Full (240px) | Icon-only (56px) | Hidden (hamburger) |
| Queue list | Visible always | Visible always | Full screen |
| Preview panel | Side panel (420px) | Slide-over sheet | Full screen push |
| Detail page | Centered (max 960px) | Full width | Full screen |
| Bulk action bar | Sticky bottom | Sticky bottom | Sticky bottom |
| Command palette | Centered modal | Centered modal | Full screen |
| Filters | Inline bar | Collapsible | Bottom sheet |

---

## 10. Dark Mode Implementation

### 10.1 Strategy

- CSS custom properties with `[data-theme="dark"]` on `<html>`
- System preference detection via `prefers-color-scheme`
- User override stored in `localStorage`
- Toggle in TopBar user menu
- All design decisions tested in both modes before shipping

### 10.2 Dark Mode Specific Rules

- Never invert — use dedicated dark palette
- Reduce surface elevation contrast (surfaces are closer in lightness)
- Increase shadow opacity (dark backgrounds need stronger shadows)
- Desaturate accent colors slightly for comfort
- Status colors maintain 4.5:1 contrast against dark surfaces
- Borders use `rgba(255,255,255,0.08)` pattern for subtlety

---

## 11. Design Token Implementation

### 11.1 File Structure

```
src/
  design-tokens/
    colors.css          # All color custom properties
    typography.css      # Font families, scale, weights
    spacing.css         # Spacing scale
    shadows.css         # Shadow definitions
    motion.css          # Duration, easing
    layout.css          # Breakpoints, z-index, radius
    index.css           # Imports all token files
```

### 11.2 Tailwind Integration

Tokens should be available as both CSS custom properties (for raw CSS and third-party libs) and Tailwind config values (for utility classes). The Tailwind config should reference the CSS custom properties, not duplicate values.

```
tailwind.config.ts references var(--token-name) values
so that themes swap at runtime via CSS without rebuild
```
