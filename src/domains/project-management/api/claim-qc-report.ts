import { z } from 'zod';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

/** The report id doubles as the QC projectTaskId on the wire, so it must be a non-empty id. */
const claimQcReportIdSchema = z.string().min(1);

/**
 * `POST /project-management/quality-control/claim/{projectTaskId}` — the current user claims the
 * QC task. The endpoint takes no fields, so the body is an empty JSON object. The caller ignores
 * the response body.
 */
export async function claimQcReport(reportId: string): Promise<void> {
  claimQcReportIdSchema.parse(reportId);

  try {
    await api.post<ApiSuccessResponse<unknown>>(
      getApiPath(`/project-management/quality-control/claim/${reportId}`),
      {}
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
