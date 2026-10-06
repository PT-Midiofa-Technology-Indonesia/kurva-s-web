import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingRecordDetailData } from '../types';

export interface GetBillingRecordDetailParams {
  billingId: string;
  companyId?: string;
}

export type GetBillingRecordDetailResponse = ApiSuccessResponse<BillingRecordDetailData>;

export async function getBillingRecordDetail(
  params: GetBillingRecordDetailParams
): Promise<GetBillingRecordDetailResponse> {
  try {
    const headers = params.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    const { data } = await api.get<GetBillingRecordDetailResponse>(
      getApiPath(`/finance/billings/${params.billingId}/detail`),
      { headers }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
