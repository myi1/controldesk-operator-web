// ---------------------------------------------------------------------------
// TanStack Query hooks — property surfaces
// ---------------------------------------------------------------------------

import { useQuery } from "@tanstack/react-query";
import {
  fetchPropertiesBootstrap,
  fetchPortfolioBootstrap,
  fetchUnitsBootstrap,
} from "../api/property-surfaces";
import type {
  PropertiesBootstrapResponse,
  PortfolioBootstrapResponse,
  UnitsBootstrapResponse,
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
