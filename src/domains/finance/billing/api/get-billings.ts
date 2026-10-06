import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiPaginatedResponse } from '@/shared/types/api';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { BillingProjectListItem, BillingProjectListStatus } from '../types';

export interface GetBillingsParams extends BaseQueryParams {
  companyId?: string;
  billingType?: string;
  status?: BillingProjectListStatus;
  projectId?: string;
}

export type GetBillingsResponse = ApiPaginatedResponse<BillingProjectListItem[]>;

export async function getBillings(params?: GetBillingsParams): Promise<GetBillingsResponse> {
  try {
    const { companyId, ...queryParams } = params ?? {};
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;

    const { data } = await api.get<GetBillingsResponse>(getApiPath('/finance/billings'), {
      params: queryParams,
      headers,
    });

    return data;
  } catch (error: unknown) {
    return handleApiError<BillingProjectListItem>(error, true);
  }
}
