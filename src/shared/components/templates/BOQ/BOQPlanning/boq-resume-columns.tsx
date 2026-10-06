'use client';

import type { ColumnDef } from '@tanstack/react-table';
import type { HeaderColumnNode } from '@/components/organisms/DataTable';
import type { BOQResumeColumnLabels } from '../types/boq-labels.types';
import type { BOQResumeEquipmentRow, BOQResumeMaterialRow } from './boq-resume.types';
import {
  computeEquipmentRow,
  computeMaterialRow,
  sumEquipmentAmount,
  sumMaterialAmount,
} from './boq-resume.utils';

export const DEFAULT_RESUME_COLUMN_LABELS: BOQResumeColumnLabels = {
  kode: 'Kode',
  namaMaterial: 'Nama Material',
  namaEquipment: 'Nama Equipment',
  vol: 'VOL',
  rab: 'RAB',
  cco: 'CCO',
  act: 'ACT',
  uom: 'UoM',
  duration: 'Duration',
  materialCost: 'Material Cost',
  equipmentCost: 'Equipment Cost',
  transportationCost: 'Transportation Cost',
  original: 'Original',
  markUp: 'Mark Up',
  unitPrice: 'Unit Price',
  total: 'Total',
  material: 'Material',
  transport: 'Transport',
  equipment: 'Equipment',
  amount: 'Amount',
};

const idr = (v?: number) => (v == null ? '' : v.toLocaleString('id-ID'));
const pct = (v?: number) => (v == null ? '' : `${v}%`);

export interface BOQResumeColumnsOptions {
  disabled: boolean;
  labels?: Partial<BOQResumeColumnLabels>;
  showVolumeCcoAct?: boolean;
}

export interface BOQResumeMaterialColumnsResult {
  columns: ColumnDef<BOQResumeMaterialRow>[];
  headerColumnTree: HeaderColumnNode[];
}

