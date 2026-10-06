import { getApiPath } from '@/shared/lib/api-config';
import { handleImportError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { VendorItemCatalogImportResult } from '../types';

export async function importItemCatalogs(
  file: File,
  vendorId: string,
  onUploadProgress?: (percent: number) => void
): Promise<VendorItemCatalogImportResult> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('vendorId', vendorId);
    const { data } = await api.post<ApiSuccessResponse<VendorItemCatalogImportResult>>(
      getApiPath('/vendor-item-catalogs/import'),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          if (event.total) {
            // Cap at 90% — server-side processing occupies the remaining gap
            const uploadPercent = Math.round((event.loaded / event.total) * 90);
            onUploadProgress?.(uploadPercent);
          }
        },
      }
    );
    return data.data;
  } catch (error: unknown) {
    const importError =
      handleImportError<VendorItemCatalogImportResult['failed_rows'][number]>(error);
    return {
      message: importError.message,
      success_count: 0,
      failed_count: importError.failed_count,
      failed_rows: importError.failed_rows,
    };
  }
}
