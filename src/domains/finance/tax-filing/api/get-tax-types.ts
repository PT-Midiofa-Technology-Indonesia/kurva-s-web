import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';
import type { TaxFilingTaxType } from '../types';

export type GetTaxTypesResponse = ApiSuccessResponse<TaxFilingTaxType[]>;

export async function getTaxTypes(): Promise<GetTaxTypesResponse> {
  try {
    const { data } = await api.get<GetTaxTypesResponse>(getApiPath('/tax-types'));
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
