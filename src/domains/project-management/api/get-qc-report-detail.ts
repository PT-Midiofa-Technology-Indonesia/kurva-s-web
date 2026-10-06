import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import {
  type QcTaskDetailResponse,
  qcTaskDetailResponseSchema,
} from '../schemas/manpower-planning-api';
import { mapQcTaskDetail } from '../services/manpower-plan-api-mapper.service';
import type { QcReportDetail } from '../types/manpower-planning';

/**
 * `GET /project-management/quality-control/{projectTaskId}` — the report id doubles as the
 * projectTaskId. Wire payload is Zod-validated then mapped onto the domain detail by the mapper
 * service; evidence documents surface through the mapped timeline attachments.
 */
export async function getQcReportDetail(reportId: string): Promise<QcReportDetail> {
  try {
    const { data } = await api.get<ApiSuccessResponse<QcTaskDetailResponse['data']>>(
      getApiPath(`/project-management/quality-control/${reportId}`)
    );
    return mapQcTaskDetail(qcTaskDetailResponseSchema.parse(data).data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
