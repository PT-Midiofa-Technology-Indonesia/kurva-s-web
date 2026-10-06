'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  type UpdateAssetRegistrationNotesParams,
  updateAssetRegistrationNotes,
} from '../api/update-asset-registration-notes';
import { ASSET_REGISTRATION_QUERY_KEYS } from './use-asset-registrations';

export function useUpdateAssetRegistrationNotes(id: string, companyId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: UpdateAssetRegistrationNotesParams) =>
      updateAssetRegistrationNotes(id, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ASSET_REGISTRATION_QUERY_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: ASSET_REGISTRATION_QUERY_KEYS.detail(id, companyId),
      });
    },
  });
}
