import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

// ============================================================================
// Params
// ============================================================================

import type { ApiSuccessResponse } from '@/shared/types/api';
import type { BillingUploadedDocument } from '../types';

export interface UploadBillingDocumentParams {
  billingId: string;
  companyId: string;
  documentTypeId: string;
  files: File[];
  documentDeletedIds?: string[];
}

export interface UploadBillingDocumentData {
  uploadedDocuments: BillingUploadedDocument[];
  deletedDocumentIds: string[];
}

export type UploadBillingDocumentResponse = ApiSuccessResponse<UploadBillingDocumentData>;

export async function uploadBillingDocument(
  params: UploadBillingDocumentParams
): Promise<UploadBillingDocumentResponse> {
  try {
    const formData = new FormData();
    formData.append('documentTypeId', params.documentTypeId);

    params.files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    params.documentDeletedIds?.forEach((documentId, index) => {
      formData.append(`documentDeletedIds[${index}]`, documentId);
    });

    const { data } = await api.post<UploadBillingDocumentResponse>(
      getApiPath(`/finance/billings/${params.billingId}/documents`),
      formData,
      {
        headers: {
          'X-Company-Id': params.companyId,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
