'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { CornerDownRight, Eye, SquarePlus } from 'lucide-react';
import type { HeaderColumnNode } from '@/components/organisms/DataTable';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { SelectOption } from '@/shared/components/atoms';
import { formatIDR } from '@/shared/utils/currency';
import type { BOQColumnLabels, BOQTooltipLabels } from '../types/boq-labels.types';
import type { BOQPlanningNode, BOQUomAsyncSelect } from '../types/boq-planning.types';
import { DEFAULT_UNIT_PRICE_CATEGORIES } from '../types/boq-planning.types';
import type { BOQJenisOption, BOQNode } from '../types/boq-tree.types';
import { computeBobot, createEmptyNode, findDepth } from '../utils/boq-tree.utils';
import {
  computeAmount,
  computeTotalPriceMaterial,
  computeTotalPriceWork,
  computeUnitPriceMaterial,
  computeUnitPriceWork,
} from './boq-planning-rollup.utils';

export interface BOQPlanningColumnsOptions {
  codes: Map<string, string>;
  nameOptions: string[];
  jenisOptions: BOQJenisOption[];
  maxDepth: number;
  treeData: BOQPlanningNode[];
  onAddChild: (node: BOQPlanningNode) => void;
  onAddSiblingBelow: (node: BOQPlanningNode) => void;
  onOpenDetail?: (node: BOQPlanningNode) => void;
  onScrollEnd?: () => void;
  /** Server-side suggestion search for the name combobox. Receives the 1-based level of the edited row. */
  onNameSearch?: (search: string, level: number) => void;
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
}

export interface BOQPlanningColumnsResult {
  columns: ColumnDef<BOQPlanningNode>[];
  headerColumnTree: HeaderColumnNode[];
}

export function createEmptyPlanningNode(
  patch?: Partial<Omit<BOQPlanningNode, 'children'>>
): BOQPlanningNode {
  const base = createEmptyNode();
  return { ...base, children: [], bobot: 1, ...patch };
}

const DEFAULT_COLUMN_LABELS: BOQColumnLabels = {
  kode: 'Kode',
  jobItem: 'Job/Item',
  jenis: 'Jenis',
  rab: 'RABss',
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
  bobotLocked: 'Bobot hanya dapat diubah di level terakhir',
  saveFirstToFillCost: 'Simpan terlebih dahulu untuk mengisi cost item',
};

