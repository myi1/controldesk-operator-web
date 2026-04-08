import { describe, it, expect } from "vitest";
import { getAvailableActions } from "./case-actions";
import type { AvailableAction, ProtectedAction } from "../types/api";
import type { AnyRunnerConfig } from "../types/runner";

/* ------------------------------------------------------------------ */
/*  Fixtures                                                            */
/* ------------------------------------------------------------------ */

function makeTransition(
  actionKey: string,
  label = actionKey,
): AvailableAction {
  return {
    action_key: actionKey,
    target_status: actionKey.split(".")[1] ?? "",
    label,
    confirmation_required: false,
  };
}

function makeProtected(
  actionKey: string,
  availableRoles: string[] = [],
  overrides: Partial<ProtectedAction> = {},
): ProtectedAction {
  return {
    action_key: actionKey,
    label: actionKey,
    requires_human_release: false,
    permission_scope: "standard",
    available_roles: availableRoles,
    ...overrides,
  };
}

function makeRunner(id: string, allowedRoles: string[] = []): AnyRunnerConfig {
  return {
    id,
    title: id,
    description: "",
    lifecycle: id.split(".")[0] ?? id,
    endpoint: "/api/test/{id}/advance",
    method: "POST",
    mode: "modal",
    steps: [],
    invalidates: [],
    successMessage: "",
    allowedRoles,
  } as AnyRunnerConfig;
}

const EMPTY_REGISTRY = new Map<string, AnyRunnerConfig>();

/* ------------------------------------------------------------------ */
/*  Tests                                                               */
/* ------------------------------------------------------------------ */

describe("getAvailableActions — empty inputs", () => {
  it("returns all nulls/empty arrays when everything is empty", () => {
    const result = getAvailableActions([], [], [], EMPTY_REGISTRY);
    expect(result.continueAction).toBeNull();
    expect(result.quickActions).toHaveLength(0);
    expect(result.myActions).toHaveLength(0);
    expect(result.lockedActions).toHaveLength(0);
    expect(result.myTransitions).toHaveLength(0);
    expect(result.lockedTransitions).toHaveLength(0);
  });

  it("handles undefined availableActions without throwing", () => {
    const result = getAvailableActions(undefined, [], [], EMPTY_REGISTRY);
    expect(result.continueAction).toBeNull();
    expect(result.myTransitions).toHaveLength(0);
  });
});

