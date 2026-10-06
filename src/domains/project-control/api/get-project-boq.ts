import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';
import type { SPKRequirementDocument } from '../types';

export interface ProjectBOClient {
  id: string;
  name: string;
}

export interface ProjectBOCompany {
  id: string;
  name: string;
}

export interface ProjectBOProjectType {
  id: string;
  name: string;
}

export interface ProjectBODetail {
  id: string;
  code: string;
  name: string;
  description: string;
  currentStage: string;
  currentStageName: string;
  estimatedValue: number;
  totalValue: number;
  totalValueCco: number;
  limitBudgetPercentage: number | null;
  projectStartDate: string;
  projectEndDate: string;
  startedAt: string | null;
  tenderSubmissionDeadline: string | null;
  outcomeReason: string | null;
  isActive: boolean;
  isRabComplete: boolean;
  isLimitBudgetComplete: boolean;
  isCcoComplete: boolean;
  isSideInstruction?: boolean;
  spkNumber?: string | null;
  spkRequirementDocuments?: SPKRequirementDocument | null;
  spkUploadedDocuments?:
    | {
        id: string;
        documentTypeId: string;
        documentTypeName: string;
        fileName: string;
        fileSize: number;
        mimeType: string;
        url: string;
        uploadedBy: { id: string; name: string };
        uploadedAt: string;
      }[]
    | null;
  company: ProjectBOCompany;
  client: ProjectBOClient;
  createdBy: { id: string; name: string };
  projectType: ProjectBOProjectType | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskMonitoringAssignedEmployee {
  id: string;
  fullName: string;
}

export interface TaskMonitoring {
  assignedEmployees: TaskMonitoringAssignedEmployee[];
  manpowerTask: number;
  qcTask: number;
  totalScheduleDays: any;
  weightItem: string;
  totalTask: number;
  totalDoneTask: number;
  percentageDoneTask: number;
  status: string;
  statusLabel: string;
}

export interface ProjectBOQItem {
  id: string;
  boqId?: string;
  parentId: string | null;
  sortOrder: number;
  level: number;
  code: string;
  name: string;
  isFinalLevel: boolean;
  weight: string | null;
  volumeRab?: string | number | null;
  volumeCco?: string | number | null;
  volumeActual?: string | number | null;
  uomId?: string | null;
  uom?: { id: string; code: string; name: string } | null;
  unitPriceMaterialRab?: string | number | null;
  unitPriceWorkRab?: string | number | null;
  totalPriceMaterialRab?: string | number | null;
  totalPriceWorkRab?: string | number | null;
  totalAmountRab?: string | number | null;
  remarks?: string | null;
  jobItemTypeId?: string;
  jobItemType?: { id: string; name: string } | null;
  scheduleStartDate: string | null;
  scheduleEndDate: string | null;
  taskMonitoring?: TaskMonitoring;
  children: ProjectBOQItem[];
}

export interface ProjectBOData {
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
  items: ProjectBOQItem[];
}

export interface GetProjectBOResponse {
  project: ProjectBODetail;
  boq: ProjectBOData | null;
}

export type ProjectBOQMonitoringTime = 'day' | 'week' | 'month';

export async function getProjectBOQ(
  projectId: string,
  monitoringTime?: ProjectBOQMonitoringTime
): Promise<GetProjectBOResponse> {
  try {
    const response = await axios.get<ApiSuccessResponse<GetProjectBOResponse>>(
      getApiPath(`/projects/${projectId}/boq`),
      { params: monitoringTime ? { monitoringTime } : undefined }
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
