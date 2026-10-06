import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { ApprovedPrItem } from '../types/api';

export interface GetApprovedPrItemsParams {
  projectId: string;
  type: 'materialTool' | 'serviceRental';
}

export type GetApprovedPrItemsResponse = ApiSuccessResponse<ApprovedPrItem[]>;

export async function getApprovedPrItems(
  params: GetApprovedPrItemsParams,
  companyId?: string
): Promise<ApprovedPrItem[]> {
  try {
    const { data } = await api.get<GetApprovedPrItemsResponse>(
      getApiPath('/procurement/po-drafts/approved-pr-items'),
      {
        params,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
