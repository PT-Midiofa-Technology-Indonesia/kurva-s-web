import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { PaginationLinks, PaginationMeta } from '@/shared/types/api';
import type { BaseQueryParams } from '@/shared/types/query-params';
import type { BillingProgressDetailData } from '../types';

export interface GetBillingProgressDetailParams extends BaseQueryParams {
  billingId: string;
  companyId?: string;
}

export interface GetBillingProgressDetailResponse {
  success: true;
  message: string;
  data: BillingProgressDetailData;
  meta: PaginationMeta;
  links: PaginationLinks;
}

export async function getBillingProgressDetail(
  params: GetBillingProgressDetailParams
): Promise<GetBillingProgressDetailResponse> {
  try {
    const { billingId, companyId, ...queryParams } = params;
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;

    const { data } = await api.get<GetBillingProgressDetailResponse>(
      getApiPath(`/finance/billings/${billingId}/progress-detail`),
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
