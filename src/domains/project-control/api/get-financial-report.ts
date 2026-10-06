import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

export interface FinancialReportUom {
  id: string;
  code: string;
  name: string;
}

export interface FinancialReportJobItemType {
  id: string;
  name: string;
}

export interface FinancialReportTaskMonitoring {
  assignedEmployees: string[];
  manpowerTask: number;
  qcTask: number;
  totalScheduleDays: number | null;
  weightItem: string;
  totalTask: number;
  totalDoneTask: number;
  percentageDoneTask: number;
  status: string;
}

export interface FinancialReportItem {
  id: string;
  boqId: string;
  parentId: string | null;
  sortOrder: number;
  level: number;
  code: string;
  name: string;
  isFinalLevel: boolean;
  weight: string;
  limitBudgetPercentage: string | null;
  volumeRab: number;
  volumeCco: number;
  volumeActual: number;
  uomId: string | null;
  unitPriceMaterialRab: number;
  unitPriceMaterialCco: number;
  unitPriceMaterialActual: number;
  unitPriceWorkRab: number;
  unitPriceWorkCco: number;
  unitPriceWorkActual: number;
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
  jobItemType: FinancialReportJobItemType | null;
  uom: FinancialReportUom | null;
  itemCostCount: number;
  createdAt: string;
  updatedAt: string;
  taskMonitoring: FinancialReportTaskMonitoring;
  budgetRemainingRab: number;
  budgetRemainingCco: number;
  isOverbudgetRab: boolean;
  isOverbudgetCco: boolean;
  children: FinancialReportItem[];
}

/** Raw shape from the backend — numeric fields sometimes arrive as strings (matches ProjectBOQItem convention). */
export interface FinancialReportItemRaw {
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
  volumeRab: number | string | null;
  volumeCco: number | string | null;
  volumeActual: number | string | null;
  uomId: string | null;
  unitPriceMaterialRab: number | string | null;
  unitPriceMaterialCco: number | string | null;
  unitPriceMaterialActual: number | string | null;
  unitPriceWorkRab: number | string | null;
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
  jobItemType: FinancialReportJobItemType | null;
  uom: FinancialReportUom | null;
  itemCostCount: number;
  createdAt: string;
  updatedAt: string;
  taskMonitoring: FinancialReportTaskMonitoring;
  budgetRemainingRab: number | string | null;
  budgetRemainingCco: number | string | null;
  isOverbudgetRab: boolean;
  isOverbudgetCco: boolean;
  children: FinancialReportItemRaw[];
}

export function mapFinancialReportItem(raw: FinancialReportItemRaw): FinancialReportItem {
  return {
    id: raw.id,
    boqId: raw.boqId,
    parentId: raw.parentId,
    sortOrder: raw.sortOrder,
    level: raw.level,
    code: raw.code,
    name: raw.name,
    isFinalLevel: raw.isFinalLevel,
    weight: raw.weight ?? '0',
    limitBudgetPercentage: raw.limitBudgetPercentage,
    volumeRab: Number(raw.volumeRab ?? 0),
    volumeCco: Number(raw.volumeCco ?? 0),
    volumeActual: Number(raw.volumeActual ?? 0),
    uomId: raw.uomId,
    unitPriceMaterialRab: Number(raw.unitPriceMaterialRab ?? 0),
    unitPriceMaterialCco: Number(raw.unitPriceMaterialCco ?? 0),
    unitPriceMaterialActual: Number(raw.unitPriceMaterialActual ?? 0),
    unitPriceWorkRab: Number(raw.unitPriceWorkRab ?? 0),
    unitPriceWorkCco: Number(raw.unitPriceWorkCco ?? 0),
    unitPriceWorkActual: Number(raw.unitPriceWorkActual ?? 0),
    totalPriceMaterialRab: Number(raw.totalPriceMaterialRab ?? 0),
    totalPriceMaterialCco: Number(raw.totalPriceMaterialCco ?? 0),
    totalPriceMaterialActual: Number(raw.totalPriceMaterialActual ?? 0),
    totalPriceWorkRab: Number(raw.totalPriceWorkRab ?? 0),
    totalPriceWorkCco: Number(raw.totalPriceWorkCco ?? 0),
    totalPriceWorkActual: Number(raw.totalPriceWorkActual ?? 0),
    totalAmountRab: Number(raw.totalAmountRab ?? 0),
    totalAmountCco: Number(raw.totalAmountCco ?? 0),
    totalAmountActual: Number(raw.totalAmountActual ?? 0),
    amountAfterLimitRab: Number(raw.amountAfterLimitRab ?? 0),
    scheduleStartDate: raw.scheduleStartDate,
    scheduleEndDate: raw.scheduleEndDate,
    remarks: raw.remarks,
    isActive: raw.isActive,
    jobItemType: raw.jobItemType,
    uom: raw.uom,
    itemCostCount: raw.itemCostCount,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    taskMonitoring: raw.taskMonitoring,
    budgetRemainingRab: Number(raw.budgetRemainingRab ?? 0),
    budgetRemainingCco: Number(raw.budgetRemainingCco ?? 0),
    isOverbudgetRab: raw.isOverbudgetRab,
    isOverbudgetCco: raw.isOverbudgetCco,
    children: (raw.children ?? []).map(mapFinancialReportItem),
  };
}

