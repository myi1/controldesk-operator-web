// ---------------------------------------------------------------------------
// Reports API — Phase 10: Reporting + Dashboard Expansion
// ---------------------------------------------------------------------------

import { apiGet } from "./client";
import type {
  AgedVacancyReport,
  FieldCompletenessReport,
  RenewalActionsDueReport,
} from "../types/api";

export async function fetchAgedVacancyReport(): Promise<AgedVacancyReport> {
  return apiGet<AgedVacancyReport>(
    "/api/v1/operator-shell/reports/aged-vacancy",
  );
}

export async function fetchFieldCompletenessReport(): Promise<FieldCompletenessReport> {
  return apiGet<FieldCompletenessReport>(
    "/api/v1/operator-shell/reports/field-completeness",
  );
}

export async function fetchRenewalActionsDueReport(): Promise<RenewalActionsDueReport> {
  return apiGet<RenewalActionsDueReport>(
    "/api/v1/operator-shell/reports/renewal-actions-due",
  );
}
