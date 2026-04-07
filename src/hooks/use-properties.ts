// ---------------------------------------------------------------------------
// TanStack Query hooks — property surfaces
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import {
  fetchPropertiesBootstrap,
  fetchPortfolioBootstrap,
  fetchUnitsBootstrap,
  fetchPropertyContextBootstrap,
  fetchTenantsBootstrap,
  fetchLandlordsBootstrap,
  fetchVendorsBootstrap,
  fetchInspectionsBootstrap,
} from "../api/property-surfaces";
import type {
  PropertiesBootstrapResponse,
  PortfolioBootstrapResponse,
  UnitsBootstrapResponse,
  PropertyContextBootstrapResponse,
  TenantsBootstrapResponse,
  LandlordsBootstrapResponse,
  VendorsBootstrapResponse,
  InspectionsBootstrapResponse,
} from "../types/api";

export function usePropertiesBootstrap() {
  return useQuery<PropertiesBootstrapResponse, Error>({
    queryKey: ["properties-bootstrap"],
    queryFn: fetchPropertiesBootstrap,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function usePortfolioBootstrap() {
  return useQuery<PortfolioBootstrapResponse, Error>({
    queryKey: ["portfolio-bootstrap"],
    queryFn: fetchPortfolioBootstrap,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useUnitsBootstrap() {
  return useQuery<UnitsBootstrapResponse, Error>({
    queryKey: ["units-bootstrap"],
    queryFn: fetchUnitsBootstrap,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useTenantsBootstrap() {
  return useQuery<TenantsBootstrapResponse, Error>({
    queryKey: ["tenants-bootstrap"],
    queryFn: fetchTenantsBootstrap,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useLandlordsBootstrap() {
  return useQuery<LandlordsBootstrapResponse, Error>({
    queryKey: ["landlords-bootstrap"],
    queryFn: fetchLandlordsBootstrap,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useVendorsBootstrap() {
  return useQuery<VendorsBootstrapResponse, Error>({
    queryKey: ["vendors-bootstrap"],
    queryFn: fetchVendorsBootstrap,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function useInspectionsBootstrap() {
  return useQuery<InspectionsBootstrapResponse, Error>({
    queryKey: ["inspections-bootstrap"],
    queryFn: fetchInspectionsBootstrap,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

export function usePropertyContextBootstrap(params?: {
  referenceType?: string;
  referenceId?: string;
}) {
  return useQuery<PropertyContextBootstrapResponse, Error>({
    queryKey: ["property-context-bootstrap", params?.referenceType, params?.referenceId],
    queryFn: () => fetchPropertyContextBootstrap(params),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
