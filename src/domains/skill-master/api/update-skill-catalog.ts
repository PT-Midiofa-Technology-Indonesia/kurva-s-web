import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { SkillCatalogFormData } from '../schemas';
import type { SkillCatalog } from '../types';

export type UpdateSkillCatalogResponse = ApiResponse<SkillCatalog>;

export async function updateSkillCatalog(
  id: string,
  payload: SkillCatalogFormData
): Promise<UpdateSkillCatalogResponse> {
  try {
    const { data } = await api.patch<UpdateSkillCatalogResponse>(
      getApiPath(`/skill-catalogs/${id}`),
      payload
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
