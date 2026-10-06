'use client';

import { useQuery } from '@tanstack/react-query';
import { getAssetRegistration } from '../api/get-asset-registration';
import { ASSET_REGISTRATION_QUERY_KEYS } from './use-asset-registrations';

export function useAssetRegistration(id?: string | null, companyId?: string | null) {
  return useQuery({
    queryKey: ASSET_REGISTRATION_QUERY_KEYS.detail(id ?? '', companyId),
    queryFn: () => getAssetRegistration(id ?? '', companyId),
    enabled: !!id && !!companyId,
  });
}
