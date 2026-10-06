import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { SelectableDoDetail } from '../types/goods-receipt';

export async function getSelectableDoDetail(
  doId: string,
  companyId?: string
): Promise<SelectableDoDetail> {
  try {
    const { data } = await api.get<ApiSuccessResponse<SelectableDoDetail>>(
      getApiPath(`/procurement/goods-receipts/selectable-dos/${doId}`),
      { headers: companyId ? { 'X-Company-Id': companyId } : undefined }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
