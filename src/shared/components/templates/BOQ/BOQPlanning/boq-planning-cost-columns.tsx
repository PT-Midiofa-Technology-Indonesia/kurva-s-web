'use client';

import type { ColumnDef, Table } from '@tanstack/react-table';
import type { HeaderColumnNode } from '@/components/organisms/DataTable';
import { formatIDR } from '@/shared/utils/currency';
import type { BOQCostNameAsyncSelect, BOQCostNameCombobox } from '../types/boq-cost.types';
import { resolveNameHeader } from '../types/boq-cost.types';
import type { BOQCostColumnLabels } from '../types/boq-labels.types';
import type { BOQUomAsyncSelect } from '../types/boq-planning.types';
import type { BOQPlanningCostRow } from './boq-planning-cost.types';

export interface BOQPlanningCostColumnsOptions {
  sectionValue: string;
  nameHeader?: string;
  disabled: boolean;
  nameCombobox?: BOQCostNameCombobox;
  nameAsyncSelect?: BOQCostNameAsyncSelect;
  /** UOM async-select for the satuan (Volume UoM) column — general list, no groupType filter */
  uomAsyncSelect?: BOQUomAsyncSelect;
  /** UOM async-select for the durationUoM column — typically groupType=time filtered */
  durationUomAsyncSelect?: BOQUomAsyncSelect;
  labels?: Partial<BOQCostColumnLabels>;
  /** Column IDs that should be read-only even when section is not disabled. */
  readOnlyColumns?: string[];
}

export interface BOQPlanningCostColumnsResult {
  columns: ColumnDef<BOQPlanningCostRow>[];
  headerColumnTree: HeaderColumnNode[];
}

const DEFAULT_COST_COLUMN_LABELS: BOQCostColumnLabels = {
  code: 'Code',
  name: 'Name',
  vol: 'VOL',
  uom: 'UoM',
  unitPrice: 'Unit Price',
  total: 'Total',
  salary: 'Salary/h',
  remarks: 'Remarks',
};

