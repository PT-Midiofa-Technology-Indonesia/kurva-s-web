import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { SelectableDo } from '../types/goods-receipt';

export interface GetSelectableDosParams {
  search?: string;
  warehouseId?: string;
  companyId?: string;
}

export async function getSelectableDos(params?: GetSelectableDosParams): Promise<SelectableDo[]> {
  try {
    const queryParams: Record<string, unknown> = {};
    let companyId: string | undefined;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return;
        if (key === 'companyId') {
          companyId = value as string;
          return;
        }
        queryParams[key] = value;
      });
    }

    const { data } = await api.get<ApiSuccessResponse<SelectableDo[]>>(
      getApiPath('/procurement/goods-receipts/selectable-dos'),
      {
        params: queryParams,
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
