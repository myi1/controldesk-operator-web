// ---------------------------------------------------------------------------
// TanStack Query hooks — property surfaces
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import {
  fetchPropertiesBootstrap,
  fetchPortfolioBootstrap,
  fetchUnitsBootstrap,
  fetchPropertyContextBootstrap,
} from "../api/property-surfaces";
import type {
  PropertiesBootstrapResponse,
  PortfolioBootstrapResponse,
  UnitsBootstrapResponse,
  PropertyContextBootstrapResponse,
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
