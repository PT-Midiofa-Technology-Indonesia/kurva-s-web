import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { MenuBadges } from '../types';

export async function getMenuBadges(companyId?: string): Promise<MenuBadges> {
  try {
    const { data } = await api.get<ApiSuccessResponse<MenuBadges>>(
      getApiPath('/notifications/menu-badges'),
      { headers: companyId ? { 'X-Company-Id': companyId } : undefined }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
