import axios from '@/lib/axios';
import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import type { ApiSuccessResponse } from '@/types/api';
import type { GetProjectBOResponse, ProjectBOQMonitoringTime } from './get-project-boq';

/**
 * Project-management variant of {@link getProjectBOQ}: same response shape, but the
 * project is resolved server-side from the `x-project-id` header that the axios
 * request interceptor attaches from the globally selected project.
 */
export async function getProjectManagementBOQ(
  monitoringTime?: ProjectBOQMonitoringTime
): Promise<GetProjectBOResponse> {
  try {
    const response = await axios.get<ApiSuccessResponse<GetProjectBOResponse>>(
      getApiPath('/project-management/boq'),
      { params: monitoringTime ? { monitoringTime } : undefined }
    );
    return response.data.data;
  } catch (error: unknown) {
    handleApiError(error);
  }
}
