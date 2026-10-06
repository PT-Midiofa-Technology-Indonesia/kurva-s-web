import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { HierarchyManagement } from '../types';

export async function deleteHierarchyManagement(id: string): Promise<HierarchyManagement> {
  try {
    const { data } = await api.delete<ApiSuccessResponse<HierarchyManagement>>(
      getApiPath(`/company-positions/${id}`)
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
