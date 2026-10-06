'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { CornerDownRight, Eye, SquarePlus } from 'lucide-react';
import React from 'react';
import type { HeaderColumnNode } from '@/components/organisms/DataTable';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SelectOption } from '@/shared/components/atoms';
import { formatIDR } from '@/shared/utils/currency';
import type { BOQColumnLabels, BOQTooltipLabels } from '../types/boq-labels.types';
import type { BOQJenisOption, BOQNode } from '../types/boq-tree.types';
import { computeBobot, createEmptyNode, findDepth, findParentId } from '../utils/boq-tree.utils';
import type { BOQExecutionNode, BOQUomAsyncSelect } from './types/boq-execution.types';
import { DEFAULT_UNIT_PRICE_CATEGORIES } from './types/boq-execution.types';

export interface BOQExecutionColumnsOptions {
  codes: Map<string, string>;
  nameOptions: string[];
  jenisOptions: BOQJenisOption[];
  maxDepth: number;
  treeData: BOQExecutionNode[];
  onAddChild: (node: BOQExecutionNode) => void;
  onAddSiblingBelow: (node: BOQExecutionNode) => void;
  onOpenDetail?: (node: BOQExecutionNode) => void;
  onScrollEnd?: () => void;
  /** Called when name combobox searches — passes (search, level, parentId) to drive suggestion refetch */
  onNameSearch?: (search: string, level: number, parentId?: string | null) => void;
  readOnly?: boolean;
  /** Set of node IDs saved on server */
  savedNodeIds?: Set<string>;
  labels?: {
    columns?: Partial<BOQColumnLabels>;
    tooltips?: Partial<BOQTooltipLabels>;
  };
  /** When provided, only these column IDs are editable */
  editableColumnIds?: Set<string>;
  /** UOM async-select config */
  uomAsyncSelect?: BOQUomAsyncSelect;
  /** When set, jenis column uses async-select */
  jenisAsyncSelect?: {
    options: SelectOption[];
    hasNextPage?: boolean;
    onSearch: (query: string) => void;
    onScrollEnd: () => void;
  };
  /** When true (BOQ complete), volume_cco and volume_actual are disabled */
  isComplete?: boolean;
}

export interface BOQExecutionColumnsResult {
  columns: ColumnDef<BOQExecutionNode>[];
  headerColumnTree: HeaderColumnNode[];
}

export function createEmptyExecutionNode(
  patch?: Partial<Omit<BOQExecutionNode, 'children'>>
): BOQExecutionNode {
  const base = createEmptyNode();
  return { ...base, children: [], ...patch };
}

const DEFAULT_COLUMN_LABELS: BOQColumnLabels = {
  kode: 'Kode',
  jobItem: 'Job/Item',
  jenis: 'Jenis',
  rab: 'RAB',
  uom: 'UoM',
  remarks: 'Remarks',
  volume: 'Volume',
  amount: 'Amount',
  material: 'Material',
  work: 'Work',
  bobot: 'Bobot',
  tambah: 'Tambah',
};

const DEFAULT_TOOLTIP_LABELS: BOQTooltipLabels = {
  viewDetail: 'Lihat detail',
  addMenu: 'Tambah Menu',
  addSubMenu: 'Tambah Sub Menu',
  saveFirstToFillCost: 'Simpan terlebih dahulu untuk mengisi cost item',
};

const RAB_CCO_ACT = ['rab', 'cco', 'actual'] as const;

type Suffix = (typeof RAB_CCO_ACT)[number];

const suffixHeaderMap: Record<Suffix, string> = {
  rab: 'RAB',
  cco: 'CCO',
  actual: 'ACT',
};

