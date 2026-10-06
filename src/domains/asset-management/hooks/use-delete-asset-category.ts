'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAssetCategory } from '../api/delete-asset-category';
import { ASSET_CATEGORY_QUERY_KEYS } from './use-asset-categories';
import { ASSET_REGISTRATION_QUERY_KEYS } from './use-asset-registrations';

export function useDeleteAssetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAssetCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ASSET_CATEGORY_QUERY_KEYS.infinite() });
      queryClient.invalidateQueries({ queryKey: ASSET_REGISTRATION_QUERY_KEYS.all });
    },
  });
}
