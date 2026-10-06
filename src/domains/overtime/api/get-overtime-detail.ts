import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Overtime } from '../types';

export async function getOvertimeDetail(id: string, companyId: string): Promise<Overtime> {
  try {
    const { data } = await api.get<ApiSuccessResponse<Overtime>>(
      getApiPath(`/human-resource/overtimes/${id}`),
      { headers: { 'X-Company-Id': companyId } }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
