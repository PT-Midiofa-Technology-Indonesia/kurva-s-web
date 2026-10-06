'use client';

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { FileAttachmentList, ItemNotFound, PageHeader } from '@/shared/components/molecules';
import { FormPageSkeleton } from '@/shared/components/templates';
import {
  Card,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui';
import { PROCUREMENT_LABELS } from '../constants';
import { useGoodsReceiptDetail } from '../hooks/use-goods-receipts';

const GR_LABELS = PROCUREMENT_LABELS.GOODS_RECEIPT;

export function GoodsReceiptDetailPage() {
  const params = useParams<{ id?: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const goodsReceiptId = params.id ?? '';
  const companyId = searchParams.get('companyId') ?? undefined;

  const { data: detail, isLoading } = useGoodsReceiptDetail(goodsReceiptId, companyId);
  const itemRows = detail?.items ?? [];
  const documentGroups = useMemo(
    () =>
      (detail?.documents ?? []).map((doc) => ({
        label: doc.documentType.name,
        files: doc.files,
      })),
    [detail?.documents]
  );

  const handleBack = useCallback(() => {
    const query = companyId ? `?companyId=${companyId}` : '';
    router.push(`/procurement/goods-receipt${query}`);
  }, [router, companyId]);

  if (isLoading) {
    return <FormPageSkeleton />;
  }

  if (!detail) {
    return <ItemNotFound message="Goods Receipt tidak ditemukan" onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader title={GR_LABELS.DETAIL.TITLE} onBack={handleBack} />

      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">
              {GR_LABELS.FORM.FIELDS.DELIVERY_ORDER}
            </Label>
            <p className="text-sm font-medium text-slate-950">{detail.deliveryOrderCode}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">
              {GR_LABELS.FORM.FIELDS.DESTINATION_WAREHOUSE}
            </Label>
            <p className="text-sm font-medium text-slate-950">{detail.destinationWarehouseName}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">
              {GR_LABELS.FORM.FIELDS.SOURCE_TYPE}
            </Label>
            <p className="text-sm font-medium text-slate-950">{detail.sourceType}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">
              {GR_LABELS.FORM.FIELDS.PURCHASE_ORDER}
            </Label>
            <p className="text-sm font-medium text-slate-950">{detail.purchaseOrderCode ?? '-'}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">
              {GR_LABELS.FORM.FIELDS.RECEIVED_AT}
            </Label>
            <p className="text-sm font-medium text-slate-950">{detail.receivedAtFormatted}</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs font-normal text-slate-500">
              {GR_LABELS.FORM.FIELDS.RECEIVED_BY}
            </Label>
            <p className="text-sm font-medium text-slate-950">{detail.receivedByName}</p>
          </div>
          <div className="flex flex-col gap-1 md:col-span-2">
            <Label className="text-xs font-normal text-slate-500">
              {GR_LABELS.FORM.FIELDS.NOTE}
            </Label>
            <p className="text-sm text-slate-700">{detail.notes ?? '-'}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-6 py-4">
          <h2 className="text-base font-semibold text-slate-950">
            {GR_LABELS.FORM.ITEMS_TABLE.TITLE}
          </h2>
        </div>
        {itemRows.length > 0 ? (
          <div className="p-4">
            <Card className="p-0">
              <Table className="text-sm">
                <TableHeader>
                  <TableRow className="border-b border-slate-100 bg-slate-50 hover:bg-slate-50">
                    <TableHead className="px-6 py-3 text-left font-medium text-slate-500 h-auto">
                      {GR_LABELS.FORM.ITEMS_TABLE.CODE}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left font-medium text-slate-500 h-auto">
                      {GR_LABELS.FORM.ITEMS_TABLE.ITEM}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-right font-medium text-slate-500 h-auto">
                      {GR_LABELS.FORM.ITEMS_TABLE.DO_QTY}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-right font-medium text-slate-500 h-auto">
                      {GR_LABELS.FORM.ITEMS_TABLE.QTY_RECEIVED}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-right font-medium text-slate-500 h-auto">
                      {GR_LABELS.FORM.ITEMS_TABLE.QTY_REJECTED}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-right font-medium text-slate-500 h-auto">
                      {GR_LABELS.FORM.ITEMS_TABLE.QTY_NET}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left font-medium text-slate-500 h-auto">
                      {GR_LABELS.FORM.ITEMS_TABLE.UOM}
                    </TableHead>
                    <TableHead className="px-6 py-3 text-left font-medium text-slate-500 h-auto">
                      {GR_LABELS.FORM.ITEMS_TABLE.REMARKS}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itemRows.map((item) => (
                    <TableRow key={item.id} className="border-b border-slate-50 last:border-b-0">
                      <TableCell className="px-6 py-3 text-slate-950">{item.code}</TableCell>
                      <TableCell className="px-6 py-3 text-slate-950">{item.name}</TableCell>
                      <TableCell className="px-6 py-3 text-right text-slate-950">
                        {item.doQty}
                      </TableCell>
                      <TableCell className="px-6 py-3 text-right text-slate-950">
                        {item.quantityReceived}
                      </TableCell>
                      <TableCell className="px-6 py-3 text-right text-slate-950">
                        {item.quantityRejected}
                      </TableCell>
                      <TableCell className="px-6 py-3 text-right text-slate-950">
                        {item.quantityNet}
                      </TableCell>
                      <TableCell className="px-6 py-3 text-slate-600">{item.uom}</TableCell>
                      <TableCell className="px-6 py-3 text-slate-600">
                        {item.notes ?? '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        ) : (
          <div className="px-6 py-4 text-sm text-slate-500">
            {GR_LABELS.DETAIL.ITEMS_UNAVAILABLE}
          </div>
        )}
      </div>

      <div className="rounded-[14px] border border-slate-200 bg-white shadow-sm px-6 py-6">
        <h2 className="text-base font-semibold text-slate-950">
          {GR_LABELS.DETAIL.DOCUMENTS_TITLE}
        </h2>
        <div className="mt-4">
          <FileAttachmentList
            groups={documentGroups}
            emptyMessage={GR_LABELS.DETAIL.DOCUMENTS_EMPTY}
            downloadLabel={GR_LABELS.DETAIL.DOWNLOAD_DOCUMENT}
          />
        </div>
      </div>
    </div>
  );
}
