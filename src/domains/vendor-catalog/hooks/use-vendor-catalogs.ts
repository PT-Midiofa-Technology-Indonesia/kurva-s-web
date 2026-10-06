import { useQuery } from '@tanstack/react-query';
import { type GetVendorCatalogsParams, getVendorCatalogs } from '../api/get-vendor-catalogs';

export const VENDOR_CATALOG_QUERY_KEYS = {
  all: ['vendors'] as const,
  lists: () => [...VENDOR_CATALOG_QUERY_KEYS.all, 'list'] as const,
  list: (filters: string) => [...VENDOR_CATALOG_QUERY_KEYS.lists(), { filters }] as const,
  details: () => [...VENDOR_CATALOG_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...VENDOR_CATALOG_QUERY_KEYS.details(), id] as const,
};

export interface UseVendorCatalogsOptions extends GetVendorCatalogsParams {
  enabled?: boolean;
}

export function useVendorCatalogs(params?: UseVendorCatalogsOptions) {
  const { enabled, ...queryParams } = params ?? {};
  return useQuery({
    queryKey: [...VENDOR_CATALOG_QUERY_KEYS.all, queryParams],
    queryFn: () => getVendorCatalogs(queryParams),
    placeholderData: (previousData) => previousData,
    ...(enabled !== undefined && { enabled }),
  });
}
