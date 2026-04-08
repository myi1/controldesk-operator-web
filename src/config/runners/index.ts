// ---------------------------------------------------------------------------
// RUNNER_REGISTRY — O(1) lookup from action_key → runner config
//
// Key format: '{lifecycle}.{target_status}' (advance runners)
//             '{lifecycle}.{action_name}' (specific-endpoint runners)
//
// Both must match the action_key returned by the backend in:
//   - CaseDetailResponse.available_actions[].action_key
//   - CaseDetailResponse.protected_actions[].action_key
// ---------------------------------------------------------------------------

import type { AnyRunnerConfig } from "../../types/runner";

import { ONBOARDING_RUNNERS, ONBOARDING_CONFIRM_ACTIONS } from "./onboarding";
import { VACANCY_RUNNERS, VACANCY_CONFIRM_ACTIONS } from "./vacancy";
import { TENANCY_RUNNERS } from "./tenancy";
import { MOVEOUT_RUNNERS, MOVEOUT_CONFIRM_ACTIONS } from "./moveout";
import { RENEWAL_RUNNERS, RENEWAL_CONFIRM_ACTIONS, RENEWAL_LEGAL_RUNNERS } from "./renewal";
import { RECEIVABLES_RUNNERS } from "./receivables";
import { MAINTENANCE_RUNNERS } from "./maintenance";
import { SERVICE_RECOVERY_RUNNERS } from "./service-recovery";
import { REPORTING_RUNNERS } from "./reporting";
import { INSPECTION_RUNNERS } from "./inspection";
import { VENDOR_RUNNERS, VENDOR_CONFIRM_ACTIONS } from "./vendors";
import { LANDLORD_RUNNERS, LANDLORD_CONFIRM_ACTIONS } from "./landlords";
import { UNIT_RUNNERS, UNIT_CONFIRM_ACTIONS } from "./units";
import { TENANT_RUNNERS, TENANT_CONFIRM_ACTIONS } from "./tenants";
import { PROPERTY_RUNNERS, PROPERTY_CONFIRM_ACTIONS } from "./properties";

const ALL_CONFIGS: AnyRunnerConfig[] = [
  ...ONBOARDING_RUNNERS,
  ...ONBOARDING_CONFIRM_ACTIONS,
  ...VACANCY_RUNNERS,
  ...VACANCY_CONFIRM_ACTIONS,
  ...TENANCY_RUNNERS,
  ...MOVEOUT_RUNNERS,
  ...MOVEOUT_CONFIRM_ACTIONS,
  ...RENEWAL_RUNNERS,
  ...RENEWAL_LEGAL_RUNNERS,
  ...RENEWAL_CONFIRM_ACTIONS,
  ...RECEIVABLES_RUNNERS,
  ...MAINTENANCE_RUNNERS,
  ...SERVICE_RECOVERY_RUNNERS,
  ...REPORTING_RUNNERS,
  ...INSPECTION_RUNNERS,
  ...VENDOR_RUNNERS,
  ...VENDOR_CONFIRM_ACTIONS,
  ...LANDLORD_RUNNERS,
  ...LANDLORD_CONFIRM_ACTIONS,
  ...UNIT_RUNNERS,
  ...UNIT_CONFIRM_ACTIONS,
  ...TENANT_RUNNERS,
  ...TENANT_CONFIRM_ACTIONS,
  ...PROPERTY_RUNNERS,
  ...PROPERTY_CONFIRM_ACTIONS,
];

export const RUNNER_REGISTRY = new Map<string, AnyRunnerConfig>(
  ALL_CONFIGS.map((c) => [c.id, c]),
);
