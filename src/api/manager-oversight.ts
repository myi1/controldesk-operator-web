// ---------------------------------------------------------------------------
// Manager Oversight API — Phase 8: SLA & Notification Engine
// ---------------------------------------------------------------------------

import { apiGet, apiPost } from "./client";
import type {
  ManagerOversightBootstrapResponse,
  SLABreachSummary,
  ProcessRemindersResponse,
} from "../types/api";

export async function fetchManagerOversightBootstrap(): Promise<ManagerOversightBootstrapResponse> {
  return apiGet<ManagerOversightBootstrapResponse>("/api/v1/manager-oversight/bootstrap");
}

export async function fetchSLABreaches(): Promise<SLABreachSummary[]> {
  return apiGet<SLABreachSummary[]>("/api/v1/operator-shell/sla-breaches");
}

export async function processReminders(): Promise<ProcessRemindersResponse> {
  return apiPost<ProcessRemindersResponse>("/api/v1/operator-shell/process-reminders", {});
}
