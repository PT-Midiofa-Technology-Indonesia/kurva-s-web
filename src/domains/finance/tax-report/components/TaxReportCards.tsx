import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { FileAttachmentList } from '@/shared/components/molecules';
import { DataTable } from '@/shared/components/organisms';
import { Badge } from '@/shared/components/ui';
import { formatCurrencyIDR, formatDate } from '@/shared/utils/format';
import {
  TAX_REPORT_LABELS,
  TAX_REPORT_SOURCE_LABELS,
  TAX_REPORT_STATUS_LABELS,
} from '../constants';
import type { TaxReport, TaxReportAttachment, TaxReportStatus, TaxReportTaxDetail } from '../types';
import { getTaxReportSourceHref, getTaxReportStatusVariant } from '../utils/source-route';

function valueText(value?: string | number | null) {
  return value === null || value === undefined || value === '' ? '-' : String(value);
}

function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-1.5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-950">{valueText(value)}</p>
    </div>
  );
}

export function TaxReportStatusBadge({ status }: { status: TaxReportStatus | string }) {
  return (
    <Badge variant={getTaxReportStatusVariant(status)}>
      {TAX_REPORT_STATUS_LABELS[status] ?? valueText(status)}
    </Badge>
  );
}

export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="mb-5 text-base font-semibold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

export function TaxSummaryCard({ taxReport }: { taxReport: TaxReport }) {
  return (
    <Card title={TAX_REPORT_LABELS.DETAIL.TAX_SUMMARY}>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label={TAX_REPORT_LABELS.FIELDS.COMPANY} value={taxReport.company?.name} />
        <Field label={TAX_REPORT_LABELS.FIELDS.CODE} value={taxReport.code} />
        <Field label={TAX_REPORT_LABELS.FIELDS.TAX_DIRECTION} value={taxReport.direction} />
        <div className="space-y-1.5">
          <p className="text-sm text-slate-500">{TAX_REPORT_LABELS.FIELDS.TAX_STATUS}</p>
          <TaxReportStatusBadge status={taxReport.status} />
        </div>
        <Field
          label={TAX_REPORT_LABELS.FIELDS.TAXABLE_AMOUNT}
          value={formatCurrencyIDR(taxReport.subtotalAmount)}
        />
        <Field
          label={TAX_REPORT_LABELS.FIELDS.TOTAL_TAX_AMOUNT}
          value={formatCurrencyIDR(taxReport.totalTaxAmount)}
        />
        <Field
          label={TAX_REPORT_LABELS.FIELDS.TOTAL_TRANSACTION}
          value={formatCurrencyIDR(taxReport.totalAmount)}
        />
      </div>
    </Card>
  );
}

const TAX_BREAKDOWN_COLUMNS: ColumnDef<TaxReportTaxDetail>[] = [
  {
    accessorKey: 'taxType.name',
    header: TAX_REPORT_LABELS.FIELDS.TAX_TYPE,
    cell: ({ row }) => row.original.taxType.name,
  },
  {
    accessorKey: 'taxType.code',
    header: TAX_REPORT_LABELS.FIELDS.TAX_CODE,
    cell: ({ row }) => row.original.taxType.code,
  },
  {
    accessorKey: 'taxBaseAmount',
    header: TAX_REPORT_LABELS.FIELDS.TAX_BASE,
    cell: ({ row }) => formatCurrencyIDR(row.original.taxBaseAmount),
  },
  {
    accessorKey: 'taxRate',
    header: TAX_REPORT_LABELS.FIELDS.TAX_RATE,
    cell: ({ row }) => `${row.original.taxRate}%`,
  },
  {
    accessorKey: 'taxAmount',
    header: TAX_REPORT_LABELS.FIELDS.TAX_AMOUNT,
    cell: ({ row }) => formatCurrencyIDR(row.original.taxAmount),
  },
  {
    accessorKey: 'totalAmount',
    header: TAX_REPORT_LABELS.FIELDS.TOTAL_AMOUNT,
    cell: ({ row }) => formatCurrencyIDR(row.original.totalAmount),
  },
];

