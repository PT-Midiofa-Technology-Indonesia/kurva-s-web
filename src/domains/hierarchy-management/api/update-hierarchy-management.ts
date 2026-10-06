import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { HierarchyManagement } from '../types';

export interface UpdateHierarchyManagementPayload {
  departmentId?: string;
  positionId?: string;
  parentId?: string | null;
  isActive?: boolean;
}

export async function updateHierarchyManagement(
  id: string,
  payload: UpdateHierarchyManagementPayload,
  companyId?: string
): Promise<HierarchyManagement> {
  try {
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;
    const { data } = await api.put<ApiSuccessResponse<HierarchyManagement>>(
      getApiPath(`/company-positions/${id}`),
      payload,
      { headers }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
