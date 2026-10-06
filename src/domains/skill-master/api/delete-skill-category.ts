import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';

export type DeleteSkillCategoryResponse = ApiResponse<null>;

export async function deleteSkillCategory(id: string): Promise<DeleteSkillCategoryResponse> {
  try {
    const { data } = await api.delete<DeleteSkillCategoryResponse>(
      getApiPath(`/skill-categories/${id}`)
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
