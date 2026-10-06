import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import type { ApiSuccessResponse } from '@/shared/types/api';

export interface DeleteSPKParams {
  projectId: string;
  uploadedDocId: string;
}

export type DeleteSPKResponse = ApiSuccessResponse<null>;

export async function deleteSPK({
  projectId,
  uploadedDocId,
}: DeleteSPKParams): Promise<DeleteSPKResponse> {
  const { data } = await axios.delete<DeleteSPKResponse>(
    getApiPath(`/projects/${projectId}/spk/documents/${uploadedDocId}`)
  );
  return data;
}
