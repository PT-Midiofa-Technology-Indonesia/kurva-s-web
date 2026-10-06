'use client';

import type { ColumnDef, Table } from '@tanstack/react-table';
import type { HeaderColumnNode } from '@/components/organisms/DataTable';
import { formatIDR } from '@/shared/utils/currency';
import { generateId } from '@/shared/utils/generate-id';
import type { BOQCostNameAsyncSelect } from '../types/boq-cost.types';
import { resolveNameHeader } from '../types/boq-cost.types';
import type { BOQCostColumnLabels } from '../types/boq-labels.types';

export function createEmptyExecutionCostRow(): BOQExecutionCostRow {
  return { id: generateId(), code: '', name: '' };
}

export interface BOQExecutionCostRow {
  id: string;
  code: string;
  name: string;
  catalogId?: string;
  vol_rab?: number;
  vol_cco?: number;
  vol_actual?: number;
  satuan?: string;
  uomId?: string | null;
  /** Equipment & Manpower only */
  durasiSewa_rab?: number;
  durasiSewa_cco?: number;
  durasiSewa_actual?: number;
  durationUoM?: string;
  durationUomId?: string | null;
  hargaSatuan_rab?: number;
  hargaSatuan_cco?: number;
  hargaSatuan_actual?: number;
  keterangan?: string;
  /** Marker for footer row */
  isFooter?: boolean;
}

export interface BOQExecutionCostSection {
  value: string;
  label: string;
  rows: BOQExecutionCostRow[];
  disabled?: boolean;
  nameHeader?: string;
  infoBadge?: { message: string };
  searchPlaceholder?: string;
  /** When provided, CCO/ACT columns are editable for these suffixes */
  editableSuffixes?: Set<string>;
  /** Called when rows change via cell edit */
  onRowsChange?: (rows: BOQExecutionCostRow[]) => void;
}

export interface BOQExecutionCostColumnsOptions {
  sectionValue: string;
  disabled: boolean;
  labels?: Partial<BOQCostColumnLabels>;
  /** Set of suffixes ('rab', 'cco', 'actual') that are editable */
  editableSuffixes?: Set<string>;
  /** Catalog async-select for name column (material/equipment selection) */
  nameAsyncSelect?: BOQCostNameAsyncSelect;
}

export interface BOQExecutionCostColumnsResult {
  columns: ColumnDef<BOQExecutionCostRow>[];
  headerColumnTree: HeaderColumnNode[];
}

const DEFAULT_COST_COLUMN_LABELS: BOQCostColumnLabels = {
  code: 'Kode',
  name: 'Name',
  vol: 'VOL',
  uom: 'UoM',
  unitPrice: 'Unit Price',
  total: 'Total',
  salary: 'Salary/h',
  remarks: 'Remarks',
};

const RAB_CCO_ACT = ['rab', 'cco', 'actual'] as const;
const suffixLabel = (suffix: string) => (suffix === 'actual' ? 'ACT' : suffix.toUpperCase());

