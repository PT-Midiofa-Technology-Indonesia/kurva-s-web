import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import * as setBOQLimitBudgetAPI from '@/domains/project-control/api/set-boq-limit-budget';
import { toast } from '@/shared/lib/toast';
import { BOQ_PROJECT_QUERY_KEYS } from '../use-boq-projects';
import { PROJECT_BOQ_QUERY_KEYS } from '../use-project-boq';
import { useSetBOQLimitBudget } from '../use-set-boq-limit-budget';

const queryClient = new QueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useSetBOQLimitBudget', () => {
  beforeEach(() => {
    queryClient.clear();
    vi.spyOn(setBOQLimitBudgetAPI, 'setBOQLimitBudget').mockReset();
  });

  it('should successfully set BOQ limit budget and invalidate queries', async () => {
    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const toastSuccessSpy = vi.spyOn(toast, 'success');
    vi.spyOn(setBOQLimitBudgetAPI, 'setBOQLimitBudget').mockResolvedValue({
      data: null,
      message: 'OK',
      success: true,
    });

    const projectId = 'project-123';
    const payload = { limitBudgetPercentage: 80 };

    const { result } = renderHook(() => useSetBOQLimitBudget(), { wrapper });

    result.current.mutate({ projectId, payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(setBOQLimitBudgetAPI.setBOQLimitBudget).toHaveBeenCalledWith(projectId, payload);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: BOQ_PROJECT_QUERY_KEYS.all });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: PROJECT_BOQ_QUERY_KEYS.detail(projectId),
    });
    expect(toastSuccessSpy).toHaveBeenCalled();
  });

  it('should handle error when setting BOQ limit budget', async () => {
    const toastErrorSpy = vi.spyOn(toast, 'error');
    vi.spyOn(setBOQLimitBudgetAPI, 'setBOQLimitBudget').mockRejectedValue(
      new Error('Gagal memperbarui limit budget')
    );

    const projectId = 'project-123';
    const payload = { limitBudgetPercentage: 80 };

    const { result } = renderHook(() => useSetBOQLimitBudget(), { wrapper });

    result.current.mutate({ projectId, payload });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(setBOQLimitBudgetAPI.setBOQLimitBudget).toHaveBeenCalledWith(projectId, payload);
    expect(toastErrorSpy).toHaveBeenCalled();
  });
});
