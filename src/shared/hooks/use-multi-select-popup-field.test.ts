import { act, renderHook } from '@testing-library/react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { useMultiSelectPopupField } from './use-multi-select-popup-field';

interface ApiItem {
  id: string;
  code: string;
}

interface FieldShape {
  refId: string;
  code: string;
}

function setup(initialItems: ApiItem[] = []) {
  const useInfiniteHook = vi.fn(() => ({
    items: initialItems,
    isLoading: false,
    hasMore: false,
    loadMore: vi.fn(),
  }));

  const formResult = renderHook(() =>
    useForm<{ refs: FieldShape[] }>({ defaultValues: { refs: [] } })
  );

  const hookResult = renderHook(() =>
    useMultiSelectPopupField<FieldShape, ApiItem>({
      control: formResult.result.current.control as any,
      fieldArrayName: 'refs',
      selectIdKey: 'refId',
      useInfiniteHook,
      mapApiItemToPopupItem: (item) => ({ id: item.id, label: item.code }),
      mapApiItemToFieldValue: (item) => ({ refId: item.id, code: item.code }),
    })
  );

  return { hookResult, useInfiniteHook };
}

describe('useMultiSelectPopupField', () => {
  it('starts with an empty fields array and popup closed', () => {
    const { hookResult } = setup();
    expect(hookResult.result.current.fields).toEqual([]);
    expect(hookResult.result.current.popupOpen).toBe(false);
  });

  it('handleOpenPopup opens the popup', () => {
    const { hookResult } = setup();
    act(() => hookResult.result.current.handleOpenPopup());
    expect(hookResult.result.current.popupOpen).toBe(true);
  });

  it('handleSelect appends new items mapped via mapApiItemToFieldValue and closes the popup', () => {
    const { hookResult } = setup([{ id: 'a1', code: 'PO-001' }]);
    act(() => hookResult.result.current.handleOpenPopup());
    act(() => hookResult.result.current.handleSelect([{ id: 'a1', label: 'PO-001' }]));
    expect(hookResult.result.current.fields).toHaveLength(1);
    expect(hookResult.result.current.fields[0]).toMatchObject({ refId: 'a1', code: 'PO-001' });
    expect(hookResult.result.current.popupOpen).toBe(false);
  });

  it('handleSelect does not duplicate an already-selected item', () => {
    const { hookResult } = setup([{ id: 'a1', code: 'PO-001' }]);
    act(() => hookResult.result.current.handleSelect([{ id: 'a1', label: 'PO-001' }]));
    act(() => hookResult.result.current.handleSelect([{ id: 'a1', label: 'PO-001' }]));
    expect(hookResult.result.current.fields).toHaveLength(1);
  });

  it('remove(index) removes the field at that index', () => {
    const { hookResult } = setup([
      { id: 'a1', code: 'PO-001' },
      { id: 'a2', code: 'PO-002' },
    ]);
    act(() =>
      hookResult.result.current.handleSelect([
        { id: 'a1', label: 'PO-001' },
        { id: 'a2', label: 'PO-002' },
      ])
    );
    expect(hookResult.result.current.fields).toHaveLength(2);
    act(() => hookResult.result.current.remove(0));
    expect(hookResult.result.current.fields).toHaveLength(1);
    expect(hookResult.result.current.fields[0]).toMatchObject({ refId: 'a2' });
  });

  it('handleToggle updates popupSelected without appending to the field array', () => {
    const { hookResult } = setup([{ id: 'a1', code: 'PO-001' }]);
    act(() => hookResult.result.current.handleToggle([{ id: 'a1', label: 'PO-001' }]));
    expect(hookResult.result.current.popupSelected).toEqual([{ id: 'a1', label: 'PO-001' }]);
    expect(hookResult.result.current.fields).toEqual([]);
  });
});
