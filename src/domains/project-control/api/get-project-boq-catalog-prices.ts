import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';

export interface BOQCatalogPriceUom {
  id: string;
  code: string;
  name: string;
}

export interface BOQCatalogPriceCatalog {
  id: string;
  code: string;
  name: string;
}

export interface BOQCatalogPriceCostDetail {
  id: string;
  boqId: string;
  costCategory: string;
  catalogType: string;
  catalogId: string;
  originalPriceRab: string | null;
  markupPercentageRab: string | null;
  unitPriceRab: string | null;
  unitPriceCco: string | null;
  unitPriceActual: string | null;
  catalog: BOQCatalogPriceCatalog;
  createdAt: string;
  updatedAt: string;
}

export interface BOQCatalogPriceMaterialEntry {
  catalogId: string;
  catalogType: string;
  code: string;
  name: string;
  volumeRab: number | string | null;
  volumeCco: number | string | null;
  volumeActual: number | string | null;
  uom: BOQCatalogPriceUom | null;
  durationRab: number | string | null;
  durationCco: number | string | null;
  durationAct: number | string | null;
  durationUom: BOQCatalogPriceUom | null;
  materialCost: BOQCatalogPriceCostDetail;
  transportCost: BOQCatalogPriceCostDetail;
  totalCostMaterial: number;
  totalCostTransport: number;
  amount: number;
}

export interface BOQCatalogPriceEquipmentEntry {
  catalogId: string;
  catalogType: string;
  code: string;
  name: string;
  volumeRab: number | string | null;
  volumeCco: number | string | null;
  volumeActual: number | string | null;
  uom: BOQCatalogPriceUom | null;
  durationRab: number | string | null;
  durationCco: number | string | null;
  durationAct: number | string | null;
  durationUom: BOQCatalogPriceUom | null;
  equipmentCost: BOQCatalogPriceCostDetail;
  transportCost: BOQCatalogPriceCostDetail;
  totalCostEquipment: number;
  totalCostTransport: number;
  amount: number;
}

export interface BOQCatalogPriceTaskMonitoring {
  assignedEmployees: unknown[];
  manpowerTask: number;
  qcTask: number;
  totalScheduleDays: number;
  weightItem: string;
  totalTask: number;
  totalDoneTask: number;
  percentageDoneTask: number;
  status: string;
}

export interface BOQCatalogPriceItem {
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
  volumeRab: string | null;
  volumeCco: number | string | null;
  volumeActual: number | string | null;
  uomId: string | null;
  unitPriceMaterialRab: string | null;
  unitPriceMaterialCco: number | string | null;
  unitPriceMaterialActual: number | string | null;
  unitPriceWorkRab: string | null;
  unitPriceWorkCco: number | string | null;
  unitPriceWorkActual: number | string | null;
  totalPriceMaterialRab: number | string | null;
  totalPriceMaterialCco: number | string | null;
  totalPriceMaterialActual: number | string | null;
  totalPriceWorkRab: number | string | null;
  totalPriceWorkCco: number | string | null;
  totalPriceWorkActual: number | string | null;
  totalAmountRab: number | string | null;
  totalAmountCco: number | string | null;
  totalAmountActual: number | string | null;
  amountAfterLimitRab: number | string | null;
  scheduleStartDate: string | null;
  scheduleEndDate: string | null;
  remarks: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  taskMonitoring: BOQCatalogPriceTaskMonitoring;
}

export interface BOQCatalogPriceEntry {
  item: BOQCatalogPriceItem;
  resumeMaterialCost: BOQCatalogPriceMaterialEntry[];
  resumeEquipmentCost: BOQCatalogPriceEquipmentEntry[];
  totalAmount: number;
}

export async function getProjectBOQCatalogPrices(projectId: string): Promise<BOQCatalogPriceEntry> {
  try {
    const response = await axios.get<ApiSuccessResponse<BOQCatalogPriceEntry>>(
      getApiPath(`/projects/${projectId}/boq/catalog-prices`)
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