export interface FinancialReportProject {
  id: string;
  code: string;
  name: string;
  description: string | null;
  currentStage: string;
  currentStageName: string;
  estimatedValue: number;
  totalValue: number;
  projectStartDate: string;
  projectEndDate: string;
  tenderSubmissionDeadline: string | null;
  outcomeReason: string | null;
  isActive: boolean;
  statusBoqPlanning: boolean;
  statusBoqFinal: boolean;
  statusBoqExecution: boolean;
  isRabComplete: boolean;
  isLimitBudgetComplete: boolean;
  isCcoComplete: boolean;
  hasProjectHierarchy: boolean;
  hasProjectWarehouse: boolean;
  company: { id: string; name: string };
  client: { id: string; name: string };
  createdBy: { id: string; name: string };
  projectType: unknown;
  warehouse: unknown;
  workStartTime: string | null;
  workEndTime: string | null;
  workDays: unknown[];
  startedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface GetFinancialReportParams {
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetFinancialReportResponse {
  project: FinancialReportProject;
  items: FinancialReportItem[];
}

interface RawBoqItem {
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
  volumeRab: number | string | null;
  volumeCco: number | string | null;
  volumeActual: number | string | null;
  uomId: string | null;
  unitPriceMaterialRab: number | string | null;
  unitPriceMaterialCco: number | string | null;
  unitPriceMaterialActual: number | string | null;
  unitPriceWorkRab: number | string | null;
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
  jobItemType: FinancialReportJobItemType | null;
  uom: FinancialReportUom | null;
  itemCostCount: number;
  createdAt: string;
  updatedAt: string;
  taskMonitoring: FinancialReportTaskMonitoring;
  children: RawBoqItem[];
}

interface RawBoqData {
  id: string;
  projectId: string;
  boqTemplateId: string;
  code: string;
  name: string;
  limitBudgetPercentage: string;
  isRabComplete: boolean;
  isLimitBudgetComplete: boolean;
  isCcoComplete: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  items: RawBoqItem[];
}

interface RawGetFinancialReportData {
  project: FinancialReportProject;
  boq: RawBoqData;
  items: FinancialReportItemRaw[];
}

export async function getFinancialReport(
  projectId: string,
  params?: GetFinancialReportParams
): Promise<GetFinancialReportResponse> {
  try {
    const { data } = await api.get<ApiSuccessResponse<RawGetFinancialReportData>>(
      getApiPath(`/projects/${projectId}/financial-report`),
      { params: { ...params, page: 1, perPage: 9999 } }
    );
    return {
      project: data.data.project,
      items: data.data.items.map(mapFinancialReportItem),
    };
  } catch (error: unknown) {
    handleApiError(error);
  }
}
