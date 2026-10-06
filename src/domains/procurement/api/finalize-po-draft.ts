import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { FinalizePoDraftPayload } from '../types/api';

export interface FinalizePoDraftParams {
  id: string;
  companyId: string;
  payload: FinalizePoDraftPayload;
}

export async function finalizePoDraft({
  id,
  companyId,
  payload,
}: FinalizePoDraftParams): Promise<void> {
  try {
    await api.post(getApiPath(`/procurement/po-drafts/${id}/finalize`), payload, {
      headers: { 'X-Company-Id': companyId },
    });
  } catch (error: unknown) {
    handleApiError(error);
  }
}
