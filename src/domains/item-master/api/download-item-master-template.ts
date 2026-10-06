import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function downloadItemCatalogTemplate(
  onDownloadProgress?: (percent: number) => void
): Promise<Blob> {
  try {
    const { data } = await api.get<Blob>(getApiPath('/item-catalogs/import/template'), {
      responseType: 'blob',
      onDownloadProgress: (event) => {
        if (event.total) {
          onDownloadProgress?.(Math.round((event.loaded * 100) / event.total));
        }
      },
    });
    return data;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
