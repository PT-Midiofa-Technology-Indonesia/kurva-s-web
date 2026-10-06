import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';

export async function deleteEmployeeWorkplace(
  employeeId: string,
  workplaceId: string,
  companyId?: string
): Promise<void> {
  try {
    await api.delete(getApiPath(`/employees/${employeeId}/workplaces/${workplaceId}`), {
      headers: companyId ? { 'X-Company-Id': companyId } : undefined,
    });
  } catch (error: unknown) {
    handleApiError(error);
  }
}
