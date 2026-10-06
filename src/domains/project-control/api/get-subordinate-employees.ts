import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';

/**
 * Task category the employees will be scoped to — mirrors the `taskCategory`
 * query param on `/project-management/project-tasks/boq`. Defined locally so
 * `project-control` doesn't import from the `project-management` domain.
 */
export type SubordinateEmployeeCategory = 'work' | 'qc';

export interface SubordinateEmployee {
  id: string;
  userId: string | null;
  code: string;
  fullName: string;
  employeeType: string;
  contractType: string | null;
  salaryType: string | null;
  workPlacement: string | null;
  email: string;
  phone: string;
  nik: string | null;
  npwp: string | null;
  birthPlace: string;
  birthDate: string;
  gender: string;
  addressDetail: string | null;
  postalCode: string | null;
  hireDate: string | null;
  terminationDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getSubordinateEmployees(
  projectId?: string | null,
  taskCategory?: SubordinateEmployeeCategory
): Promise<SubordinateEmployee[]> {
  try {
    const { data } = await api.get<ApiSuccessResponse<SubordinateEmployee[]>>(
      getApiPath('/project-hierarchy-nodes/subordinate-employees'),
      {
        params: taskCategory ? { taskCategory } : undefined,
        headers: projectId ? { 'X-Project-Id': projectId } : undefined,
      }
    );
    return data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
