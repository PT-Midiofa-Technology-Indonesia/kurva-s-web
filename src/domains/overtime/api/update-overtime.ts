import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Overtime, UpdateOvertimePayload } from '../types';

export interface UpdateOvertimeParams {
  id: string;
  companyId: string;
  payload: UpdateOvertimePayload;
}

export async function updateOvertime({
  id,
  companyId,
  payload,
}: UpdateOvertimeParams): Promise<Overtime> {
  try {
    const { data } = await api.put<ApiSuccessResponse<Overtime>>(
      getApiPath(`/human-resource/overtimes/${id}`),
      payload,
      { headers: { 'X-Company-Id': companyId } }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
