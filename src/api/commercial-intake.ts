// ---------------------------------------------------------------------------
// Commercial Intake API — Phase 9: Lead Qualification + CRM Enrichment
// ---------------------------------------------------------------------------

import { apiGet } from "./client";
import type { CommercialIntakeCaseListResponse } from "../types/api";

export async function fetchCommercialIntakeCases(): Promise<CommercialIntakeCaseListResponse> {
  return apiGet<CommercialIntakeCaseListResponse>(
    "/api/v1/operator-shell/commercial-intake-cases",
  );
}
