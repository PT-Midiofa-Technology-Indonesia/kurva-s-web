'use client';

import { useCallback, useState } from 'react';
import { useWarehousesInfinite } from '@/domains/warehouse/hooks/use-warehouses-infinite';
import { AsyncSelect } from '@/shared/components/atoms';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { ASSET_CATALOG_LABELS } from '../constants';

interface AssetCatalogWarehouseFilterProps {
  value?: string;
  onChange: (value: string | string[] | null | undefined) => void;
  companyId?: string;
}

export function AssetCatalogWarehouseFilter({
  value,
  onChange,
  companyId,
}: AssetCatalogWarehouseFilterProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const { options, isLoading, hasMore, isFetchingNextPage, loadMore } = useWarehousesInfinite({
    search: debouncedSearch,
    companyId,
    enabled: !!companyId,
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
      placeholder={ASSET_CATALOG_LABELS.LIST.FILTERS.WAREHOUSE}
      isLoading={isLoading}
      isSearchable
      isClearable
      onSearchChange={setSearch}
      onScrollToBottom={handleScrollToBottom}
    />
  );
}
