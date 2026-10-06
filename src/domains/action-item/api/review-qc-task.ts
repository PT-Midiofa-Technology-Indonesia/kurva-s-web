import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { QcTaskRow } from '../types';
import type { QcDecisionApi, QcTaskApiResponse } from '../types/api';
import { mapQcTaskToRow } from './mappers';

export interface ReviewQcTaskParams {
  id: string;
  companyId: string;
  qcDecision: QcDecisionApi;
  qcNote: string;
  /** QC reviewer's evidence, sent as multipart `qcEvidenceFiles[]`. */
  files: File[];
}

export async function reviewQcTask({
  id,
  companyId,
  qcDecision,
  qcNote,
  files,
}: ReviewQcTaskParams): Promise<QcTaskRow> {
  try {
    const formData = new FormData();
    formData.append('qcDecision', qcDecision);
    formData.append('qcNote', qcNote);
    for (const file of files) {
      formData.append('qcEvidenceFiles[]', file);
    }

    const { data } = await api.post<ApiSuccessResponse<QcTaskApiResponse>>(
      getApiPath(`/meeting-tasks/${id}/review-qc`),
      formData,
      {
        headers: {
          'Content-Type': undefined,
          'X-Company-Id': companyId,
        },
      }
    );
    return mapQcTaskToRow(data.data);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
