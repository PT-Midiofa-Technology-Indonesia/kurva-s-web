import { handleApiError } from '@/lib/api-error';
import { getApiPath } from '@/shared/lib/api-config';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export async function deleteRole(roleId: string): Promise<void> {
  try {
    await api.delete<ApiSuccessResponse<null>>(getApiPath(`/roles/${roleId}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
