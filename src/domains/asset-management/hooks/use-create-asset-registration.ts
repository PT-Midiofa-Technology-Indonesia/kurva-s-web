'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type CreateAssetRegistrationParams,
  createAssetRegistration,
} from '../api/create-asset-registration';
import { ASSET_CATEGORY_QUERY_KEYS } from './use-asset-categories';
import { ASSET_REGISTRATION_QUERY_KEYS } from './use-asset-registrations';

export function useCreateAssetRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CreateAssetRegistrationParams) => createAssetRegistration(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_REGISTRATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ASSET_CATEGORY_QUERY_KEYS.all });
      queryClient.invalidateQueries({ queryKey: ASSET_CATEGORY_QUERY_KEYS.infinite() });
    },
  });
}
