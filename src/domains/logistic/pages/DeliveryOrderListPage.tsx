'use client';

import { PlusIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { useDeliveryOrderStatuses } from '@/shared/hooks/use-enums';
import type { BaseQueryParams } from '@/shared/types/query-params';
import { createDeliveryOrderColumns } from '../components/delivery-order-columns';
import { DO_SOURCE_TYPE_OPTIONS, LOGISTIC_LABELS, LOGISTIC_PAGE_CONFIGS } from '../constants';
import { useDeliveryOrderPage } from '../hooks/use-delivery-order-page';
import type { DeliveryOrder, DeliveryOrderType } from '../types';

interface DeliveryOrderUrlParams extends BaseQueryParams {
  companyId?: string;
  status?: string;
  sourceType?: string;
}

interface DeliveryOrderListPageProps {
  type: DeliveryOrderType;
}

export function DeliveryOrderListPage({ type }: DeliveryOrderListPageProps) {
  const router = useRouter();
  const config = LOGISTIC_PAGE_CONFIGS[type];
  const { queryParams, updateQueryParam, setQueryParams } =
    useQueryParams<DeliveryOrderUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();

  const { data: statusOptions = [] } = useDeliveryOrderStatuses();

  const params = useMemo(
    () => ({
      type,
      companyId,
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'code',
      sortOrder: (queryParams.sortOrder || 'desc') as 'asc' | 'desc',
      search: queryParams.search,
      status: queryParams.status,
      sourceType: queryParams.sourceType,
    }),
    [queryParams, type, companyId]
  );

  const pageOptions = useMemo(
    () => ({
      type,
      params,
      onUpdateQueryParam: updateQueryParam,
      onSetQueryParams: setQueryParams,
    }),
    [type, params, updateQueryParam, setQueryParams]
  );

  const {
    items,
    totalItems,
    totalPages,
    isLoading,
    isError,
    handleAdd,
    handleSearchChange,
    handleSort,
    handlePaginationChange,
    handleFilterChange,
  } = useDeliveryOrderPage(pageOptions);

  const handleView = useCallback(
    (item: DeliveryOrder) => {
      const basePath =
        type === 'inbound'
          ? '/logistic/inbound'
          : type === 'outbond'
            ? '/logistic/outbound'
            : '/logistic/delivery-order';
      const query = companyId ? `?companyId=${companyId}` : '';
      router.push(`${basePath}/${item.id}${query}`);
    },
    [router, type, companyId]
  );

  const handleEdit = useCallback(
    (item: DeliveryOrder) => {
      const query = companyId ? `?companyId=${companyId}` : '';
      router.push(`/logistic/delivery-order/${item.id}/edit${query}`);
    },
    [router, companyId]
  );

  const columns = useMemo(
    () =>
      createDeliveryOrderColumns({
        showSource: config.showSource,
        showDestination: config.showDestination,
        onView: handleView,
        onEdit: type === 'do' ? handleEdit : undefined,
      }),
    [config.showSource, config.showDestination, handleView, handleEdit, type]
  );

  const handleSearch = useCallback(
    (value: string | undefined) => handleSearchChange(value ?? ''),
    [handleSearchChange]
  );

  // === Filters per page type ===
  const filters = useMemo(() => {
    const filterElements: React.ReactNode[] = [];

    if (type === 'do' || type === 'inbound') {
      filterElements.push(
        <AsyncSelect
          key="status"
          className="w-48"
          options={statusOptions}
          placeholder="Status"
          value={queryParams.status ?? ''}
          isSearchable={false}
          onChange={(v) => {
            const val = Array.isArray(v) ? v[0] : v;
            handleFilterChange('status', val || undefined);
          }}
          isClearable
        />
      );
    }

    if (type === 'do') {
      filterElements.push(
        <AsyncSelect
          key="sourceType"
          className="w-52"
          options={DO_SOURCE_TYPE_OPTIONS}
          placeholder="Type"
          value={queryParams.sourceType ?? ''}
          isSearchable={false}
          onChange={(v) => {
            const val = Array.isArray(v) ? v[0] : v;
            handleFilterChange('sourceType', val || undefined);
          }}
          isClearable
        />
      );
    }

    if (type === 'inbound') {
      filterElements.push(
        <AsyncSelect
          key="sourceType"
          className="w-52"
          options={DO_SOURCE_TYPE_OPTIONS}
          placeholder="Source Type"
          value={queryParams.sourceType ?? ''}
          isSearchable={false}
          onChange={(v) => {
            const val = Array.isArray(v) ? v[0] : v;
            handleFilterChange('sourceType', val || undefined);
          }}
          isClearable
        />
      );
    }

    return <>{filterElements}</>;
  }, [type, queryParams.status, queryParams.sourceType, handleFilterChange, statusOptions]);

  // === Header actions ===
  const headerActions = useMemo(
    () => (
      <div className="flex items-center gap-3">
        <AsyncSelect
          className="w-52"
          options={companyOptions}
          value={companyId ?? null}
          onChange={handleCompanyChange}
          placeholder="Company"
          isSearchable={false}
          isClearable={false}
        />
        {type === 'do' && (
          <Button onClick={handleAdd} leftIcon={<PlusIcon />}>
            {LOGISTIC_LABELS.LIST.BUTTONS.ADD_DO}
          </Button>
        )}
      </div>
    ),
    [type, handleAdd, companyOptions, companyId, handleCompanyChange]
  );

  return (
    <ListPageTemplate<DeliveryOrder>
      title={config.title}
      headerActions={headerActions}
      data={items}
      columns={columns}
      isLoading={isLoading}
      isError={isError}
      emptyMessage={LOGISTIC_LABELS.LIST.EMPTY}
      search={queryParams.search}
      onSearchChange={handleSearch}
      sortBy={params.sortBy}
      sortOrder={params.sortOrder}
      onSort={handleSort}
      page={params.page}
      perPage={params.perPage}
      totalItems={totalItems}
      totalPages={totalPages}
      onPaginationChange={handlePaginationChange}
      toolbarRight={filters}
    />
  );
}
