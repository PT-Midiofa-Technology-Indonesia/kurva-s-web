import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import * as updateLeaveApi from '@/domains/leave/api/update-leave';
import type { LeaveListItem } from '@/domains/leave/types';
import { toast } from '@/shared/lib/toast';
import { LEAVE_DETAIL_QUERY_KEYS } from '../use-leave-detail';
import { LEAVE_TYPES_QUERY_KEYS } from '../use-leave-types';
import { LEAVE_QUERY_KEYS } from '../use-leaves';
import { useUpdateLeave } from '../use-update-leave';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useUpdateLeave', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(updateLeaveApi, 'updateLeave').mockReset();
  });

  it('updates cached leave list and detail without dropping the edited record', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const toastSuccessSpy = vi.spyOn(toast, 'success');

    const originalLeave: LeaveListItem = {
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
      status: 'pending_approval',
      description: 'Pulang kampung',
      adminNote: null,
      canCancel: true,
      createdAt: '2026-06-18T08:00:00.000Z',
      updatedAt: '2026-06-18T08:00:00.000Z',
    };

    const updatedLeave: LeaveListItem = {
      ...originalLeave,
      leaveTypeId: 'leave-type-2',
      leaveType: {
        id: 'leave-type-2',
        code: 'leave-type-2',
        name: 'Cuti Melahirkan',
      },
      startDate: '2026-06-21',
      endDate: '2026-06-24',
      description: 'Updated reason',
      updatedAt: '2026-06-20T08:00:00.000Z',
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
      data: [originalLeave],
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

    queryClient.setQueryData(LEAVE_DETAIL_QUERY_KEYS.detail('leave-1', 'company-1'), {
      success: true,
      message: 'OK',
      data: originalLeave,
    });

    vi.spyOn(updateLeaveApi, 'updateLeave').mockResolvedValue({
      success: true,
      message: 'OK',
      data: updatedLeave,
    });

    const { result } = renderHook(() => useUpdateLeave(), { wrapper });

    result.current.mutate({
      id: 'leave-1',
      companyId: 'company-1',
      payload: {
        employeeId: 'employee-1',
        leaveTypeId: 'leave-type-2',
        startDate: '2026-06-21',
        endDate: '2026-06-24',
        description: 'Updated reason',
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cachedList = queryClient.getQueryData<{
      data: LeaveListItem[];
    }>(LEAVE_QUERY_KEYS.list(JSON.stringify(listParams)));
    const cachedDetail = queryClient.getQueryData<{
      data: LeaveListItem;
    }>(LEAVE_DETAIL_QUERY_KEYS.detail('leave-1', 'company-1'));

    expect(cachedList?.data[0].leaveTypeId).toBe('leave-type-2');
    expect(cachedList?.data[0].description).toBe('Updated reason');
    expect(cachedDetail?.data.leaveTypeId).toBe('leave-type-2');
    expect(cachedDetail?.data.description).toBe('Updated reason');
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: LEAVE_TYPES_QUERY_KEYS.all,
    });
    expect(toastSuccessSpy).toHaveBeenCalledWith({
      title: 'Cuti berhasil diperbarui',
    });
  });
});
