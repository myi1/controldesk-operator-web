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
  TenancyPaymentScheduleSetRequest,
  TenancyPaymentScheduleResponse,
  TenancyEjariStatusUpdateRequest,
  TenancyEjariStatusResponse,
  TenancyRdcDisputeUpdateRequest,
  TenancyRdcDisputeResponse,
  TenancyDepositSetRequest,
  TenancyDepositResponse,
  MoveOutDepositDeductionsSetRequest,
  MoveOutDepositDeductionsResponse,
  MoveOutDilapidationSetRequest,
  MoveOutDilapidationResponse,
  RenewalDldIndexUpdateRequest,
  RenewalDldIndexResponse,
  RenewalArticleNoticeRequest,
  RenewalArticleNoticeResponse,
  VendorsBootstrapResponse,
  VendorDetailResponse,
  CreateVendorPayload,
  CreateVendorResponse,
  InspectionsBootstrapResponse,
  CreateInspectionCaseRequest,
  CreateInspectionCaseResponse,
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

// ---- Vendors ----

export async function fetchVendorsBootstrap(): Promise<VendorsBootstrapResponse> {
  return apiGet<VendorsBootstrapResponse>("/api/v1/vendors/bootstrap");
}

export async function fetchVendorDetail(vendorId: string): Promise<VendorDetailResponse> {
  return apiGet<VendorDetailResponse>(`/api/v1/vendors/${vendorId}`);
}

export async function createVendor(payload: CreateVendorPayload): Promise<CreateVendorResponse> {
  return apiPost<CreateVendorResponse>("/api/v1/vendors", payload);
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

// ---- Tenancy record operations ----

export async function setTenancyPaymentSchedule(
  tenancyRecordId: string,
  payload: TenancyPaymentScheduleSetRequest,
): Promise<TenancyPaymentScheduleResponse> {
  return apiPost<TenancyPaymentScheduleResponse>(
    `/api/v1/operator-shell/tenancy-records/${tenancyRecordId}/payment-schedule`,
    payload,
  );
}

export async function updateTenancyEjariStatus(
  tenancyRecordId: string,
  payload: TenancyEjariStatusUpdateRequest,
): Promise<TenancyEjariStatusResponse> {
  return apiPut<TenancyEjariStatusResponse>(
    `/api/v1/operator-shell/tenancy-records/${tenancyRecordId}/ejari-status`,
    payload,
  );
}

export async function updateTenancyRdcDispute(
  tenancyRecordId: string,
  payload: TenancyRdcDisputeUpdateRequest,
): Promise<TenancyRdcDisputeResponse> {
  return apiPut<TenancyRdcDisputeResponse>(
    `/api/v1/operator-shell/tenancy-records/${tenancyRecordId}/rdc-dispute`,
    payload,
  );
}

export async function updateRenewalDldIndex(
  renewalCaseId: string,
  payload: RenewalDldIndexUpdateRequest,
): Promise<RenewalDldIndexResponse> {
  return apiPut<RenewalDldIndexResponse>(
    `/api/v1/operator-shell/renewal-cases/${renewalCaseId}/dld-index`,
    payload,
  );
}

export async function recordRenewalArticleNotice(
  renewalCaseId: string,
  payload: RenewalArticleNoticeRequest,
): Promise<RenewalArticleNoticeResponse> {
  return apiPut<RenewalArticleNoticeResponse>(
    `/api/v1/operator-shell/renewal-cases/${renewalCaseId}/article-notice`,
    payload,
  );
}

export async function setTenancyDeposit(
  tenancyRecordId: string,
  payload: TenancyDepositSetRequest,
): Promise<TenancyDepositResponse> {
  return apiPut<TenancyDepositResponse>(
    `/api/v1/operator-shell/tenancy-records/${tenancyRecordId}/deposit`,
    payload,
  );
}

export async function setMoveOutDepositDeductions(
  moveoutCaseId: string,
  payload: MoveOutDepositDeductionsSetRequest,
): Promise<MoveOutDepositDeductionsResponse> {
  return apiPost<MoveOutDepositDeductionsResponse>(
    `/api/v1/operator-shell/moveout-cases/${moveoutCaseId}/deposit-deductions`,
    payload,
  );
}

export async function setMoveOutDilapidation(
  moveoutCaseId: string,
  payload: MoveOutDilapidationSetRequest,
): Promise<MoveOutDilapidationResponse> {
  return apiPost<MoveOutDilapidationResponse>(
    `/api/v1/operator-shell/moveout-cases/${moveoutCaseId}/dilapidation`,
    payload,
  );
}

export async function fetchInspectionsBootstrap(): Promise<InspectionsBootstrapResponse> {
  return apiGet<InspectionsBootstrapResponse>("/api/v1/operator-shell/inspections/bootstrap");
}

export async function createInspectionCase(
  payload: CreateInspectionCaseRequest,
): Promise<CreateInspectionCaseResponse> {
  return apiPost<CreateInspectionCaseResponse>("/api/v1/operator-shell/inspections", payload);
}
