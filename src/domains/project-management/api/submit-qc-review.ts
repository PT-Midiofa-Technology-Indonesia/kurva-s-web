import { z } from 'zod';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { SubmitQcReviewPayload } from '../types/manpower-planning';

/**
 * Mirrors the legacy done endpoint: `note` may be empty, `decision` maps to the wire `qcDecision`
 * values ('pass' | 'fail'), and evidence files ride along as multipart when provided.
 */
const submitQcReviewPayloadSchema = z.object({
  reportId: z.string().min(1),
  decision: z.enum(['pass', 'fail']),
  note: z.string(),
  files: z.array(z.instanceof(File)).optional(),
});

/**
 * `POST /project-management/quality-control/{projectTaskId}/decision` — multipart, same pattern as
 * `mark-project-task-done`: `qcDecision` always, `note` only when non-empty, one `files[i]` entry
 * per evidence file. The caller ignores the response body.
 */
export async function submitQcReview(payload: SubmitQcReviewPayload): Promise<void> {
  submitQcReviewPayloadSchema.parse(payload);

  const formData = new FormData();
  formData.append('qcDecision', payload.decision);
  if (payload.note) formData.append('note', payload.note);
  payload.files?.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });

  try {
    await api.post<ApiSuccessResponse<unknown>>(
      getApiPath(`/project-management/quality-control/${payload.reportId}/decision`),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
