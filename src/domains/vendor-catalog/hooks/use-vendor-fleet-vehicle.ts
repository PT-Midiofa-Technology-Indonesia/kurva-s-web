'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorFleetVehicle } from '../api/get-vendor-fleet-vehicle';

const QUERY_KEY = 'vendor-fleet-vehicle';

export function useVendorFleetVehicle(id: string | null | undefined) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getVendorFleetVehicle(id!),
    enabled: !!id,
  });
}
