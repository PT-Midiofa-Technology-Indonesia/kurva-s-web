import { getApiPath } from '@/shared/lib/api-config';
import { handleImportError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { ItemCatalogImportResult } from '../types';

export async function importItemCatalogs(
  file: File,
  onUploadProgress?: (percent: number) => void
): Promise<ItemCatalogImportResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post<ApiSuccessResponse<ItemCatalogImportResult>>(
      getApiPath('/item-catalogs/import'),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            const uploadPercent = Math.round((event.loaded / event.total) * 90);
            onUploadProgress?.(uploadPercent);
          }
        },
      }
    );
    return data.data;
  } catch (error: unknown) {
    const importError = handleImportError<ItemCatalogImportResult['failed_rows'][number]>(error);
    return {
      message: importError.message,
      success_count: 0,
      failed_count: importError.failed_count,
      failed_rows: importError.failed_rows,
    };
  }
}
