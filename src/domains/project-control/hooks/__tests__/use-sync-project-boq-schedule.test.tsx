import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import * as syncProjectBOQScheduleAPI from '@/domains/project-control/api/sync-project-boq-schedule';
import { toast } from '@/shared/lib/toast';
import { PROJECT_BOQ_QUERY_KEYS } from '../use-project-boq';
import { useSyncProjectBOQSchedule } from '../use-sync-project-boq-schedule';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useSyncProjectBOQSchedule', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(syncProjectBOQScheduleAPI, 'syncProjectBOQSchedule').mockReset();
  });

  it('should successfully sync schedule and invalidate the project BOQ query', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const toastSuccessSpy = vi.spyOn(toast, 'success');
    vi.spyOn(syncProjectBOQScheduleAPI, 'syncProjectBOQSchedule').mockResolvedValue({
      data: null,
      message: 'OK',
      success: true,
    });

    const projectId = 'project-123';
    const payload = {
      items: [
        {
          id: 'item-1',
          sortOrder: 1,
          name: 'Pengadukan Semen dan Pasir',
          scheduleStartDate: '2026-07-01',
          scheduleEndDate: '2026-07-05',
        },
      ],
      deletedIds: [],
    };

    const { result } = renderHook(() => useSyncProjectBOQSchedule(projectId), { wrapper });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(syncProjectBOQScheduleAPI.syncProjectBOQSchedule).toHaveBeenCalledWith(
      projectId,
      payload
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: PROJECT_BOQ_QUERY_KEYS.detail(projectId),
    });
    expect(toastSuccessSpy).toHaveBeenCalled();
  });

  it('should handle error when syncing schedule fails', async () => {
    const toastErrorSpy = vi.spyOn(toast, 'error');
    vi.spyOn(syncProjectBOQScheduleAPI, 'syncProjectBOQSchedule').mockRejectedValue(
      new Error('Gagal menyimpan jadwal')
    );

    const projectId = 'project-123';
    const payload = { items: [], deletedIds: [] };

    const { result } = renderHook(() => useSyncProjectBOQSchedule(projectId), { wrapper });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastErrorSpy).toHaveBeenCalled();
  });
});
