// ---------------------------------------------------------------------------
// Property surfaces API — Properties, Portfolio, Units, Property Context
// ---------------------------------------------------------------------------

import { apiGet } from "./client";
import type {
  PropertiesBootstrapResponse,
  PortfolioBootstrapResponse,
  UnitsBootstrapResponse,
} from "../types/api";

export async function fetchPropertiesBootstrap(): Promise<PropertiesBootstrapResponse> {
  return apiGet<PropertiesBootstrapResponse>("/api/v1/properties/bootstrap");
}

export async function fetchPortfolioBootstrap(): Promise<PortfolioBootstrapResponse> {
  return apiGet<PortfolioBootstrapResponse>("/api/v1/portfolio/bootstrap");
}

export async function fetchUnitsBootstrap(): Promise<UnitsBootstrapResponse> {
  return apiGet<UnitsBootstrapResponse>("/api/v1/units/bootstrap");
}

export async function fetchPropertyContextBootstrap(params: {
  referenceType?: string;
  referenceId?: string;
}): Promise<Record<string, unknown>> {
  return apiGet<Record<string, unknown>>("/api/v1/property-context/bootstrap", {
    reference_type: params.referenceType,
    reference_id: params.referenceId,
  });
}
