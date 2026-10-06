import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiResponse } from '@/types/api';

export interface ProjectBOQCostItemDetail {
  id: string;
  costCategory: string;
  catalogType: string | null;
  catalogId: string | null;
  code: string;
  name: string;
  volumeRab: string | null;
  volumeCco: string | null;
  volumeActual: string | null;
  uomId: string | null;
  durationRab: string | null;
  durationCco: string | null;
  durationActual: string | null;
  durationUomId: string | null;
  unitPriceRab: string | null;
  unitPriceCco: string | null;
  unitPriceActual: string | null;
  remarks: string | null;
  catalog: { id: string; code: string; name: string } | null;
  uom: { id: string; code: string; name: string } | null;
  durationUom: { id: string; code: string; name: string } | null;
  createdAt: string;
  updatedAt: string;
  totalRab: number | null;
}

export interface ProjectBOQCostCategory {
  category: string;
  categoryName: string;
  items: ProjectBOQCostItemDetail[];
}

export interface ProjectBOQItemDetail {
  id: string;
  boqId: string;
  parentId: string | null;
  sortOrder: number;
  level: number;
  code: string;
  name: string;
  isFinalLevel: boolean;
  weight: string | null;
  uomId: string | null;
  volumeRab: string | null;
  volumeCco: string | null;
  volumeActual: string | null;
  unitPriceMaterialRab: string | null;
  unitPriceWorkRab: string | null;
  jobItemType: { id: string; name: string };
  /** When true, CCO inputs in the cost item modal are disabled */
  isSideInstruction?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectBOQItemCostsData {
  item: ProjectBOQItemDetail;
  costs: ProjectBOQCostCategory[];
}

export async function getProjectBOQItemCosts(
  projectId: string,
  itemId: string
): Promise<ApiResponse<ProjectBOQItemCostsData>> {
  try {
    const response = await axios.get<ApiResponse<ProjectBOQItemCostsData>>(
      getApiPath(`/projects/${projectId}/boq/items/${itemId}`)
    );
    return response.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
