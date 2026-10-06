import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export interface BillingTaxType {
  id: string;
  code: string;
  name: string;
  category?: string;
  defaultRate?: number;
}

export type GetBillingTaxTypesResponse = ApiSuccessResponse<BillingTaxType[]>;

export async function getBillingTaxTypes(): Promise<GetBillingTaxTypesResponse> {
  try {
    const { data } = await api.get<GetBillingTaxTypesResponse>(getApiPath('/tax-types'));
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
