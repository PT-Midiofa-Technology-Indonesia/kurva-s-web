'use client';

import { Copy, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/atoms';
import { ConfirmDialog } from '@/shared/components/molecules/AlertDialog';
import { DetailDrawerTemplate } from '@/shared/components/templates/DetailDrawerTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { formatDateLong as formatDate } from '@/shared/utils/format';
import {
  LOADING_ORDER_ITEM_TYPE_LABELS,
  LOADING_ORDER_LABELS,
  LOADING_ORDER_SOURCE_TYPE_LABELS,
  LOADING_ORDER_STATUS_BADGE,
} from '../constants';
import { useCancelLoadingOrder, useLoadingOrderDetailQuery } from '../hooks';
import type { LoadingOrderItem, LoadingOrderItemType } from '../types';

const LABELS = LOADING_ORDER_LABELS.DETAIL;

interface LoadingOrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  loadingOrderId: string | null;
  companyId?: string | null;
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-sm font-normal text-slate-500">{label}</Label>
      <p className="text-sm font-medium text-slate-950">{value}</p>
    </div>
  );
}

function getItemLabel(item: LoadingOrderItem) {
  if (item.itemType === 'equipment') {
    return item.resourceUnit ? `${item.resourceUnit.code} - ${item.resourceUnit.name}` : '-';
  }
  return item.itemCatalog ? `${item.itemCatalog.code} - ${item.itemCatalog.name}` : '-';
}

function getItemTypeLabel(itemType: LoadingOrderItem['itemType']) {
  return LOADING_ORDER_ITEM_TYPE_LABELS[itemType as LoadingOrderItemType] ?? itemType;
}

export function LoadingOrderDetailDrawer({
  open,
  onClose,
  loadingOrderId,
  companyId,
}: LoadingOrderDetailDrawerProps) {
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const { data: loadingOrderResponse, isLoading } = useLoadingOrderDetailQuery(
    loadingOrderId ?? '',
    companyId
  );
  const loadingOrder = loadingOrderResponse?.success ? loadingOrderResponse.data : null;
  const cancelMutation = useCancelLoadingOrder();
  const canCancel = loadingOrder?.status === 'draft' || loadingOrder?.status === 'prepared';

  if (isLoading) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        onEdit={undefined}
        title={LABELS.TITLE}
        editLabel={LABELS.BUTTONS.EDIT}
        closeLabel={LABELS.BUTTONS.CLOSE}
      >
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </DetailDrawerTemplate>
    );
  }

  return (
    <DetailDrawerTemplate
      open={open}
      onClose={onClose}
      onEdit={undefined}
      title={LABELS.TITLE}
      editLabel={LABELS.BUTTONS.EDIT}
      closeLabel={LABELS.BUTTONS.CLOSE}
      customFooter={
        canCancel ? (
          <Button
            type="button"
            variant="destructive"
            className="w-full"
            disabled={cancelMutation.isPending}
            onClick={() => setConfirmCancelOpen(true)}
          >
            {LABELS.BUTTONS.CANCEL}
          </Button>
        ) : undefined
      }
      confirmDialog={
        <ConfirmDialog
          open={confirmCancelOpen}
          onOpenChange={setConfirmCancelOpen}
          variant="danger"
          title={LOADING_ORDER_LABELS.DIALOG.CANCEL_TITLE}
          description={LOADING_ORDER_LABELS.DIALOG.CANCEL_DESCRIPTION}
          cancelText="Batal"
          confirmText="Ya, Batalkan"
          isLoading={cancelMutation.isPending}
          onConfirm={() => {
            if (!loadingOrderId || !companyId) return;
            cancelMutation.mutate(
              { id: loadingOrderId, companyId },
              {
                onSuccess: () => {
                  setConfirmCancelOpen(false);
                  onClose();
                },
                onError: () => {
                  setConfirmCancelOpen(false);
                },
              }
            );
          }}
          onCancel={() => setConfirmCancelOpen(false)}
        />
      }
    >
      {/* Kode + salin */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{LABELS.FIELDS.CODE}</Label>
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-950">{loadingOrder?.code ?? '-'}</p>
          {loadingOrder?.code && (
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(loadingOrder.code)}
              className="inline-flex shrink-0 items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-700"
              title={LABELS.BUTTONS.COPY_CODE}
            >
              <Copy className="h-3.5 w-3.5" />
              {LABELS.BUTTONS.COPY_CODE}
            </button>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">{LABELS.FIELDS.STATUS}</Label>
        {loadingOrder ? (
          <div>
            <Badge variant={LOADING_ORDER_STATUS_BADGE[loadingOrder.status]}>
              {loadingOrder.status.charAt(0).toUpperCase() +
                loadingOrder.status.slice(1).replace('_', ' ')}
            </Badge>
          </div>
        ) : (
          <p className="text-sm font-medium text-slate-950">-</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <DetailField
          label={LABELS.FIELDS.SOURCE_TYPE}
          value={loadingOrder ? LOADING_ORDER_SOURCE_TYPE_LABELS[loadingOrder.sourceType] : '-'}
        />
        <DetailField
          label={LABELS.FIELDS.RESOURCE_ALLOCATION}
          value={loadingOrder?.resourceAllocation?.code ?? '-'}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <DetailField
          label={LABELS.FIELDS.SOURCE_WAREHOUSE}
          value={loadingOrder?.sourceWarehouse?.name ?? '-'}
        />
        <DetailField
          label={LABELS.FIELDS.DESTINATION_WAREHOUSE}
          value={loadingOrder?.destinationWarehouse?.name ?? '-'}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <DetailField
          label={LABELS.FIELDS.PREPARED_AT}
          value={loadingOrder?.preparedAt ? formatDate(loadingOrder.preparedAt) : '-'}
        />
        <DetailField
          label={LABELS.FIELDS.PREPARED_BY}
          value={loadingOrder?.preparedBy?.name ?? '-'}
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <DetailField
          label={LABELS.FIELDS.LOADED_AT}
          value={loadingOrder?.loadedAt ? formatDate(loadingOrder.loadedAt) : '-'}
        />
        <DetailField label={LABELS.FIELDS.LOADED_BY} value={loadingOrder?.loadedBy?.name ?? '-'} />
      </div>

      <DetailField label={LABELS.FIELDS.NOTES} value={loadingOrder?.notes ?? '-'} />

      <div className="space-y-3">
        <Label className="text-sm font-normal text-slate-500">{LABELS.FIELDS.ITEMS}</Label>
        {loadingOrder?.items?.length ? (
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-3 py-2 text-left font-medium text-slate-500">
                    {LABELS.ITEM_COLUMNS.ITEM_TYPE}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">
                    {LABELS.ITEM_COLUMNS.ITEM}
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500">
                    {LABELS.ITEM_COLUMNS.QTY}
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">
                    {LABELS.ITEM_COLUMNS.NOTES}
                  </th>
                </tr>
              </thead>
              <tbody>
                {loadingOrder.items.map((item) => (
                  <tr key={item.id} className="border-b border-slate-100 last:border-b-0">
                    <td className="px-3 py-2 text-slate-700">{getItemTypeLabel(item.itemType)}</td>
                    <td className="px-3 py-2 text-slate-950">{getItemLabel(item)}</td>
                    <td className="px-3 py-2 text-right text-slate-950">{item.quantity}</td>
                    <td className="px-3 py-2 text-slate-700">{item.notes ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">{LABELS.EMPTY_ITEMS}</p>
        )}
      </div>
    </DetailDrawerTemplate>
  );
}
