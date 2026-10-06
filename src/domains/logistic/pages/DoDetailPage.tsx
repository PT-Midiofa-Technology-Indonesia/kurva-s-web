'use client';

import { Copy, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Suspense, useCallback, useState } from 'react';
import { useCompanyId } from '@/domains/procurement/hooks/use-company-id';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import {
  Badge,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui';
import { useDeliveryOrderStatuses } from '@/shared/hooks/use-enums';
import { SOURCE_TYPE_LABELS, STATUS_BADGE_VARIANT } from '../constants';
import {
  useCancelDeliveryOrder,
  useDeleteDoItem,
  useDeleteDoLoadingOrder,
  useDeleteDoPurchaseOrder,
  useDeliveryOrderDetail,
  useUpdateDeliveryOrder,
} from '../hooks';
import type {
  DeliveryOrderItem,
  DeliveryOrderLoadingOrder,
  DeliveryOrderPurchaseOrder,
} from '../types';

const ConfirmDialogDynamic = dynamic(
  () =>
    import('@/shared/components/molecules/AlertDialog').then((m) => ({
      default: m.ConfirmDialog,
    })),
  { ssr: false, loading: () => null }
);

export function DoDetailPage() {
  const params = useParams<{ id?: string }>();
  const id = params.id ?? '';
  const router = useRouter();
  const companyId = useCompanyId();
  const { data: detail, isLoading, isError } = useDeliveryOrderDetail(id, companyId);
  const deletePo = useDeleteDoPurchaseOrder();
  const deleteItem = useDeleteDoItem();
  const deleteLoadingOrder = useDeleteDoLoadingOrder();
  const updateStatus = useUpdateDeliveryOrder();
  const cancelOrder = useCancelDeliveryOrder();
  const { data: statusOptions = [] } = useDeliveryOrderStatuses();

  const [deleteTarget, setDeleteTarget] = useState<DeliveryOrderPurchaseOrder | null>(null);
  const [deleteTargetItem, setDeleteTargetItem] = useState<DeliveryOrderItem | null>(null);
  const [deleteTargetLoadingOrder, setDeleteTargetLoadingOrder] =
    useState<DeliveryOrderLoadingOrder | null>(null);
  const [editStatus, setEditStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [confirmUpdateStatusOpen, setConfirmUpdateStatusOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const handleBack = useCallback(() => {
    const query = companyId ? `?companyId=${companyId}` : '';
    router.push(`/logistic/delivery-order${query}`);
  }, [router, companyId]);

  const handleEdit = useCallback(() => {
    const query = companyId ? `?companyId=${companyId}` : '';
    router.push(`/logistic/delivery-order/${id}/edit${query}`);
  }, [router, id, companyId]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handleDeletePo = useCallback((po: DeliveryOrderPurchaseOrder) => {
    setDeleteTarget(po);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget || !detail) return;
    deletePo.mutate(
      { doId: detail.id, poId: deleteTarget.id, companyId },
      {
        onSuccess: () => setDeleteTarget(null),
      }
    );
  }, [deleteTarget, detail, companyId, deletePo]);

  const handleDeleteItem = useCallback((item: DeliveryOrderItem) => {
    setDeleteTargetItem(item);
  }, []);

  const handleConfirmDeleteItem = useCallback(() => {
    if (!deleteTargetItem || !detail) return;
    deleteItem.mutate(
      { doId: detail.id, itemId: deleteTargetItem.id, companyId },
      {
        onSuccess: () => setDeleteTargetItem(null),
      }
    );
  }, [deleteTargetItem, detail, companyId, deleteItem]);

  const handleDeleteLoadingOrder = useCallback((lo: DeliveryOrderLoadingOrder) => {
    setDeleteTargetLoadingOrder(lo);
  }, []);

  const handleConfirmDeleteLoadingOrder = useCallback(() => {
    if (!deleteTargetLoadingOrder || !detail) return;
    deleteLoadingOrder.mutate(
      {
        doId: detail.id,
        loadingOrderId: deleteTargetLoadingOrder.id,
        companyId,
      },
      {
        onSuccess: () => setDeleteTargetLoadingOrder(null),
      }
    );
  }, [deleteTargetLoadingOrder, detail, companyId, deleteLoadingOrder]);

  const handleStartEditStatus = useCallback(() => {
    if (!detail) return;
    setSelectedStatus(detail.status);
    setEditStatus(true);
  }, [detail]);

  const handleCancelEditStatus = useCallback(() => {
    setEditStatus(false);
    setSelectedStatus('');
  }, []);

  const handleOpenConfirmUpdateStatus = useCallback(() => {
    setConfirmUpdateStatusOpen(true);
  }, []);

  const handleConfirmUpdateStatus = useCallback(() => {
    if (!detail || !selectedStatus) return;
    updateStatus.mutate(
      { id: detail.id, payload: { status: selectedStatus } as any, companyId },
      {
        onSuccess: () => {
          setEditStatus(false);
          setSelectedStatus('');
          setConfirmUpdateStatusOpen(false);
        },
        onError: () => {
          setConfirmUpdateStatusOpen(false);
        },
      }
    );
  }, [detail, selectedStatus, companyId, updateStatus]);

  const handleConfirmCancel = useCallback(() => {
    if (!detail) return;
    cancelOrder.mutate(
      { id: detail.id, companyId },
      {
        onSuccess: () => setConfirmCancelOpen(false),
        onError: () => setConfirmCancelOpen(false),
      }
    );
  }, [detail, companyId, cancelOrder]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <FormPageSkeleton />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="p-6">
        <ItemNotFound message="Gagal memuat data delivery order." onBack={handleBack} />
      </div>
    );
  }

  const statusVariant = STATUS_BADGE_VARIANT[detail.status] ?? 'default';
  const statusLabel =
    detail.status.charAt(0).toUpperCase() + detail.status.slice(1).replace('_', ' ');
  const sourceTypeLabel = SOURCE_TYPE_LABELS[detail.sourceType] ?? detail.sourceType;

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (val: number | null) => {
    if (val == null) return '-';
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* === Page Header === */}
      <PageHeader
        title="Delivery Order Detail"
        onBack={handleBack}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit}>
              Edit Delivery Order
            </Button>
            <Button variant="destructive" onClick={() => setConfirmCancelOpen(true)}>
              Cancel
            </Button>
          </div>
        }
      />

      {/* === Main Info Card === */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-5">
        {/* Order ID + Status + Update Status */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-slate-950">{detail.code}</span>
            {!editStatus && <Badge variant={statusVariant}>{statusLabel}</Badge>}
          </div>
          {editStatus ? (
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start">
                  {statusOptions
                    .filter((opt) => opt.value !== 'received')
                    .map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button
                variant="default"
                size="sm"
                className="h-8"
                disabled={
                  !selectedStatus || selectedStatus === detail.status || updateStatus.isPending
                }
                onClick={handleOpenConfirmUpdateStatus}
              >
                {updateStatus.isPending ? 'Menyimpan...' : 'Save'}
              </Button>
              <Button variant="ghost" size="sm" className="h-8" onClick={handleCancelEditStatus}>
                Batal
              </Button>
            </div>
          ) : detail.status !== 'received' ? (
            <Button variant="outline" size="sm" onClick={handleStartEditStatus}>
              Update Status
            </Button>
          ) : null}
        </div>

        {/* Grid: Type, Dates, Courier, Shipping */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Type</Label>
            <p className="text-sm font-medium text-slate-950">{sourceTypeLabel}</p>
          </div>
          <div /> {/* empty for grid alignment */}
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">ETD (Estimated Departure)</Label>
            <p className="text-sm font-medium text-slate-950">{formatDate(detail.etd)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">ETA (Estimated Arrival)</Label>
            <p className="text-sm font-medium text-slate-950">{formatDate(detail.eta)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Courier</Label>
            <p className="text-sm font-medium text-slate-950">{detail.carrier ?? '-'}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Tracking Number</Label>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-slate-950">{detail.resi ?? '-'}</p>
              {detail.resi && (
                <button
                  type="button"
                  onClick={() => handleCopy(detail.resi!)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                  title="Salin nomor resi"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Shipping Cost</Label>
            <p className="text-sm font-medium text-slate-950">
              {formatCurrency(detail.shippingCost)}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Total Weight</Label>
            <p className="text-sm font-medium text-slate-950">
              {detail.weight != null ? `${detail.weight} kg` : '-'}
            </p>
          </div>
        </div>
      </div>

      {/* === Source & Destination (side by side) === */}
      <div className="grid grid-cols-2 gap-4">
        {/* Source */}
        <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-5">
          <h3 className="text-sm font-semibold text-slate-950 mb-3">Pengiriman dari (Source)</h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-normal text-slate-500">Nama Vendor</Label>
              <p className="text-sm font-medium text-slate-950">
                {detail.sourceWarehouse?.name ?? '-'}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-normal text-slate-500">Kode Warehouse</Label>
              <p className="text-sm text-slate-700">{detail.sourceWarehouse?.code ?? '-'}</p>
            </div>
          </div>
        </div>

        {/* Destination */}
        <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-5">
          <h3 className="text-sm font-semibold text-slate-950 mb-3">Pengiriman ke (Destination)</h3>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-normal text-slate-500">Nama Warehouse</Label>
              <p className="text-sm font-medium text-slate-950">
                {detail.destinationWarehouse?.name ?? '-'}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs font-normal text-slate-500">Kode Warehouse</Label>
              <p className="text-sm text-slate-700">{detail.destinationWarehouse?.code ?? '-'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* === Notes === */}
      {detail.notes && (
        <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-5">
          <Label className="text-xs font-normal text-slate-500 mb-2 block">Notes</Label>
          <p className="text-sm text-slate-700">{detail.notes}</p>
        </div>
      )}

      {/* === Purchase Orders Table === */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-950">Purchase Order</h2>
        </div>
        {detail.purchaseOrders.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left font-medium text-slate-500">Code</th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">Distribute Cost</th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">Nominal Alokasi</th>
                <th className="px-6 py-3 text-center font-medium text-slate-500 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {detail.purchaseOrders.map((po) => (
                <tr
                  key={po.id}
                  className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50"
                >
                  <td className="px-6 py-3 font-medium text-slate-950">{po.purchaseOrder.code}</td>
                  <td className="px-6 py-3 text-right text-slate-950">
                    {po.costAllocationPercentage}%
                  </td>
                  <td className="px-6 py-3 text-right text-slate-950">
                    {formatCurrency(po.costAllocatedAmount)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeletePo(po)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-4 text-sm text-slate-500">Belum ada purchase order</div>
        )}
      </div>

      {/* === Items Table === */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-950">Items</h2>
        </div>
        {detail.items.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left font-medium text-slate-500">Item</th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">Qty</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">UoM</th>
                <th className="px-6 py-3 text-center font-medium text-slate-500 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {detail.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50"
                >
                  <td className="px-6 py-3 text-slate-950">{item.itemCatalog?.name ?? '-'}</td>
                  <td className="px-6 py-3 text-right text-slate-950">{item.quantity}</td>
                  <td className="px-6 py-3 text-slate-600">{item.itemCatalog?.uom?.code ?? '-'}</td>
                  <td className="px-6 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteItem(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-4 text-sm text-slate-500">Belum ada item</div>
        )}
      </div>

      {/* === Loading Orders Table === */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-950">Loading Order</h2>
        </div>
        {detail.loadingOrders.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left font-medium text-slate-500">Code</th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">Distribute Cost</th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">Nominal Alokasi</th>
                <th className="px-6 py-3 text-center font-medium text-slate-500 w-16">Action</th>
              </tr>
            </thead>
            <tbody>
              {detail.loadingOrders.map((lo) => (
                <tr
                  key={lo.id}
                  className="border-b border-slate-50 last:border-b-0 hover:bg-slate-50/50"
                >
                  <td className="px-6 py-3 font-medium text-slate-950">{lo.loadingOrder.code}</td>
                  <td className="px-6 py-3 text-right text-slate-950">
                    {lo.costAllocationPercentage}%
                  </td>
                  <td className="px-6 py-3 text-right text-slate-950">
                    {formatCurrency(lo.costAllocatedAmount)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteLoadingOrder(lo)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-4 text-sm text-slate-500">Belum ada loading order</div>
        )}
      </div>

      {/* === Delete PO Confirm Dialog === */}
      <Suspense fallback={null}>
        {deleteTarget && (
          <ConfirmDialogDynamic
            open
            onOpenChange={() => setDeleteTarget(null)}
            variant="danger"
            title="Hapus Purchase Order"
            description={`Yakin ingin menghapus PO ${deleteTarget.purchaseOrder.code}?`}
            cancelText="Batal"
            confirmText="Ya, Hapus"
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleConfirmDelete}
            isLoading={deletePo.isPending}
          />
        )}
      </Suspense>

      {/* === Delete Item Confirm Dialog === */}
      <Suspense fallback={null}>
        {deleteTargetItem && (
          <ConfirmDialogDynamic
            open
            onOpenChange={() => setDeleteTargetItem(null)}
            variant="danger"
            title="Hapus Item"
            description={`Yakin ingin menghapus item ${deleteTargetItem.itemCatalog?.name ?? 'ini'}?`}
            cancelText="Batal"
            confirmText="Ya, Hapus"
            onCancel={() => setDeleteTargetItem(null)}
            onConfirm={handleConfirmDeleteItem}
            isLoading={deleteItem.isPending}
          />
        )}
      </Suspense>

      {/* === Delete Loading Order Confirm Dialog === */}
      <Suspense fallback={null}>
        {deleteTargetLoadingOrder && (
          <ConfirmDialogDynamic
            open
            onOpenChange={() => setDeleteTargetLoadingOrder(null)}
            variant="danger"
            title="Hapus Loading Order"
            description={`Yakin ingin menghapus loading order ${deleteTargetLoadingOrder.loadingOrder.code}?`}
            cancelText="Batal"
            confirmText="Ya, Hapus"
            onCancel={() => setDeleteTargetLoadingOrder(null)}
            onConfirm={handleConfirmDeleteLoadingOrder}
            isLoading={deleteLoadingOrder.isPending}
          />
        )}
      </Suspense>

      {/* === Update Status Confirm Dialog === */}
      <Suspense fallback={null}>
        {confirmUpdateStatusOpen && (
          <ConfirmDialogDynamic
            open
            onOpenChange={() => setConfirmUpdateStatusOpen(false)}
            variant="warning"
            title="Update Status"
            description={`Yakin ingin mengubah status dari "${statusLabel}" ke "${selectedStatus.replace('_', ' ')}"?`}
            cancelText="Batal"
            confirmText="Ya, Simpan"
            onCancel={() => setConfirmUpdateStatusOpen(false)}
            onConfirm={handleConfirmUpdateStatus}
            isLoading={updateStatus.isPending}
          />
        )}
      </Suspense>

      {/* === Cancel Order Confirm Dialog === */}
      <Suspense fallback={null}>
        {confirmCancelOpen && (
          <ConfirmDialogDynamic
            open
            onOpenChange={() => setConfirmCancelOpen(false)}
            variant="danger"
            title="Batalkan Delivery Order"
            description={`Yakin ingin membatalkan delivery order ${detail.code}?`}
            cancelText="Tidak"
            confirmText="Ya, Batalkan"
            onCancel={() => setConfirmCancelOpen(false)}
            onConfirm={handleConfirmCancel}
            isLoading={cancelOrder.isPending}
          />
        )}
      </Suspense>
    </div>
  );
}
