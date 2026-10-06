import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { OvertimeCalculation, OvertimeCalculationPayload } from '../types';

export interface CalculateOvertimeParams {
  companyId: string;
  payload: OvertimeCalculationPayload;
}

export async function calculateOvertime({
  companyId,
  payload,
}: CalculateOvertimeParams): Promise<OvertimeCalculation> {
  try {
    const { data } = await api.post<ApiSuccessResponse<OvertimeCalculation>>(
      getApiPath('/human-resource/overtimes/calculate'),
      payload,
      { headers: { 'X-Company-Id': companyId } }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
