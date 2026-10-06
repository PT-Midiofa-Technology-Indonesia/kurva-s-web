import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export interface CreateCompanyDepartmentsPayload {
  departmentIds: string[];
}

export async function createCompanyDepartments(
  companyId: string,
  payload: CreateCompanyDepartmentsPayload
): Promise<void> {
  try {
    await api.post(getApiPath(`/companies/${companyId}/departments`), payload);
  } catch (error: unknown) {
    handleApiError(error);
  }
}