describe("getAvailableActions — continueAction selection", () => {
  it("selects the first runner-backed available_action the user can run", () => {
    const transitions = [
      makeTransition("vacancy.pricing_pending", "Set Pricing"),
      makeTransition("vacancy.lease_ready", "Mark Lease Ready"),
    ];
    const registry = new Map([
      ["vacancy.pricing_pending", makeRunner("vacancy.pricing_pending", ["PM Coordinator"])],
      ["vacancy.lease_ready", makeRunner("vacancy.lease_ready", ["PM Manager"])],
    ]);

    const result = getAvailableActions(transitions, [], ["PM Coordinator"], registry);

    expect(result.continueAction).toEqual({
      actionKey: "vacancy.pricing_pending",
      label: "Set Pricing",
    });
  });

  it("skips transitions where user lacks the required role", () => {
    const transitions = [
      makeTransition("vacancy.pricing_pending", "Set Pricing"),
      makeTransition("vacancy.lease_ready", "Mark Lease Ready"),
    ];
    const registry = new Map([
      ["vacancy.pricing_pending", makeRunner("vacancy.pricing_pending", ["PM Manager"])],
      ["vacancy.lease_ready", makeRunner("vacancy.lease_ready", ["PM Coordinator"])],
    ]);

    const result = getAvailableActions(transitions, [], ["PM Coordinator"], registry);

    expect(result.continueAction).toEqual({
      actionKey: "vacancy.lease_ready",
      label: "Mark Lease Ready",
    });
  });

  it("skips available_actions with no runner entry (not eligible for Continue)", () => {
    const transitions = [makeTransition("no_runner.transition", "No Runner")];
    const result = getAvailableActions(transitions, [], ["any_role"], EMPTY_REGISTRY);
    expect(result.continueAction).toBeNull();
  });

  it("falls back to protected_action when no runner-backed transition available", () => {
    const transitions = [makeTransition("no_runner.action", "Not In Registry")];
    const pa = makeProtected("some.protected", ["PM Coordinator"], { label: "Do Something" });

    const result = getAvailableActions(transitions, [pa], ["PM Coordinator"], EMPTY_REGISTRY);

    expect(result.continueAction).toEqual({
      actionKey: "some.protected",
      label: "Do Something",
    });
  });

  it("returns null continueAction when user has no matching role anywhere", () => {
    const transitions = [makeTransition("vacancy.pricing_pending")];
    const registry = new Map([
      ["vacancy.pricing_pending", makeRunner("vacancy.pricing_pending", ["PM Manager"])],
    ]);
    const pa = makeProtected("some.action", ["PM Manager"]);

    const result = getAvailableActions(transitions, [pa], ["Leasing Agent"], registry);

    expect(result.continueAction).toBeNull();
  });

  it("treats a runner with empty allowedRoles as open to all users", () => {
    const transitions = [makeTransition("case.open_action", "Open Action")];
    const registry = new Map([["case.open_action", makeRunner("case.open_action", [])]]);

    const result = getAvailableActions(transitions, [], ["any_role"], registry);

    expect(result.continueAction).toEqual({
      actionKey: "case.open_action",
      label: "Open Action",
    });
  });

  it("picks the first eligible action in order — not the last", () => {
    const transitions = [
      makeTransition("step.one", "Step One"),
      makeTransition("step.two", "Step Two"),
      makeTransition("step.three", "Step Three"),
    ];
    const registry = new Map([
      ["step.one", makeRunner("step.one", ["PM Manager"])], // user can't run
      ["step.two", makeRunner("step.two", ["PM Coordinator"])], // user can run
      ["step.three", makeRunner("step.three", ["PM Coordinator"])], // user can run
    ]);

    const result = getAvailableActions(transitions, [], ["PM Coordinator"], registry);

    expect(result.continueAction?.actionKey).toBe("step.two");
  });

  it("fallback does not select a protected_action whose key is already in availableActions", () => {
    // vacancy.pricing_pending is in both available_actions AND protected_actions
    // but the runner requires PM Manager (user is PM Coordinator) — so no runner-based continue
    // The fallback should NOT pick the protected action for pricing_pending
    // because it's already represented in availableActions (different label might apply)
    const transitions = [makeTransition("vacancy.pricing_pending", "Set Pricing (runner label)")];
    const pa = makeProtected("vacancy.pricing_pending", ["PM Coordinator"], {
      label: "Set Pricing (protected label)",
    });
    // Runner requires PM Manager → user can't run it as a runner
    const registry = new Map([
      ["vacancy.pricing_pending", makeRunner("vacancy.pricing_pending", ["PM Manager"])],
    ]);

    const result = getAvailableActions(transitions, [pa], ["PM Coordinator"], registry);

    // continueAction should be null — user can't run the runner, and the fallback
    // skips vacancy.pricing_pending because it's in availableKeys
    expect(result.continueAction).toBeNull();
  });
});

describe("getAvailableActions — quickActions", () => {
  it("classifies snooze actions as quickActions, not myActions", () => {
    const pa = makeProtected("case.snooze_case", ["PM Coordinator"]);
    const result = getAvailableActions([], [pa], ["PM Coordinator"], EMPTY_REGISTRY);
    expect(result.quickActions).toHaveLength(1);
    expect(result.quickActions[0].action_key).toBe("case.snooze_case");
    expect(result.myActions).toHaveLength(0);
  });

  it("classifies escalate actions as quickActions", () => {
    const pa = makeProtected("case.escalate_to_manager", ["PM Coordinator"]);
    const result = getAvailableActions([], [pa], ["PM Coordinator"], EMPTY_REGISTRY);
    expect(result.quickActions).toHaveLength(1);
    expect(result.quickActions[0].action_key).toBe("case.escalate_to_manager");
  });

  it("classifies assign actions as quickActions", () => {
    const pa = makeProtected("case.assign_owner", ["PM Coordinator"]);
    const result = getAvailableActions([], [pa], ["PM Coordinator"], EMPTY_REGISTRY);
    expect(result.quickActions).toHaveLength(1);
  });

  it("classifies non-utility protected actions as myActions", () => {
    const pa = makeProtected("case.approve_contract", ["PM Coordinator"]);
    const result = getAvailableActions([], [pa], ["PM Coordinator"], EMPTY_REGISTRY);
    expect(result.myActions).toHaveLength(1);
    expect(result.quickActions).toHaveLength(0);
  });

  it("does NOT put locked utility actions in quickActions", () => {
    const pa = makeProtected("case.snooze_case", ["PM Manager"]); // user is Coordinator
    const result = getAvailableActions([], [pa], ["PM Coordinator"], EMPTY_REGISTRY);
    expect(result.quickActions).toHaveLength(0);
    expect(result.lockedActions).toHaveLength(1);
  });
});

