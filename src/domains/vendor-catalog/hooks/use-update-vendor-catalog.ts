'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import type { UpdateVendorCatalogPayload } from '../api/update-vendor-catalog';
import { updateVendorCatalog } from '../api/update-vendor-catalog';
import { VENDOR_CATALOG_QUERY_KEYS } from './use-vendor-catalogs';

export function useUpdateVendorCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateVendorCatalogPayload }) =>
      updateVendorCatalog(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: VENDOR_CATALOG_QUERY_KEYS.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: VENDOR_CATALOG_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.UPDATED('Vendor') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
