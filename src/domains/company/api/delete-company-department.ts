import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteCompanyDepartment(
  companyId: string,
  departmentId: string
): Promise<void> {
  try {
    await api.delete(getApiPath(`/companies/${companyId}/departments/${departmentId}`));
  } catch (error: unknown) {
    handleApiError(error);
  }
}
