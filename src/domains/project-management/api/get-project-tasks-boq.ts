import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { AssignedEmployee } from '../types/manpower-planning';

export type ProjectTaskBoqCategory = 'work' | 'qc';

export interface ProjectTaskBoqTaskSummary {
  id: string;
  projectId: string;
  parentTaskId: string | null;
  taskType: string;
  sourceWorkTaskId: string | null;
  boqItemId: string | null;
  title: string;
  description: string | null;
  status: string;
  statusLabel: string;
  assignedToEmployeeId: string | null;
  createdByUserId: string;
  doneAt: string | null;
  doneByUserId: string | null;
  qcDecision: string | null;
  retryCount: number;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedEmployee: AssignedEmployee | null;
}

export interface ProjectTaskBoqNode {
  id: string;
  boqId: string;
  parentId: string | null;
  sortOrder: number;
  level: number;
  code: string;
  name: string;
  isFinalLevel: boolean;
  /** Server-side rule: `false` means the node's task cannot be delegated (not selectable). */
  isDelegatable?: boolean;
  weight: string;
  limitBudgetPercentage: string;
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
  scheduleStartDate: string | null;
  scheduleEndDate: string | null;
  remarks: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  projectTasks: ProjectTaskBoqTaskSummary[];
  children: ProjectTaskBoqNode[];
}

export interface ProjectTaskBoqProject {
  id: string;
  code: string;
  name: string;
  description: string | null;
  currentStage: string;
  currentStageName: string;
  estimatedValue: number;
  totalValue: number;
  projectStartDate: string | null;
  projectEndDate: string | null;
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
  workStartTime: string | null;
  workEndTime: string | null;
  workDays: string[];
  startedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectTaskBoqData {
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
  items: ProjectTaskBoqNode[];
}

export interface GetProjectTasksBoqResponse {
  project: ProjectTaskBoqProject;
  boq: ProjectTaskBoqData;
}

export interface GetProjectTasksBoqParams {
  search?: string;
  taskCategory: ProjectTaskBoqCategory;
}

export async function getProjectTasksBoq(
  params: GetProjectTasksBoqParams,
  projectId?: string | null
): Promise<GetProjectTasksBoqResponse> {
  try {
    const { data } = await api.get<ApiSuccessResponse<GetProjectTasksBoqResponse>>(
      getApiPath('/project-management/project-tasks/boq'),
      {
        params,
        headers: projectId ? { 'X-Project-Id': projectId } : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
