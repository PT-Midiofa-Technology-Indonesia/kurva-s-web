import { api } from '@/shared/lib/axios';
import type { DocumentModule, SyncModuleRequest } from '../types/document-module';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getDocumentModules(): Promise<DocumentModule[]> {
  const response = await api.get<ApiResponse<DocumentModule[]>>('/v1/document-types-modules');
  return response.data.data;
}

export async function syncDocumentModule(
  module: string,
  payload: SyncModuleRequest
): Promise<void> {
  await api.post(`/v1/document-types-modules/${module}/sync`, payload);
}
