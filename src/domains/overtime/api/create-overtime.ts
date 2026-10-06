import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { CreateOvertimePayload, Overtime } from '../types';

export interface CreateOvertimeParams {
  companyId: string;
  payload: CreateOvertimePayload;
}

export async function createOvertime({
  companyId,
  payload,
}: CreateOvertimeParams): Promise<Overtime> {
  try {
    const { data } = await api.post<ApiSuccessResponse<Overtime>>(
      getApiPath('/human-resource/overtimes'),
      payload,
      { headers: { 'X-Company-Id': companyId } }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
