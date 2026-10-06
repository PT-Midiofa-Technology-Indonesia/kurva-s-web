import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { Company } from '../types';

export async function getCompany(id: string): Promise<Company> {
  try {
    const { data } = await api.get<ApiSuccessResponse<Company>>(getApiPath(`/companies/${id}`));
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
