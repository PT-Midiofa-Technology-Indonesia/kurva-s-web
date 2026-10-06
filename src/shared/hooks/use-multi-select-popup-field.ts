'use client';

import { useCallback, useMemo, useState } from 'react';
import { type Control, useFieldArray } from 'react-hook-form';
import type { MultiSelectPopupItem } from '@/shared/components/molecules/MultiSelectPopup/MultiSelectPopup';
import { useDebounce } from './use-debounce';

export interface UseMultiSelectPopupFieldOptions<TField extends Record<string, any>, TApiItem> {
  control: Control<any>;
  fieldArrayName: string;
  selectIdKey: keyof TField;
  useInfiniteHook: (opts: { search: string; enabled: boolean }) => {
    items: TApiItem[];
    isLoading: boolean;
    hasMore: boolean;
    loadMore: () => void;
  };
  mapApiItemToPopupItem: (item: TApiItem) => MultiSelectPopupItem;
  mapApiItemToFieldValue: (item: TApiItem) => TField;
}

export function useMultiSelectPopupField<TField extends Record<string, any>, TApiItem>({
  control,
  fieldArrayName,
  selectIdKey,
  useInfiniteHook,
  mapApiItemToPopupItem,
  mapApiItemToFieldValue,
}: UseMultiSelectPopupFieldOptions<TField, TApiItem>) {
  const { fields, append, remove } = useFieldArray({ control, name: fieldArrayName as any });

  const [popupOpen, setPopupOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const {
    items: apiItems,
    isLoading,
    hasMore,
    loadMore,
  } = useInfiniteHook({
    search: debouncedSearch,
    enabled: popupOpen,
  });

  const selectedIds = useMemo(
    () => (fields as unknown as TField[]).map((f) => String(f[selectIdKey])),
    [fields, selectIdKey]
  );

  const popupItems: MultiSelectPopupItem[] = useMemo(
    () => apiItems.map(mapApiItemToPopupItem),
    [apiItems, mapApiItemToPopupItem]
  );

  const [popupSelected, setPopupSelected] = useState<MultiSelectPopupItem[]>([]);

  const handleOpenPopup = useCallback(() => {
    setPopupSelected(popupItems.filter((item) => selectedIds.includes(item.id)));
    setPopupOpen(true);
  }, [popupItems, selectedIds]);

  const handleSelect = useCallback(
    (items: MultiSelectPopupItem[]) => {
      const existingIds = new Set(selectedIds);
      for (const item of items) {
        if (!existingIds.has(item.id)) {
          const apiItem = apiItems.find((ai) => String(mapApiItemToPopupItem(ai).id) === item.id);
          if (apiItem) {
            append(mapApiItemToFieldValue(apiItem) as any);
          }
        }
      }
      setPopupOpen(false);
      setSearch('');
      setPopupSelected([]);
    },
    [selectedIds, apiItems, append, mapApiItemToFieldValue, mapApiItemToPopupItem]
  );

  const handleToggle = useCallback((items: MultiSelectPopupItem[]) => {
    setPopupSelected(items);
  }, []);

  return {
    fields: fields as unknown as (TField & { id: string })[],
    remove,
    popupOpen,
    setPopupOpen,
    search,
    setSearch,
    popupItems,
    popupSelected,
    isLoading,
    hasMore,
    loadMore,
    handleOpenPopup,
    handleSelect,
    handleToggle,
  };
}
