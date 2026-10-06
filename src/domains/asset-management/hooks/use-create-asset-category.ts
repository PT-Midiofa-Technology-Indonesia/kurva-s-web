'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { type CreateAssetCategoryPayload, createAssetCategory } from '../api/create-asset-category';
import { ASSET_CATEGORY_QUERY_KEYS } from './use-asset-categories';
import { ASSET_REGISTRATION_QUERY_KEYS } from './use-asset-registrations';

export function useCreateAssetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAssetCategoryPayload) => createAssetCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ASSET_CATEGORY_QUERY_KEYS.infinite() });
      queryClient.invalidateQueries({ queryKey: ASSET_REGISTRATION_QUERY_KEYS.all });
    },
  });
}
