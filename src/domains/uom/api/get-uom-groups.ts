import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export interface UomGroup {
  value: string;
  label: string;
}

export type GetUomGroupsResponse = ApiSuccessResponse<UomGroup[]>;

export async function getUomGroups(): Promise<GetUomGroupsResponse> {
  try {
    const { data } = await api.get<GetUomGroupsResponse>(getApiPath('/uom-groups'));
    return data;
  } catch (error: unknown) {
    return handleApiError<UomGroup>(error, true);
  }
}
