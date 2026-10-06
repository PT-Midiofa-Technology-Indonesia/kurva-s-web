import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import {
  type QcTaskListResponse,
  qcTaskListResponseSchema,
} from '../schemas/manpower-planning-api';
import { mapQcTaskToRow, QC_STATUS_TO_API } from '../services/manpower-plan-api-mapper.service';
import type { QcReportStatus, QcReportsPage } from '../types/manpower-planning';

export interface GetQcReportsParams {
  page?: number;
  perPage?: number;
  search?: string;
  /**
   * Domain status label — the wire `?status=` value is resolved via `QC_STATUS_TO_API` inside this
   * call, so callers (and the URL/page state) never touch wire enums.
   */
  status?: QcReportStatus;
}

/**
 * `GET /project-management/quality-control` — paginated server-side search/status/page list.
 * Wire payload is Zod-validated then mapped onto the domain rows by the mapper service; `meta`
 * rides along untouched so the pagination UI can read `lastPage`/`currentPage`/`total`.
 */
export async function getQcReports(params?: GetQcReportsParams): Promise<QcReportsPage> {
  try {
    const { data } = await api.get<ApiSuccessResponse<QcTaskListResponse['data']>>(
      getApiPath('/project-management/quality-control'),
      {
        params: {
          page: params?.page,
          perPage: params?.perPage,
          // Empty search must not become `?search=` — undefined keys are dropped by axios.
          search: params?.search?.trim() || undefined,
          status: params?.status ? QC_STATUS_TO_API[params.status] : undefined,
        },
      }
    );

    const parsed = qcTaskListResponseSchema.parse(data);
    return {
      rows: parsed.data.map((task) => mapQcTaskToRow(task, task.workTask)),
      meta: parsed.meta,
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
