'use client';

import { useCallback, useState } from 'react';
import { useWarehousesInfinite } from '@/domains/warehouse/hooks/use-warehouses-infinite';
import { AsyncSelect } from '@/shared/components/atoms';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { STOCK_MONITORING_LABELS } from '../constants';

interface WarehouseFilterProps {
  value?: string;
  onChange: (value: string | string[] | null | undefined) => void;
  companyId?: string;
}

/**
 * Clearing the select means "all warehouses" — no synthetic option is needed,
 * the cleared state simply drops the warehouseId param.
 */
export function WarehouseFilter({ value, onChange, companyId }: WarehouseFilterProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  const { options, hasMore, isFetchingNextPage, loadMore } = useWarehousesInfinite({
    search: debouncedSearch,
    companyId,
    enabled: !!companyId,
  });

  const handleScrollToBottom = useCallback(() => {
    if (hasMore && !isFetchingNextPage) loadMore();
  }, [hasMore, isFetchingNextPage, loadMore]);

  const handleSearchChange = useCallback((v: string) => setSearch(v), []);

  return (
    <AsyncSelect
      className="w-56 focus:ring-1 ring-primary"
      options={options}
      value={value}
      placeholder={STOCK_MONITORING_LABELS.ALL_WAREHOUSES}
      isSearchable
      isClearable
      onChange={onChange}
      onScrollToBottom={handleScrollToBottom}
      onSearchChange={handleSearchChange}
    />
  );
}