export function TaxBreakdownCard({ taxReport }: { taxReport: TaxReport }) {
  return (
    <Card title={TAX_REPORT_LABELS.DETAIL.TAX_BREAKDOWN}>
      <DataTable<TaxReportTaxDetail, unknown>
        columns={TAX_BREAKDOWN_COLUMNS}
        data={taxReport.taxDetails ?? []}
        getRowId={(row) => row.id}
        emptyMessage={TAX_REPORT_LABELS.DETAIL.EMPTY_BREAKDOWN}
        enablePagination={false}
        enableColumnDnd={false}
        enableColumnResize={false}
        enableZebraStripes={false}
        className="overflow-hidden rounded-[14px] border border-slate-200 shadow-sm"
      />
    </Card>
  );
}

export function TransactionInfoCard({ taxReport }: { taxReport: TaxReport }) {
  const sourceHref = getTaxReportSourceHref(taxReport.resourceType, taxReport.resourceId);

  return (
    <Card title={TAX_REPORT_LABELS.DETAIL.TRANSACTION_INFORMATION}>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label={TAX_REPORT_LABELS.FIELDS.DOCUMENT_NO} value={taxReport.documentNumber} />
        <Field
          label={TAX_REPORT_LABELS.FIELDS.DOCUMENT_DATE}
          value={taxReport.documentDate ? formatDate(taxReport.documentDate) : '-'}
        />
        <Field
          label={TAX_REPORT_LABELS.FIELDS.TAX_REFERENCE_NO}
          value={taxReport.resourceReference}
        />
        <Field
          label={TAX_REPORT_LABELS.FIELDS.TAX_REFERENCE_DATE}
          value={formatDate(taxReport.transactionDate)}
        />
        <Field
          label={TAX_REPORT_LABELS.FIELDS.SOURCE}
          value={TAX_REPORT_SOURCE_LABELS[taxReport.resourceType] ?? taxReport.resourceType}
        />
        <div className="space-y-1.5">
          <p className="text-sm text-slate-500">{TAX_REPORT_LABELS.FIELDS.REFERENCE_NO}</p>
          {sourceHref ? (
            <Link className="text-sm font-medium text-brand-500 underline" href={sourceHref}>
              {taxReport.resourceReference}
            </Link>
          ) : (
            <p className="text-sm font-medium text-slate-950">
              {valueText(taxReport.resourceReference)}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

export function PartnerInfoCard({ taxReport }: { taxReport: TaxReport }) {
  return (
    <Card title={TAX_REPORT_LABELS.DETAIL.PARTNER_INFORMATION}>
      <div className="grid gap-5 md:grid-cols-3">
        <Field label={TAX_REPORT_LABELS.FIELDS.PARTNER_TYPE} value={taxReport.partner.type} />
        <Field label={TAX_REPORT_LABELS.FIELDS.NAME} value={taxReport.partner.name} />
        <Field label={TAX_REPORT_LABELS.FIELDS.CODE} value={taxReport.partner.code} />
        <Field label={TAX_REPORT_LABELS.FIELDS.ADDRESS} value={taxReport.partner.address} />
        <Field label={TAX_REPORT_LABELS.FIELDS.NPWP} value={taxReport.partner.npwp} />
      </div>
    </Card>
  );
}

function groupAttachments(attachments: TaxReportAttachment[]) {
  return attachments.map((attachment) => ({
    label: attachment.documentTypeName ?? TAX_REPORT_LABELS.DETAIL.ATTACHMENTS,
    files: attachment.uploadedDocuments ?? [],
  }));
}

export function AttachmentsCard({ taxReport }: { taxReport: TaxReport }) {
  return (
    <Card title={TAX_REPORT_LABELS.DETAIL.ATTACHMENTS}>
      <FileAttachmentList
        groups={groupAttachments(taxReport.attachments ?? [])}
        emptyMessage={TAX_REPORT_LABELS.DETAIL.EMPTY_ATTACHMENTS}
        downloadLabel={TAX_REPORT_LABELS.DETAIL.DOWNLOAD_ATTACHMENT}
      />
    </Card>
  );
}
