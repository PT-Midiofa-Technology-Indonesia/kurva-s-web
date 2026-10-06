'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { useMemo } from 'react';

import { DataTableLayout } from '@/shared/components/templates/DataTableLayout';
import { Badge, type BadgeVariant, Label } from '@/shared/components/ui';
import { formatIDR } from '@/shared/utils/currency';
import {
  APPROVAL_REQUEST_LABELS,
  APPROVAL_REQUEST_STATUS_LABELS,
  APPROVAL_REQUEST_STATUS_VARIANTS,
} from '../constants';
import type { ApprovalDetail, CostBreakdown, DetailFormat, DetailTable } from '../types';

const EXTRA_BADGE_VARIANTS: Record<string, BadgeVariant> = {
  submitted: 'secondary',
  paid: 'success',
};

interface DetailFieldProps {
  label: string;
  value: string | number | string[] | null;
  formatType: DetailFormat;
}

function DetailField({ label, value, formatType }: DetailFieldProps) {
  if (value === null || value === undefined) {
    return null;
  }

  let displayValue: React.ReactNode = '-';

  if (formatType === 'text' && typeof value === 'string') {
    displayValue = value;
  } else if (formatType === 'number' && typeof value === 'number') {
    displayValue = Number(value).toLocaleString('id-ID');
  } else if (
    formatType === 'currency' &&
    (typeof value === 'string' || typeof value === 'number')
  ) {
    displayValue = formatIDR(Number(value));
  } else if (formatType === 'date' && typeof value === 'string') {
    try {
      const date = parseISO(value);
      displayValue = format(date, 'dd MMM yyyy', { locale: id });
    } catch {
      displayValue = value;
    }
  } else if (formatType === 'date-list' && Array.isArray(value)) {
    displayValue = (
      <div className="flex flex-wrap gap-2">
        {value.map((date, idx) => {
          try {
            const parsed = parseISO(date);
            const formatted = format(parsed, 'dd MMM yyyy', { locale: id });
            return (
              <Badge key={idx} variant="secondary">
                {formatted}
              </Badge>
            );
          } catch {
            return (
              <Badge key={idx} variant="secondary">
                {date}
              </Badge>
            );
          }
        })}
      </div>
    );
  } else if (formatType === 'badge' && typeof value === 'string') {
    const variant =
      APPROVAL_REQUEST_STATUS_VARIANTS[value] ?? EXTRA_BADGE_VARIANTS[value] ?? 'secondary';
    const label = APPROVAL_REQUEST_STATUS_LABELS[value] ?? value;
    displayValue = <Badge variant={variant}>{label}</Badge>;
  }

  return (
    <div className="flex flex-col gap-1">
      <Label className="text-sm font-normal text-slate-500">{label}</Label>
      <div className="text-sm font-medium text-slate-950">{displayValue}</div>
    </div>
  );
}

interface ApprovalDetailContentProps {
  detail: ApprovalDetail;
}

type DetailTableRow = (string | number | null)[];

function formatDetailCell(
  value: string | number | null | undefined,
  formatType: DetailFormat
): React.ReactNode {
  if (value === null || value === undefined) {
    return '-';
  }
  if (formatType === 'number' && typeof value === 'number') {
    return value.toLocaleString('id-ID');
  }
  if (formatType === 'currency' && (typeof value === 'string' || typeof value === 'number')) {
    return formatIDR(Number(value));
  }
  if (formatType === 'date' && typeof value === 'string') {
    try {
      return format(parseISO(value), 'dd MMM yyyy', { locale: id });
    } catch {
      return value;
    }
  }
  return value;
}

function buildDetailTableColumns(table: DetailTable): ColumnDef<DetailTableRow>[] {
  return table.columns.map((col, idx) => ({
    id: `col_${idx}`,
    header: col.label,
    accessorFn: (row: DetailTableRow) => row[idx],
    enableSorting: true,
    size: col.label.toLowerCase() === 'no' ? 50 : undefined,
    cell: ({ getValue }) => formatDetailCell(getValue() as string | number | null, col.format),
  }));
}

function CostBreakdownSection({ breakdown }: { breakdown: CostBreakdown }) {
  const hasTaxes = breakdown.taxes && breakdown.taxes.length > 0;
  const hasDpp = breakdown.dpp != null;
  const hasTotalPayable = breakdown.totalPayable != null;

  if (!hasDpp && !hasTaxes && !hasTotalPayable) return null;

  return (
    <div className="mt-4 flex w-full">
      <div className="w-full rounded-xl bg-slate-50 p-4">
        {breakdown.title && (
          <p className="mb-3 text-sm font-semibold text-slate-950">{breakdown.title}</p>
        )}
        <div className="space-y-2 text-sm text-slate-600">
          {hasDpp && (
            <div className="flex items-center justify-between gap-4">
              <span>{APPROVAL_REQUEST_LABELS.COST_BREAKDOWN.DPP_LABEL}</span>
              <span className="font-medium text-slate-950">{formatIDR(breakdown.dpp!)}</span>
            </div>
          )}

          {breakdown.taxes?.map((tax) => (
            <div
              key={tax.id ?? tax.taxTypeId ?? tax.label}
              className="flex items-center justify-between gap-4"
            >
              <span>{tax.label}</span>
              <span className="font-medium text-slate-950">
                {tax.effect === 'DEDUCTION' ? `- ${formatIDR(tax.amount)}` : formatIDR(tax.amount)}
              </span>
            </div>
          ))}

          {hasTotalPayable && (
            <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-2 text-slate-950">
              <span>{APPROVAL_REQUEST_LABELS.COST_BREAKDOWN.TOTAL_LABEL}</span>
              <span className="font-semibold">{formatIDR(breakdown.totalPayable!)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ApprovalDetailContent({ detail }: ApprovalDetailContentProps) {
  const breakdown = detail.costBreakdown ?? detail.rincianNilai;
  const tableColumns = useMemo(
    () => (detail.table ? buildDetailTableColumns(detail.table) : []),
    [detail.table]
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-x-8 gap-y-6">
        {detail.summary.map((item, idx) => (
          <DetailField key={idx} label={item.label} value={item.value} formatType={item.format} />
        ))}
      </div>

      {detail.table && detail.table.rows.length > 0 && (
        <>
          <div className="border-t border-slate-200" />
          <DataTableLayout
            columns={tableColumns}
            data={detail.table.rows}
            emptyMessage="Tidak ada data."
            enablePagination={false}
            enableRowSelection={false}
            enableColumnResize={false}
            enableColumnDnd={false}
            enableZebraStripes
            enableRangeSelection
            className="rounded-none border shadow-none"
          />
        </>
      )}

      {breakdown && <CostBreakdownSection breakdown={breakdown} />}
    </>
  );
}