describe("getAvailableActions — lockedActions", () => {
  it("puts protected actions with no role match in lockedActions", () => {
    const pa = makeProtected("case.release_deposit", ["PM Head", "Finance"]);
    const result = getAvailableActions([], [pa], ["PM Coordinator"], EMPTY_REGISTRY);
    expect(result.lockedActions).toHaveLength(1);
    expect(result.myActions).toHaveLength(0);
    expect(result.quickActions).toHaveLength(0);
  });

  it("puts a protected action in myActions if ANY of the user roles match", () => {
    const pa = makeProtected("case.approve", ["PM Manager", "PM Coordinator"]);
    const result = getAvailableActions([], [pa], ["PM Coordinator"], EMPTY_REGISTRY);
    expect(result.myActions).toHaveLength(1);
    expect(result.lockedActions).toHaveLength(0);
  });
});

describe("getAvailableActions — transitions", () => {
  it("deduplicates available_actions already present in protected_actions", () => {
    const t = makeTransition("case.advance");
    const pa = makeProtected("case.advance", ["PM Coordinator"]);
    const registry = new Map([["case.advance", makeRunner("case.advance", ["PM Coordinator"])]]);

    const result = getAvailableActions([t], [pa], ["PM Coordinator"], registry);

    expect(result.myTransitions).toHaveLength(0);
    expect(result.lockedTransitions).toHaveLength(0);
  });

  it("puts non-deduplicated transitions in myTransitions when user can run them", () => {
    const t1 = makeTransition("vacancy.pricing_pending", "Set Pricing");
    const t2 = makeTransition("vacancy.lease_ready", "Lease Ready");
    const registry = new Map([
      ["vacancy.pricing_pending", makeRunner("vacancy.pricing_pending", ["PM Coordinator"])],
      ["vacancy.lease_ready", makeRunner("vacancy.lease_ready", ["PM Manager"])],
    ]);

    const result = getAvailableActions([t1, t2], [], ["PM Coordinator"], registry);

    expect(result.myTransitions).toHaveLength(1);
    expect(result.myTransitions[0].action_key).toBe("vacancy.pricing_pending");
    expect(result.lockedTransitions).toHaveLength(1);
    expect(result.lockedTransitions[0].action_key).toBe("vacancy.lease_ready");
  });

  it("allows unregistered transitions for any user (no runner = no role restriction)", () => {
    const t = makeTransition("case.unregistered_transition");
    const result = getAvailableActions([t], [], ["anyone"], EMPTY_REGISTRY);
    expect(result.myTransitions).toHaveLength(1);
    expect(result.lockedTransitions).toHaveLength(0);
  });

  it("preserves ordering of myTransitions", () => {
    const transitions = [
      makeTransition("a.one"),
      makeTransition("a.two"),
      makeTransition("a.three"),
    ];
    const result = getAvailableActions(transitions, [], ["role"], EMPTY_REGISTRY);
    expect(result.myTransitions.map((t) => t.action_key)).toEqual(["a.one", "a.two", "a.three"]);
  });
});

describe("getAvailableActions — mixed scenarios", () => {
  it("handles a realistic case with multiple action types", () => {
    const transitions = [
      makeTransition("vacancy.pricing_pending", "Set Pricing"),
      makeTransition("vacancy.stalled", "Mark Stalled"),
    ];
    const protected_ = [
      makeProtected("vacancy.snooze", ["PM Coordinator"]),       // quickAction
      makeProtected("vacancy.escalate", ["PM Coordinator"]),     // quickAction
      makeProtected("vacancy.close_lost", ["PM Manager"]),       // lockedAction
      makeProtected("vacancy.pricing_pending", ["PM Coordinator"]), // deduplicated from transitions
    ];
    const registry = new Map([
      ["vacancy.pricing_pending", makeRunner("vacancy.pricing_pending", ["PM Coordinator"])],
      ["vacancy.stalled", makeRunner("vacancy.stalled", ["PM Head"])],
    ]);

    const result = getAvailableActions(
      transitions,
      protected_,
      ["PM Coordinator"],
      registry,
    );

    expect(result.continueAction?.actionKey).toBe("vacancy.pricing_pending");
    expect(result.quickActions).toHaveLength(2); // snooze + escalate
    expect(result.myActions).toHaveLength(0); // pricing_pending deduped, no other non-utility
    expect(result.lockedActions).toHaveLength(1); // close_lost (wrong role)
    expect(result.myTransitions).toHaveLength(0); // pricing_pending is in protected, stalled is locked
    expect(result.lockedTransitions).toHaveLength(1); // stalled (PM Head only)
  });
});
