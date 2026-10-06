import { beforeEach, describe, expect, it, vi } from 'vitest';
import api from '@/shared/lib/axios';
import { createLeave } from '../create-leave';
import { getLeaveSettings } from '../get-leave-settings';
import { getLeaveTypes } from '../get-leave-types';
import { getLeaves } from '../get-leaves';
import { updateLeaveSettings } from '../update-leave-settings';

vi.mock('@/shared/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('Leave API contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads global leave types without company header', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: [],
      },
    });

    await getLeaveSettings('company-1');

    expect(mockedApi.get).toHaveBeenCalledWith('/v1/leave-types', {
      params: {},
    });
  });

  it('syncs leave settings using backend leave type payload', async () => {
    mockedApi.put.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: [],
      },
    });

    await updateLeaveSettings({
      leaveTypes: [
        {
          id: 'leave-type-1',
          leaveType: 'Cuti Tahunan',
          annualQuota: 12,
          requiresApproval: false,
          isActive: true,
        },
      ],
    });

    expect(mockedApi.put).toHaveBeenCalledWith('/v1/leave-types/sync', {
      leaveTypes: [
        {
          id: 'leave-type-1',
          name: 'Cuti Tahunan',
          defaultQuotaDays: 12,
          requiresApproval: false,
          isActive: true,
        },
      ],
    });
  });

  it('creates leave with reason field instead of description', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: null,
      },
    });

    await createLeave({
      companyId: 'company-1',
      payload: {
        employeeId: 'employee-1',
        leaveTypeId: 'leave-type-1',
        startDate: '2026-09-01',
        endDate: '2026-09-04',
        description: 'Acara keluarga',
      },
    });

    expect(mockedApi.post).toHaveBeenCalledWith(
      '/v1/human-resource/leaves',
      {
        employeeId: 'employee-1',
        leaveTypeId: 'leave-type-1',
        startDate: '2026-09-01',
        endDate: '2026-09-04',
        reason: 'Acara keluarga',
      },
      { headers: { 'X-Company-Id': 'company-1' } }
    );
  });

  it('uses employee, year, and leave type query parameters for leave list filters', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: [],
        meta: { currentPage: 1, perPage: 10, total: 0, lastPage: 1, from: null, to: null },
        links: { first: '', last: '', prev: null, next: null },
      },
    });

    await getLeaves({
      companyId: 'company-1',
      employeeId: 'employee-1',
      year: 2026,
      status: 'approved',
      leaveTypeId: 'leave-type-1',
      search: 'LV/EMP-001',
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/v1/human-resource/leaves', {
      params: {
        employeeId: 'employee-1',
        year: 2026,
        status: 'approved',
        leaveTypeId: 'leave-type-1',
        search: 'LV/EMP-001',
      },
      headers: { 'X-Company-Id': 'company-1' },
    });
  });

  it('loads company-scoped leave types with employee quota context', async () => {
    mockedApi.get.mockResolvedValueOnce({
      data: {
        success: true,
        message: 'OK',
        data: [
          {
            id: 'leave-type-active',
            code: 'ACTIVE',
            name: 'Cuti Tahunan',
            isPaid: false,
            requiresDocument: false,
            isActive: true,
            quota: 12,
            balance: { quota: 12, used: 0, remaining: 12 },
          },
          {
            id: 'leave-type-inactive',
            code: 'INACTIVE',
            name: 'Izin',
            isPaid: false,
            requiresDocument: false,
            isActive: false,
            quota: 0,
            balance: null,
          },
        ],
      },
    });

    const response = await getLeaveTypes({
      companyId: 'company-1',
      employeeId: 'employee-1',
      year: 2026,
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/v1/human-resource/leaves/types', {
      params: {
        employeeId: 'employee-1',
        year: 2026,
      },
      headers: { 'X-Company-Id': 'company-1' },
    });
    expect(response.success).toBe(true);
    if (!response.success) throw new Error('Expected successful response');
    expect(response.data).toHaveLength(1);
    expect(response.data[0].id).toBe('leave-type-active');
  });
});
