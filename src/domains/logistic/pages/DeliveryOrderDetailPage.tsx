'use client';

import { Check, Copy, Loader2, Pencil, X } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { useCompanyId } from '@/domains/procurement/hooks/use-company-id';
import {
  ConfirmDialog,
  FileAttachmentList,
  ItemNotFound,
  PageHeader,
} from '@/shared/components/molecules';
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
import { getErrorMessage, getFieldErrors } from '@/shared/lib/api-error';
import { toast } from '@/shared/lib/toast';
import {
  LOGISTIC_LABELS,
  LOGISTIC_PAGE_CONFIGS,
  SOURCE_TYPE_LABELS,
  STATUS_BADGE_VARIANT,
} from '../constants';
import { useCancelDeliveryOrder } from '../hooks/use-cancel-delivery-order';
import { useDeliveryOrderDetail } from '../hooks/use-delivery-orders';
import { useReceiveDeliveryOrder } from '../hooks/use-receive-delivery-order';
import { useSendDeliveryOrder } from '../hooks/use-send-delivery-order';
import { useUpdateDeliveryOrder } from '../hooks/use-update-delivery-order';
import { resolveItemIdentity } from '../services/delivery-order-items';
import type { DeliveryOrderType } from '../types';

interface DeliveryOrderDetailPageProps {
  type: DeliveryOrderType;
}

