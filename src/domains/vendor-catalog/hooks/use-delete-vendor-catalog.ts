'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/api-error';
import { toast } from '@/lib/toast';
import { TOAST_MESSAGES } from '@/shared/constants/toast-messages';
import { deleteVendorCatalog } from '../api/delete-vendor-catalog';
import { VENDOR_CATALOG_QUERY_KEYS } from './use-vendor-catalogs';

export function useDeleteVendorCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVendorCatalog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VENDOR_CATALOG_QUERY_KEYS.all });
      toast.success({ title: TOAST_MESSAGES.SUCCESS.DELETED('Vendor') });
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error({ title: message });
    },
  });
}
