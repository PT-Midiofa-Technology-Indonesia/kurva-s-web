import { z } from 'zod';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { AssignLeafManpowerPayload } from '../types/manpower-planning';

/**
 * Guard for the Assign Pekerjaan submit: every card needs an employee and a positive target. `id`
 * is null (new card) or the project task id being updated — the wire accepts both in one call.
 * The schema must not reject a payload the declared `AssignLeafManpowerPayload` contract allows —
 * `manpowers: []` and empty `helperEmployeeIds` are type-legal.
 */
const assignLeafManpowerPayloadSchema = z.object({
  boqItemId: z.string().min(1),
  manpowers: z.array(
    z.object({
      id: z.string().nullable(),
      employeeId: z.string().min(1),
      targetQty: z.number().positive(),
      helperEmployeeIds: z.array(z.string()),
      note: z.string().optional(),
    })
  ),
});

/**
 * `POST /project-management/project-tasks/delegate/final` — the store/update endpoint of the
 * manpower cards. In assign mode the dialog sends only the cards added that session, each with
 * `id: null` (the endpoint APPENDS — locked decision #4). In edit mode every card goes out with
 * its own id: existing cards carry their project task id (update), appended cards stay `null`
 * (create). The response shape is unused by the caller.
 */
export async function assignLeafManpower(payload: AssignLeafManpowerPayload): Promise<void> {
  assignLeafManpowerPayloadSchema.parse(payload);

  try {
    await api.post<ApiSuccessResponse<unknown[]>>(
      getApiPath('/project-management/project-tasks/delegate/final'),
      {
        boqItemId: payload.boqItemId,
        manpower: payload.manpowers.map((manpower) => ({
          id: manpower.id,
          employeeId: manpower.employeeId,
          target: manpower.targetQty,
          helperEmployeeIds: manpower.helperEmployeeIds,
          note: manpower.note ?? null,
        })),
      }
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
