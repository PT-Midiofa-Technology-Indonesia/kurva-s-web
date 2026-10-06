import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import * as createLeaveApi from '@/domains/leave/api/create-leave';
import type { LeaveListItem } from '@/domains/leave/types';
import { toast } from '@/shared/lib/toast';
import { useCreateLeave } from '../use-create-leave';
import { LEAVE_TYPES_QUERY_KEYS } from '../use-leave-types';
import { LEAVE_QUERY_KEYS } from '../use-leaves';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useCreateLeave', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(createLeaveApi, 'createLeave').mockReset();
  });

  it('prepends the new leave to cached leave lists using the API response status', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const toastSuccessSpy = vi.spyOn(toast, 'success');
    const existingLeave: LeaveListItem = {
      id: 'leave-1',
      employeeId: 'employee-1',
      employee: {
        id: 'employee-1',
        code: 'EMP-001',
        fullName: 'Budi Santoso',
        email: 'budi@example.com',
        phone: '08123456789',
        nik: '31730001',
        department: 'Human Resource',
        position: 'Staff',
      },
      companyId: 'company-1',
      company: {
        id: 'company-1',
        name: 'PT Curva Teknologi',
      },
      leaveTypeId: 'leave-type-1',
      leaveType: {
        id: 'leave-type-1',
        code: 'leave-type-1',
        name: 'Cuti Tahunan',
      },
      appliedDate: '2026-06-18',
      startDate: '2026-06-20',
      endDate: '2026-06-23',
      durationDays: 4,
      quotaBalance: 8,
      status: 'approved',
      description: 'Existing leave',
      adminNote: null,
      canCancel: true,
      createdAt: '2026-06-18T08:00:00.000Z',
      updatedAt: '2026-06-18T08:00:00.000Z',
    };

    const listParams = {
      companyId: 'company-1',
      page: 1,
      perPage: 10,
      sortOrder: 'asc' as const,
    };

    queryClient.setQueryData(LEAVE_QUERY_KEYS.list(JSON.stringify(listParams)), {
      success: true,
      message: 'OK',
      data: [existingLeave],
      meta: {
        currentPage: 1,
        perPage: 10,
        total: 1,
        lastPage: 1,
        from: 1,
        to: 1,
      },
      links: {
        first: '',
        last: '',
        prev: null,
        next: null,
      },
    });

    const createdLeave: LeaveListItem = {
      ...existingLeave,
      id: 'leave-2',
      startDate: '2026-07-01',
      endDate: '2026-07-03',
      appliedDate: '2026-07-01',
      status: 'approved',
      description: 'Pulang kampung',
      canCancel: false,
    };

    vi.spyOn(createLeaveApi, 'createLeave').mockResolvedValue({
      success: true,
      message: 'OK',
      data: createdLeave,
    });

    const { result } = renderHook(() => useCreateLeave(), { wrapper });

    result.current.mutate({
      companyId: 'company-1',
      payload: {
        employeeId: 'employee-1',
        leaveTypeId: 'leave-type-1',
        startDate: '2026-07-01',
        endDate: '2026-07-03',
        description: 'Pulang kampung',
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cached = queryClient.getQueryData<{
      data: LeaveListItem[];
      meta: { total: number };
    }>(LEAVE_QUERY_KEYS.list(JSON.stringify(listParams)));

    expect(cached?.data[0].id).toBe('leave-2');
    expect(cached?.data[0].status).toBe('approved');
    expect(cached?.meta.total).toBe(2);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: LEAVE_TYPES_QUERY_KEYS.all,
    });
    expect(toastSuccessSpy).toHaveBeenCalledWith({
      title: 'Cuti berhasil diajukan',
    });
  });
});
