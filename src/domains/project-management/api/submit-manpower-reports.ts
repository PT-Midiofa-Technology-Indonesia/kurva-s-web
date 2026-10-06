import { z } from 'zod';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { SubmitManpowerReportsPayload } from '../types/manpower-planning';

/**
 * Guard for the Selesaikan submit: a report is only valid with a positive capaian.
 * Optional/empty fields (`files`, `reports: []`) stay type-legal — the schema must not
 * reject a payload the declared `SubmitManpowerReportsPayload` contract allows.
 */
const submitManpowerReportsPayloadSchema = z.object({
  boqItemId: z.string().min(1),
  reports: z.array(
    z.object({
      manpowerId: z.string().min(1),
      achievedQty: z.number().positive(),
      note: z.string().optional(),
      files: z.array(z.instanceof(File)).optional(),
    })
  ),
});

/**
 * `POST /project-management/project-tasks/items/{boqItemId}/done` — one multipart entry per
 * submittable manpower card (`manpower[i][...]`), mirrors the `mark-project-task-done` pattern.
 * The caller ignores the response body.
 */
export async function submitManpowerReports(payload: SubmitManpowerReportsPayload): Promise<void> {
  submitManpowerReportsPayloadSchema.parse(payload);

  const formData = new FormData();
  payload.reports.forEach((report, index) => {
    formData.append(`manpower[${index}][projectTaskId]`, report.manpowerId);
    formData.append(`manpower[${index}][completedVolume]`, String(report.achievedQty));
    if (report.note) formData.append(`manpower[${index}][note]`, report.note);
    report.files?.forEach((file, fileIndex) => {
      formData.append(`manpower[${index}][files][${fileIndex}]`, file);
    });
  });

  try {
    await api.post<ApiSuccessResponse<unknown>>(
      getApiPath(`/project-management/project-tasks/items/${payload.boqItemId}/done`),
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
