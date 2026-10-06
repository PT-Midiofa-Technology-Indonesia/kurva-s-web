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
import { usePickupOrderStatuses, usePickupOrderTypes } from '@/shared/hooks/use-enums';
import { getErrorMessage } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import type { BaseQueryParams } from '@/types/query-params';
import { PickupOrderChangeEmployeeDialog } from '../components/PickupOrderChangeEmployeeDialog';
import { PickupOrderDetailDrawer } from '../components/PickupOrderDetailDrawer';
import { PickupOrderFormDrawer } from '../components/PickupOrderFormDrawer';
import { createPickupOrderColumns } from '../components/pickup-order-columns';
import { PICKUP_ORDER_LABELS } from '../constants';
import { useCancelPickupOrder, useCompletePickupOrder, usePickupOrdersQuery } from '../hooks';
import type { PickupOrder, PickupOrderStatus, PickupOrderType } from '../types';

interface PickupOrderUrlParams extends BaseQueryParams {
  companyId?: string;
  type?: string;
  status?: string;
  warehouseId?: string;
  dateFrom?: string;
  dateTo?: string;
}

type PickupOrderAction = 'complete' | 'cancel';

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

export function PickupOrderListPage() {
  const { queryParams, setQueryParams } = useQueryParams<PickupOrderUrlParams>();
  const { companyId, companyOptions, handleCompanyChange } = useCompanyFilter();
  const { data: statusOptions = [] } = usePickupOrderStatuses();
  const { data: typeOptions = [] } = usePickupOrderTypes();
  const [detailTarget, setDetailTarget] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [changeEmployeeTarget, setChangeEmployeeTarget] = useState<PickupOrder | null>(null);
  const [actionTarget, setActionTarget] = useState<{
    action: PickupOrderAction;
    item: PickupOrder;
  } | null>(null);
  const { mutateAsync: completePickupOrder, isPending: isCompleting } = useCompletePickupOrder();
  const { mutateAsync: cancelPickupOrder, isPending: isCancelling } = useCancelPickupOrder();

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
      sortBy: queryParams.sortBy ?? 'scheduledDate',
      sortOrder: (queryParams.sortOrder || 'asc') as 'asc' | 'desc',
      search: queryParams.search,
      type: queryParams.type as PickupOrderType | undefined,
      status: queryParams.status as PickupOrderStatus | undefined,
      warehouseId: queryParams.warehouseId,
      dateFrom: queryParams.dateFrom,
      dateTo: queryParams.dateTo,
    }),
    [companyId, queryParams]
  );

  const { data: pickupOrderResponse, isLoading, isError } = usePickupOrdersQuery(params);
  const pickupOrders = pickupOrderResponse?.success ? pickupOrderResponse.data : [];
  const totalItems = pickupOrderResponse?.meta.total ?? 0;
  const totalPages = pickupOrderResponse?.meta.lastPage ?? 1;

  const columns = useMemo(
    () =>
      createPickupOrderColumns({
        onView: (item: PickupOrder) => setDetailTarget(item.id),
        onChangeEmployee: (item: PickupOrder) => setChangeEmployeeTarget(item),
        onComplete: (item: PickupOrder) => setActionTarget({ action: 'complete', item }),
        onCancel: (item: PickupOrder) => setActionTarget({ action: 'cancel', item }),
      }),
    []
  );

  const handleSearchChange = useCallback(
    (value: string | undefined) => {
      setQueryParams({
        search: value,
        page: 1,
      } as Partial<PickupOrderUrlParams>);
    },
    [setQueryParams]
  );

  const handleSort = useCallback(
    (sortBy: string, sortOrder: 'asc' | 'desc') => {
      setQueryParams({
        sortBy: sortBy || undefined,
        sortOrder,
        page: 1,
      } as Partial<PickupOrderUrlParams>);
    },
    [setQueryParams]
  );

  const handlePaginationChange = useCallback(
    (page: number, perPage: number) => {
      setQueryParams({ page, perPage } as Partial<PickupOrderUrlParams>);
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
          onClick={() => setFormOpen(true)}
          disabled={!companyId}
        >
          {PICKUP_ORDER_LABELS.LIST.BUTTONS.ADD}
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
            } as Partial<PickupOrderUrlParams>);
          }}
          rangePlaceholder="Date range"
        />
        <AsyncSelect
          className="w-48"
          options={typeOptions}
          placeholder="Type"
          value={queryParams.type ?? ''}
          isSearchable={false}
          onChange={(value) => {
            const type = Array.isArray(value) ? value[0] : value;
            setQueryParams({
              type: type || undefined,
              page: 1,
            } as Partial<PickupOrderUrlParams>);
          }}
          isClearable
        />
        <AsyncSelect
          className="w-48"
          options={statusOptions}
          placeholder="Status"
          value={queryParams.status ?? ''}
          isSearchable={false}
          onChange={(value) => {
            const status = Array.isArray(value) ? value[0] : value;
            setQueryParams({
              status: status || undefined,
              page: 1,
            } as Partial<PickupOrderUrlParams>);
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
            } as Partial<PickupOrderUrlParams>);
          }}
          isClearable
        />
      </div>
    ),
    [queryParams, setQueryParams, statusOptions, typeOptions, warehouseOptions]
  );

  const handleDetailClose = useCallback(() => {
    setDetailTarget(null);
  }, []);

  const handleFormClose = useCallback(() => {
    setFormOpen(false);
  }, []);

  return (
    <>
      <ListPageTemplate<PickupOrder>
        title={PICKUP_ORDER_LABELS.LIST.TITLE}
        headerActions={headerActions}
        search={queryParams.search}
        searchPlaceholder={PICKUP_ORDER_LABELS.LIST.SEARCH}
        onSearchChange={handleSearchChange}
        toolbarRight={toolbarRight}
        data={pickupOrders}
        columns={columns}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={PICKUP_ORDER_LABELS.LIST.EMPTY}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        onSort={handleSort}
        page={params.page}
        perPage={params.perPage}
        totalItems={totalItems}
        totalPages={totalPages}
        onPaginationChange={handlePaginationChange}
      />

      <PickupOrderDetailDrawer
        open={detailTarget !== null}
        onClose={handleDetailClose}
        pickupOrderId={detailTarget}
        companyId={companyId ?? null}
      />

      <PickupOrderChangeEmployeeDialog
        open={changeEmployeeTarget !== null}
        onClose={() => setChangeEmployeeTarget(null)}
        order={changeEmployeeTarget}
        companyId={companyId ?? null}
      />

      <ConfirmDialog
        open={actionTarget !== null}
        onOpenChange={(value) => {
          if (!value) setActionTarget(null);
        }}
        variant={actionTarget?.action === 'cancel' ? 'danger' : 'default'}
        title={
          actionTarget?.action === 'complete'
            ? PICKUP_ORDER_LABELS.DIALOG.COMPLETE_TITLE
            : PICKUP_ORDER_LABELS.DIALOG.CANCEL_TITLE
        }
        description={
          actionTarget?.action === 'complete'
            ? PICKUP_ORDER_LABELS.DIALOG.COMPLETE_DESCRIPTION
            : PICKUP_ORDER_LABELS.DIALOG.CANCEL_DESCRIPTION
        }
        cancelText="Batal"
        confirmText="Ya, Lanjutkan"
        isLoading={isCompleting || isCancelling}
        onCancel={() => setActionTarget(null)}
        onConfirm={async () => {
          if (!actionTarget || !companyId) return;

          try {
            if (actionTarget.action === 'complete') {
              await completePickupOrder({
                id: actionTarget.item.id,
                payload: { notes: actionTarget.item.notes ?? undefined },
                companyId,
              });
            } else {
              await cancelPickupOrder({
                id: actionTarget.item.id,
                payload: { cancelledReason: 'Dibatalkan dari frontend' },
                companyId,
              });
            }
            setActionTarget(null);
          } catch (error) {
            toast.error({ title: getErrorMessage(error) });
            setActionTarget(null);
          }
        }}
      />

      <PickupOrderFormDrawer
        open={formOpen}
        onClose={handleFormClose}
        onSuccess={handleFormClose}
        companyId={companyId ?? null}
      />
    </>
  );
}
