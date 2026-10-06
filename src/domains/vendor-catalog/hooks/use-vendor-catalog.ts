import { useQuery } from '@tanstack/react-query';
import { type GetVendorCatalogResponse, getVendorCatalog } from '../api/get-vendor-catalog';
import { VENDOR_CATALOG_QUERY_KEYS } from './use-vendor-catalogs';

export function useVendorCatalog(id: string | undefined) {
  return useQuery<GetVendorCatalogResponse>({
    queryKey: [...VENDOR_CATALOG_QUERY_KEYS.details(), id],
    queryFn: () => getVendorCatalog(id!),
    enabled: !!id,
  });
}
