import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/types/api';
import type { BOQTemplateItem } from './get-boq-template';

export interface BOQTemplateItemCostItem {
  id: string;
  costCategory: string;
  catalogId: string | null;
  code: string;
  name: string;
  catalog: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export interface BOQTemplateItemCostCategory {
  category: string;
  categoryName: string;
  items: BOQTemplateItemCostItem[];
}

export interface BOQTemplateItemCostsData {
  item: BOQTemplateItem;
  costs: BOQTemplateItemCostCategory[];
}

export async function getBOQTemplateItemCosts(
  templateId: string,
  itemId: string
): Promise<ApiResponse<BOQTemplateItemCostsData>> {
  try {
    const response = await axios.get<ApiResponse<BOQTemplateItemCostsData>>(
      getApiPath(`/boq-templates/${templateId}/items/${itemId}`)
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