export function createBOQPlanningCostColumns(
  opts: BOQPlanningCostColumnsOptions
): BOQPlanningCostColumnsResult {
  const { sectionValue, disabled, nameCombobox, nameAsyncSelect, readOnlyColumns = [] } = opts;
  const nameHeader = resolveNameHeader(sectionValue, opts.nameHeader);
  const labels = { ...DEFAULT_COST_COLUMN_LABELS, ...opts.labels };
  const readOnlySet = new Set(readOnlyColumns);

  const codeEditable = !disabled && !nameAsyncSelect;

  const nameEditMeta = (() => {
    if (disabled) return { editable: false, cellClassName: 'h-9' };
    if (nameAsyncSelect) {
      return {
        editable: true,
        cellClassName: 'h-9',
        edit: {
          editType: 'async-select' as const,
          selectOptions: nameAsyncSelect.options,
          selectHasNextPage: nameAsyncSelect.hasNextPage,
          selectOnLoadMore: nameAsyncSelect.onScrollEnd,
          selectOnSearch: nameAsyncSelect.onSearch,
        },
      };
    }
    if (nameCombobox) {
      return {
        editable: true,
        cellClassName: 'h-9',
        edit: {
          editType: 'combobox' as const,
          comboboxOptions: nameCombobox.options,
          comboboxOnLoadMore: nameCombobox.onScrollEnd,
          comboboxOnSearch: nameCombobox.onSearch,
          comboboxHasNextPage: nameCombobox.hasNextPage,
        },
      };
    }
    return { editable: true, cellClassName: 'h-9' };
  })();

  const isMaterial = sectionValue === 'material_cost';
  const isEquipment = sectionValue === 'equipment_cost';
  const isManpower = sectionValue === 'man_power_cost';
  const isTransport = sectionValue === 'transport_cost';
  const hasDuration = isEquipment || isManpower;
  // Material Cost & Equipment Cost: UoM after VOL is always readonly (never user-editable)
  const uomAfterVolReadonly = isMaterial || isEquipment;
  const priceLabel = isManpower ? labels.salary : labels.unitPrice;
  const totalLabel = isTransport || isManpower ? labels.total : labels.total;

  const { uomAsyncSelect: uomSel, durationUomAsyncSelect: durationUomSel } = opts;

  const makeUomEditMeta = (sel?: BOQUomAsyncSelect) => {
    if (disabled || !sel) return { editable: false, cellClassName: 'h-9' };
    return {
      editable: true as const,
      cellClassName: 'h-9',
      edit: {
        editType: 'async-select' as const,
        selectOptions: sel.options,
        selectHasNextPage: sel.hasNextPage,
        selectOnLoadMore: sel.onScrollEnd,
        selectOnSearch: sel.onSearch,
      },
    };
  };

  const columns: ColumnDef<BOQPlanningCostRow>[] = [
    {
      accessorKey: 'code',
      header: labels.code,
      meta: { editable: codeEditable, cellClassName: 'h-9' },
      size: 82,
    },
    {
      accessorKey: 'name',
      header: nameHeader,
      meta: nameEditMeta,
      size: 252,
    },
    {
      id: 'vol_rab',
      header: 'RAB',
      accessorFn: (row) => row.vol,
      cell: ({ row }) => <span>{row.original.vol ?? ''}</span>,
      meta: {
        editable: !disabled && !readOnlySet.has('vol_rab'),
        cellClassName: 'h-9',
        edit: { editType: 'input' as const, inputType: 'number' as const },
        copyValue: (r: BOQPlanningCostRow) => r.vol ?? '',
      },
      size: 77,
    },
    {
      accessorKey: 'satuan',
      header: labels.uom,
      cell: ({ row }) => {
        const r = row.original;
        return <span>{r.uomLabel ?? r.satuan ?? ''}</span>;
      },
      meta: uomAfterVolReadonly
        ? { editable: false, cellClassName: 'h-9' }
        : makeUomEditMeta(uomSel),
      size: 79,
    },
    ...(hasDuration
      ? ([
          {
            id: 'durasi_sewa_rab',
            header: 'RAB',
            accessorFn: (row: BOQPlanningCostRow) => row.durasiSewa,
            cell: ({ row }: { row: { original: BOQPlanningCostRow } }) => (
              <span>{row.original.durasiSewa ?? ''}</span>
            ),
            meta: {
              editable: !disabled,
              cellClassName: 'h-9',
              edit: { editType: 'input' as const, inputType: 'number' as const },
              copyValue: (r: BOQPlanningCostRow) => r.durasiSewa ?? '',
            },
            size: 81,
          },
          {
            accessorKey: 'durationUoM',
            header: labels.uom,
            cell: ({ row }: { row: { original: BOQPlanningCostRow } }) => {
              const r = row.original;
              return <span>{r.durationUomLabel ?? r.durationUoM ?? ''}</span>;
            },
            meta: makeUomEditMeta(durationUomSel ?? uomSel),
            size: 79,
          },
        ] as ColumnDef<BOQPlanningCostRow>[])
      : []),
    {
      id: 'harga_satuan_rab',
      header: 'RAB',
      accessorFn: (row) => row.hargaSatuan,
      cell: ({ row }) => (
        <span className="text-right block w-full">
          {formatIDR(row.original.hargaSatuan ?? row.original.unitPriceRab)}
        </span>
      ),
      meta: {
        editable: !disabled,
        cellClassName: 'h-9',
        edit: { editType: 'input' as const, inputType: 'price' as const },
        copyValue: (r: BOQPlanningCostRow) => r.hargaSatuan ?? '',
      },
      size: 128,
    },
    {
      id: 'jumlah_harga_rab',
      header: 'RAB',
      footer: ({ table }: { table: Table<BOQPlanningCostRow> }) => {
        const sum = table.getFilteredRowModel().rows.reduce((acc, row) => {
          const vol = row.original.vol ?? 0;
          const price = row.original.hargaSatuan ?? 0;
          const dur = hasDuration ? (row.original.durasiSewa ?? 1) : 1;
          return acc + vol * price * dur;
        }, 0);
        return <span className="text-right block w-full font-semibold">{formatIDR(sum)}</span>;
      },
      accessorFn: (row) => {
        const base = (row.vol ?? 0) * (row.hargaSatuan ?? 0);
        return hasDuration ? base * (row.durasiSewa ?? 1) : base;
      },
      cell: ({ row }) => {
        const r = row.original;
        const vol = r.vol ?? r.volumeRab;
        const price = r.hargaSatuan ?? r.unitPriceRab;
        const dur = hasDuration ? (r.durasiSewa ?? 1) : 1;
        if (vol == null || price == null) return <span />;
        return <span className="text-right block w-full">{formatIDR(vol * price * dur)}</span>;
      },
      meta: { editable: false, cellClassName: 'h-9' },
      size: 128,
    },
    {
      accessorKey: 'keterangan',
      header: labels.remarks,
      meta: { editable: !disabled, cellClassName: 'h-9' },
      size: 128,
    },
  ];

  const headerColumnTree: HeaderColumnNode[] = [
    { id: 'code', header: labels.code },
    { id: 'name', header: nameHeader },
    {
      id: 'vol',
      header: labels.vol,
      children: [
        { id: 'vol_rab', header: 'RAB' },
        { id: 'satuan', header: labels.uom },
      ],
    },
    ...(hasDuration
      ? [
          {
            id: 'durasi_sewa',
            header: 'Duration',
            children: [
              { id: 'durasi_sewa_rab', header: 'RAB' },
              { id: 'durationUoM', header: labels.uom },
            ],
          },
        ]
      : []),
    {
      id: 'harga_satuan',
      header: priceLabel,
      children: [{ id: 'harga_satuan_rab', header: 'RAB' }],
    },
    {
      id: 'jumlah_harga',
      header: totalLabel,
      children: [{ id: 'jumlah_harga_rab', header: 'RAB' }],
    },
    { id: 'keterangan', header: labels.remarks },
  ];

  return { columns, headerColumnTree };
}
