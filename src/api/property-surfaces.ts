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
  TenantsBootstrapResponse,
  LandlordsBootstrapResponse,
  LandlordDetailResponse,
  LandlordApprovalMatrixRequest,
  LandlordBankDetailsRequest,
  LandlordKycRequest,
  LandlordFeeAgreementRequest,
  LandlordProfileRequest,
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

// ---- Tenants ----

export async function fetchTenantsBootstrap(): Promise<TenantsBootstrapResponse> {
  return apiGet<TenantsBootstrapResponse>("/api/v1/tenants/bootstrap");
}

// ---- Landlords ----

export async function fetchLandlordsBootstrap(): Promise<LandlordsBootstrapResponse> {
  return apiGet<LandlordsBootstrapResponse>("/api/v1/landlords/bootstrap");
}

export async function fetchLandlordDetail(landlordId: string): Promise<LandlordDetailResponse> {
  return apiGet<LandlordDetailResponse>(`/api/v1/landlords/${landlordId}`);
}

export async function updateLandlordApprovalMatrix(
  landlordId: string,
  payload: LandlordApprovalMatrixRequest,
): Promise<LandlordDetailResponse> {
  return apiPut<LandlordDetailResponse>(`/api/v1/landlords/${landlordId}/approval-matrix`, payload);
}

export async function updateLandlordBankDetails(
  landlordId: string,
  payload: LandlordBankDetailsRequest,
): Promise<LandlordDetailResponse> {
  return apiPut<LandlordDetailResponse>(`/api/v1/landlords/${landlordId}/bank-details`, payload);
}

export async function updateLandlordKyc(
  landlordId: string,
  payload: LandlordKycRequest,
): Promise<LandlordDetailResponse> {
  return apiPut<LandlordDetailResponse>(`/api/v1/landlords/${landlordId}/kyc`, payload);
}

export async function updateLandlordFeeAgreement(
  landlordId: string,
  payload: LandlordFeeAgreementRequest,
): Promise<LandlordDetailResponse> {
  return apiPut<LandlordDetailResponse>(`/api/v1/landlords/${landlordId}/fee-agreement`, payload);
}

export async function updateLandlordProfile(
  landlordId: string,
  payload: LandlordProfileRequest,
): Promise<LandlordDetailResponse> {
  return apiPut<LandlordDetailResponse>(`/api/v1/landlords/${landlordId}/profile`, payload);
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
