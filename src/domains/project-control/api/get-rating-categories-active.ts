import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';
import type { ProjectManpowerRatingCategory } from '../types/project-manpower-rating';

export async function getRatingCategoriesActive(): Promise<ProjectManpowerRatingCategory[]> {
  try {
    const { data } = await axios.get<ApiSuccessResponse<ProjectManpowerRatingCategory[]>>(
      getApiPath('/rating-categories/active')
    );

    return data.data;
  } catch (error) {
    return handleApiError(error);
  }
}
