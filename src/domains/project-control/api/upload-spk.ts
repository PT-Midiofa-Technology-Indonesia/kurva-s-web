import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import type { ApiSuccessResponse } from '@/shared/types/api';

export interface UploadSPKParams {
  projectId: string;
  spkNumber: string;
  documentTypeId: string;
  files: File[];
}

export interface SPKUploadedDocument {
  id: string;
  documentTypeId: string;
  documentTypeName: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

export interface UploadSPKData {
  spkNumber: string;
  uploadedDocuments: SPKUploadedDocument[];
}

export type UploadSPKResponse = ApiSuccessResponse<UploadSPKData>;

export async function uploadSPK(params: UploadSPKParams): Promise<UploadSPKResponse> {
  const formData = new FormData();
  formData.append('spkNumber', params.spkNumber);
  formData.append('documentTypeId', params.documentTypeId);
  params.files.forEach((file, index) => {
    formData.append(`files[${index}]`, file);
  });

  const { data } = await axios.post<UploadSPKResponse>(
    getApiPath(`/projects/${params.projectId}/spk`),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return data;
}
