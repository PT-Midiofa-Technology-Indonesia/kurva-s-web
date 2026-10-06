import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { CreateAssetCategoryPayload } from '../../api/create-asset-category';
import type { UpdateAssetCategoryPayload } from '../../api/update-asset-category';
import { useAssetCategoryPage } from '../use-asset-category-page';
import { useCreateAssetCategoryPage } from '../use-create-asset-category-page';
import { useEditAssetCategoryPage } from '../use-edit-asset-category-page';

const { mockPush, mockCreate, mockUpdate } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('../use-asset-categories', () => ({
  useAssetCategories: () => ({
    data: { data: [], meta: { total: 0, lastPage: 1 } },
    isLoading: false,
    isError: false,
  }),
}));

vi.mock('../use-delete-asset-category', () => ({
  useDeleteAssetCategory: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('../use-create-asset-category', () => ({
  useCreateAssetCategory: () => ({
    mutate: mockCreate,
    isPending: false,
  }),
}));

vi.mock('../use-asset-category', () => ({
  useAssetCategory: () => ({
    data: {
      data: {
        id: 'category-1',
        code: 'CAT-001',
        name: 'Laptop',
      },
    },
    isLoading: false,
  }),
}));

vi.mock('../use-update-asset-category', () => ({
  useUpdateAssetCategory: () => ({
    mutate: mockUpdate,
    isPending: false,
  }),
}));

describe('Asset Category navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('opens the new create route', () => {
    const { result } = renderHook(() => useAssetCategoryPage());

    act(() => result.current.handleAdd());

    expect(mockPush).toHaveBeenCalledWith('/asset-management/asset-category/create');
  });

  it('opens the new edit route', () => {
    const { result } = renderHook(() => useAssetCategoryPage());

    act(() =>
      result.current.handleEdit({
        id: 'category-1',
      } as Parameters<typeof result.current.handleEdit>[0])
    );

    expect(mockPush).toHaveBeenCalledWith('/asset-management/asset-category/category-1/edit');
  });

  it('opens the new edit route from the detail drawer', () => {
    const { result } = renderHook(() => useAssetCategoryPage());

    act(() =>
      result.current.handleDetail({
        id: 'category-1',
      } as Parameters<typeof result.current.handleDetail>[0])
    );
    act(() => result.current.handleDetailEdit());

    expect(mockPush).toHaveBeenCalledWith('/asset-management/asset-category/category-1/edit');
  });

  it('returns from create to the category list', () => {
    const { result } = renderHook(() => useCreateAssetCategoryPage());

    act(() => result.current.handleCancel());

    expect(mockPush).toHaveBeenCalledWith('/asset-management/asset-category');
  });

  it('returns from edit to the category list', () => {
    const { result } = renderHook(() => useEditAssetCategoryPage('category-1'));

    act(() => result.current.handleCancel());

    expect(mockPush).toHaveBeenCalledWith('/asset-management/asset-category');
  });

  it('returns to the category list after create succeeds', () => {
    mockCreate.mockImplementation(
      (_payload: CreateAssetCategoryPayload, options: { onSuccess: () => void }) => {
        options.onSuccess();
      }
    );
    const payload = {
      code: 'CAT-001',
      name: 'Laptop',
      usefulLifeMonths: 48,
    } satisfies CreateAssetCategoryPayload;
    const { result } = renderHook(() => useCreateAssetCategoryPage());

    act(() => result.current.handleBeforeSubmit(payload));
    act(() => result.current.handleConfirmSubmit());

    expect(mockPush).toHaveBeenCalledWith('/asset-management/asset-category');
  });

  it('returns to the category list after edit succeeds', () => {
    mockUpdate.mockImplementation(
      (_payload: UpdateAssetCategoryPayload, options: { onSuccess: () => void }) => {
        options.onSuccess();
      }
    );
    const payload = {
      name: 'Laptop Updated',
      usefulLifeMonths: 60,
    } satisfies UpdateAssetCategoryPayload;
    const { result } = renderHook(() => useEditAssetCategoryPage('category-1'));

    act(() => result.current.handleBeforeSubmit(payload));
    act(() => result.current.handleConfirmSubmit());

    expect(mockPush).toHaveBeenCalledWith('/asset-management/asset-category');
  });
});
