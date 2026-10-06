'use client';

import { useQuery } from '@tanstack/react-query';
import { getVendorOfferingDocument } from '../api/get-vendor-offering-document';

export const VENDOR_OFFERING_DOCUMENT_QUERY_KEY = 'vendor-offering-document';

export function useVendorOfferingDocument(id: string | null | undefined) {
  return useQuery({
    queryKey: [VENDOR_OFFERING_DOCUMENT_QUERY_KEY, id],
    queryFn: () => getVendorOfferingDocument(id!),
    enabled: !!id,
  });
}
