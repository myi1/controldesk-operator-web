// ---------------------------------------------------------------------------
// Role defaults — maps each OperatorRole to its landing route
// ---------------------------------------------------------------------------

import type { OperatorRole } from "../types/enums";

/**
 * Default landing route for each operator role.
 * Used on login / role-switch to navigate to the most relevant queue.
 */
export const ROLE_DEFAULT_ROUTES: Record<OperatorRole, string> = {
  "PM Head": "/queue/my_work",
  "PM Manager": "/queue/my_work",
  "PM Coordinator": "/queue/my_work",
  "Admin / Ejari / Documentation": "/queue/onboarding_control",
  "Finance / Accounts Support": "/queue/receivables_control",
  "Head of Leasing": "/queue/vacancy_control",
  "Leasing Support Interface": "/queue/vacancy_control",
  "Inspections / Move Team": "/queue/maintenance_control",
  "Maintenance / Vendor Coordinator": "/queue/maintenance_control",
  "Landlord Success Manager": "/queue/onboarding_control",
  "MD / Leadership": "/queue/my_work",
  "System Automations": "/queue/integration_sync",
};