export function DeliveryOrderDetailPage({ type }: DeliveryOrderDetailPageProps) {
  const params = useParams<{ id?: string }>();
  const id = params.id ?? '';
  const router = useRouter();
  const companyId = useCompanyId();

  const { data: detail, isLoading, isError } = useDeliveryOrderDetail(id, companyId);
  const config = LOGISTIC_PAGE_CONFIGS[type];

  const receiveMutation = useReceiveDeliveryOrder();
  const sendMutation = useSendDeliveryOrder();
  const cancelMutation = useCancelDeliveryOrder();
  const updateStatus = useUpdateDeliveryOrder();
  const { data: statusOptions = [] } = useDeliveryOrderStatuses();

  const documentGroups = useMemo(
    () =>
      (detail?.documents ?? []).map((doc) => ({
        label: doc.documentType.name,
        files: doc.files,
      })),
    [detail?.documents]
  );

  const isMutating = receiveMutation.isPending || sendMutation.isPending;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [confirmUpdateStatusOpen, setConfirmUpdateStatusOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  const handleBack = useCallback(() => {
    const query = companyId ? `?companyId=${companyId}` : '';
    if (type === 'inbound') {
      router.push(`/logistic/inbound${query}`);
    } else if (type === 'outbond') {
      router.push(`/logistic/outbound${query}`);
    } else {
      router.push(`/logistic/delivery-order${query}`);
    }
  }, [router, type, companyId]);

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handleAction = useCallback(() => {
    setConfirmOpen(true);
  }, []);

  const handleConfirmAction = useCallback(() => {
    if (type === 'inbound') {
      receiveMutation.mutate(
        { deliveryOrderId: id, companyId },
        {
          onSuccess: () => {
            toast.success({ title: 'Barang berhasil diterima.' });
            setConfirmOpen(false);
          },
          onError: (error: any) => {
            const message = getErrorMessage(error);
            const fieldErrors = getFieldErrors(error);
            const description = fieldErrors
              ? Object.values(fieldErrors).flat().join('\n')
              : undefined;
            toast.error({ title: message, description });
          },
        }
      );
    } else {
      sendMutation.mutate(
        { deliveryOrderId: id, companyId },
        {
          onSuccess: () => {
            toast.success({ title: 'Barang berhasil dikirim.' });
            setConfirmOpen(false);
          },
          onError: (error: any) => {
            const message = getErrorMessage(error);
            const fieldErrors = getFieldErrors(error);
            const description = fieldErrors
              ? Object.values(fieldErrors).flat().join('\n')
              : undefined;
            toast.error({ title: message, description });
          },
        }
      );
    }
  }, [type, id, companyId, receiveMutation, sendMutation]);

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
    cancelMutation.mutate(
      { id, companyId },
      {
        onSuccess: () => {
          setConfirmCancelOpen(false);
        },
        onError: () => {
          setConfirmCancelOpen(false);
        },
      }
    );
  }, [cancelMutation, companyId, id]);

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

  const statusLabel =
    detail.status.charAt(0).toUpperCase() + detail.status.slice(1).replace('_', ' ');
  const sourceTypeLabel = SOURCE_TYPE_LABELS[detail.sourceType] ?? detail.sourceType;

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatCurrency = (val: number | null) => {
    if (val == null) return '-';
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  const actionButtonLabel = type === 'inbound' ? 'Terima Barang (GR)' : 'Kirim Barang (GI)';
  const showActionButton =
    type === 'inbound'
      ? detail.status === 'in_transit'
      : type === 'outbond'
        ? detail.status === 'requested'
        : detail.status !== 'cancelled';
  const canCancel = detail.status !== 'received' && detail.status !== 'cancelled';

  return (
    <div className="p-6 space-y-6">
      {/* === Page Header === */}
      <PageHeader
        title={`${config.title} Detail`}
        onBack={handleBack}
        actions={
          !(type === 'inbound' && detail.status === 'received') ? (
            <div className="flex items-center gap-2">
              {showActionButton && (
                <Button variant="default" onClick={handleAction} disabled={isMutating}>
                  {isMutating ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {actionButtonLabel}
                    </span>
                  ) : (
                    actionButtonLabel
                  )}
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={() => setConfirmCancelOpen(true)}
                  disabled={cancelMutation.isPending}
                >
                  {LOGISTIC_LABELS.DETAIL.BUTTONS.CANCEL}
                </Button>
              )}
            </div>
          ) : undefined
        }
      />

      {/* === Shipment Header Card === */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-950">{detail.code}</span>
            <button
              type="button"
              onClick={() => handleCopy(detail.code)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
              title="Salin kode"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          {editStatus ? (
            <div className="flex items-center gap-2">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-[180px] h-8">
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="default"
                size="icon-sm"
                disabled={
                  !selectedStatus || selectedStatus === detail.status || updateStatus.isPending
                }
                onClick={handleOpenConfirmUpdateStatus}
                title="Simpan status"
              >
                {updateStatus.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={handleCancelEditStatus}
                title="Batal"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Badge variant={STATUS_BADGE_VARIANT[detail.status] ?? 'default'}>
                {statusLabel}
              </Badge>
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-slate-500 hover:text-slate-700"
                onClick={handleStartEditStatus}
                title="Edit status"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
        <div className="mt-2 text-sm text-slate-500">
          ETD (Estimated Departure):{' '}
          <span className="text-slate-900 font-medium">{formatDate(detail.etd)}</span>
        </div>
      </div>

      {/* === Main Detail Information === */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm p-6 space-y-6">
        {/* Row 1: Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Type</Label>
            <p className="text-sm font-medium text-slate-950">{sourceTypeLabel}</p>
          </div>
        </div>

        {/* Row 2: ETD & ETA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">ETD (Estimated Departure)</Label>
            <p className="text-sm font-medium text-slate-950">{formatDate(detail.etd)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">ETA (Estimated Arrival)</Label>
            <p className="text-sm font-medium text-slate-950">{formatDate(detail.eta)}</p>
          </div>
        </div>

        {/* Row 3: Courier & Tracking Number */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        </div>

        {/* Row 4: Shipping Cost & Total Weight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Source & Destination Side-by-Side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Source Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-950">
              {type === 'outbond' ? 'Pengirim' : 'Pengiriman dari (Source)'}
            </h3>
            {detail.sourceShippingType === 'vendor' && detail.sourceShipping ? (
              <>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">Nama Vendor</Label>
                  <p className="text-sm font-medium text-slate-950">{detail.sourceShipping.name}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">Alamat Vendor</Label>
                  <p className="text-sm font-medium text-slate-950">{detail.sourceShipping.code}</p>
                </div>
              </>
            ) : detail.sourceWarehouse ? (
              <>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">Nama Warehouse</Label>
                  <p className="text-sm font-medium text-slate-950">
                    {detail.sourceWarehouse.name}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">Alamat Warehouse</Label>
                  <p className="text-sm font-medium text-slate-950">
                    {detail.sourceWarehouse.code}
                  </p>
                </div>
              </>
            ) : detail.sourceShipping ? (
              <>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">Nama Sumber</Label>
                  <p className="text-sm font-medium text-slate-950">{detail.sourceShipping.name}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">Alamat Sumber</Label>
                  <p className="text-sm font-medium text-slate-950">{detail.sourceShipping.code}</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">-</p>
            )}
          </div>

          {/* Destination Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
            <h3 className="text-sm font-semibold text-slate-950">
              {type === 'outbond' ? 'Tujuan' : 'Pengiriman ke (Destination)'}
            </h3>
            {detail.destinationWarehouse ? (
              <>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">Nama Warehouse</Label>
                  <p className="text-sm font-medium text-slate-950">
                    {detail.destinationWarehouse.name}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-normal text-slate-500">Alamat Warehouse</Label>
                  <p className="text-sm font-medium text-slate-950">
                    {detail.destinationWarehouse.code}
                  </p>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">-</p>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="flex flex-col gap-1 pt-2">
          <Label className="text-xs font-normal text-slate-500">Notes</Label>
          <p className="text-sm text-slate-700 leading-relaxed">{detail.notes ?? '-'}</p>
        </div>
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
              </tr>
            </thead>
            <tbody>
              {detail.items.map((item) => {
                const identity = resolveItemIdentity(item);

                return (
                  <tr key={item.id} className="border-b border-slate-50 last:border-b-0">
                    <td className="px-6 py-3 text-slate-950">{identity.itemName || '-'}</td>
                    <td className="px-6 py-3 text-right text-slate-950">{item.quantity}</td>
                    <td className="px-6 py-3 text-slate-600">{identity.uom || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-4 text-sm text-slate-500">Belum ada item</div>
        )}
      </div>

      {/* === Purchase Orders === */}
      {detail.purchaseOrders.length > 0 && (
        <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-950">Purchase Orders</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-6 py-3 text-left font-medium text-slate-500">No.</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Kode PO</th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">
                  Alokasi Biaya (%)
                </th>
                <th className="px-6 py-3 text-right font-medium text-slate-500">Nominal Alokasi</th>
                <th className="px-6 py-3 text-left font-medium text-slate-500">Notes</th>
              </tr>
            </thead>
            <tbody>
              {detail.purchaseOrders.map((po, idx) => (
                <tr key={po.id} className="border-b border-slate-50 last:border-b-0">
                  <td className="px-6 py-3 text-slate-950">{idx + 1}</td>
                  <td className="px-6 py-3 text-slate-950 font-medium">{po.purchaseOrder.code}</td>
                  <td className="px-6 py-3 text-right text-slate-950">
                    {po.costAllocationPercentage}%
                  </td>
                  <td className="px-6 py-3 text-right text-slate-950">
                    {formatCurrency(po.costAllocatedAmount)}
                  </td>
                  <td className="px-6 py-3 text-slate-600">{po.notes ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* === Bukti (Documents) === */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-6">
        <h2 className="text-base font-semibold text-slate-950">
          {LOGISTIC_LABELS.DETAIL.DOCUMENTS_TITLE}
        </h2>
        <div className="mt-4">
          <FileAttachmentList
            groups={documentGroups}
            emptyMessage={LOGISTIC_LABELS.DETAIL.DOCUMENTS_EMPTY}
            downloadLabel={LOGISTIC_LABELS.DETAIL.DOWNLOAD_DOCUMENT}
          />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        variant="warning"
        title={`Konfirmasi ${actionButtonLabel}`}
        description={`Apakah anda yakin ingin ${type === 'inbound' ? 'menerima' : 'mengirim'} barang ini?`}
        confirmText="Ya, Lanjutkan"
        cancelText="Batal"
        onConfirm={handleConfirmAction}
        isLoading={isMutating}
      />

      <ConfirmDialog
        open={confirmCancelOpen}
        onOpenChange={setConfirmCancelOpen}
        variant="danger"
        title={LOGISTIC_LABELS.DETAIL.DIALOG.CANCEL_TITLE}
        description={LOGISTIC_LABELS.DETAIL.DIALOG.CANCEL_DESCRIPTION}
        confirmText={LOGISTIC_LABELS.DETAIL.DIALOG.CANCEL_CONFIRM}
        cancelText={LOGISTIC_LABELS.DETAIL.DIALOG.CANCEL_CANCEL}
        onConfirm={handleConfirmCancel}
        isLoading={cancelMutation.isPending}
      />

      <ConfirmDialog
        open={confirmUpdateStatusOpen}
        onOpenChange={setConfirmUpdateStatusOpen}
        variant="warning"
        title="Update Status"
        description={`Yakin ingin mengubah status dari "${statusLabel}" ke "${selectedStatus.replace('_', ' ')}"?`}
        cancelText="Batal"
        confirmText="Ya, Simpan"
        onConfirm={handleConfirmUpdateStatus}
        isLoading={updateStatus.isPending}
      />
    </div>
  );
}
