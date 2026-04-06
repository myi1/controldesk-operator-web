# Operator Web Stack Decision

Status: superseded as the canonical next operator UI path  
Date: 2026-04-04  
Historical issue: `#32`  
Correction issue: `#34`  
Thread: `operator-ux-course-correction`

## Current Rule

The React + TypeScript + Vite scaffold under `clients/operator-web/` remains a validated exploratory client surface.

It is not the canonical next operator UI implementation path for `ControlDesk`.

The canonical next path is to adapt the bounded Frappe experiment control tower into `ControlDesk` as a Frappe Desk page/workspace on top of the current `operator_shell` service contract.

## Why This Was Corrected

- The user clarified that `ControlDesk` should expand the bounded Frappe experiment base, not replace it with a standalone-first frontend.
- The preserved experiment already proves the operator UI as a bounded Frappe page/workspace with queue visibility, in-shell detail, and bounded protected actions.
- The current `ControlDesk` backend still aligns closely with the experiment's bootstrap and queue-row contracts, so the drift is mainly in frontend planning rather than in the service base.
- Continuing to expand the standalone client as the primary UI would deepen architecture drift from the experiment instead of carrying it forward.

## What Remains Valid From Issue `#32`

- Node and npm are available locally and the exploratory client scaffold builds, tests, and lints cleanly.
- The files under `clients/operator-web/` can remain as reference-only scaffolding for a later deliberate multi-surface decision.
- The validation contract from that issue remains useful for keeping the exploratory scaffold healthy:
  - `npm run lint`
  - `npm run test`
  - `npm run build`

## What Is No Longer Canonical

- Issue `#33` is no longer "build the first standalone operator-web workbench."
- The claim that a standalone client is a better first operator UI path than a Frappe page/workspace is superseded in this repo.
- `clients/operator-web/` must not keep expanding as the primary operator surface unless a later deliberate decision explicitly reopens that direction.

## Canonical Source Basis

- `experiment_repo/docs/54_SLICE4A_OPERATOR_SHELL_FOUNDATION_NOTE.md`
- `experiment_repo/docs/55_SLICE4B_CASE_DETAIL_AND_ACTIONS_NOTE.md`
- `experiment_repo/.../page/remax_pm_control_tower/remax_pm_control_tower.js`
- `experiment_repo/.../page/remax_pm_control_tower/remax_pm_control_tower.json`
- `experiment_repo/.../workspace/remax_pm_control_tower/remax_pm_control_tower.json`
- `apps/controldesk_core/controldesk_core/operator_shell.py`

## Immediate Consequence

- Use `clients/operator-web/SLICE_01_BUILD_SPEC.md` as the corrected planning handoff to the experiment-faithful Frappe control-tower implementation.
- Treat the current client scaffold as exploratory/reference-only until a later multi-surface decision says otherwise.
