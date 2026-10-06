import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/shared/types/api';
import type { SalaryStructureDetail, SalaryStructureDetailItem } from '../types';

export async function getSalaryStructureDetail(
  gradeId: string,
  salaryType: string
): Promise<SalaryStructureDetail | null> {
  try {
    const response = await api.get<ApiResponse<SalaryStructureDetail>>(
      getApiPath(`/human-resource/salary-structures/${gradeId}`),
      {
        params: { salaryType },
      }
    );
    const data = response.data.data;
    return data ?? null;
  } catch (error) {
    throw handleApiError(error);
  }
}

export function getSalaryStructureItems(
  data: SalaryStructureDetail | null
): SalaryStructureDetailItem[] {
  return data?.items ?? [];
}
