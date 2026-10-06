import { useQuery } from '@tanstack/react-query';
import {
  type GetVendorRatingsParams,
  type GetVendorRatingsResponse,
  getVendorRatings,
} from '../api/get-vendor-ratings';

export const VENDOR_RATINGS_QUERY_KEYS = {
  all: ['vendor-ratings'] as const,
  lists: () => [...VENDOR_RATINGS_QUERY_KEYS.all, 'list'] as const,
  list: (params: Partial<GetVendorRatingsParams>) =>
    [...VENDOR_RATINGS_QUERY_KEYS.lists(), params] as const,
};

export function useVendorRatings(params: Partial<GetVendorRatingsParams>) {
  const vendorId = params.vendorId;

  return useQuery<GetVendorRatingsResponse>({
    queryKey: VENDOR_RATINGS_QUERY_KEYS.list(params),
    queryFn: () =>
      getVendorRatings({
        vendorId: vendorId!,
        sourceType: params.sourceType,
        dateFrom: params.dateFrom,
        dateTo: params.dateTo,
        page: params.page,
        perPage: params.perPage,
      }),
    enabled: !!vendorId,
    placeholderData: (previousData) => previousData,
  });
}
