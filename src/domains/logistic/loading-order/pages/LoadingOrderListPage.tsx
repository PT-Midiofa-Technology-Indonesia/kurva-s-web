'use client';

import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { useWarehousesInfinite } from '@/domains/warehouse';
import { useQueryParams } from '@/hooks/use-query-params';
import { AsyncSelect, Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DatePicker } from '@/shared/components/molecules/DatePicker/DatePicker';
import { ListPageTemplate } from '@/shared/components/templates/ListPageTemplate';
import { useCompanyFilter } from '@/shared/hooks/use-company-filter';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { BaseQueryParams } from '@/types/query-params';
import { LoadingOrderDetailDrawer } from '../components/LoadingOrderDetailDrawer';
import { LoadingOrderFormDrawer } from '../components/LoadingOrderFormDrawer';
import { createLoadingOrderColumns } from '../components/loading-order-columns';
import {
  LOADING_ORDER_LABELS,
  LOADING_ORDER_SOURCE_TYPE_OPTIONS,
  LOADING_ORDER_STATUS_OPTIONS,
} from '../constants';
import {
  useCancelLoadingOrder,
  useDeleteLoadingOrder,
  useLoadingOrdersQuery,
  useLoadLoadingOrder,
  usePrepareLoadingOrder,
} from '../hooks';
import type { LoadingOrder, LoadingOrderSourceType, LoadingOrderStatus } from '../types';

interface LoadingOrderUrlParams extends BaseQueryParams {
  companyId?: string;
  sourceType?: string;
  status?: string;
  warehouseId?: string;
  dateFrom?: string;
  dateTo?: string;
}

type LoadingOrderAction = 'prepare' | 'load' | 'cancel' | 'delete';

function toDate(value?: string) {
  return value ? new Date(`${value}T00:00:00`) : undefined;
}

function toDateRange(dateFrom?: string, dateTo?: string): DateRange | undefined {
  if (!dateFrom && !dateTo) return undefined;
  return {
    from: toDate(dateFrom),
    to: toDate(dateTo),
  };
}

