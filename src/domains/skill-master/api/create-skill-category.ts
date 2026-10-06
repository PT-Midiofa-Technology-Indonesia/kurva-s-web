import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { SkillCategoryFormData } from '../schemas';
import type { SkillCategory } from '../types';

export type CreateSkillCategoryResponse = ApiResponse<SkillCategory>;

export async function createSkillCategory(
  payload: SkillCategoryFormData
): Promise<CreateSkillCategoryResponse> {
  try {
    const { data } = await api.post<CreateSkillCategoryResponse>(
      getApiPath('/skill-categories'),
      payload
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
