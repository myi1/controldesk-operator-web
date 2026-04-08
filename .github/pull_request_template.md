## Summary

<!-- 1-3 bullet points describing what this PR does -->

## Test plan

<!-- Checklist of manual and automated tests performed -->
- [ ] `npm run typecheck` passes (0 TypeScript errors)
- [ ] `npm run lint` passes (0 warnings)
- [ ] `npm test -- --run` passes (all tests green)
- [ ] `npm run build` succeeds

## UX consistency checklist

<!-- Required for any PR that changes UI components, pages, or styles -->
- [ ] No raw hex colors — uses Tailwind design tokens or CSS variables only
- [ ] No `rounded-full border px-2 py-0.5` badge pattern on plain data columns
- [ ] Interactive elements meet 44×44px minimum touch target
- [ ] Visible labels on all form inputs (no placeholder-only)
- [ ] Runner visibility respects active roles (not assigned roles)
- [ ] No new hardcoded role strings — uses role constants
- [ ] Semantic color tokens used for status states (status-danger, status-warning, etc.)

## Notes

<!-- Any backend gaps, deferred work, or reviewer callouts -->

🤖 Generated with [Claude Code](https://claude.com/claude-code)
