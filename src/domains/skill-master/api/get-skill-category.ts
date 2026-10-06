import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { SkillCategory } from '../types';

export type GetSkillCategoryResponse = ApiResponse<SkillCategory>;

export async function getSkillCategory(id: string): Promise<GetSkillCategoryResponse> {
  try {
    const { data } = await api.get<GetSkillCategoryResponse>(getApiPath(`/skill-categories/${id}`));
    return data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
