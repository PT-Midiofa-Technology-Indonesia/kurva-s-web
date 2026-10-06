'use client';

import type { ColumnDef } from '@tanstack/react-table';
import {
  AlertCircle,
  Edit,
  Eye,
  Loader2,
  MoreVertical,
  Plus,
  Settings,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useRef } from 'react';
import { FileAttachmentList } from '@/shared/components/molecules';
import { DataTable } from '@/shared/components/organisms';
import {
  Alert,
  AlertTitle,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Progress,
} from '@/shared/components/ui';
import { formatCurrencyIDR, formatDate } from '@/shared/utils/format';
import { TAX_FILING_LABELS, TAX_FILING_STATUS_LABELS } from '../constants';
import type { TaxFiling, TaxFilingPayment, TaxFilingTransactionDetail } from '../types';

export function TaxFilingStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={
        status === 'closed' || status === 'reported'
          ? 'success'
          : status === 'not_reported'
            ? 'destructive'
            : 'secondary'
      }
    >
      {TAX_FILING_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
function Field({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-950">{value ?? '-'}</p>
    </div>
  );
}
export function TaxFilingSummaryCard({ taxFiling }: { taxFiling: TaxFiling }) {
  const s = taxFiling.taxSummary;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Filling Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Company" value={taxFiling.company?.name ?? 'Company 01'} />
          <Field
            label="Tax Period"
            value={taxFiling.taxPeriod ? formatDate(taxFiling.taxPeriod) : '-'}
          />
          <div>
            <p className="text-sm text-slate-500">Tax Type</p>
            <Badge variant="outline">{taxFiling.taxType?.name ?? 'VAT'}</Badge>
          </div>
          <div>
            <p className="text-sm text-slate-500">Status</p>
            <Badge variant="outline">
              {TAX_FILING_STATUS_LABELS[taxFiling.status] ?? taxFiling.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card className="flex flex-col justify-between">
        <CardHeader>
          <CardTitle>Tax Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Field
              label={TAX_FILING_LABELS.FIELDS.TAX_PAYABLE}
              value={formatCurrencyIDR(s?.taxPayable ?? taxFiling.totalTax)}
            />
            <Field
              label={TAX_FILING_LABELS.FIELDS.TAX_PAID}
              value={formatCurrencyIDR(s?.taxPaid ?? 0)}
            />
            <Field
              label={TAX_FILING_LABELS.FIELDS.OUTSTANDING}
              value={formatCurrencyIDR(s?.outstanding ?? 0)}
            />
          </div>
          <Alert className="border-amber-500 bg-amber-50 text-amber-900">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-sm font-medium">
              {s?.taxPayableNote ?? 'Tax Payable = VAT Output - VAT Input'}
            </AlertTitle>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
export function TaxFilingInformationCard({
  taxFiling,
  onSetInformation,
}: {
  taxFiling: TaxFiling;
  onSetInformation: () => void;
}) {
  const i = taxFiling.information;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Filling Information</CardTitle>
        <Button onClick={onSetInformation}>
          <Settings className="mr-2 h-4 w-4" /> Set Filling Information
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <p className="text-sm text-slate-500">Filling Status</p>
            <Badge variant={i?.filingStatus === 'Submitted' ? 'success' : 'secondary'}>
              {i?.filingStatus ?? 'Submitted'}
            </Badge>
          </div>
          <Field
            label="Filling Period"
            value={i?.filingPeriod ?? (taxFiling.taxPeriod ? formatDate(taxFiling.taxPeriod) : '-')}
          />
          <Field
            label="Due Date"
            value={i?.dueDate ? formatDate(i.dueDate) : formatDate(taxFiling.dueDate)}
          />
          <Field label="DJP Reference No" value={i?.djpReferenceNo ?? '-'} />
          <Field label="BPE Number" value={i?.bpeNumber ?? '-'} />
          <Field label="BPE Date" value={i?.bpeDate ? formatDate(i.bpeDate) : '-'} />
          <Field label="Submitted By" value={i?.submittedBy?.name ?? '-'} />
        </div>

        {i?.attachments?.length ? (
          <div className="space-y-2 border-t pt-4">
            <p className="text-sm font-medium text-slate-700">BPE Attachment</p>
            <FileAttachmentList
              groups={[{ label: 'BPE Attachment', files: i.attachments }]}
              emptyMessage="Belum ada lampiran"
              downloadLabel={() => 'Download'}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
function toTitleCase(str?: string): string {
  if (!str) return '-';
  return str
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const TAX_BREAKDOWN_COLUMNS: ColumnDef<TaxFilingTransactionDetail>[] = [
  {
    accessorKey: 'code',
    header: 'Tax Report No',
    cell: ({ row }) => (
      <Link
        href={`/finance/tax-report/${row.original.id}`}
        className="font-medium text-brand-600 hover:underline"
      >
        {row.original.code}
      </Link>
    ),
  },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <Badge variant="outline">{toTitleCase(row.original.source)}</Badge>,
  },
  {
    accessorKey: 'referenceNo',
    header: 'Reference No',
    cell: ({ row }) => (
      <span className="font-medium text-brand-600 cursor-pointer hover:underline">
        {row.original.referenceNo}
      </span>
    ),
  },
  {
    id: 'partner',
    header: 'Partner',
    cell: ({ row }) => <span>{row.original.partner.name}</span>,
  },
  {
    accessorKey: 'taxCode',
    header: 'Tax Code',
  },
  {
    accessorKey: 'taxBase',
    header: 'Tax Base (DPP)',
    cell: ({ row }) => formatCurrencyIDR(row.original.taxBase),
  },
  {
    accessorKey: 'taxRate',
    header: 'Tax Rate',
    cell: ({ row }) => `${row.original.taxRate}%`,
  },
  {
    accessorKey: 'taxAmount',
    header: 'Tax Amount',
    cell: ({ row }) => formatCurrencyIDR(row.original.taxAmount),
  },
  {
    accessorKey: 'totalTaxAmount',
    header: 'Total Tax Amount',
    cell: ({ row }) => formatCurrencyIDR(row.original.totalTaxAmount),
  },
  {
    accessorKey: 'direction',
    header: 'Direction',
    cell: ({ row }) => <Badge variant="secondary">{row.original.direction}</Badge>,
  },
];

export function TaxFilingTransactionCard({ taxFiling }: { taxFiling: TaxFiling }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable<TaxFilingTransactionDetail, unknown>
          columns={TAX_BREAKDOWN_COLUMNS}
          data={taxFiling.taxTransactionDetails ?? []}
          enablePagination={false}
          enableZebraStripes={false}
        />
      </CardContent>
    </Card>
  );
}
export function TaxFilingPaymentsCard({
  taxFiling,
  onAddPayment,
  onViewPayment,
  onEditPayment,
}: {
  taxFiling: TaxFiling;
  onAddPayment: () => void;
  onViewPayment: (paymentId: string) => void;
  onEditPayment: (paymentId: string) => void;
}) {
  const columns: ColumnDef<TaxFilingPayment>[] = [
    {
      accessorKey: 'billingCode',
      header: 'Billing Code',
    },
    {
      accessorKey: 'paymentDate',
      header: 'Payment Date',
      cell: ({ row }) => (row.original.paymentDate ? formatDate(row.original.paymentDate) : '-'),
    },
    {
      id: 'paymentMethod',
      header: 'Payment Method',
      cell: ({ row }) => row.original.paymentType?.name ?? 'Bank Transfer',
    },
    {
      accessorKey: 'amount',
      header: 'Amount Paid',
      cell: ({ row }) => formatCurrencyIDR(row.original.amount),
    },
    {
      accessorKey: 'ntpn',
      header: 'NTPN',
    },
    {
      id: 'submittedBy',
      header: 'Submit By',
      cell: ({ row }) => row.original.submittedBy?.name ?? '-',
    },
    {
      accessorKey: 'paymentStatus',
      header: 'Payment Status',
      cell: ({ row }) => <TaxFilingStatusBadge status={row.original.paymentStatus} />,
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewPayment(row.original.id)}>
              <Eye className="mr-2 h-4 w-4" /> Detail Payment
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditPayment(row.original.id)}>
              <Edit className="mr-2 h-4 w-4" /> Edit Payment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Payment Information</CardTitle>
        <Button onClick={onAddPayment}>
          <Plus className="mr-2 h-4 w-4" /> Add Payment
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable<TaxFilingPayment, unknown>
          columns={columns}
          data={taxFiling.payments ?? []}
          enablePagination={false}
          enableZebraStripes={false}
        />
      </CardContent>
    </Card>
  );
}
export function TaxFilingAttachmentsCard({
  taxFiling,
  onUpload,
  onDelete,
  isUploading = false,
  uploadProgress = null,
}: {
  taxFiling: TaxFiling;
  onUpload: (files: File[]) => void;
  onDelete: (documentId: string) => void;
  isUploading?: boolean;
  uploadProgress?: number | null;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(Array.from(e.target.files));
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>{TAX_FILING_LABELS.DETAIL.ATTACHMENTS}</CardTitle>
          <p className="mt-0.5 text-xs text-slate-500">
            {TAX_FILING_LABELS.DETAIL.ATTACHMENT_SUBTITLE}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {TAX_FILING_LABELS.DETAIL.ATTACHMENT_ADD_FILES}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </CardHeader>
      <CardContent className="space-y-4">
        {isUploading && uploadProgress !== null ? (
          <div className="space-y-2 rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-950">
                {TAX_FILING_LABELS.DETAIL.ATTACHMENT_UPLOADING}
              </p>
              <p className="text-xs text-slate-500">{uploadProgress}%</p>
            </div>
            <Progress value={uploadProgress} className="h-1.5" />
          </div>
        ) : null}
        <FileAttachmentList
          groups={[{ label: '', files: taxFiling.attachments ?? [] }]}
          emptyMessage={TAX_FILING_LABELS.DETAIL.EMPTY_ATTACHMENTS}
          downloadLabel={TAX_FILING_LABELS.DETAIL.DOWNLOAD_ATTACHMENT}
          onDelete={onDelete}
          deleteLabel={TAX_FILING_LABELS.DETAIL.ATTACHMENT_DELETE}
        />
      </CardContent>
    </Card>
  );
}
