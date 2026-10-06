'use client';

import { Loader2 } from 'lucide-react';
import { DetailDrawerTemplate } from '@/shared/components/templates/DetailDrawerTemplate';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { formatDateLong as formatDate } from '@/shared/utils/format';
import {
  PICKUP_ORDER_LABELS,
  PICKUP_ORDER_STATUS_BADGE,
  PICKUP_ORDER_TYPE_LABELS,
} from '../constants';
import { usePickupOrderDetailQuery } from '../hooks';
import type { PickupOrderItem } from '../types';

interface PickupOrderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  pickupOrderId: string | null;
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

function getItemLabel(item: PickupOrderItem) {
  if (item.itemCatalog) return `${item.itemCatalog.code} - ${item.itemCatalog.name}`;
  if (item.resourceUnit) return `${item.resourceUnit.code} - ${item.resourceUnit.name}`;
  return '-';
}

function formatDateOnly(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export function PickupOrderDetailDrawer({
  open,
  onClose,
  pickupOrderId,
  companyId,
}: PickupOrderDetailDrawerProps) {
  const { data: detailResponse, isLoading } = usePickupOrderDetailQuery(
    pickupOrderId ?? '',
    companyId
  );
  const pickupOrder = detailResponse?.success ? detailResponse.data : null;
  const statusBadge = pickupOrder ? PICKUP_ORDER_STATUS_BADGE[pickupOrder.status] : 'secondary';

  if (isLoading) {
    return (
      <DetailDrawerTemplate
        open={open}
        onClose={onClose}
        title={PICKUP_ORDER_LABELS.DETAIL.TITLE}
        closeLabel={PICKUP_ORDER_LABELS.DETAIL.BUTTONS.CLOSE}
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
      title={PICKUP_ORDER_LABELS.DETAIL.TITLE}
      closeLabel={PICKUP_ORDER_LABELS.DETAIL.BUTTONS.CLOSE}
    >
      <DetailField
        label={PICKUP_ORDER_LABELS.DETAIL.FIELDS.CODE}
        value={pickupOrder?.code ?? '-'}
      />
      <div className="flex flex-col gap-1.5">
        <Label className="text-sm font-normal text-slate-500">
          {PICKUP_ORDER_LABELS.DETAIL.FIELDS.STATUS}
        </Label>
        {pickupOrder ? (
          <Badge variant={statusBadge}>
            {pickupOrder.status.charAt(0).toUpperCase() + pickupOrder.status.slice(1)}
          </Badge>
        ) : (
          <p className="text-sm font-medium text-slate-950">-</p>
        )}
      </div>
      <DetailField
        label={PICKUP_ORDER_LABELS.DETAIL.FIELDS.TYPE}
        value={pickupOrder ? PICKUP_ORDER_TYPE_LABELS[pickupOrder.type] : '-'}
      />
      <DetailField
        label={PICKUP_ORDER_LABELS.DETAIL.FIELDS.WAREHOUSE}
        value={pickupOrder?.warehouse?.name ?? '-'}
      />
      <DetailField
        label={PICKUP_ORDER_LABELS.DETAIL.FIELDS.EMPLOYEE}
        value={pickupOrder?.assignedEmployee?.name ?? '-'}
      />
      <DetailField
        label={PICKUP_ORDER_LABELS.DETAIL.FIELDS.PICKUP_LOCATION}
        value={pickupOrder?.pickupLocation ?? '-'}
      />
      <DetailField
        label={PICKUP_ORDER_LABELS.DETAIL.FIELDS.SCHEDULED_DATE}
        value={pickupOrder ? formatDateOnly(pickupOrder.scheduledDate) : '-'}
      />
      <DetailField
        label={PICKUP_ORDER_LABELS.DETAIL.FIELDS.COMPLETED_AT}
        value={pickupOrder?.completedAt ? formatDate(pickupOrder.completedAt) : '-'}
      />
      <DetailField
        label={PICKUP_ORDER_LABELS.DETAIL.FIELDS.CANCELLED_REASON}
        value={pickupOrder?.cancelledReason ?? '-'}
      />
      <DetailField
        label={PICKUP_ORDER_LABELS.DETAIL.FIELDS.NOTES}
        value={pickupOrder?.notes ?? '-'}
      />

      <div className="space-y-3">
        <Label className="text-sm font-normal text-slate-500">
          {PICKUP_ORDER_LABELS.DETAIL.FIELDS.DELIVERY_ORDERS}
        </Label>
        {pickupOrder?.deliveryOrders?.length ? (
          <div className="rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Kode</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {pickupOrder.deliveryOrders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-950">{order.code}</td>
                    <td className="px-3 py-2 text-slate-700">{order.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Belum ada delivery order</p>
        )}
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-normal text-slate-500">
          {PICKUP_ORDER_LABELS.DETAIL.FIELDS.ITEMS}
        </Label>
        {pickupOrder?.items?.length ? (
          <div className="rounded-lg border border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Item</th>
                  <th className="px-3 py-2 text-right font-medium text-slate-500">Qty</th>
                  <th className="px-3 py-2 text-left font-medium text-slate-500">Notes</th>
                </tr>
              </thead>
              <tbody>
                {pickupOrder.items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-3 py-2 text-slate-950">{getItemLabel(item)}</td>
                    <td className="px-3 py-2 text-right text-slate-950">{item.quantityPlanned}</td>
                    <td className="px-3 py-2 text-slate-700">{item.notes ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Belum ada item</p>
        )}
      </div>
    </DetailDrawerTemplate>
  );
}
