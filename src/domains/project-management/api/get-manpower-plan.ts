import type { InformasiProjectCardData } from '@/domains/project-control/components/InformasiProjectCard';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import {
  type ManpowerPlanListResponse,
  manpowerPlanListResponseSchema,
} from '../schemas/manpower-planning-api';
import { mapManpowerPlanList } from '../services/manpower-plan-api-mapper.service';
import type { ManpowerPlanTreeItem } from '../types/manpower-planning';

/** Manpower planning list payload: the InformasiProjectCard data + the manpower tree. */
export interface ManpowerPlanList {
  project: InformasiProjectCardData;
  tree: ManpowerPlanTreeItem[];
}

/**
 * `GET /project-management/manpower-planning` — no params; search/status filtering stays client-side.
 * Wire payload is Zod-validated then mapped onto the domain types by the mapper service.
 */
export async function getManpowerPlan(): Promise<ManpowerPlanList> {
  try {
    const { data } = await api.get<ApiSuccessResponse<ManpowerPlanListResponse['data']>>(
      getApiPath('/project-management/manpower-planning')
    );
    return mapManpowerPlanList(manpowerPlanListResponseSchema.parse(data).data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