export function createBOQResumeMaterialColumns(
  opts: BOQResumeColumnsOptions
): BOQResumeMaterialColumnsResult {
  const { disabled } = opts;
  const labels = { ...DEFAULT_RESUME_COLUMN_LABELS, ...opts.labels };

  const volChildren: HeaderColumnNode[] = [{ id: 'vol_rab', header: labels.rab }];
  if (opts.showVolumeCcoAct) {
    volChildren.push({ id: 'vol_cco', header: labels.cco });
    volChildren.push({ id: 'vol_act', header: labels.act });
  }

  const columns: ColumnDef<BOQResumeMaterialRow>[] = [
    {
      accessorKey: 'code',
      header: labels.kode,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 82,
    },
    {
      accessorKey: 'name',
      header: labels.namaMaterial,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 200,
    },
    {
      id: 'vol_rab',
      header: labels.rab,
      accessorFn: (r) => r.vol,
      cell: ({ row }) => <span>{row.original.vol ?? ''}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 70,
    },
    ...(opts.showVolumeCcoAct
      ? [
          {
            id: 'vol_cco' as const,
            header: labels.cco,
            accessorFn: (r: BOQResumeMaterialRow) => r.volCco,
            cell: ({ row }: { row: { original: BOQResumeMaterialRow } }) => (
              <span>{row.original.volCco ?? ''}</span>
            ),
            meta: {
              editable: !disabled,
              cellClassName: 'h-9',
              edit: { editType: 'input' as const, inputType: 'number' as const },
            },
            size: 70,
          } satisfies ColumnDef<BOQResumeMaterialRow>,
          {
            id: 'vol_act' as const,
            header: labels.act,
            accessorFn: (r: BOQResumeMaterialRow) => r.volAct,
            cell: ({ row }: { row: { original: BOQResumeMaterialRow } }) => (
              <span>{row.original.volAct ?? ''}</span>
            ),
            meta: { editable: false, cellClassName: 'h-9' },
            size: 70,
          } satisfies ColumnDef<BOQResumeMaterialRow>,
        ]
      : []),

    {
      accessorKey: 'satuan',
      header: labels.uom,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 70,
    },

    {
      id: 'materialOriginal',
      header: labels.original,
      accessorFn: (r) => r.materialOriginal,
      cell: ({ row }) => <span>{idr(row.original.materialOriginal)}</span>,
      meta: {
        editable: !disabled,
        cellClassName: 'h-9',
        edit: { editType: 'input' as const, inputType: 'price' as const },
      },
      size: 100,
    },
    {
      id: 'materialMarkup',
      header: labels.markUp,
      accessorFn: (r) => r.materialMarkup,
      cell: ({ row }) => <span>{pct(row.original.materialMarkup)}</span>,
      meta: {
        editable: !disabled,
        cellClassName: 'h-9',
        edit: { editType: 'input' as const, inputType: 'number' as const },
        copyValue: (r: BOQResumeMaterialRow) => r.materialMarkup ?? '',
      },
      size: 90,
    },
    {
      id: 'materialUnitPrice',
      header: labels.unitPrice,
      accessorFn: (r) => computeMaterialRow(r).materialUnitPrice,
      cell: ({ row }) => <span>{idr(computeMaterialRow(row.original).materialUnitPrice)}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 100,
    },

    {
      id: 'transportOriginal',
      header: labels.original,
      accessorFn: (r) => r.transportOriginal,
      cell: ({ row }) => <span>{idr(row.original.transportOriginal)}</span>,
      meta: {
        editable: !disabled,
        cellClassName: 'h-9',
        edit: { editType: 'input' as const, inputType: 'price' as const },
      },
      size: 100,
    },
    {
      id: 'transportMarkup',
      header: labels.markUp,
      accessorFn: (r) => r.transportMarkup,
      cell: ({ row }) => <span>{pct(row.original.transportMarkup)}</span>,
      meta: {
        editable: !disabled,
        cellClassName: 'h-9',
        edit: { editType: 'input' as const, inputType: 'number' as const },
        copyValue: (r: BOQResumeMaterialRow) => r.transportMarkup ?? '',
      },
      size: 90,
    },
    {
      id: 'transportUnitPrice',
      header: labels.unitPrice,
      accessorFn: (r) => computeMaterialRow(r).transportUnitPrice,
      cell: ({ row }) => <span>{idr(computeMaterialRow(row.original).transportUnitPrice)}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 100,
    },

    {
      id: 'totalMaterial',
      header: labels.material,
      accessorFn: (r) => computeMaterialRow(r).totalMaterial,
      cell: ({ row }) => <span>{idr(computeMaterialRow(row.original).totalMaterial)}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 110,
    },
    {
      id: 'totalTransport',
      header: labels.transport,
      accessorFn: (r) => computeMaterialRow(r).totalTransport,
      cell: ({ row }) => <span>{idr(computeMaterialRow(row.original).totalTransport)}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 110,
    },
    {
      id: 'amount',
      header: labels.amount,
      accessorFn: (r) => computeMaterialRow(r).amount,
      cell: ({ row }) => <span>{idr(computeMaterialRow(row.original).amount)}</span>,
      footer: ({ table }) => (
        <span className="font-medium">
          {idr(sumMaterialAmount(table.getRowModel().rows.map((r) => r.original)))}
        </span>
      ),
      meta: { editable: false, cellClassName: 'h-9' },
      size: 120,
    },
  ];

  const headerColumnTree: HeaderColumnNode[] = [
    { id: 'code', header: labels.kode },
    { id: 'name', header: labels.namaMaterial },
    {
      id: 'vol',
      header: labels.vol,
      children: [...volChildren, { id: 'satuan', header: labels.uom }],
    },
    {
      id: 'material_cost',
      header: labels.materialCost,
      children: [
        { id: 'materialOriginal', header: labels.original },
        { id: 'materialMarkup', header: labels.markUp },
        { id: 'materialUnitPrice', header: labels.unitPrice },
      ],
    },
    {
      id: 'transportation_cost',
      header: labels.transportationCost,
      children: [
        { id: 'transportOriginal', header: labels.original },
        { id: 'transportMarkup', header: labels.markUp },
        { id: 'transportUnitPrice', header: labels.unitPrice },
      ],
    },
    {
      id: 'total',
      header: labels.total,
      children: [
        { id: 'totalMaterial', header: labels.material },
        { id: 'totalTransport', header: labels.transport },
      ],
    },
    { id: 'amount', header: labels.amount },
  ];

  return { columns, headerColumnTree };
}

