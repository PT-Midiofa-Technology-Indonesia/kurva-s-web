import { useQuery } from '@tanstack/react-query';
import {
  type GetVendorRatingSummaryParams,
  type GetVendorRatingSummaryResponse,
  getVendorRatingSummary,
} from '../api/get-vendor-rating-summary';

export const VENDOR_RATING_SUMMARY_QUERY_KEYS = {
  all: ['vendor-rating-summary'] as const,
  details: () => [...VENDOR_RATING_SUMMARY_QUERY_KEYS.all, 'detail'] as const,
  detail: (vendorId: string, showAll: boolean = false) =>
    [...VENDOR_RATING_SUMMARY_QUERY_KEYS.details(), vendorId, { showAll }] as const,
};

export function useVendorRatingSummary(params: Partial<GetVendorRatingSummaryParams>) {
  const vendorId = params.vendorId;
  const showAll = params.showAll ?? false;

  return useQuery<GetVendorRatingSummaryResponse>({
    queryKey: vendorId
      ? VENDOR_RATING_SUMMARY_QUERY_KEYS.detail(vendorId, showAll)
      : [...VENDOR_RATING_SUMMARY_QUERY_KEYS.details(), vendorId, { showAll }],
    queryFn: () =>
      getVendorRatingSummary({
        vendorId: vendorId!,
        showAll,
      }),
    enabled: !!vendorId,
    placeholderData: (previousData) => previousData,
  });
}
