// ---------------------------------------------------------------------------
// Property surfaces API — Properties, Portfolio, Units, Property Context
// ---------------------------------------------------------------------------

import { apiGet, apiPost, apiPut, apiDelete } from "./client";
import type {
  PropertiesBootstrapResponse,
  PortfolioBootstrapResponse,
  UnitsBootstrapResponse,
  CreatePropertyPayload,
  CreatePropertyResponse,
  UnitWritePayload,
  DeleteUnitResponse,
  PropertyContextBootstrapResponse,
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

export async function createProperty(
  payload: CreatePropertyPayload,
): Promise<CreatePropertyResponse> {
  return apiPost<CreatePropertyResponse>("/api/v1/properties", payload);
}

// ---- Unit CRUD ----

export async function createUnit(payload: UnitWritePayload): Promise<UnitWritePayload> {
  return apiPost<UnitWritePayload>("/api/v1/units", payload);
}

export async function updateUnit(
  unitId: string,
  payload: UnitWritePayload,
): Promise<UnitWritePayload> {
  return apiPut<UnitWritePayload>(`/api/v1/units/${unitId}`, payload);
}

export async function deleteUnit(unitId: string): Promise<DeleteUnitResponse> {
  return apiDelete<DeleteUnitResponse>(`/api/v1/units/${unitId}`);
}

// ---- Property Context ----

export async function fetchPropertyContextBootstrap(params?: {
  referenceType?: string;
  referenceId?: string;
}): Promise<PropertyContextBootstrapResponse> {
  return apiGet<PropertyContextBootstrapResponse>("/api/v1/property-context/bootstrap", {
    reference_type: params?.referenceType,
    reference_id: params?.referenceId,
  });
}
