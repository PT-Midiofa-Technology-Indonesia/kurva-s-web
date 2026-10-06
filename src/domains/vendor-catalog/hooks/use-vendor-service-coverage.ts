'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorServiceCoverage } from '../api/get-vendor-service-coverage';

const QUERY_KEY = 'vendor-service-coverage';

export function useVendorServiceCoverage(
  vendorId: string | null | undefined,
  provinceId: string | null | undefined
) {
  return useQuery({
    queryKey: [QUERY_KEY, vendorId, provinceId],
    queryFn: () => getVendorServiceCoverage(vendorId!, provinceId!),
    enabled: !!(vendorId && provinceId),
  });
}
