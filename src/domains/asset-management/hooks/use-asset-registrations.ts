'use client';

import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import {
  type GetAssetRegistrationsParams,
  type GetAssetRegistrationsResponse,
  getAssetRegistrations,
} from '../api/get-asset-registrations';

export const ASSET_REGISTRATION_QUERY_KEYS = {
  all: ['asset-registrations'] as const,
  lists: () => [...ASSET_REGISTRATION_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...ASSET_REGISTRATION_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...ASSET_REGISTRATION_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string, companyId?: string | null) =>
    [...ASSET_REGISTRATION_QUERY_KEYS.details(), id, companyId] as const,
  registerableUnits: () => [...ASSET_REGISTRATION_QUERY_KEYS.all, 'registerable-units'] as const,
};

export function useAssetRegistrations(
  params?: GetAssetRegistrationsParams,
  options?: Omit<
    UseQueryOptions<GetAssetRegistrationsResponse, Error, GetAssetRegistrationsResponse>,
    'queryKey' | 'queryFn'
  >
) {
  return useQuery({
    queryKey: [...ASSET_REGISTRATION_QUERY_KEYS.all, params],
    queryFn: () => getAssetRegistrations(params),
    enabled: (options?.enabled ?? true) && !!params?.companyId,
    ...options,
  });
}
