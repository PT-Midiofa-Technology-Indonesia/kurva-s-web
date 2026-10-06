import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/shared/types/api';

export interface DraftVendorCatalogPrice {
  draftItemId: string;
  catalogId: string;
  unitPrice: number | null;
  totalPrice: number | null;
  quantity: number;
}

export interface DraftVendor {
  id: string;
  code: string;
  name: string;
  isSupplier: boolean;
  isSubcontractor: boolean;
  hasQuote: boolean;
  catalogPrices: DraftVendorCatalogPrice[];
}

export interface GetDraftVendorsResponse {
  data: DraftVendor[];
}

export async function getDraftVendors(
  draftId: string,
  companyId?: string
): Promise<GetDraftVendorsResponse> {
  try {
    const { data } = await api.get<ApiSuccessResponse<DraftVendor[]>>(
      getApiPath(`/procurement/po-drafts/${draftId}/vendors`),
      {
        headers: companyId ? { 'X-Company-Id': companyId } : {},
      }
    );
    return { data: data.data ?? [] };
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
