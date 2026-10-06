'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { Badge } from '@/shared/components/ui/badge';
import { Label } from '@/shared/components/ui/label';
import { formatDate } from '@/shared/utils/format';
import { PROCUREMENT_LABELS, PURCHASE_REQUEST_STATUS_BADGE } from '../constants';
import { usePurchaseRequestDetail } from '../hooks/use-purchase-request-detail';
import type { PurchaseRequestDetailItem } from '../types/purchase-request-detail';

export function PurchaseRequestDetailPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const purchaseRequestId = params.id ?? '';
  const companyId = searchParams.get('companyId') ?? undefined;

  const {
    data: detail,
    isLoading,
    isError,
  } = usePurchaseRequestDetail(purchaseRequestId, companyId);

  const [search, setSearch] = useState('');

  const handleBack = () => router.back();

  const filteredItems = useMemo(() => {
    if (!detail) return [];
    const q = search.toLowerCase().trim();
    if (!q) return detail.items;
    return detail.items.filter(
      (item) => item.code.toLowerCase().includes(q) || item.materialName.toLowerCase().includes(q)
    );
  }, [detail, search]);

  const statusBadge = detail
    ? (PURCHASE_REQUEST_STATUS_BADGE[detail.status] ?? {
        label: detail.statusLabel,
        variant: 'secondary' as const,
      })
    : null;

  const columns = useMemo<ColumnDef<PurchaseRequestDetailItem>[]>(
    () => [
      {
        accessorKey: 'code',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST_DETAIL.TABLE.KODE,
      },
      {
        accessorKey: 'materialName',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST_DETAIL.TABLE.MATERIAL_TOOLS,
      },
      {
        accessorKey: 'quantity',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST_DETAIL.TABLE.VOL_PR,
        cell: ({ getValue }) => {
          const val = getValue() as number | null | undefined;
          return val != null ? val.toLocaleString('id-ID') : '-';
        },
      },
      {
        accessorKey: 'uom',
        header: PROCUREMENT_LABELS.PURCHASE_REQUEST_DETAIL.TABLE.UOM,
      },
    ],
    []
  );

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (isError || !detail) {
    return <ItemNotFound message="Gagal memuat data Purchase Request." onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title={`${PROCUREMENT_LABELS.PURCHASE_REQUEST_DETAIL.TITLE} — ${detail.code}`}
        onBack={handleBack}
      />

      {/* Info PR */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-900">Informasi Purchase Request</h2>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">No. PR</Label>
            <p className="text-sm font-medium text-slate-900">{detail.code}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Project</Label>
            <p className="text-sm font-medium text-slate-900">{detail.projectName}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Perusahaan</Label>
            <p className="text-sm font-medium text-slate-900">{detail.companyName}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Tipe</Label>
            <p className="text-sm font-medium text-slate-900">{detail.typeLabel}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Source</Label>
            <p className="text-sm font-medium text-slate-900">{detail.sourceLabel}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Status</Label>
            <div>
              {statusBadge && <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Tanggal Request</Label>
            <p className="text-sm font-medium text-slate-900">{formatDate(detail.dateRequest)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Tanggal Dibutuhkan</Label>
            <p className="text-sm font-medium text-slate-900">{formatDate(detail.dateRequired)}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Request Oleh</Label>
            <p className="text-sm font-medium text-slate-900">{detail.requestedBy.name}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">Kode Project</Label>
            <p className="text-sm font-medium text-slate-900">{detail.projectCode}</p>
          </div>
          {detail.notes && (
            <div className="flex flex-col gap-1 col-span-2">
              <Label className="text-xs font-normal text-slate-500">Catatan</Label>
              <p className="text-sm font-medium text-slate-900">{detail.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Item table */}
      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-base font-semibold text-slate-950">Detail Purchase Request</h2>
          <div className="relative w-52">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={PROCUREMENT_LABELS.PURCHASE_REQUEST_DETAIL.TABLE.SEARCH_PLACEHOLDER}
              className="w-full h-8 pl-3 pr-8 rounded-md border border-slate-200 text-xs"
            />
            <svg
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        </div>

        <DataTableLayout
          columns={columns}
          data={filteredItems}
          emptyMessage={PROCUREMENT_LABELS.PURCHASE_REQUEST_DETAIL.TABLE.EMPTY}
          enablePagination={false}
          enableRowSelection={false}
          enableColumnResize={false}
          enableColumnDnd={false}
          enableZebraStripes={false}
          className="shadow-none rounded-none border-0"
        />
      </div>
    </div>
  );
}
