import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import {
  isNonFinalItemDetail,
  type ProjectTaskItemDetailResponse,
  projectTaskItemDetailResponseSchema,
} from '../schemas/manpower-planning-api';
import { mapFinalItemDetail } from '../services/manpower-plan-api-mapper.service';
import type { ManpowerAssignmentDetail } from '../types/manpower-planning';

/**
 * `GET /project-management/project-tasks/items/{boqItemId}` — final-level (leaf) variant, consumed
 * by the Assign/Selesaikan dialogs. A parent id is a caller bug: it throws so the query fails
 * loudly instead of silently mapping an unrelated wire shape.
 */
export async function getManpowerAssignment(boqItemId: string): Promise<ManpowerAssignmentDetail> {
  try {
    const { data } = await api.get<ApiSuccessResponse<ProjectTaskItemDetailResponse['data']>>(
      getApiPath(`/project-management/project-tasks/items/${boqItemId}`)
    );
    const detail = projectTaskItemDetailResponseSchema.parse(data).data;

    if (isNonFinalItemDetail(detail)) {
      throw new Error(`Project task item ${boqItemId} is not a final-level (leaf) item`);
    }

    return mapFinalItemDetail(detail);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
