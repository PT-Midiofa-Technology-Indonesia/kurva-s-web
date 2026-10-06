'use client';

import { useCallback, useState } from 'react';
import { AsyncSelect } from '@/shared/components/atoms';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { ASSET_CATALOG_LABELS } from '../constants';
import { useAssetCategoriesInfinite } from '../hooks/use-asset-categories-infinite';

interface AssetCatalogCategoryFilterProps {
  value?: string;
  onChange: (value: string | string[] | null | undefined) => void;
}

export function AssetCatalogCategoryFilter({ value, onChange }: AssetCatalogCategoryFilterProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const { options, isLoading, hasMore, isFetchingNextPage, loadMore } = useAssetCategoriesInfinite({
    search: debouncedSearch,
    isActive: true,
  });

  const handleScrollToBottom = useCallback(() => {
    if (hasMore && !isFetchingNextPage) loadMore();
  }, [hasMore, isFetchingNextPage, loadMore]);

  return (
    <AsyncSelect
      className="w-52"
      options={options}
      value={value ?? null}
      onChange={onChange}
      placeholder={ASSET_CATALOG_LABELS.LIST.FILTERS.CATEGORY}
      isLoading={isLoading}
      isSearchable
      isClearable
      onSearchChange={setSearch}
      onScrollToBottom={handleScrollToBottom}
    />
  );
}
