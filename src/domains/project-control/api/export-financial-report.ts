import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { GetFinancialReportParams } from './get-financial-report';

export async function exportFinancialReport(
  projectId: string,
  params?: GetFinancialReportParams,
  onDownloadProgress?: (percent: number) => void
): Promise<Blob> {
  try {
    const { data } = await api.get<Blob>(
      getApiPath(`/projects/${projectId}/financial-report/export`),
      {
        params,
        responseType: 'blob',
        onDownloadProgress: (event) => {
          if (event.total) {
            onDownloadProgress?.(Math.round((event.loaded * 100) / event.total));
          }
        },
      }
    );
    return data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