export function LoadingOrderListPage() {
  const { queryParams, setQueryParams } = useQueryParams<LoadingOrderUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formEditId, setFormEditId] = useState<string | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    action: LoadingOrderAction;
    item: LoadingOrder;
  } | null>(null);
  const { mutateAsync: prepareLoadingOrder, isPending: isPreparing } = usePrepareLoadingOrder();
  const { mutateAsync: loadLoadingOrder, isPending: isLoadingAction } = useLoadLoadingOrder();
  const { mutateAsync: cancelLoadingOrder, isPending: isCancelling } = useCancelLoadingOrder();
  const { mutateAsync: deleteLoadingOrder, isPending: isDeleting } = useDeleteLoadingOrder();

  const { options: warehouseOptions } = useWarehousesInfinite({
    companyId: companyId ?? undefined,
    includeCompanyIdParam: true,
    enabled: !!companyId,
    isActive: true,
    perPage: 20,
  });

  const params = useMemo(
    () => ({
      companyId,
      page: queryParams.page ?? 1,
      perPage: queryParams.perPage ?? 10,
      sortBy: queryParams.sortBy ?? 'createdAt',
      sortOrder: (queryParams.sortOrder || 'desc') as 'asc' | 'desc',
      search: queryParams.search,
      sourceType: queryParams.sourceType as LoadingOrderSourceType | undefined,
      status: queryParams.status as LoadingOrderStatus | undefined,
      warehouseId: queryParams.warehouseId,
      dateFrom: queryParams.dateFrom,
      dateTo: queryParams.dateTo,
    }),
    [companyId, queryParams]
  );

  const { data: loadingOrderResponse, isLoading, isError } = useLoadingOrdersQuery(params);
  const loadingOrders = loadingOrderResponse?.success ? loadingOrderResponse.data : [];
  const totalItems = loadingOrderResponse?.meta.total ?? 0;
  const totalPages = loadingOrderResponse?.meta.lastPage ?? 1;

  const columns = useMemo(
    () =>
      createLoadingOrderColumns({
        onView: (item: LoadingOrder) => setDetailTarget(item.id),
        onEdit: (item: LoadingOrder) => {
          setFormEditId(item.id);
          setFormOpen(true);
        },
        onPrepare: (item: LoadingOrder) => setActionTarget({ action: 'prepare', item }),
        onLoad: (item: LoadingOrder) => setActionTarget({ action: 'load', item }),
        onCancel: (item: LoadingOrder) => setActionTarget({ action: 'cancel', item }),
        onDelete: (item: LoadingOrder) => setActionTarget({ action: 'delete', item }),
      }),
    []
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setQueryParams({ search: value, page: 1 } as Partial<LoadingOrderUrlParams>);
    },
    [setQueryParams]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      setQueryParams({
        sortBy: sortBy || undefined,
        sortOrder,
        page: 1,
      } as Partial<LoadingOrderUrlParams>);
    },
    [setQueryParams]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      setQueryParams({ page, perPage } as Partial<LoadingOrderUrlParams>);
    },
    [setQueryParams]
  );

  const headerActions = useMemo(
    () => (
      <div className="flex items-center gap-2">
        <AsyncSelect
          className="w-52"
          options={companyOptions}
          value={companyId ?? null}
          onChange={handleCompanyChange}
          placeholder="Company"
          isSearchable={false}
          isClearable={false}
        />
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          variant="default"
          onClick={() => {
            setFormEditId(null);
            setFormOpen(true);
          }}
          disabled={!companyId}
        >
          {LOADING_ORDER_LABELS.LIST.BUTTONS.ADD}
        </Button>
      </div>
    ),
    [companyId, companyOptions, handleCompanyChange]
  );

  const toolbarRight = useMemo(
    () => (
      <div className="flex flex-wrap items-center gap-2">
        <DatePicker
          mode="range"
          className="w-64"
          value={toDateRange(queryParams.dateFrom, queryParams.dateTo)}
          onChange={(range) => {
            const dateRange = range as DateRange | undefined;
            setQueryParams({
              dateFrom: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
              dateTo: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
              page: 1,
            } as Partial<LoadingOrderUrlParams>);
          }}
          rangePlaceholder="Date range"
        />
        <AsyncSelect
          className="w-48"
          options={LOADING_ORDER_SOURCE_TYPE_OPTIONS}
          placeholder="Source type"
          value={queryParams.sourceType ?? ''}
          isSearchable={false}
          onChange={(value) => {
            const sourceType = Array.isArray(value) ? value[0] : value;
            setQueryParams({
              sourceType: sourceType || undefined,
              page: 1,
            } as Partial<LoadingOrderUrlParams>);
          }}
          isClearable
        />
        <AsyncSelect
          className="w-48"
          options={LOADING_ORDER_STATUS_OPTIONS}
          placeholder="Status"
          value={queryParams.status ?? ''}
          isSearchable={false}
          onChange={(value) => {
            const status = Array.isArray(value) ? value[0] : value;
            setQueryParams({
              status: status || undefined,
              page: 1,
            } as Partial<LoadingOrderUrlParams>);
          }}
          isClearable
        />
        <AsyncSelect
          className="w-52"
          options={warehouseOptions}
          placeholder="Warehouse"
          value={queryParams.warehouseId ?? ''}
          isSearchable
          onChange={(value) => {
            const warehouseId = Array.isArray(value) ? value[0] : value;
            setQueryParams({
              warehouseId: warehouseId || undefined,
              page: 1,
            } as Partial<LoadingOrderUrlParams>);
          }}
          isClearable
        />
      </div>
    ),
    [queryParams, setQueryParams, warehouseOptions]
  );

  const handleDetailClose = useCallback(() => {
    setDetailTarget(null);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
    setFormEditId(null);
  }, []);

  return (
    <>
      <ListPageTemplate<LoadingOrder>
        title={LOADING_ORDER_LABELS.LIST.TITLE}
        headerActions={headerActions}
        search={queryParams.search}
        searchPlaceholder={LOADING_ORDER_LABELS.LIST.SEARCH}
        onSearchChange={handleSearchChange}
        toolbarRight={toolbarRight}
        data={loadingOrders}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={LOADING_ORDER_LABELS.LIST.EMPTY}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
      />

      <LoadingOrderDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        loadingOrderId={detailTarget}
        companyId={companyId ?? null}
      />

      <ConfirmDialog
        open={actionTarget !== null}
        onOpenChange={(value) => {
          if (!value) setActionTarget(null);
        }}
        variant={actionTarget?.action === 'delete' ? 'danger' : 'default'}
        title={
          actionTarget?.action === 'prepare'
            ? LOADING_ORDER_LABELS.DIALOG.PREPARE_TITLE
            : actionTarget?.action === 'load'
              ? LOADING_ORDER_LABELS.DIALOG.LOAD_TITLE
              : actionTarget?.action === 'cancel'
                ? LOADING_ORDER_LABELS.DIALOG.CANCEL_TITLE
                : LOADING_ORDER_LABELS.DIALOG.DELETE_TITLE
        }
        description={
          actionTarget?.action === 'prepare'
            ? LOADING_ORDER_LABELS.DIALOG.PREPARE_DESCRIPTION
            : actionTarget?.action === 'load'
              ? LOADING_ORDER_LABELS.DIALOG.LOAD_DESCRIPTION
              : actionTarget?.action === 'cancel'
                ? LOADING_ORDER_LABELS.DIALOG.CANCEL_DESCRIPTION
                : LOADING_ORDER_LABELS.DIALOG.DELETE_DESCRIPTION
        }
        cancelText="Batal"
        confirmText="Ya, Lanjutkan"
        isLoading={isPreparing || isLoadingAction || isCancelling || isDeleting}
        onCancel={() => setActionTarget(null)}
        onConfirm={async () => {
          if (!actionTarget || !companyId) return;

          try {
            const variables = { id: actionTarget.item.id, companyId };
            if (actionTarget.action === 'prepare') {
              await prepareLoadingOrder(variables);
            } else if (actionTarget.action === 'load') {
              await loadLoadingOrder(variables);
            } else if (actionTarget.action === 'cancel') {
              await cancelLoadingOrder(variables);
            } else {
              await deleteLoadingOrder(variables);
            }
            setActionTarget(null);
          } catch (error) {
            toast.error({ title: getErrorMessage(error) });
            setActionTarget(null);
          }
        }}
      />

      <LoadingOrderFormDrawer
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormClose}
        editId={formEditId}
        companyId={companyId ?? null}
      />
    </>
  );
}
