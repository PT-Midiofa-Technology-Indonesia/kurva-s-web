import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/types/api';

export interface BOQTemplateItemJobItemType {
  id: string;
  name: string;
}

export interface BOQTemplateItem {
  id: string;
  boqTemplateId: string;
  parentId: string | null;
  sortOrder: number;
  level: number;
  code: string;
  name: string;
  isFinalLevel: boolean;
  weight: string | null;
  isActive: boolean;
  jobItemType: BOQTemplateItemJobItemType;
  suggestionItemId?: string | null;
  children: BOQTemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BOQTemplateDetail {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  projectCapability: {
    id: string;
    name: string;
  };
  items: BOQTemplateItem[];
  createdAt: string;
  updatedAt: string;
}

export async function getBOQTemplate(id: string): Promise<ApiResponse<BOQTemplateDetail>> {
  try {
    const response = await axios.get<ApiResponse<BOQTemplateDetail>>(
      getApiPath(`/boq-templates/${id}`)
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
