import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface SetPoDraftItemWinnerItem {
  draftItemId: string;
  vendorId: string;
}

export interface SetPoDraftItemWinnersPayload {
  items: SetPoDraftItemWinnerItem[];
}

export async function setPoDraftItemWinners(
  draftId: string,
  payload: SetPoDraftItemWinnersPayload,
  companyId?: string
): Promise<void> {
  try {
    await api.put(getApiPath(`/procurement/po-drafts/${draftId}/winners`), payload, {
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
    });
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
}
