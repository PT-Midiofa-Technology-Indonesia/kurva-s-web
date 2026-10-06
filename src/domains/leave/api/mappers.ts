import type { Leave, LeaveSettingsData, LeaveTypeOption, LeaveTypeSetting } from '../types';

interface BackendLeaveType {
  id: string;
  code?: string;
  name: string;
  defaultQuotaDays?: number | null;
  isActive?: boolean;
  requiresApproval?: boolean;
}

interface BackendLeave {
  id: string;
  code?: string;
  employee?: {
    id: string;
    code?: string;
    name?: string;
    fullName?: string;
  };
  leaveType?: {
    id: string;
    code?: string;
    name: string;
  };
  reason?: string | null;
  totalDays?: number;
  status?: string;
  dates?: string[];
  notes?: string | null;
  createdAt?: string;
}

type BackendLeaveTypeOption = LeaveTypeOption & {
  isActive?: boolean;
};

export function mapBackendLeaveType(item: BackendLeaveType): LeaveTypeSetting {
  return {
    id: item.id,
    leaveType: item.name,
    annualQuota: item.defaultQuotaDays ?? 0,
    requiresApproval: item.requiresApproval ?? false,
    isActive: item.isActive ?? true,
  };
}

export function mapLeaveSettingsResponse(
  data: BackendLeaveType[] | LeaveSettingsData
): LeaveSettingsData {
  if (Array.isArray(data)) {
    return {
      leaveTypes: data.map(mapBackendLeaveType),
    };
  }

  return data;
}

export function mapLeaveSettingsPayload(payload: LeaveSettingsData) {
  return {
    leaveTypes: payload.leaveTypes.map((item) => ({
      ...(item.id ? { id: item.id } : {}),
      name: item.leaveType,
      defaultQuotaDays: item.annualQuota,
      requiresApproval: item.requiresApproval,
      isActive: item.isActive,
    })),
  };
}

export function mapLeaveTypeOptionsResponse(data: BackendLeaveTypeOption[]): LeaveTypeOption[] {
  return data.filter((item) => item.isActive !== false);
}

export function mapBackendLeave(item: BackendLeave | Leave): Leave {
  if ('durationDays' in item && 'quotaBalance' in item && 'description' in item) {
    return item;
  }

  const dates = item.dates ?? [];
  const startDate = dates[0] ?? '';
  const endDate = dates[dates.length - 1] ?? startDate;

  return {
    id: item.id,
    code: item.code ?? '',
    employeeId: item.employee?.id ?? '',
    employee: {
      id: item.employee?.id ?? '',
      code: item.employee?.code ?? '',
      fullName: item.employee?.fullName ?? item.employee?.name ?? '-',
      email: '',
      phone: '',
      nik: null,
      department: '',
      position: null,
    },
    companyId: '',
    company: {
      id: '',
      name: '',
    },
    leaveTypeId: item.leaveType?.id ?? '',
    leaveType: {
      id: item.leaveType?.id ?? '',
      code: item.leaveType?.code ?? '',
      name: item.leaveType?.name ?? '-',
    },
    appliedDate: item.createdAt?.slice(0, 10) ?? startDate,
    startDate,
    endDate,
    durationDays: item.totalDays ?? dates.length,
    quotaBalance: 0,
    status: item.status ?? 'pending_approval',
    description: item.reason ?? null,
    adminNote: item.notes ?? null,
    canCancel: item.status === 'approved',
    createdAt: item.createdAt ?? '',
    updatedAt: item.createdAt ?? '',
  };
}
