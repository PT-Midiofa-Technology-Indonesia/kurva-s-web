import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface GeneratePurchaseOrderPdfParams {
  id: string;
  companyId?: string;
}

export async function generatePurchaseOrderPdf(
  { id, companyId }: GeneratePurchaseOrderPdfParams,
  onDownloadProgress?: (percent: number) => void
): Promise<Blob> {
  try {
    const { data } = await api.get<Blob>(
      getApiPath(`/procurement/purchase-orders/${id}/generate-pdf`),
      {
        responseType: 'blob',
        headers: companyId ? { 'X-Company-Id': companyId } : undefined,
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
