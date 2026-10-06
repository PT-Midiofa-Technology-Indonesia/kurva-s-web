'use client';

import { Button } from '@/shared/components/ui';
import { formatIDR } from '@/shared/utils/currency';
import { PROCUREMENT_LABELS } from '../constants';
import type { PurchaseOrderDetail } from '../types/purchase-order-detail';

interface PurchaseOrderInvoiceSectionProps {
  detail: PurchaseOrderDetail;
  canEdit: boolean;
  onEdit: () => void;
}

export function PurchaseOrderInvoiceSection({
  detail,
  canEdit,
  onEdit,
}: PurchaseOrderInvoiceSectionProps) {
  const labels = PROCUREMENT_LABELS.PURCHASE_ORDER_DETAIL.INVOICE_SECTION;
  const invoice = detail.invoice;
  const documents = invoice?.documentRequirements ?? [];
  const hasDocuments = documents.some((item) => (item.uploadedDocuments ?? []).length > 0);
  const ctaLabel =
    detail.status === 'issued'
      ? labels.COMPLETE_DATA_BUTTON
      : detail.status === 'in_progress'
        ? labels.EDIT_BUTTON
        : null;

  return (
    <div className="px-6 pb-4 pt-2">
      <div className="rounded-[14px] border border-slate-200 bg-white p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-950">{labels.TITLE}</h3>
          {canEdit && ctaLabel ? (
            <Button
              type="button"
              onClick={onEdit}
              className="h-8 rounded-lg bg-amber-500 px-4 text-xs font-semibold text-white hover:bg-amber-600"
            >
              {ctaLabel}
            </Button>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-[14px] border border-slate-200 p-4 sm:p-5">
            <h4 className="mb-4 text-base font-semibold text-slate-950">
              {labels.INVOICE_AND_TAX_TITLE}
            </h4>
            <div className="grid gap-x-6 gap-y-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-slate-500">{labels.FIELDS.INVOICE_NUMBER}</p>
                <p className="text-sm font-medium text-slate-950">
                  {invoice?.invoiceNumber ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{labels.FIELDS.INVOICE_DATE}</p>
                <p className="text-sm font-medium text-slate-950">{invoice?.invoiceDate ?? '-'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{labels.FIELDS.INVOICE_DUE_DATE}</p>
                <p className="text-sm font-medium text-slate-950">
                  {invoice?.invoiceDueDate ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{labels.FIELDS.INVOICE_AMOUNT}</p>
                <p className="text-sm font-medium text-slate-950">
                  {invoice?.invoiceAmount != null ? formatIDR(invoice.invoiceAmount) : '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{labels.FIELDS.TAX_INVOICE_NUMBER}</p>
                <p className="text-sm font-medium text-slate-950">
                  {invoice?.taxInvoiceNumber ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{labels.FIELDS.TAX_INVOICE_DATE}</p>
                <p className="text-sm font-medium text-slate-950">
                  {invoice?.taxInvoiceDate ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{labels.FIELDS.TAX_INVOICE_STATUS}</p>
                <p className="text-sm font-medium text-slate-950">
                  {invoice?.taxInvoiceStatus ?? '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">{labels.FIELDS.TAXPAYER_NPWP}</p>
                <p className="text-sm font-medium text-slate-950">
                  {detail.createdBy?.name ?? '-'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[14px] border border-slate-200 p-4 sm:p-5">
            <h4 className="mb-4 text-base font-semibold text-slate-950">
              {labels.DOCUMENTS_TITLE}
            </h4>
            {hasDocuments ? (
              <div className="space-y-3">
                {documents.map((group) =>
                  (group.uploadedDocuments ?? []).map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 p-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-950">{file.fileName}</p>
                        <p className="text-xs text-slate-500">{group.name}</p>
                      </div>
                      <a
                        href={file.filePath}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-cyan-600 hover:underline"
                        aria-label={labels.DOWNLOAD(file.fileName)}
                      >
                        Download
                      </a>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-slate-500">{labels.EMPTY_DOCUMENTS}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
