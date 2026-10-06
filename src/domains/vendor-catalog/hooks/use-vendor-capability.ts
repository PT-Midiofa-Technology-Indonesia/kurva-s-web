'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorCapability } from '../api/get-vendor-capability';

const QUERY_KEY = 'vendor-capability';

export function useVendorCapability(id: string | null | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getVendorCapability(id!),
    enabled: !!id,
  });
}
