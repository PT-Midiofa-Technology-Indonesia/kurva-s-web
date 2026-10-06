import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSelectedCompanyStore } from '@/shared/store/selected-company';
import { useCompanyFilter } from './use-company-filter';

const mockPush = vi.fn();
const mockUseSearchParams = vi.fn(() => new URLSearchParams());

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => '/project-control/boq-management',
  useSearchParams: () => mockUseSearchParams(),
}));

vi.mock('@/domains/company/hooks/use-companies-infinite', () => ({
  useCompaniesInfinite: () => ({
    options: [
      { value: 'comp-1', label: 'Company 1' },
      { value: 'comp-2', label: 'Company 2' },
    ],
  }),
}));

describe('useCompanyFilter', () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockUseSearchParams.mockReset();
    useSelectedCompanyStore.setState({ selectedCompanyId: null });
  });

  it('ignores a stale persisted company id and falls back to the first option', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    useSelectedCompanyStore.setState({ selectedCompanyId: 'deleted-company' });

    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() => useCompanyFilter());

    expect(result.current.companyId).toBe('comp-1');
    expect(useSelectedCompanyStore.getState().selectedCompanyId).toBe('comp-1');
    expect(pushStateSpy).toHaveBeenCalledWith(
      {},
      '',
      '/project-control/boq-management?companyId=comp-1'
    );

    pushStateSpy.mockRestore();
  });

  it('ignores a stale URL company id in favour of a valid persisted one', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('companyId=deleted-company'));
    useSelectedCompanyStore.setState({ selectedCompanyId: 'comp-2' });

    const { result } = renderHook(() => useCompanyFilter());

    expect(result.current.companyId).toBe('comp-2');
    expect(useSelectedCompanyStore.getState().selectedCompanyId).toBe('comp-2');
  });

  it('keeps a valid persisted company id across sessions', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
    useSelectedCompanyStore.setState({ selectedCompanyId: 'comp-2' });

    const { result } = renderHook(() => useCompanyFilter());

    expect(result.current.companyId).toBe('comp-2');
  });

  it('preserves tab query parameter when changing company', () => {
    mockUseSearchParams.mockReturnValue(
      new URLSearchParams('companyId=comp-1&tab=execution&page=2&search=foo')
    );
    window.history.replaceState(
      {},
      '',
      '/project-control/boq-management?companyId=comp-1&tab=execution&page=2&search=foo'
    );

    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() => useCompanyFilter());

    act(() => {
      result.current.handleCompanyChange('comp-2');
    });

    expect(pushStateSpy).toHaveBeenCalledWith(
      {},
      '',
      '/project-control/boq-management?companyId=comp-2&tab=execution'
    );

    pushStateSpy.mockRestore();
  });

  it('drops other params and does not include tab if tab is not present', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('companyId=comp-1&page=2&search=foo'));
    window.history.replaceState(
      {},
      '',
      '/project-control/boq-management?companyId=comp-1&page=2&search=foo'
    );

    const pushStateSpy = vi.spyOn(window.history, 'pushState');
    const { result } = renderHook(() => useCompanyFilter());

    act(() => {
      result.current.handleCompanyChange('comp-2');
    });

    expect(pushStateSpy).toHaveBeenCalledWith(
      {},
      '',
      '/project-control/boq-management?companyId=comp-2'
    );

    pushStateSpy.mockRestore();
  });
});
