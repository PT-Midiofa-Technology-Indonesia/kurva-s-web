import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiPaginatedResponse } from '@/types/api';

export interface ProjectCapability {
  id: string;
  name: string;
}

export interface BOQTemplate {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  projectCapability: ProjectCapability;
  createdAt: string;
  updatedAt: string;
}

export interface GetBOQTemplatesParams {
  page?: number;
  perPage?: number;
  search?: string;
  isActive?: boolean;
}

export async function getBOQTemplates(
  params?: GetBOQTemplatesParams
): Promise<ApiPaginatedResponse<BOQTemplate>> {
  try {
    const response = await axios.get<ApiPaginatedResponse<BOQTemplate>>(
      getApiPath('/boq-templates'),
      {
        params,
      }
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
