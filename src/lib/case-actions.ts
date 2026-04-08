// ---------------------------------------------------------------------------
// Case actions utility — filters available_actions and protected_actions by
// user roles and runner registry membership.
//
// Provides:
//   - continueAction: the highest-priority runner-backed step the user can run
//   - quickActions:   utility actions (snooze/escalate/assign) user can run
//   - myActions:      non-utility protected_actions user can run
//   - lockedActions:  protected_actions the user lacks role for
//   - myTransitions:  de-duped lifecycle transitions user can run
//   - lockedTransitions: lifecycle transitions user cannot run
// ---------------------------------------------------------------------------

import type { AvailableAction, ProtectedAction } from "../types/api";
import type { AnyRunnerConfig } from "../types/runner";

/** Action_key substrings that mark secondary utility actions shown as
 *  compact ghost buttons rather than the primary CTA. */
const UTILITY_ACTION_KEYWORDS = ["snooze", "escalat", "assign", "reassign", "unblock"];

// ---------------------------------------------------------------------------
//  Return shape
// ---------------------------------------------------------------------------

export interface CaseActionsResult {
  /**
   * Highest-priority runner-backed transition the user can execute.
   * Derived from available_actions first; falls back to the first
   * protected_action the user has a role for.
   * null when the user cannot execute any action.
   */
  continueAction: { actionKey: string; label: string } | null;

  /**
   * Utility protected_actions (snooze / escalate / assign …) the user can run.
   * Shown as compact ghost buttons in the header quick-action bar.
   */
  quickActions: ProtectedAction[];

  /**
   * Non-utility protected_actions the user has a matching role for.
   * Shown in "Available to you" in the Actions tab.
   */
  myActions: ProtectedAction[];

  /**
   * Protected_actions the user does NOT have a matching role for.
   * Shown greyed-out under "Requires other role".
   */
  lockedActions: ProtectedAction[];

  /**
   * Lifecycle transitions (from available_actions) not already represented
   * in protected_actions that the user can run.
   */
  myTransitions: AvailableAction[];

  /**
   * Lifecycle transitions the user cannot run (no role in runner config).
   */
  lockedTransitions: AvailableAction[];
}

// ---------------------------------------------------------------------------
//  Internal helper
// ---------------------------------------------------------------------------

function runnerAllowsUser(runner: AnyRunnerConfig, roleSet: Set<string>): boolean {
  if (!runner.allowedRoles || runner.allowedRoles.length === 0) return true;
  return runner.allowedRoles.some((r) => roleSet.has(r));
}

// ---------------------------------------------------------------------------
//  Main export
// ---------------------------------------------------------------------------

/**
 * Categorise available_actions + protected_actions for the header action bar
 * and the Actions tab.
 *
 * @param availableActions  Backend lifecycle transitions (runner engine output)
 * @param protectedActions  Backend role-gated confirmable actions
 * @param userRoles         Roles the current user holds
 * @param runnerRegistry    Map<action_key, AnyRunnerConfig>
 */
export function getAvailableActions(
  availableActions: AvailableAction[] | undefined,
  protectedActions: ProtectedAction[],
  userRoles: string[],
  runnerRegistry: Map<string, AnyRunnerConfig>,
): CaseActionsResult {
  const roleSet = new Set(userRoles);
  const protectedKeys = new Set(protectedActions.map((a) => a.action_key));
  // Keys present in available_actions — used to de-duplicate protected_actions that
  // are already represented as lifecycle transitions (continueAction or myTransitions).
  const availableKeys = new Set((availableActions ?? []).map((t) => t.action_key));

  // ── 1. Determine the primary "Continue" action ───────────────────────────
  // Prefer first available_action whose runner allows the user, then fall back
  // to first protected_action the user has a role for.

  let continueAction: CaseActionsResult["continueAction"] = null;

  for (const t of availableActions ?? []) {
    const runner = runnerRegistry.get(t.action_key);
    if (!runner) continue; // no runner — not eligible for "Continue" CTA
    if (runnerAllowsUser(runner, roleSet)) {
      continueAction = { actionKey: t.action_key, label: t.label };
      break;
    }
  }

  if (!continueAction) {
    for (const a of protectedActions) {
      if (availableKeys.has(a.action_key)) continue; // skip keys already in available_actions
      if (a.available_roles.some((r) => roleSet.has(r))) {
        continueAction = { actionKey: a.action_key, label: a.label };
        break;
      }
    }
  }

  // ── 2. Lifecycle transitions (de-duped from protected_actions) ───────────

  const myTransitions: AvailableAction[] = [];
  const lockedTransitions: AvailableAction[] = [];

  for (const t of availableActions ?? []) {
    if (protectedKeys.has(t.action_key)) continue;

    const runner = runnerRegistry.get(t.action_key);
    const canRun = !runner || runnerAllowsUser(runner, roleSet);

    if (canRun) {
      myTransitions.push(t);
    } else {
      lockedTransitions.push(t);
    }
  }

  // ── 3. Protected actions ─────────────────────────────────────────────────

  const quickActions: ProtectedAction[] = [];
  const myActions: ProtectedAction[] = [];
  const lockedActions: ProtectedAction[] = [];

  for (const a of protectedActions) {
    // Skip protected actions that are already represented as lifecycle transitions.
    // They appear either as continueAction (runner-backed) or in myTransitions/lockedTransitions.
    if (availableKeys.has(a.action_key)) continue;

    const canExecute = a.available_roles.some((r) => roleSet.has(r));

    if (!canExecute) {
      lockedActions.push(a);
      continue;
    }

    const isUtility = UTILITY_ACTION_KEYWORDS.some((kw) =>
      a.action_key.toLowerCase().includes(kw),
    );

    if (isUtility) {
      quickActions.push(a);
    } else {
      myActions.push(a);
    }
  }

  return {
    continueAction,
    quickActions,
    myActions,
    lockedActions,
    myTransitions,
    lockedTransitions,
  };
}
