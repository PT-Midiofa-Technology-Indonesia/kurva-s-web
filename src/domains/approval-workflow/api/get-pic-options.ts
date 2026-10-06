import { getApiPath } from '@/shared/lib/api-config';
import { handleApiError } from '@/shared/lib/api-error';
import api from '@/shared/lib/axios';
import type { ApiSuccessResponse } from '@/types/api';
import type { RawApproverOption } from '../types';

export interface GetPicOptionsParams {
  companyId?: string;
  approverType: 'role' | 'department';
  approverId: string;
}

export async function getPicOptions(params: GetPicOptionsParams): Promise<RawApproverOption[]> {
  try {
    const { companyId, approverType, approverId } = params;
    const headers = companyId ? { 'X-Company-Id': companyId } : undefined;
    const idParam = approverType === 'role' ? { roleId: approverId } : { departmentId: approverId };
    const { data } = await api.get<ApiSuccessResponse<RawApproverOption[]>>(
      getApiPath(`/approval-workflows/options/approvers/${approverType}`),
      { params: idParam, headers }
    );
    return data.data;
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
