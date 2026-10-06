import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQueryParams } from './use-query-params';

const mockPush = vi.fn();
const mockUseSearchParams = vi.fn(() => new URLSearchParams());

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/user-management/user',
  useSearchParams: () => mockUseSearchParams(),
}));

describe('useQueryParams', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseSearchParams.mockReset();
    mockUseSearchParams.mockReturnValue(new URLSearchParams('userType=non_employee'));
    window.history.replaceState({}, '', '/user-management/user?userType=non_employee');
  });

  it('updates query-only changes with window history instead of router navigation', () => {
    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() => useQueryParams<{ userType?: string }>());

    act(() => {
      result.current.updateQueryParam('userType', 'employee');
    });

    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/user-management/user?userType=employee');
    expect(mockPush).not.toHaveBeenCalled();

    pushStateSpy.mockRestore();
  });

  it('replaceQueryParams fully replaces query state and drops params not in the new object', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('companyId=old-co&page=2&perPage=10&search=foo')
    );
    window.history.replaceState(
      {},
      '',
      '/user-management/user?companyId=old-co&page=2&perPage=10&search=foo'
    );

    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() =>
      useQueryParams<{ companyId?: string; page?: number; perPage?: number; search?: string }>()
    );

    act(() => {
      result.current.replaceQueryParams({ companyId: 'new-co' });
    });

    expect(pushStateSpy).toHaveBeenCalledWith({}, '', '/user-management/user?companyId=new-co');
    expect(mockPush).not.toHaveBeenCalled();

    pushStateSpy.mockRestore();
  });

  it('replaceQueryParams preserves only the params explicitly passed', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('companyId=old-co&tab=task-control&page=3&status=open')
    );
    window.history.replaceState(
      {},
      '',
      '/user-management/user?companyId=old-co&tab=task-control&page=3&status=open'
    );

    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() =>
      useQueryParams<{ companyId?: string; tab?: string; page?: number; status?: string }>()
    );

    act(() => {
      result.current.replaceQueryParams({ companyId: 'new-co', tab: 'task-control' });
    });

    expect(pushStateSpy).toHaveBeenCalledWith(
      {},
      '',
      '/user-management/user?companyId=new-co&tab=task-control'
    );

    pushStateSpy.mockRestore();
  });
});
