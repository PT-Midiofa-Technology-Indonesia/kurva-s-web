import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import type { ApiResponse } from '@/shared/types/api';

export interface EmployeeByPosition {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  skills: { id: string; skillCatalog: { name: string } }[];
}

export interface GetEmployeesByPositionFullResponse {
  matchedEmployees: EmployeeByPosition[];
  skillMatchCount: number;
  unmatchedEmployees: EmployeeByPosition[];
  skillNotMatchCount: number;
}

export async function getEmployeesByPosition(
  positionId: string,
  projectId?: string
): Promise<GetEmployeesByPositionFullResponse | null> {
  try {
    const { data } = await axios.get<ApiResponse<GetEmployeesByPositionFullResponse>>(
      getApiPath(`/employees/position/${positionId}`),
      {
        params: projectId ? { projectId } : undefined,
      }
    );
    if (!data.success) return null;
    return data.data;
  } catch {
    return null;
  }
}
