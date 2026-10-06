import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { Billing } from '../types';

export interface UpdateBillingInformationParams {
  billingId: string;
  companyId: string;
  billedAt: string;
  dueDate: string;
  notes?: string;
}

export type UpdateBillingInformationResponse = ApiSuccessResponse<Billing>;

export async function updateBillingInformation(
  params: UpdateBillingInformationParams
): Promise<UpdateBillingInformationResponse> {
  try {
    const { billingId, companyId, ...payload } = params;

    const { data } = await api.put<UpdateBillingInformationResponse>(
      getApiPath(`/finance/billings/${billingId}/information`),
      payload,
      {
        headers: { 'X-Company-Id': companyId },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
