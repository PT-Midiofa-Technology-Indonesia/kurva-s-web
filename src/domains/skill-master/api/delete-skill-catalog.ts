import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';

export type DeleteSkillCatalogResponse = ApiResponse<null>;

export async function deleteSkillCatalog(id: string): Promise<DeleteSkillCatalogResponse> {
  try {
    const { data } = await api.delete<DeleteSkillCatalogResponse>(
      getApiPath(`/skill-catalogs/${id}`)
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
