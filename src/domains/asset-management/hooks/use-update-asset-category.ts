'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type UpdateAssetCategoryPayload, updateAssetCategory } from '../api/update-asset-category';
import { ASSET_CATEGORY_QUERY_KEYS } from './use-asset-categories';
import { ASSET_REGISTRATION_QUERY_KEYS } from './use-asset-registrations';

export function useUpdateAssetCategory(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateAssetCategoryPayload) => updateAssetCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ASSET_CATEGORY_QUERY_KEYS.detail(id) });
      queryClient.invalidateQueries({ queryKey: ASSET_CATEGORY_QUERY_KEYS.infinite() });
      queryClient.invalidateQueries({ queryKey: ASSET_REGISTRATION_QUERY_KEYS.all });
    },
  });
}
