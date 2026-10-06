import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import * as updateProjectBOQAPI from '@/domains/project-control/api/update-project-boq';
import { toast } from '@/shared/lib/toast';
import { PROJECT_BOQ_QUERY_KEYS } from '../use-project-boq';
import { useUpdateProjectBOQ } from '../use-update-project-boq';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useUpdateProjectBOQ', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(updateProjectBOQAPI, 'updateProjectBOQ').mockReset();
  });

  it('should update isRabComplete and invalidate the project BOQ query', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const toastSuccessSpy = vi.spyOn(toast, 'success');
    vi.spyOn(updateProjectBOQAPI, 'updateProjectBOQ').mockResolvedValue({
      data: null,
      message: 'OK',
      success: true,
    });

    const projectId = 'proj-001';
    const boqId = 'boq-001';

    const { result } = renderHook(() => useUpdateProjectBOQ(projectId), { wrapper });

    result.current.mutate({ boqId, payload: { isRabComplete: true } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(updateProjectBOQAPI.updateProjectBOQ).toHaveBeenCalledWith(projectId, boqId, {
      isRabComplete: true,
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: PROJECT_BOQ_QUERY_KEYS.detail(projectId),
    });
    expect(toastSuccessSpy).toHaveBeenCalledWith({
      title: 'BoQ Planning berhasil di-complete.',
    });
  });

  it('should update isCcoComplete and show the execution success message', async () => {
    const toastSuccessSpy = vi.spyOn(toast, 'success');
    vi.spyOn(updateProjectBOQAPI, 'updateProjectBOQ').mockResolvedValue({
      data: null,
      message: 'OK',
      success: true,
    });

    const projectId = 'proj-001';
    const boqId = 'boq-001';

    const { result } = renderHook(() => useUpdateProjectBOQ(projectId), { wrapper });

    result.current.mutate({ boqId, payload: { isCcoComplete: false } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toastSuccessSpy).toHaveBeenCalledWith({
      title: 'BoQ Execution dibatalkan complete.',
    });
  });

  it('should handle error when updating project BOQ fails', async () => {
    const toastErrorSpy = vi.spyOn(toast, 'error');
    vi.spyOn(updateProjectBOQAPI, 'updateProjectBOQ').mockRejectedValue(
      new Error('Gagal memperbarui BOQ project')
    );

    const projectId = 'proj-001';
    const boqId = 'boq-001';

    const { result } = renderHook(() => useUpdateProjectBOQ(projectId), { wrapper });

    result.current.mutate({ boqId, payload: { isRabComplete: true } });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(toastErrorSpy).toHaveBeenCalled();
  });
});
