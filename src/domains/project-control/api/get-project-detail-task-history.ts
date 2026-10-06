import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';
import { ProjectBOQItem } from './get-project-boq';

export interface BoqTaskItem
  extends Omit<ProjectBOQItem, 'taskMonitoring' | 'children' | 'isFinalLevel'> {
  totalCountChildren: number;
  status: string;
}

export interface TaskHistory {
  id: string;
  projectId: string;
  parentTaskId: any;
  taskType: string;
  sourceWorkTaskId: any;
  boqItemId: string;
  title: string;
  description: any;
  status: string;
  statusLabel: string;
  assignedToEmployeeId: string;
  createdByUserId: string;
  doneAt: any;
  doneByUserId: any;
  qcDecision: any;
  retryCount: number;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  assignedEmployee: AssignedEmployee;
  createdByUser: CreatedByUser;
  doneByUser: DoneByUser;
}

export interface Evidence {
  id: string;
  projectId: string;
  parentTaskId: any;
  taskType: string;
  sourceWorkTaskId: any;
  boqItemId: string;
  title: string;
  description: any;
  status: string;
  statusLabel: string;
  assignedToEmployeeId: string;
  createdByUserId: string;
  doneAt: any;
  doneByUserId: any;
  qcDecision: any;
  retryCount: number;
  notes: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  boqItem: BoqTaskItem;
  assignedEmployee: AssignedEmployee;
  createdByUser: CreatedByUser;
  doneByUser: any;
  noteActivities: unknown;
  documents: unknown;
  files: File[];
}

export interface AssignedEmployee {
  id: string;
  code: string;
  fullName: string;
}

export interface CreatedByUser {
  id: string;
  name: string;
}

export interface File {
  id: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface DoneByUser {
  id: string;
  name: string;
}

export interface TaskDetailHistory {
  boqItem: BoqTaskItem;
  taskHistory: TaskHistory[];
  evidences: Evidence[];
  qcTasks: TaskHistory[];
  evidenceQcTask: Evidence[];
}

export async function getProjectDetailTaskHistory(taskId: string): Promise<TaskDetailHistory> {
  try {
    const response = await axios.get<ApiSuccessResponse<TaskDetailHistory>>(
      getApiPath(`/project-management/project-tasks/${taskId}/detail`)
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
