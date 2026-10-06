'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { CornerDownRight, Eye, SquarePlus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { BOQColumnLabels, BOQTooltipLabels } from '../types/boq-labels.types';
import type { BOQJenisAsyncSelect, BOQJenisOption, BOQNode } from '../types/boq-tree.types';
import { computeBobot, findDepth } from '../utils/boq-tree.utils';

export interface BOQColumnsOptions {
  codes: Map<string, string>;
  nameOptions: string[];
  jenisOptions: BOQJenisOption[];
  jenisAsyncSelect?: BOQJenisAsyncSelect;
  bobotOptions: number[];
  maxDepth: number;
  treeData: BOQNode[];
  onAddChild: (node: BOQNode) => void;
  onAddSiblingBelow: (node: BOQNode) => void;
  onOpenCost: (node: BOQNode) => void;
  onScrollEnd?: () => void;
  /** Server-side suggestion search for the name combobox. Receives the 1-based level of the edited row. */
  onNameSearch?: (search: string, level: number) => void;
  /** Set of node IDs saved on server */
  savedNodeIds?: Set<string>;
  labels?: {
    columns?: Partial<BOQColumnLabels>;
    tooltips?: Partial<BOQTooltipLabels>;
  };
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
  bobotLocked: 'Bobot hanya dapat diubah di level terakhir',
  saveFirstToFillCost: 'Simpan terlebih dahulu untuk mengisi cost item',
};

export function createBOQColumns(opts: BOQColumnsOptions): ColumnDef<BOQNode>[] {
  const isLeaf = (n: BOQNode) => n.children.length === 0;
  const depthOf = (n: BOQNode) => findDepth(opts.treeData, n.id);
  const canChild = (n: BOQNode) => depthOf(n) + 1 <= opts.maxDepth - 1;
  const showEye = (n: BOQNode) => n.isFinalLevel === true;
  const columnLabels = { ...DEFAULT_COLUMN_LABELS, ...opts.labels?.columns };
  const tooltipLabels = { ...DEFAULT_TOOLTIP_LABELS, ...opts.labels?.tooltips };

  return [
    {
      id: 'kode',
      header: columnLabels.kode,
      cell: ({ row }) => (
        <span className="text-muted-foreground">{opts.codes.get(row.original.id) ?? ''}</span>
      ),
      size: 120,
    },
    {
      id: 'Tambah',
      header: () => (
        <div className="flex items-center gap-2">
          <span>{columnLabels.tambah}</span>
        </div>
      ),
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
                  onClick={() => opts.onOpenCost(n)}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{tooltipLabels.viewDetail}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
        const detailBadge = n.detailsFilledCount != null && n.detailsFilledCount > 0 && (
          <Badge
            variant="secondary"
            className="h-5 min-w-5 flex items-center justify-center text-xs"
          >
            +{n.detailsFilledCount}
          </Badge>
        );

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
            {showEye(n) ? (
              <>
                {detailButton}
                {detailBadge}
              </>
            ) : canChild(n) ? (
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
            ) : null}
          </div>
        );
      },
      size: 90,
    },
    {
      id: 'name',
      accessorKey: 'name',
      header: columnLabels.jobItem,
      meta: {
        editable: true,
        edit: (row: BOQNode) => ({
          editType: 'combobox',
          comboboxOptions: opts.nameOptions,
          comboboxOnLoadMore: opts.onScrollEnd,
          comboboxOnSearch: opts.onNameSearch
            ? (search: string) => opts.onNameSearch?.(search, depthOf(row) + 1)
            : undefined,
        }),
      },
      size: 480,
    },
    {
      id: 'bobot',
      header: columnLabels.bobot,
      cell: ({ row }) => {
        const n = row.original;
        if (!isLeaf(n)) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block w-full cursor-default">{computeBobot(n) ?? ''}</span>
                </TooltipTrigger>
                <TooltipContent>{tooltipLabels.bobotLocked}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        return <span>{n.bobot != null ? String(n.bobot) : ''}</span>;
      },
      meta: {
        editable: true,
        editableWhen: (n: BOQNode) => isLeaf(n),
        edit: {
          editType: 'select',
          selectOptions: opts.bobotOptions.map((b) => ({ value: String(b), label: String(b) })),
        },
        copyValue: (n: BOQNode) => computeBobot(n) ?? '',
      },
      size: 110,
    },
    {
      id: 'jenis',
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
        editable: true,
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
        copyValue: (n: BOQNode) => {
          if (opts.jenisAsyncSelect) {
            const opt = opts.jenisAsyncSelect.options.find((o) => o.value === n.jenis);
            return opt?.label ?? n.jenis ?? '';
          }
          const opt = opts.jenisOptions.find((o) => o.value === n.jenis);
          return opt?.label ?? n.jenis ?? '';
        },
      },
      size: 140,
    },
  ];
}