export function createBOQExecutionColumns(
  opts: BOQExecutionColumnsOptions
): BOQExecutionColumnsResult {
  const isLeaf = (n: BOQExecutionNode) => n.children.length === 0;
  const depthOf = (n: BOQExecutionNode) => findDepth(opts.treeData as BOQNode[], n.id);
  const isFinalLeaf = (n: BOQExecutionNode) => isLeaf(n) && depthOf(n) === opts.maxDepth - 1;
  const canChild = (n: BOQExecutionNode) => depthOf(n) + 1 <= opts.maxDepth - 1;

  const editable = !opts.readOnly;
  const columnLabels = { ...DEFAULT_COLUMN_LABELS, ...opts.labels?.columns };
  const tooltipLabels = { ...DEFAULT_TOOLTIP_LABELS, ...opts.labels?.tooltips };

  const isColEditable = (colId: string) =>
    !opts.editableColumnIds || opts.editableColumnIds.has(colId);

  // CCO & ACT editable before complete; disabled once BOQ is complete
  const canEditVolCco = !opts.isComplete;
  const canEditVolActual = !opts.isComplete;

  // ── Tambah / Detail column ──
  const tambahColumn: ColumnDef<BOQExecutionNode> = {
    id: 'tambah',
    header: !opts.readOnly ? columnLabels.tambah : 'Detail',
    enableSorting: false,
    cell: ({ row }) => {
      const n = row.original;
      const isUnsaved = opts.savedNodeIds ? !opts.savedNodeIds.has(n.id) : Boolean(n.isDraft);
      const detailButton = isUnsaved ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-disabled="true"
                aria-label={tooltipLabels.saveFirstToFillCost}
                className="cursor-not-allowed text-muted-foreground/40"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Eye className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{tooltipLabels.saveFirstToFillCost}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={tooltipLabels.viewDetail}
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => opts.onOpenDetail?.(n)}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Eye className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{tooltipLabels.viewDetail}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
      const detailBadge = n.detailsFilledCount != null && n.detailsFilledCount > 0 && (
        <Badge variant="secondary" className="h-5 min-w-5 flex items-center justify-center text-xs">
          +{n.detailsFilledCount}
        </Badge>
      );

      if (opts.readOnly) {
        if (canChild(n) && n.isFinalLevel !== true) return null;
        return (
          <div className="flex items-center gap-2">
            {detailButton}
            {detailBadge}
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={tooltipLabels.addMenu}
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => opts.onAddSiblingBelow?.(n)}
                >
                  <SquarePlus className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{tooltipLabels.addMenu}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {canChild(n) && n.isFinalLevel !== true ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-label={tooltipLabels.addSubMenu}
                    className="text-muted-foreground hover:text-foreground"
                    onClick={() => opts.onAddChild?.(n)}
                  >
                    <CornerDownRight className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>{tooltipLabels.addSubMenu}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              {detailButton}
              {detailBadge}
            </>
          )}
        </div>
      );
    },
    size: 100,
    meta: {
      nonEditableTooltip: false,
    },
  };

  // ── Volume sub-column helpers ──
  function volumeSubCol(
    suffix: string,
    header: string,
    volEditable: boolean,
    nonEditableTooltip?: string,
    /** When true, ALL cells in this column are editable (not just last leaves) */
    allCellsEditable?: boolean
  ): ColumnDef<BOQExecutionNode> {
    const isUom = suffix === 'uom';
    const colId = isUom ? 'volume_uom' : `volume_${suffix}`;
    const isEditable =
      volEditable &&
      isColEditable(colId) &&
      (suffix === 'actual' || suffix === 'cco' || !opts.readOnly);
    return {
      id: colId,
      header,
      accessorFn: (row) => {
        const v = row.volume;
        if (!v) return '';
        if (isUom) return v.uom;
        return (v as Record<string, number | undefined>)[suffix];
      },
      cell: ({ row }) => {
        const v = row.original.volume;
        let content: React.ReactNode;
        if (!v) {
          content = <span />;
        } else if (isUom) {
          content = <span>{v.uom ?? ''}</span>;
        } else {
          content = <span>{(v as Record<string, number | undefined>)[suffix] ?? ''}</span>;
        }
        if (nonEditableTooltip && !isEditable) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">{content}</span>
                </TooltipTrigger>
                <TooltipContent>{nonEditableTooltip}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return content;
      },
      meta: {
        editable: isEditable,
        edit: isUom
          ? opts.uomAsyncSelect
            ? {
                editType: 'async-select' as const,
                selectOptions: opts.uomAsyncSelect.options,
                selectOnSearch: opts.uomAsyncSelect.onSearch,
                selectOnLoadMore: opts.uomAsyncSelect.onScrollEnd,
                selectHasNextPage: opts.uomAsyncSelect.hasNextPage,
              }
            : { editType: 'input' as const }
          : { editType: 'input' as const, inputType: 'number' },
        editableWhen: allCellsEditable
          ? undefined
          : (n: BOQExecutionNode) => n.isFinalLevel === true || isFinalLeaf(n),
        copyValue: (n: BOQExecutionNode) => {
          const v = n.volume;
          if (!v) return '';
          if (isUom) return v.uom ?? '';
          return (v as Record<string, number | undefined>)[suffix] ?? '';
        },
      },
      size: 77,
    };
  }

  // ── Unit price / Total price sub-column helpers ──
  function priceSubCol(
    pricePrefix: string, // 'unitPrice' or 'totalPrice'
    category: string, // 'material' or 'work'
    suffix: Suffix,
    header: string,
    priceEditable: boolean
  ): ColumnDef<BOQExecutionNode> {
    const colId = `${pricePrefix}_${category}_${suffix}`;
    const isEditableForSuffix = priceEditable && (suffix === 'actual' || suffix === 'cco');
    return {
      id: colId,
      header,
      accessorFn: (row) => {
        const prices = pricePrefix === 'unitPrice' ? row.unitPrice : row.totalPrice;
        return prices?.[category]?.[suffix];
      },
      cell: ({ row }) => {
        const r = row.original;
        const prices = pricePrefix === 'unitPrice' ? r.unitPrice : r.totalPrice;
        return (
          <span className="text-right block w-full">{formatIDR(prices?.[category]?.[suffix])}</span>
        );
      },
      meta: {
        editable: isEditableForSuffix && !opts.readOnly,
        edit:
          isEditableForSuffix && !opts.readOnly
            ? { editType: 'input' as const, inputType: 'number' }
            : undefined,
      },
      size: 128,
    } as ColumnDef<BOQExecutionNode>;
  }

  // ── Fixed columns ──
  const fixedColumns: ColumnDef<BOQExecutionNode>[] = [
    {
      id: 'kode',
      header: columnLabels.kode,
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{opts.codes.get(row.original.id) ?? ''}</span>
      ),
      size: 130,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: columnLabels.jobItem,
      meta: {
        editable: isColEditable('name') && editable,
        edit: (row: BOQExecutionNode) => ({
          editType: 'combobox' as const,
          comboboxOptions: opts.nameOptions,
          comboboxOnSearch: opts.onNameSearch
            ? (search: string) =>
                opts.onNameSearch?.(
                  search,
                  depthOf(row) + 1,
                  findParentId(opts.treeData as BOQNode[], row.id) ?? undefined
                )
            : undefined,
          comboboxOnLoadMore: opts.onScrollEnd,
        }),
      },
      size: 320,
    },
    {
      id: 'jenis',
      accessorKey: 'jenis',
      header: columnLabels.jenis,
      cell: ({ row }) => {
        const n = row.original;
        if (opts.jenisAsyncSelect) {
          const opt = opts.jenisAsyncSelect.options.find((o) => o.value === n.jenis);
          return <span>{opt?.label ?? n.jenis ?? ''}</span>;
        }
        const opt = opts.jenisOptions.find((o) => o.value === n.jenis);
        return <span>{opt?.label ?? n.jenis ?? ''}</span>;
      },
      meta: {
        editable: isColEditable('jenis') && editable,
        edit: opts.jenisAsyncSelect
          ? {
              editType: 'async-select',
              selectOptions: opts.jenisAsyncSelect.options,
              selectOnSearch: opts.jenisAsyncSelect.onSearch,
              selectOnLoadMore: opts.jenisAsyncSelect.onScrollEnd,
              selectHasNextPage: opts.jenisAsyncSelect.hasNextPage,
            }
          : {
              editType: 'select',
              selectOptions: opts.jenisOptions,
            },
        copyValue: (n: BOQExecutionNode) => {
          if (opts.jenisAsyncSelect) {
            const opt = opts.jenisAsyncSelect.options.find((o) => o.value === n.jenis);
            return opt?.label ?? n.jenis ?? '';
          }
          const opt = opts.jenisOptions.find((o) => o.value === n.jenis);
          return opt?.label ?? n.jenis ?? '';
        },
      },
      size: 110,
    },
    {
      id: 'bobot',
      header: columnLabels.bobot,
      cell: ({ row }) => {
        const n = row.original;
        if (!n.isFinalLevel) {
          return <span>{computeBobot(n) ?? ''}</span>;
        }
        return <span>{n.bobot != null ? String(n.bobot) : ''}</span>;
      },
      meta: {
        editable: false,
        copyValue: (n: BOQExecutionNode) => computeBobot(n) ?? '',
      },
      size: 110,
    },
  ];

  // ── Volume columns ──
  const volumeColumns: ColumnDef<BOQExecutionNode>[] = [
    volumeSubCol('rab', columnLabels.rab, true),
    volumeSubCol('cco', 'CCO', canEditVolCco, 'Selesaikan untuk edit CCO', true),
    volumeSubCol(
      'actual',
      'ACT',
      canEditVolActual,
      !canEditVolActual ? 'Selesaikan untuk edit ACT' : undefined,
      true
    ),
    volumeSubCol('uom', columnLabels.uom, true),
  ];

  // ── Unit price & Total price columns ──
  const priceColumns = [
    ...DEFAULT_UNIT_PRICE_CATEGORIES.flatMap((cat) =>
      RAB_CCO_ACT.map((suffix) =>
        priceSubCol('unitPrice', cat.value, suffix, suffixHeaderMap[suffix], false)
      )
    ),
    ...DEFAULT_UNIT_PRICE_CATEGORIES.flatMap((cat) =>
      RAB_CCO_ACT.map((suffix) =>
        priceSubCol('totalPrice', cat.value, suffix, suffixHeaderMap[suffix], false)
      )
    ),
  ];

  // ── Amount columns ──
  const amountColumns: ColumnDef<BOQExecutionNode>[] = RAB_CCO_ACT.map((suffix) => ({
    id: `amount_${suffix}`,
    header: suffixHeaderMap[suffix],
    accessorFn: (row) => row.amount?.[suffix],
    cell: ({ row }) => (
      <span className="text-right block w-full">{formatIDR(row.original.amount?.[suffix])}</span>
    ),
    meta: { editable: false },
    size: 128,
  }));

  // ── Remarks column ──
  const remarksColumn: ColumnDef<BOQExecutionNode> = {
    id: 'remarks',
    accessorKey: 'remarks',
    header: columnLabels.remarks,
    cell: ({ row }) => <span>{row.original.remarks ?? ''}</span>,
    meta: {
      editable: isColEditable('remarks') && editable,
      edit: { editType: 'input' },
      copyValue: (n: BOQExecutionNode) => n.remarks ?? '',
    },
    size: 128,
  };

  const insertBefore = (
    arr: ColumnDef<BOQExecutionNode>[],
    beforeId: string,
    item: ColumnDef<BOQExecutionNode>
  ) => {
    const idx = arr.findIndex((c) => c.id === beforeId);
    if (idx === -1) return [...arr, item];
    return [...arr.slice(0, idx), item, ...arr.slice(idx)];
  };

  const allColumns = [
    ...fixedColumns,
    ...volumeColumns,
    ...priceColumns,
    ...amountColumns,
    remarksColumn,
  ];
  const columns = insertBefore(allColumns, 'name', tambahColumn);

  // ── Header column tree ──
  const headerColumnTree: HeaderColumnNode[] = [
    { id: 'kode', header: columnLabels.kode },
    { id: 'tambah', header: `View Cost` },
    { id: 'name', header: columnLabels.jobItem },
    { id: 'jenis', header: columnLabels.jenis },
    { id: 'bobot', header: columnLabels.bobot },
    {
      id: 'volume',
      header: columnLabels.volume ?? 'Volume',
      children: [
        { id: 'volume_rab', header: columnLabels.rab },
        { id: 'volume_cco', header: 'CCO' },
        { id: 'volume_actual', header: 'ACT' },
        { id: 'volume_uom', header: columnLabels.uom },
      ],
    },
    {
      id: 'unitPrice',
      header: 'Unit Price',
      children: DEFAULT_UNIT_PRICE_CATEGORIES.map((cat) => ({
        id: `up_${cat.value}`,
        header: cat.label,
        children: RAB_CCO_ACT.map((suffix) => ({
          id: `unitPrice_${cat.value}_${suffix}`,
          header: suffixHeaderMap[suffix],
        })),
      })),
    },
    {
      id: 'totalPrice',
      header: 'Total Price',
      children: DEFAULT_UNIT_PRICE_CATEGORIES.map((cat) => ({
        id: `tp_${cat.value}`,
        header: cat.label,
        children: RAB_CCO_ACT.map((suffix) => ({
          id: `totalPrice_${cat.value}_${suffix}`,
          header: suffixHeaderMap[suffix],
        })),
      })),
    },
    {
      id: 'amount',
      header: columnLabels.amount ?? 'Amount',
      children: RAB_CCO_ACT.map((suffix) => ({
        id: `amount_${suffix}`,
        header: suffixHeaderMap[suffix],
      })),
    },
    { id: 'remarks', header: columnLabels.remarks },
  ];

  return { columns, headerColumnTree };
}