export interface BOQResumeEquipmentColumnsResult {
  columns: ColumnDef<BOQResumeEquipmentRow>[];
  headerColumnTree: HeaderColumnNode[];
}

export function createBOQResumeEquipmentColumns(
  opts: BOQResumeColumnsOptions
): BOQResumeEquipmentColumnsResult {
  const { disabled } = opts;
  const labels = { ...DEFAULT_RESUME_COLUMN_LABELS, ...opts.labels };

  const volChildren: HeaderColumnNode[] = [{ id: 'vol_rab', header: labels.rab }];
  if (opts.showVolumeCcoAct) {
    volChildren.push({ id: 'vol_cco', header: labels.cco });
    volChildren.push({ id: 'vol_act', header: labels.act });
  }

  const columns: ColumnDef<BOQResumeEquipmentRow>[] = [
    {
      accessorKey: 'code',
      header: labels.kode,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 82,
    },
    {
      accessorKey: 'name',
      header: labels.namaEquipment,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 180,
    },
    {
      id: 'vol_rab',
      header: labels.rab,
      accessorFn: (r) => r.vol,
      cell: ({ row }) => <span>{row.original.vol ?? ''}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 70,
    },
    ...(opts.showVolumeCcoAct
      ? [
          {
            id: 'vol_cco' as const,
            header: labels.cco,
            accessorFn: (r: BOQResumeEquipmentRow) => r.volCco,
            cell: ({ row }: { row: { original: BOQResumeEquipmentRow } }) => (
              <span>{row.original.volCco ?? ''}</span>
            ),
            meta: {
              editable: !disabled,
              cellClassName: 'h-9',
              edit: { editType: 'input' as const, inputType: 'number' as const },
            },
            size: 70,
          } satisfies ColumnDef<BOQResumeEquipmentRow>,
          {
            id: 'vol_act' as const,
            header: labels.act,
            accessorFn: (r: BOQResumeEquipmentRow) => r.volAct,
            cell: ({ row }: { row: { original: BOQResumeEquipmentRow } }) => (
              <span>{row.original.volAct ?? ''}</span>
            ),
            meta: { editable: false, cellClassName: 'h-9' },
            size: 70,
          } satisfies ColumnDef<BOQResumeEquipmentRow>,
        ]
      : []),

    {
      accessorKey: 'satuan',
      header: labels.uom,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 70,
    },
    {
      id: 'duration_rab',
      header: labels.rab,
      accessorFn: (r) => r.duration,
      cell: ({ row }) => <span>{row.original.duration ?? ''}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 80,
    },
    {
      accessorKey: 'durationUoM',
      header: labels.uom,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 70,
    },

    {
      id: 'equipmentOriginal',
      header: labels.original,
      accessorFn: (r) => r.equipmentOriginal,
      cell: ({ row }) => <span>{idr(row.original.equipmentOriginal)}</span>,
      meta: {
        editable: !disabled,
        cellClassName: 'h-9',
        edit: { editType: 'input' as const, inputType: 'price' as const },
      },
      size: 100,
    },
    {
      id: 'equipmentMarkup',
      header: labels.markUp,
      accessorFn: (r) => r.equipmentMarkup,
      cell: ({ row }) => <span>{pct(row.original.equipmentMarkup)}</span>,
      meta: {
        editable: !disabled,
        cellClassName: 'h-9',
        edit: { editType: 'input' as const, inputType: 'number' as const },
        copyValue: (r: BOQResumeEquipmentRow) => r.equipmentMarkup ?? '',
      },
      size: 90,
    },
    {
      id: 'equipmentUnitPrice',
      header: labels.unitPrice,
      accessorFn: (r) => computeEquipmentRow(r).equipmentUnitPrice,
      cell: ({ row }) => <span>{idr(computeEquipmentRow(row.original).equipmentUnitPrice)}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 100,
    },

    {
      id: 'transportOriginal',
      header: labels.original,
      accessorFn: (r) => r.transportOriginal,
      cell: ({ row }) => <span>{idr(row.original.transportOriginal)}</span>,
      meta: {
        editable: !disabled,
        cellClassName: 'h-9',
        edit: { editType: 'input' as const, inputType: 'price' as const },
      },
      size: 100,
    },
    {
      id: 'transportMarkup',
      header: labels.markUp,
      accessorFn: (r) => r.transportMarkup,
      cell: ({ row }) => <span>{pct(row.original.transportMarkup)}</span>,
      meta: {
        editable: !disabled,
        cellClassName: 'h-9',
        edit: { editType: 'input' as const, inputType: 'number' as const },
        copyValue: (r: BOQResumeEquipmentRow) => r.transportMarkup ?? '',
      },
      size: 90,
    },
    {
      id: 'transportUnitPrice',
      header: labels.unitPrice,
      accessorFn: (r) => computeEquipmentRow(r).transportUnitPrice,
      cell: ({ row }) => <span>{idr(computeEquipmentRow(row.original).transportUnitPrice)}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 100,
    },

    {
      id: 'totalEquipment',
      header: labels.equipment,
      accessorFn: (r) => computeEquipmentRow(r).totalEquipment,
      cell: ({ row }) => <span>{idr(computeEquipmentRow(row.original).totalEquipment)}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 120,
    },
    {
      id: 'totalTransport',
      header: labels.transport,
      accessorFn: (r) => computeEquipmentRow(r).totalTransport,
      cell: ({ row }) => <span>{idr(computeEquipmentRow(row.original).totalTransport)}</span>,
      meta: { editable: false, cellClassName: 'h-9' },
      size: 110,
    },
    {
      id: 'amount',
      header: labels.amount,
      accessorFn: (r) => computeEquipmentRow(r).amount,
      cell: ({ row }) => <span>{idr(computeEquipmentRow(row.original).amount)}</span>,
      footer: ({ table }) => (
        <span className="font-medium">
          {idr(sumEquipmentAmount(table.getRowModel().rows.map((r) => r.original)))}
        </span>
      ),
      meta: { editable: false, cellClassName: 'h-9' },
      size: 120,
    },
  ];

  const headerColumnTree: HeaderColumnNode[] = [
    { id: 'code', header: labels.kode },
    { id: 'name', header: labels.namaEquipment },
    {
      id: 'vol',
      header: labels.vol,
      children: [...volChildren, { id: 'satuan', header: labels.uom }],
    },
    {
      id: 'duration',
      header: labels.duration,
      children: [
        { id: 'duration_rab', header: labels.rab },
        { id: 'durationUoM', header: labels.uom },
      ],
    },
    {
      id: 'equipment_cost',
      header: labels.equipmentCost,
      children: [
        { id: 'equipmentOriginal', header: labels.original },
        { id: 'equipmentMarkup', header: labels.markUp },
        { id: 'equipmentUnitPrice', header: labels.unitPrice },
      ],
    },
    {
      id: 'transportation_cost',
      header: labels.transportationCost,
      children: [
        { id: 'transportOriginal', header: labels.original },
        { id: 'transportMarkup', header: labels.markUp },
        { id: 'transportUnitPrice', header: labels.unitPrice },
      ],
    },
    {
      id: 'total',
      header: labels.total,
      children: [
        { id: 'totalEquipment', header: labels.equipment },
        { id: 'totalTransport', header: labels.transport },
      ],
    },
    { id: 'amount', header: labels.amount },
  ];

  return { columns, headerColumnTree };
}
