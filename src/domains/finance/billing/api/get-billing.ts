import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingProjectDetail, BillingProjectListStatus } from '../types';

export interface GetBillingParams {
  billingId: string;
  companyId?: string;
  search?: string;
  status?: BillingProjectListStatus;
  projectId?: string;
  billingType?: string;
}

export type GetBillingResponse = ApiSuccessResponse<BillingProjectDetail>;

export async function getBilling(params: GetBillingParams): Promise<GetBillingResponse> {
  try {
    const { billingId, companyId, ...queryParams } = params;
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;

    const { data } = await api.get<GetBillingResponse>(
      getApiPath(`/finance/billings/${billingId}`),
      {
        params: queryParams,
        headers,
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
