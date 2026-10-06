import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export interface ProcurementTaxType {
  id: string;
  code: string;
  name: string;
  category?: string;
  defaultRate?: number;
  effect?: 'ADDITION' | 'DEDUCTION' | string;
}

export type GetProcurementTaxTypesResponse = ApiSuccessResponse<ProcurementTaxType[]>;

export async function getProcurementTaxTypes(): Promise<GetProcurementTaxTypesResponse> {
  try {
    const { data } = await api.get<GetProcurementTaxTypesResponse>(getApiPath('/tax-types'));
    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
