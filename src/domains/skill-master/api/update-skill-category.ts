import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { SkillCategoryFormData } from '../schemas';
import type { SkillCategory } from '../types';

export type UpdateSkillCategoryResponse = ApiResponse<SkillCategory>;

export async function updateSkillCategory(
  id: string,
  payload: SkillCategoryFormData
): Promise<UpdateSkillCategoryResponse> {
  try {
    const { data } = await api.patch<UpdateSkillCategoryResponse>(
      getApiPath(`/skill-categories/${id}`),
      payload
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
