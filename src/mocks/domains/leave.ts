import { HttpResponse, http } from 'msw';
import type { Leave, LeaveSettingsData, LeaveTypeOption } from '@/domains/leave/types';
import { getLeaveConflictMessage, getLeaveDurationDays } from '@/domains/leave/utils/leave-quota';
import { buildLeaveCode, filterLeaveRecords } from '@/domains/leave/utils/leave-record-filters';
import type { ApiPaginatedResponse, ApiResponse } from '@/shared/types/api';

const h = (path: string) => `/api/v1${path}`;

const employeeBudi = {
  id: 'employee-1',
  code: 'EMP-001',
  fullName: 'Budi Santoso',
  email: 'budi@example.com',
  phone: '08123456789',
  nik: '31730001',
  department: 'Human Resource',
  position: 'Staff',
};

const employeeSinta = {
  id: 'employee-2',
  code: 'EMP-002',
  fullName: 'Sinta Maharani',
  email: 'sinta@example.com',
  phone: '08123456780',
  nik: '31730002',
  department: 'Finance',
  position: 'Analyst',
};

const company = {
  id: 'company-1',
  name: 'PT Curva Teknologi',
};

const fallbackLeaveType = {
  id: 'leave-type-1',
  leaveType: 'Cuti Tahunan',
  annualQuota: 12,
  requiresApproval: false,
  isActive: true,
};

let mockLeaveSettings: LeaveSettingsData = {
  leaveTypes: [],
};

const createLeave = (overrides: Partial<Leave> = {}): Leave => ({
  id: 'leave-1',
  code: 'LV/EMP-001/2026/001',
  employeeId: employeeBudi.id,
  employee: employeeBudi,
  companyId: company.id,
  company,
  leaveTypeId: 'leave-type-1',
  leaveType: {
    id: 'leave-type-1',
    code: 'CT',
    name: 'Cuti Tahunan',
  },
  appliedDate: '2026-06-18',
  startDate: '2026-06-20',
  endDate: '2026-06-23',
  durationDays: 4,
  quotaBalance: 8,
  status: 'pending_approval',
  description: 'Pulang kampung',
  adminNote: null,
  canCancel: true,
  createdAt: '2026-06-18T08:00:00.000Z',
  updatedAt: '2026-06-18T08:00:00.000Z',
  ...overrides,
});

let mockLeaves: Leave[] = [
  createLeave(),
  createLeave({
    id: 'leave-2',
    code: 'LV/EMP-002/2026/001',
    employeeId: employeeSinta.id,
    employee: employeeSinta,
    leaveTypeId: 'leave-type-4',
    leaveType: {
      id: 'leave-type-4',
      code: 'CMN',
      name: 'Cuti Menikah',
    },
    appliedDate: '2026-05-01',
    startDate: '2026-05-10',
    endDate: '2026-05-12',
    durationDays: 3,
    quotaBalance: 0,
    status: 'approved',
    description: 'Acara keluarga',
    adminNote: 'Disetujui oleh HR',
    canCancel: false,
  }),
];

function getLeaveYear(date?: string | null) {
  if (!date) return new Date().getFullYear();
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date().getFullYear() : parsed.getFullYear();
}

function getLeaveTypeBalance({
  employeeId,
  leaveTypeId,
  year,
  excludeLeaveId,
}: {
  employeeId: string;
  leaveTypeId: string;
  year: number;
  excludeLeaveId?: string;
}) {
  const leaveType = mockLeaveSettings.leaveTypes.find((item) => item.id === leaveTypeId);
  if (!leaveType) return null;

  const used = mockLeaves
    .filter(
      (item) =>
        item.employeeId === employeeId &&
        item.leaveTypeId === leaveTypeId &&
        item.id !== excludeLeaveId &&
        item.status !== 'cancelled' &&
        getLeaveYear(item.startDate) === year
    )
    .reduce((total, item) => total + item.durationDays, 0);

  return {
    quota: leaveType.annualQuota,
    used,
    remaining: Math.max(0, leaveType.annualQuota - used),
  };
}

function getLeaveConflictErrorMessage({
  employeeId,
  startDate,
  endDate,
  excludeLeaveId,
}: {
  employeeId: string;
  startDate: string;
  endDate: string;
  excludeLeaveId?: string;
}) {
  return getLeaveConflictMessage({
    existingLeaves: mockLeaves.filter((item) => item.employeeId === employeeId),
    startDate,
    endDate,
    excludeLeaveId,
  });
}

function buildValidationError(message: string): HttpResponse<ApiResponse<Leave>> {
  return HttpResponse.json<ApiResponse<Leave>>(
    {
      success: false,
      message,
      data: null,
      errorCode: 'VALIDATION_ERROR',
      errors: {
        dates: [message],
      },
    },
    { status: 422 }
  );
}

export { mockLeaveSettings, mockLeaves };

