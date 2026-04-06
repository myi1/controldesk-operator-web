# Operator Web

This directory holds exploratory operator-web assets and planning docs.

It is not the canonical next operator UI implementation surface.

The canonical next UI slice for `ControlDesk` is to adapt the bounded experiment control tower into a Frappe Desk page/workspace inside the main app, using the current `operator_shell` service contract as the backend base.

Current planning docs:

- `IA_SPEC.md`
- `COMPONENT_SPEC.md`
- `STACK_DECISION.md`
- `SLICE_01_BUILD_SPEC.md`

Current implementation posture:

- the React + TypeScript + Vite scaffold remains as an exploratory/reference-only client surface
- `STACK_DECISION.md` records why that scaffold is no longer the canonical next UI path
- `SLICE_01_BUILD_SPEC.md` now defines the corrected next UI slice: a Frappe control-tower adaptation based on the bounded experiment

Exact SOP-driven gates and required document packs are deferred until the later mapping phase.

Validation commands from `clients/operator-web/` still apply to the exploratory scaffold only:

- `npm install`
- `npm run lint`
- `npm run test`
- `npm run build`
