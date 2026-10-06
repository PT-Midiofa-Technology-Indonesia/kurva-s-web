import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';
import type { UpdateSalaryStructurePayload } from '../types';

export async function updateSalaryStructure(payload: UpdateSalaryStructurePayload): Promise<void> {
  try {
    await api.post<ApiResponse<unknown>>(getApiPath('/human-resource/salary-structures'), payload);
  } catch (error) {
    throw handleApiError(error);
  }
}