export const leaveHandlers = [
  http.get(h('/human-resource/leaves'), ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const perPage = parseInt(url.searchParams.get('perPage') || '10', 10);
    const filtered = filterLeaveRecords(mockLeaves, {
      search: url.searchParams.get('search') || undefined,
      employeeId: url.searchParams.get('employeeId') || undefined,
      status:
        url.searchParams.getAll('status').length > 0
          ? url.searchParams.getAll('status')
          : url.searchParams.get('status') || undefined,
      leaveTypeId:
        url.searchParams.getAll('leaveTypeId').length > 0
          ? url.searchParams.getAll('leaveTypeId')
          : url.searchParams.get('leaveTypeId') || undefined,
      leaveTypeIds:
        url.searchParams.getAll('leaveTypeIds').length > 0
          ? url.searchParams.getAll('leaveTypeIds')
          : url.searchParams.get('leaveTypeIds') || undefined,
      year: url.searchParams.get('year') || undefined,
    });

    const start = (page - 1) * perPage;
    const paginated = filtered.slice(start, start + perPage);

    return HttpResponse.json<ApiPaginatedResponse<Leave[]>>({
      success: true,
      message: 'Data cuti berhasil diambil.',
      data: paginated,
      meta: {
        currentPage: page,
        perPage,
        total: filtered.length,
        lastPage: Math.max(1, Math.ceil(filtered.length / perPage)),
        from: filtered.length > 0 ? start + 1 : null,
        to: filtered.length > 0 ? Math.min(start + perPage, filtered.length) : null,
      },
      links: {
        first: h(`/human-resource/leaves?page=1&perPage=${perPage}`),
        last: h(
          `/human-resource/leaves?page=${Math.max(1, Math.ceil(filtered.length / perPage))}&perPage=${perPage}`
        ),
        prev: page > 1 ? h(`/human-resource/leaves?page=${page - 1}&perPage=${perPage}`) : null,
        next:
          page < Math.ceil(filtered.length / perPage)
            ? h(`/human-resource/leaves?page=${page + 1}&perPage=${perPage}`)
            : null,
      },
    });
  }),

  http.get(h('/human-resource/leaves/:id'), ({ params }) => {
    const found = mockLeaves.find((item) => item.id === params.id);

    if (!found) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Cuti tidak ditemukan.',
          data: null,
          errorCode: 'NOT_FOUND',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json<ApiResponse<Leave>>({
      success: true,
      message: 'Detail cuti berhasil diambil.',
      data: found,
    });
  }),

  http.get(h('/human-resource/leaves/types'), ({ request }) => {
    const url = new URL(request.url);
    const employeeId = url.searchParams.get('employeeId');
    const year = url.searchParams.get('year');
    const parsedYear = year ? Number(year) : new Date().getFullYear();

    const leaveTypes = mockLeaveSettings.leaveTypes
      .filter((item) => item.isActive)
      .map<LeaveTypeOption>((item) => ({
        id: item.id,
        code: item.id,
        name: item.leaveType,
        isPaid: false,
        requiresDocument: false,
        quota: item.annualQuota,
        balance:
          employeeId != null
            ? getLeaveTypeBalance({
                employeeId,
                leaveTypeId: item.id,
                year: Number.isNaN(parsedYear) ? new Date().getFullYear() : parsedYear,
              })
            : null,
      }));

    return HttpResponse.json<ApiResponse<LeaveTypeOption[]>>({
      success: true,
      message: 'Jenis cuti berhasil diambil.',
      data: leaveTypes,
    });
  }),

  http.post(h('/human-resource/leaves'), async ({ request }) => {
    const payload = (await request.json()) as {
      employeeId: string;
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason?: string | null;
    };

    const employee = payload.employeeId === employeeSinta.id ? employeeSinta : employeeBudi;
    const leaveType =
      mockLeaveSettings.leaveTypes.find((item) => item.id === payload.leaveTypeId) ??
      mockLeaveSettings.leaveTypes[0] ??
      fallbackLeaveType;
    const durationDays = getLeaveDurationDays(payload.startDate, payload.endDate);
    const conflictMessage = getLeaveConflictErrorMessage({
      employeeId: employee.id,
      startDate: payload.startDate,
      endDate: payload.endDate,
    });

    if (conflictMessage) {
      return buildValidationError(conflictMessage);
    }

    const quotaRemaining =
      getLeaveTypeBalance({
        employeeId: employee.id,
        leaveTypeId: leaveType.id,
        year: getLeaveYear(payload.startDate),
      })?.remaining ?? null;

    if (quotaRemaining != null && durationDays > quotaRemaining) {
      return buildValidationError(`Kuota tidak cukup. Sisa: ${quotaRemaining} hari.`);
    }

    const nextLeave = createLeave({
      id: `leave-${mockLeaves.length + 1}`,
      code: buildLeaveCode(employee.code, payload.startDate, mockLeaves.length + 1),
      employeeId: employee.id,
      employee,
      leaveTypeId: leaveType.id,
      leaveType: { id: leaveType.id, code: leaveType.id, name: leaveType.leaveType },
      startDate: payload.startDate,
      endDate: payload.endDate,
      appliedDate: payload.startDate,
      durationDays,
      quotaBalance: Math.max(0, (quotaRemaining ?? leaveType.annualQuota) - durationDays),
      status: 'approved',
      description: payload.reason || null,
      canCancel: true,
    });

    mockLeaves = [nextLeave, ...mockLeaves];

    return HttpResponse.json<ApiResponse<Leave>>({
      success: true,
      message: 'Cuti berhasil diajukan.',
      data: nextLeave,
    });
  }),

  http.put(h('/human-resource/leaves/:id'), async ({ params, request }) => {
    const payload = (await request.json()) as {
      employeeId?: string;
      leaveTypeId: string;
      startDate: string;
      endDate: string;
      reason?: string | null;
    };

    const currentLeave = mockLeaves.find((item) => item.id === params.id);
    const employee =
      currentLeave?.employee ??
      (payload.employeeId === employeeSinta.id ? employeeSinta : employeeBudi);
    const leaveType =
      mockLeaveSettings.leaveTypes.find((item) => item.id === payload.leaveTypeId) ??
      mockLeaveSettings.leaveTypes[0] ??
      fallbackLeaveType;
    const durationDays = getLeaveDurationDays(payload.startDate, payload.endDate);
    const conflictMessage = getLeaveConflictErrorMessage({
      employeeId: employee.id,
      startDate: payload.startDate,
      endDate: payload.endDate,
      excludeLeaveId: params.id as string,
    });

    if (conflictMessage) {
      return buildValidationError(conflictMessage);
    }

    const quotaRemaining =
      getLeaveTypeBalance({
        employeeId: employee.id,
        leaveTypeId: leaveType.id,
        year: getLeaveYear(payload.startDate),
        excludeLeaveId: params.id as string,
      })?.remaining ?? null;

    if (quotaRemaining != null && durationDays > quotaRemaining) {
      return buildValidationError(`Kuota tidak cukup. Sisa: ${quotaRemaining} hari.`);
    }

    let updatedLeave: Leave | null = null;

    mockLeaves = mockLeaves.map((item) => {
      if (item.id !== params.id) return item;

      updatedLeave = {
        ...item,
        leaveTypeId: leaveType.id,
        leaveType: { id: leaveType.id, code: leaveType.id, name: leaveType.leaveType },
        startDate: payload.startDate,
        endDate: payload.endDate,
        durationDays,
        quotaBalance: Math.max(0, (quotaRemaining ?? leaveType.annualQuota) - durationDays),
        description: payload.reason || null,
        updatedAt: new Date().toISOString(),
      };

      return updatedLeave;
    });

    return HttpResponse.json<ApiResponse<Leave>>({
      success: true,
      message: 'Cuti berhasil diperbarui.',
      data: updatedLeave ?? mockLeaves[0],
    });
  }),

  http.post(h('/human-resource/leaves/:id/cancel'), ({ params }) => {
    let updatedLeave: Leave | null = null;

    mockLeaves = mockLeaves.map((item) => {
      if (item.id !== params.id) return item;

      updatedLeave = {
        ...item,
        status: 'cancelled',
        canCancel: false,
        adminNote: item.adminNote || 'Dibatalkan oleh pengguna',
        updatedAt: new Date().toISOString(),
      };

      return updatedLeave;
    });

    return HttpResponse.json<ApiResponse<Leave>>({
      success: true,
      message: 'Cuti berhasil dibatalkan.',
      data: updatedLeave ?? mockLeaves[0],
    });
  }),

  http.get(h('/leave-types'), () => {
    return HttpResponse.json<
      ApiResponse<
        Array<{
          id: string;
          name: string;
          defaultQuotaDays: number;
          requiresApproval: boolean;
          isActive: boolean;
        }>
      >
    >({
      success: true,
      message: 'Pengaturan cuti berhasil diambil.',
      data: mockLeaveSettings.leaveTypes.map((item) => ({
        id: item.id,
        name: item.leaveType,
        defaultQuotaDays: item.annualQuota,
        requiresApproval: item.requiresApproval,
        isActive: item.isActive,
      })),
    });
  }),

  http.put(h('/leave-types/sync'), async ({ request }) => {
    const payload = (await request.json()) as {
      leaveTypes: Array<{
        id?: string;
        name: string;
        defaultQuotaDays: number;
        requiresApproval: boolean;
        isActive: boolean;
      }>;
    };
    mockLeaveSettings = {
      leaveTypes: payload.leaveTypes.map((item, index) => ({
        id: item.id ?? `leave-type-${index + 1}`,
        leaveType: item.name,
        annualQuota: item.defaultQuotaDays,
        requiresApproval: item.requiresApproval,
        isActive: item.isActive,
      })),
    };

    return HttpResponse.json<
      ApiResponse<
        Array<{
          id: string;
          name: string;
          defaultQuotaDays: number;
          requiresApproval: boolean;
          isActive: boolean;
        }>
      >
    >({
      success: true,
      message: 'Pengaturan cuti berhasil diperbarui.',
      data: mockLeaveSettings.leaveTypes.map((item) => ({
        id: item.id,
        name: item.leaveType,
        defaultQuotaDays: item.annualQuota,
        requiresApproval: item.requiresApproval,
        isActive: item.isActive,
      })),
    });
  }),
];
