import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import * as updateLeaveSettingsApi from '@/domains/leave/api/update-leave-settings';
import { toast } from '@/shared/lib/toast';
import { LEAVE_SETTINGS_QUERY_KEYS } from '../use-leave-settings';
import { LEAVE_TYPES_QUERY_KEYS } from '../use-leave-types';
import { useUpdateLeaveSettings } from '../use-update-leave-settings';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useUpdateLeaveSettings', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(updateLeaveSettingsApi, 'updateLeaveSettings').mockReset();
  });

  it('updates leave settings and active leave type caches without refetching', async () => {
    const companyId = 'company-1';
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const toastSuccessSpy = vi.spyOn(toast, 'success');

    const previousSettings = {
      leaveTypes: [
        {
          id: 'leave-type-1',
          leaveType: 'Cuti Tahunan',
          annualQuota: 12,
          requiresApproval: false,
          isActive: true,
        },
        {
          id: 'leave-type-2',
          leaveType: 'Izin',
          annualQuota: 0,
          requiresApproval: false,
          isActive: true,
        },
      ],
    };

    queryClient.setQueryData(LEAVE_SETTINGS_QUERY_KEYS.byCompany(companyId), {
      success: true,
      message: 'OK',
      data: previousSettings,
    });

    queryClient.setQueryData(LEAVE_TYPES_QUERY_KEYS.list({ companyId }), {
      success: true,
      message: 'OK',
      data: [
        {
          id: 'leave-type-1',
          code: 'leave-type-1',
          name: 'Cuti Tahunan',
          isActive: true,
          isPaid: false,
          requiresDocument: false,
          quota: 12,
          balance: null,
        },
        {
          id: 'leave-type-2',
          code: 'leave-type-2',
          name: 'Izin',
          isActive: true,
          isPaid: false,
          requiresDocument: false,
          quota: 0,
          balance: null,
        },
      ],
    });

    const updatedSettings = {
      leaveTypes: [
        {
          id: 'leave-type-1',
          leaveType: 'Cuti Tahunan',
          annualQuota: 12,
          requiresApproval: false,
          isActive: true,
        },
        {
          id: 'leave-type-2',
          leaveType: 'Izin',
          annualQuota: 0,
          requiresApproval: false,
          isActive: false,
        },
      ],
    };

    vi.spyOn(updateLeaveSettingsApi, 'updateLeaveSettings').mockResolvedValue({
      success: true,
      message: 'OK',
      data: updatedSettings,
    });

    const { result } = renderHook(() => useUpdateLeaveSettings(companyId), { wrapper });

    result.current.mutate(updatedSettings);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const cachedSettings = queryClient.getQueryData<{
      success: boolean;
      message: string;
      data: typeof updatedSettings;
    }>(LEAVE_SETTINGS_QUERY_KEYS.byCompany(companyId));

    const cachedLeaveTypes = queryClient.getQueryData<{
      success: boolean;
      message: string;
      data: Array<{ id: string; name: string; isActive?: boolean }>;
    }>(LEAVE_TYPES_QUERY_KEYS.list({ companyId }));

    expect(cachedSettings?.data.leaveTypes[1].isActive).toBe(false);
    expect(cachedLeaveTypes?.data).toHaveLength(1);
    expect(cachedLeaveTypes?.data[0].name).toBe('Cuti Tahunan');
    expect(invalidateQueriesSpy).not.toHaveBeenCalled();
    expect(toastSuccessSpy).toHaveBeenCalledWith({
      title: 'Pengaturan cuti berhasil disimpan',
    });
  });
});