export function createBOQPlanningColumns(
  opts: BOQPlanningColumnsOptions
): BOQPlanningColumnsResult {
  const depthOf = (n: BOQPlanningNode) => findDepth(opts.treeData as BOQNode[], n.id);
  const canChild = (n: BOQPlanningNode) => depthOf(n) + 1 <= opts.maxDepth - 1;

  const nodeById = new Map<string, BOQPlanningNode>();
  const indexNodes = (nodes: BOQPlanningNode[]) => {
    for (const n of nodes) {
      nodeById.set(n.id, n);
      if (n.children.length > 0) indexNodes(n.children);
    }
  };
  indexNodes(opts.treeData);

  const getUnitPriceValue = (
    n: BOQPlanningNode,
    catValue: string,
    field: 'materialRab' | 'workRab'
  ): number | undefined => {
    const full = nodeById.get(n.id) ?? n;
    const isUnitPriceCategory = catValue === 'material';
    if (field === 'materialRab') {
      return isUnitPriceCategory ? computeUnitPriceMaterial(full) : computeTotalPriceMaterial(full);
    }
    return isUnitPriceCategory ? computeUnitPriceWork(full) : computeTotalPriceWork(full);
  };

  const getAmountValue = (n: BOQPlanningNode): number | undefined =>
    computeAmount(nodeById.get(n.id) ?? n);

  const editable = !opts.readOnly;
  const columnLabels = { ...DEFAULT_COLUMN_LABELS, ...opts.labels?.columns };
  const tooltipLabels = { ...DEFAULT_TOOLTIP_LABELS, ...opts.labels?.tooltips };

  const isColEditable = (colId: string) =>
    !opts.editableColumnIds || opts.editableColumnIds.has(colId);

  // ── Flat leaf columns (order MUST match depth-first leaf traversal of headerColumnTree) ──

  const tambahColumn: ColumnDef<BOQPlanningNode> = {
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
        // Non-leaf (can still have children) rows have no detail; leaf rows show Eye + badge.
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
                  onClick={() => opts.onAddSiblingBelow(n)}
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
                    onClick={() => opts.onAddChild(n)}
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

  const fixedColumns: ColumnDef<BOQPlanningNode>[] = [
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
        edit: (row: BOQPlanningNode) => ({
          editType: 'combobox' as const,
          comboboxOptions: opts.nameOptions,
          comboboxOnLoadMore: opts.onScrollEnd,
          comboboxOnSearch: opts.onNameSearch
            ? (search: string) => opts.onNameSearch?.(search, depthOf(row) + 1)
            : undefined,
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
        copyValue: (n: BOQPlanningNode) => {
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
      accessorFn: (n: BOQPlanningNode) => String(n.bobot ?? 1),
      cell: ({ row }) => {
        const n = row.original;
        if (!n.isFinalLevel) {
          return <span>{computeBobot(n) ?? ''}</span>;
        }
        return <span>{String(n.bobot ?? 1)}</span>;
      },
      meta: {
        // Readonly: bobot tidak dapat diubah di BOQ Planning
        editable: false,
        /*
        editable: isColEditable('bobot') && editable,
        editableWhen: (n: BOQPlanningNode) => n.isFinalLevel === true,
        edit: {
          editType: 'select',
          selectOptions: DEFAULT_BOBOT_OPTIONS.map((b) => ({
            value: String(b),
            label: String(b),
          })),
        },
        */
        copyValue: (n: BOQPlanningNode) => computeBobot(n) ?? '',
      },
      size: 110,
    },
    {
      id: 'volume_rab',
      header: columnLabels.rab,
      accessorFn: (row) => row.volume?.rab,
      cell: ({ row }) => <span>{row.original.volume?.rab ?? ''}</span>,
      meta: {
        editable: isColEditable('volume_rab') && editable,
        edit: { editType: 'input' },
        copyValue: (n: BOQPlanningNode) => n.volume?.rab ?? '',
      },
      size: 77,
    },
    {
      id: 'volume_uom',
      header: columnLabels.uom,
      accessorFn: (row) => row.volume?.uom,
      cell: ({ row }) => <span>{row.original.uomLabel ?? row.original.volume?.uom ?? ''}</span>,
      meta: {
        editable: isColEditable('volume_uom') && editable,
        edit: opts.uomAsyncSelect
          ? {
              editType: 'async-select',
              selectOptions: opts.uomAsyncSelect.options,
              selectOnSearch: opts.uomAsyncSelect.onSearch,
              selectOnLoadMore: opts.uomAsyncSelect.onScrollEnd,
              selectHasNextPage: opts.uomAsyncSelect.hasNextPage,
            }
          : { editType: 'input' },
        copyValue: (n: BOQPlanningNode) => n.uomLabel ?? n.volume?.uom ?? '',
      },
      size: 77,
    },
  ];

  const categoryColumns: ColumnDef<BOQPlanningNode>[] = DEFAULT_UNIT_PRICE_CATEGORIES.flatMap(
    (cat) => [
      {
        id: `unitprice_material_rab_${cat.value}`,
        header: 'RAB',
        accessorFn: (row) => getUnitPriceValue(row, cat.value, 'materialRab'),
        cell: ({ row }) => (
          <span className="text-right block w-full">
            {formatIDR(getUnitPriceValue(row.original, cat.value, 'materialRab'))}
          </span>
        ),
        meta: {
          editable: false,
          copyValue: (n: BOQPlanningNode) =>
            formatIDR(getUnitPriceValue(n, cat.value, 'materialRab')),
        },
        size: 128,
      } as ColumnDef<BOQPlanningNode>,
      {
        id: `unitprice_work_rab_${cat.value}`,
        header: 'RAB',
        accessorFn: (row) => getUnitPriceValue(row, cat.value, 'workRab'),
        cell: ({ row }) => (
          <span className="text-right block w-full">
            {formatIDR(getUnitPriceValue(row.original, cat.value, 'workRab'))}
          </span>
        ),
        meta: {
          editable: false,
          copyValue: (n: BOQPlanningNode) => formatIDR(getUnitPriceValue(n, cat.value, 'workRab')),
        },
        size: 128,
      } as ColumnDef<BOQPlanningNode>,
    ]
  );

  const trailingColumns: ColumnDef<BOQPlanningNode>[] = [
    {
      id: 'amount_rab',
      header: columnLabels.rab,
      accessorFn: (row) => getAmountValue(row),
      cell: ({ row }) => (
        <span className="text-right block w-full">{formatIDR(getAmountValue(row.original))}</span>
      ),
      meta: {
        editable: false,
        copyValue: (n: BOQPlanningNode) => formatIDR(getAmountValue(n)),
      },
      size: 128,
    },
    {
      id: 'remarks',
      accessorKey: 'remarks',
      header: columnLabels.remarks,
      cell: ({ row }) => <span>{row.original.remarks ?? ''}</span>,
      meta: {
        editable: isColEditable('remarks') && editable,
        edit: { editType: 'input' },
        copyValue: (n: BOQPlanningNode) => n.remarks ?? '',
      },
      size: 128,
    },
  ];

  const insertBefore = (
    arr: ColumnDef<BOQPlanningNode>[],
    beforeId: string,
    item: ColumnDef<BOQPlanningNode>
  ) => {
    const idx = arr.findIndex((c) => c.id === beforeId);
    if (idx === -1) return [...arr, item];
    return [...arr.slice(0, idx), item, ...arr.slice(idx)];
  };
  const merged = [...fixedColumns, ...categoryColumns, ...trailingColumns];
  const columns = insertBefore(merged, 'name', tambahColumn);

  // ── Header column tree (depth-first leaf order must match `columns` array above) ──

  const headerColumnTree: HeaderColumnNode[] = [
    { id: 'kode', header: columnLabels.kode },
    { id: 'tambah', header: !opts.readOnly ? columnLabels.tambah : 'Detail' },
    { id: 'name', header: columnLabels.jobItem },
    { id: 'jenis', header: columnLabels.jenis },
    { id: 'bobot', header: columnLabels.bobot },
    {
      id: 'volume',
      header: columnLabels.volume,
      children: [
        { id: 'volume_rab', header: columnLabels.rab },
        { id: 'volume_uom', header: columnLabels.uom },
      ],
    },
    ...DEFAULT_UNIT_PRICE_CATEGORIES.map((cat) => ({
      id: `unitprice_${cat.value}`,
      header: cat.label,
      children: [
        {
          id: `material_${cat.value}`,
          header: columnLabels.material,
          children: [{ id: `unitprice_material_rab_${cat.value}`, header: columnLabels.rab }],
        },
        {
          id: `work_${cat.value}`,
          header: columnLabels.work,
          children: [{ id: `unitprice_work_rab_${cat.value}`, header: columnLabels.rab }],
        },
      ],
    })),
    {
      id: 'amount',
      header: columnLabels.amount,
      children: [{ id: 'amount_rab', header: columnLabels.rab }],
    },
    { id: 'remarks', header: columnLabels.remarks },
  ];

  return { columns, headerColumnTree };
}
