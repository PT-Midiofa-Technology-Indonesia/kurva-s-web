import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

// ============================================================================
// Params
// ============================================================================

export interface DeleteBillingDocumentParams {
  billingId: string;
  documentId: string;
  companyId?: string;
}

// ============================================================================
// API Function
// ============================================================================

export async function deleteBillingDocument(params: DeleteBillingDocumentParams): Promise<void> {
  try {
    const headers = params.companyId ? { 'X-Company-Id': params.companyId } : undefined;

    await api.delete(
      getApiPath(`/finance/billings/${params.billingId}/documents/${params.documentId}`),
      { headers }
    );
  } catch (error: unknown) {
    handleApiError(error);
  }
}