export function createBOQExecutionCostColumns(
  opts: BOQExecutionCostColumnsOptions
): BOQExecutionCostColumnsResult {
  const { sectionValue } = opts;
  const nameHeader = resolveNameHeader(
    sectionValue,
    sectionValue === 'equipment_cost' ? 'Equipment name' : undefined
  );
  const labels = { ...DEFAULT_COST_COLUMN_LABELS, ...opts.labels };

  const isEquipment = sectionValue === 'equipment_cost';
  const isManpower = sectionValue === 'man_power_cost';
  const hasDuration = isEquipment || isManpower;
  const priceLabel = isManpower ? labels.salary : labels.unitPrice;
  const totalLabel = labels.total;

  const nameEditMeta = (() => {
    if (opts.disabled) return { editable: false, cellClassName: 'h-9' };
    if (opts.nameAsyncSelect) {
      return {
        editable: true,
        cellClassName: 'h-9',
        edit: {
          editType: 'async-select' as const,
          selectOptions: opts.nameAsyncSelect.options,
          selectHasNextPage: opts.nameAsyncSelect.hasNextPage,
          selectOnLoadMore: opts.nameAsyncSelect.onScrollEnd,
          selectOnSearch: opts.nameAsyncSelect.onSearch,
        },
      };
    }
    return { editable: false, cellClassName: 'h-9' };
  })();

  const getVolKey = (suffix: string) =>
    suffix === 'rab' ? 'vol_rab' : suffix === 'cco' ? 'vol_cco' : 'vol_actual';
  const getDurKey = (suffix: string) =>
    suffix === 'rab' ? 'durasiSewa_rab' : suffix === 'cco' ? 'durasiSewa_cco' : 'durasiSewa_actual';
  const getPriceKey = (suffix: string) =>
    suffix === 'rab'
      ? 'hargaSatuan_rab'
      : suffix === 'cco'
        ? 'hargaSatuan_cco'
        : 'hargaSatuan_actual';

  const isEditableSuffix = (suffix: string) =>
    !opts.disabled && !!opts.editableSuffixes?.has(suffix);

  const columns: ColumnDef<BOQExecutionCostRow>[] = [
    {
      accessorKey: 'code',
      header: labels.code,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 82,
    },
    {
      accessorKey: 'name',
      header: nameHeader,
      meta: nameEditMeta,
      size: 252,
    },
    // VOL subcolumns: rab, cco, actual
    ...RAB_CCO_ACT.map((suffix) => ({
      id: `vol_${suffix}`,
      header: suffixLabel(suffix),
      accessorFn: (row: BOQExecutionCostRow) => row[getVolKey(suffix) as keyof BOQExecutionCostRow],
      cell: ({ row }: { row: { original: BOQExecutionCostRow } }) => (
        <span>{row.original[getVolKey(suffix) as keyof BOQExecutionCostRow] ?? ''}</span>
      ),
      meta: {
        editable: isEditableSuffix(suffix),
        edit: isEditableSuffix(suffix) ? ({ editType: 'input' } as const) : undefined,
        cellClassName: 'h-9',
      },
      size: 77,
    })),
    {
      id: 'satuan',
      accessorKey: 'satuan',
      header: labels.uom,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 79,
    },
  ];

  // Duration columns (equipment & manpower only)
  if (hasDuration) {
    columns.push(
      ...RAB_CCO_ACT.map((suffix) => ({
        id: `durasi_sewa_${suffix}`,
        header: suffixLabel(suffix),
        accessorFn: (row: BOQExecutionCostRow) =>
          row[getDurKey(suffix) as keyof BOQExecutionCostRow],
        cell: ({ row }: { row: { original: BOQExecutionCostRow } }) => (
          <span>{row.original[getDurKey(suffix) as keyof BOQExecutionCostRow] ?? ''}</span>
        ),
        meta: {
          editable: isEditableSuffix(suffix),
          edit: isEditableSuffix(suffix) ? ({ editType: 'input' } as const) : undefined,
          cellClassName: 'h-9',
        },
        size: 81,
      })),
      {
        id: 'durationUoM',
        accessorKey: 'durationUoM',
        header: labels.uom,
        cell: ({ row }: { row: { original: BOQExecutionCostRow } }) => (
          <span>{row.original.durationUoM ?? ''}</span>
        ),
        meta: { editable: false, cellClassName: 'h-9' },
        size: 79,
      }
    );
  }

  // Unit price / Salary subcolumns
  columns.push(
    ...RAB_CCO_ACT.map((suffix) => ({
      id: `harga_satuan_${suffix}`,
      header: suffixLabel(suffix),
      accessorFn: (row: BOQExecutionCostRow) =>
        row[getPriceKey(suffix) as keyof BOQExecutionCostRow],
      cell: ({ row }: { row: { original: BOQExecutionCostRow } }) => (
        <span className="text-right block w-full">
          {formatIDR(
            Number(row.original[getPriceKey(suffix) as keyof BOQExecutionCostRow]) || undefined
          )}
        </span>
      ),
      meta: {
        editable: isEditableSuffix(suffix),
        edit: isEditableSuffix(suffix) ? ({ editType: 'input' } as const) : undefined,
        cellClassName: 'h-9',
      },
      size: 128,
    }))
  );

  // Total / Amount subcolumns (computed: vol * price * duration)
  columns.push(
    ...RAB_CCO_ACT.map((suffix) => {
      const volKey = getVolKey(suffix) as keyof BOQExecutionCostRow;
      const priceKey = getPriceKey(suffix) as keyof BOQExecutionCostRow;
      const durKey = getDurKey(suffix) as keyof BOQExecutionCostRow;
      return {
        id: `jumlah_harga_${suffix}`,
        header: suffixLabel(suffix),
        footer: ({ table }: { table: Table<BOQExecutionCostRow> }) => {
          const sum = table.getFilteredRowModel().rows.reduce((acc, row) => {
            const vol = Number(row.original[volKey] ?? 0);
            const price = Number(row.original[priceKey] ?? 0);
            const dur = hasDuration ? Number(row.original[durKey] ?? 1) : 1;
            return acc + vol * price * dur;
          }, 0);
          return <span className="text-right block w-full font-semibold">{formatIDR(sum)}</span>;
        },
        accessorFn: (row: BOQExecutionCostRow) => {
          const vol = Number(row[volKey] ?? 0);
          const price = Number(row[priceKey] ?? 0);
          const dur = hasDuration ? Number(row[durKey] ?? 1) : 1;
          return vol * price * dur;
        },
        cell: ({ row }: { row: { original: BOQExecutionCostRow } }) => {
          const r = row.original;
          const vol = r[volKey];
          const price = r[priceKey];
          if (vol == null || price == null) return <span />;
          const dur = hasDuration ? Number(r[durKey] ?? 1) : 1;
          return (
            <span className="text-right block w-full">
              {formatIDR(Number(vol) * Number(price) * dur)}
            </span>
          );
        },
        meta: { editable: false, cellClassName: 'h-9' },
        size: 128,
      };
    }),
    {
      id: 'keterangan',
      accessorKey: 'keterangan',
      header: labels.remarks,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 128,
    }
  );

  // ── Header column tree ──
  const headerColumnTree: HeaderColumnNode[] = [
    { id: 'code', header: labels.code },
    { id: 'name', header: nameHeader },
    {
      id: 'vol',
      header: labels.vol,
      children: [
        ...RAB_CCO_ACT.map((suffix) => ({
          id: `vol_${suffix}`,
          header: suffixLabel(suffix),
        })),
        { id: 'satuan', header: labels.uom },
      ],
    },
    ...(hasDuration
      ? [
          {
            id: 'durasi_sewa',
            header: 'Duration',
            children: [
              ...RAB_CCO_ACT.map((suffix) => ({
                id: `durasi_sewa_${suffix}`,
                header: suffixLabel(suffix),
              })),
              { id: 'durationUoM', header: labels.uom },
            ],
          },
        ]
      : []),
    {
      id: 'harga_satuan',
      header: priceLabel,
      children: RAB_CCO_ACT.map((suffix) => ({
        id: `harga_satuan_${suffix}`,
        header: suffixLabel(suffix),
      })),
    },
    {
      id: 'jumlah_harga',
      header: totalLabel,
      children: RAB_CCO_ACT.map((suffix) => ({
        id: `jumlah_harga_${suffix}`,
        header: suffixLabel(suffix),
      })),
    },
    { id: 'keterangan', header: labels.remarks },
  ];

  return { columns, headerColumnTree };
}
