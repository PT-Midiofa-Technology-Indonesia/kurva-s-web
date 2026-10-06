import { z } from 'zod';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { AssignQcTasksPayload } from '../types/manpower-planning';

/**
 * Guard for the bulk QC assign. `projectTaskIds` carries no `.min(1)` — not on the array and not
 * on its elements — because the schema must not reject what the declared `AssignQcTasksPayload`
 * contract (`string[]`) allows; the dialog already blocks an empty selection.
 */
const assignQcReportsPayloadSchema = z.object({
  projectTaskIds: z.array(z.string()),
  employeeId: z.string().min(1),
  note: z.string().optional(),
});

/**
 * `POST /project-management/quality-control/delegate` — hands a batch of QC project tasks to one
 * employee; an absent note is sent as `null` on the wire. The caller ignores the response body.
 */
export async function assignQcReports(payload: AssignQcTasksPayload): Promise<void> {
  assignQcReportsPayloadSchema.parse(payload);

  try {
    await api.post<ApiSuccessResponse<unknown>>(
      getApiPath('/project-management/quality-control/delegate'),
      {
        projectTaskIds: payload.projectTaskIds,
        employeeId: payload.employeeId,
        note: payload.note ?? null,
      }
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
