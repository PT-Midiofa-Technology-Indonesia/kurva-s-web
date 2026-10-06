import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export interface ProjectBOQChildItemType {
  id: string;
  name: string;
}

export interface ProjectBOQChildItemUom {
  id: string;
  code: string;
  name: string;
}

export interface ProjectBOQChildItemTaskMonitoring {
  assignedEmployees: string[];
  manpowerTask: number;
  qcTask: number;
  totalScheduleDays: number;
  weightItem: string;
  totalTask: number;
  totalDoneTask: number;
  percentageDoneTask: number;
  status: string;
}

export interface ProjectBOQChildItem {
  id: string;
  boqId: string;
  parentId: string | null;
  sortOrder: number;
  level: number;
  code: string;
  name: string;
  isFinalLevel: boolean;
  weight: string | null;
  limitBudgetPercentage: string | null;
  volumeRab: number | string;
  volumeCco: number | string;
  volumeActual: number | string;
  uomId: string | null;
  unitPriceMaterialRab: number | string;
  unitPriceMaterialCco: number | string;
  unitPriceMaterialActual: number | string;
  unitPriceWorkRab: number | string;
  unitPriceWorkCco: number | string;
  unitPriceWorkActual: number | string;
  totalPriceMaterialRab: number;
  totalPriceMaterialCco: number;
  totalPriceMaterialActual: number;
  totalPriceWorkRab: number;
  totalPriceWorkCco: number;
  totalPriceWorkActual: number;
  totalAmountRab: number;
  totalAmountCco: number;
  totalAmountActual: number;
  amountAfterLimitRab: number;
  scheduleStartDate: string | null;
  scheduleEndDate: string | null;
  remarks: string | null;
  isActive: boolean;
  jobItemType: ProjectBOQChildItemType | null;
  uom: ProjectBOQChildItemUom | null;
  createdAt: string;
  updatedAt: string;
  taskMonitoring: ProjectBOQChildItemTaskMonitoring;
}

export interface GetProjectBOQItemsParams {
  parentId?: string;
}

export async function getProjectBOQItems(
  projectId: string,
  params?: GetProjectBOQItemsParams
): Promise<ProjectBOQChildItem[]> {
  try {
    const { data } = await api.get<ApiSuccessResponse<ProjectBOQChildItem[]>>(
      getApiPath(`/projects/${projectId}/boq/items`),
      { params }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
