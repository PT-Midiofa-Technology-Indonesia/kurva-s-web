import { z } from 'zod';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { AssignParentItemsPayload } from '../types/manpower-planning';

/**
 * Guard for the parent bulk assign: every boqItem id and the employee must be present and
 * non-empty. `boqItemIds: []` and an absent note stay type-legal, so the schema must not reject
 * a payload the declared `AssignParentItemsPayload` contract allows.
 */
const assignParentItemsPayloadSchema = z.object({
  boqItemIds: z.array(z.string().min(1)),
  employeeId: z.string().min(1),
  note: z.string().optional(),
});

/**
 * `POST /project-management/project-tasks/delegate/non-final` — one employee across all selected
 * parent items. Empty note is sent as `null`; the response shape is unused by the caller.
 */
export async function assignParentItems(payload: AssignParentItemsPayload): Promise<void> {
  assignParentItemsPayloadSchema.parse(payload);

  try {
    await api.post<ApiSuccessResponse<unknown>>(
      getApiPath('/project-management/project-tasks/delegate/non-final'),
      {
        boqItemIds: payload.boqItemIds,
        employeeId: payload.employeeId,
        note: payload.note ?? null,
      }
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
