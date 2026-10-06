import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { SkillCatalog } from '../types';

export type GetSkillCatalogResponse = ApiResponse<SkillCatalog>;

export async function getSkillCatalog(id: string): Promise<GetSkillCatalogResponse> {
  try {
    const { data } = await api.get<GetSkillCatalogResponse>(getApiPath(`/skill-catalogs/${id}`));
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
