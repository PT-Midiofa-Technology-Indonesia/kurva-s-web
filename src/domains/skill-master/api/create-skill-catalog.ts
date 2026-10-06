import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { SkillCatalogFormData } from '../schemas';
import type { SkillCatalog } from '../types';

export type CreateSkillCatalogResponse = ApiResponse<SkillCatalog>;

export async function createSkillCatalog(
  payload: SkillCatalogFormData
): Promise<CreateSkillCatalogResponse> {
  try {
    const { data } = await api.post<CreateSkillCatalogResponse>(
      getApiPath('/skill-catalogs'),
      payload
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
