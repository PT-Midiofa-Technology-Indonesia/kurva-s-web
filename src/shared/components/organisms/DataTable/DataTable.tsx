'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnSizingState,
  type ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Row,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronRight, GripVertical, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DataTableColumnHeader } from '@/components/atoms/DataTableColumnHeader';
import { DataTableEditableCell } from '@/components/atoms/DataTableEditableCell';
import { DataTablePagination } from '@/components/molecules/DataTablePagination';
import { Checkbox } from '@/components/ui/checkbox';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

// ─── Types ───────────────────────────────────────────────────────────────────

type EditingCell = { rowIndex: number; columnId: string };
type CellPos = { row: number; col: number };

interface HeaderGroupCell {
  label: ReactNode;
  colspan?: number;
  rowspan?: number;
  className?: string;
  /** If set, this cell is a leaf that maps to a tanstack column at this index */
  columnIndex?: number;
  /** Grid column index (0-based, relative to data columns, not including prefix) — used for sticky positioning */
  gridCol?: number;
}

type HeaderGroupRow = HeaderGroupCell[];

export interface HeaderColumnNode {
  id: string;
  header: ReactNode;
  className?: string;
  children?: HeaderColumnNode[];
}

interface RangeProps {
  anchor: CellPos;
  focus: CellPos;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
}

// ─── Tree helpers ─────────────────────────────────────────────────────────────

function getAllLeafRows<TData>(row: Row<TData>): Row<TData>[] {
  if (row.subRows.length === 0) return [row];
  return row.subRows.flatMap((r) => getAllLeafRows(r));
}

// ─── Header column tree helpers ─────────────────────────────────────────────

function leafCount(node: HeaderColumnNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((sum, child) => sum + leafCount(child), 0);
}

function buildHeaderRows(
  tree: HeaderColumnNode[],
  prefixCount = 0
): {
  rows: HeaderGroupRow[];
  totalRows: number;
} {
  function maxDepth(nodes: HeaderColumnNode[], depth: number): number {
    let max = depth;
    for (const node of nodes) {
      if (node.children) {
        max = Math.max(max, maxDepth(node.children, depth + 1));
      }
    }
    return max;
  }

  const totalRows = maxDepth(tree, 0) + 1;
  const totalCols = tree.reduce((sum, node) => sum + leafCount(node), 0);

  const grid: (HeaderGroupCell | null)[][] = Array.from({ length: totalRows }, () =>
    Array(totalCols).fill(null)
  );

  let leafCounter = 0;

  function placeNode(node: HeaderColumnNode, parentDepth: number, startCol: number): number {
    const colSpan = leafCount(node);
    const depth = parentDepth + 1;
    const hasChildren = node.children && node.children.length > 0;
    const rowSpan = hasChildren ? 1 : totalRows - depth;

    let col = startCol;
    while (col < totalCols && grid[depth]![col] !== null) {
      col++;
    }

    const cell: HeaderGroupCell = {
      label: node.header,
      colspan: colSpan > 1 ? colSpan : undefined,
      rowspan: rowSpan > 1 ? rowSpan : undefined,
      className: node.className,
      gridCol: col,
    };

    if (!hasChildren) {
      cell.columnIndex = prefixCount + leafCounter;
      leafCounter++;
    }

    grid[depth]![col] = cell;

    if (hasChildren) {
      let childCol = col;
      for (const child of node.children!) {
        childCol = placeNode(child, depth, childCol);
      }
    }

    return col + colSpan;
  }

  let startCol = 0;
  for (const node of tree) {
    placeNode(node, -1, startCol);
    startCol += leafCount(node);
  }

  const rows: HeaderGroupRow[] = [];
  for (let r = 0; r < totalRows; r++) {
    const row: HeaderGroupCell[] = [];
    for (let c = 0; c < totalCols; c++) {
      const cell = grid[r]![c];
      if (cell) {
        row.push(cell);
      }
    }
    rows.push(row);
  }

  return { rows, totalRows };
}

// ─── Range helpers ────────────────────────────────────────────────────────────

function getRangeBounds(anchor: CellPos, focus: CellPos) {
  return {
    minRow: Math.min(anchor.row, focus.row),
    maxRow: Math.max(anchor.row, focus.row),
    minCol: Math.min(anchor.col, focus.col),
    maxCol: Math.max(anchor.col, focus.col),
  };
}

function isCellInRange(bounds: ReturnType<typeof getRangeBounds>, row: number, col: number) {
  return (
    row >= bounds.minRow && row <= bounds.maxRow && col >= bounds.minCol && col <= bounds.maxCol
  );
}

function getRangeValues<TData>(
  rows: Row<TData>[],
  bounds: ReturnType<typeof getRangeBounds>
): unknown[][] {
  const values: unknown[][] = [];
  for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
    const row = rows[r];
    if (!row) continue;
    const cells = row.getVisibleCells();
    const rowValues: unknown[] = [];
    for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
      rowValues.push(cells[c]?.getValue() ?? '');
    }
    values.push(rowValues);
  }
  return values;
}

function getRangeRowIndices<TData>(
  rows: Row<TData>[],
  bounds: ReturnType<typeof getRangeBounds>
): number[] {
  const indices: number[] = [];
  for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
    const row = rows[r];
    if (row) indices.push(row.index);
  }
  return indices;
}

// ─── Shared cell renderer ─────────────────────────────────────────────────────

function renderRowCells<TData>(
  row: Row<TData>,
  visibleRowIndex: number,
  editingCell: EditingCell | null,
  onSave: (rowIndex: number, columnId: string, value: unknown, rowData: TData) => void,
  onCancelEdit: () => void,
  enableZebraStripes: boolean,
  rangeProps?: RangeProps,
  activeCell?: CellPos | null,
  onActivateCell?: (row: number, col: number) => void,
  onStartEdit?: (rowIndex: number, columnId: string) => void,
  onNavigateFromEdit?: (direction: 'down' | 'right' | 'left') => void,
  setEditingCell?: (cell: EditingCell | null) => void,
  enableRangeSelection?: boolean,
  onContextMenuCell?: (
    rowIndex: number,
    colIndex: number,
    columnId: string,
    value: unknown
  ) => void,
  copiedRange?: { anchor: CellPos; focus: CellPos } | null,
  stickyColumns?: number,
  stickyColumnOffsets?: number[],
  nonEditableTooltip?: string | ((info: { columnId: string; header: string }) => string),
  treeColumnIndex?: number,
  popoverContainer?: HTMLElement | null
) {
  const rangeBounds = rangeProps ? getRangeBounds(rangeProps.anchor, rangeProps.focus) : null;
  const copiedBounds = copiedRange ? getRangeBounds(copiedRange.anchor, copiedRange.focus) : null;

  return row.getVisibleCells().map((cell, colIndex) => {
    const isSticky = !!stickyColumns && colIndex < stickyColumns;
    const stickyLeft = isSticky ? (stickyColumnOffsets?.[colIndex] ?? 0) : undefined;
    const meta = cell.column.columnDef.meta;
    const isEditable =
      meta?.editable === true && (!meta.editableWhen || meta.editableWhen(row.original));
    const isEditing =
      editingCell?.rowIndex === visibleRowIndex && editingCell?.columnId === cell.column.id;
    const edit = typeof meta?.edit === 'function' ? meta.edit(row.original) : meta?.edit;
    const editType = edit?.editType ?? 'input';
    const inputType = (edit?.editType === 'input' ? edit.inputType : undefined) ?? 'text';
    const selectOptions =
      edit && (edit.editType === 'select' || edit.editType === 'async-select')
        ? edit.selectOptions
        : undefined;
    const selectHasNextPage =
      edit && (edit.editType === 'select' || edit.editType === 'async-select')
        ? edit.selectHasNextPage
        : undefined;
    const selectOnLoadMore =
      edit && (edit.editType === 'select' || edit.editType === 'async-select')
        ? edit.selectOnLoadMore
        : undefined;
    const selectOnSearch =
      edit && edit.editType === 'async-select' ? edit.selectOnSearch : undefined;
    const comboboxOptions = edit?.editType === 'combobox' ? edit.comboboxOptions : undefined;
    const comboboxOnLoadMore = edit?.editType === 'combobox' ? edit.comboboxOnLoadMore : undefined;
    const comboboxHasNextPage =
      edit?.editType === 'combobox' ? edit.comboboxHasNextPage : undefined;
    const comboboxOnSearch = edit?.editType === 'combobox' ? edit.comboboxOnSearch : undefined;
    const isDateEditing = isEditing && editType === 'date';
    const resolvedCellClassName =
      typeof meta?.cellClassName === 'function'
        ? meta.cellClassName(row.original)
        : meta?.cellClassName;

    const inRange = rangeBounds ? isCellInRange(rangeBounds, visibleRowIndex, colIndex) : false;
    const isTopEdge = inRange && visibleRowIndex === rangeBounds!.minRow;
    const isBottomEdge = inRange && visibleRowIndex === rangeBounds!.maxRow;
    const isLeftEdge = inRange && colIndex === rangeBounds!.minCol;
    const isRightEdge = inRange && colIndex === rangeBounds!.maxCol;

    const inCopiedRange = copiedBounds
      ? isCellInRange(copiedBounds, visibleRowIndex, colIndex)
      : false;

    const isActiveCell = enableRangeSelection
      ? activeCell !== null &&
        activeCell !== undefined &&
        visibleRowIndex === activeCell.row &&
        colIndex === activeCell.col
      : false;

    const zebraOverlay =
      enableZebraStripes && row.depth === 0 && visibleRowIndex % 2 !== 0
        ? 'linear-gradient(color-mix(in srgb, var(--muted) 20%, transparent), color-mix(in srgb, var(--muted) 20%, transparent))'
        : undefined;

    return (
      <TableCell
        key={cell.id}
        style={{
          width: cell.column.getSize(),
          ...(isSticky
            ? {
                left: stickyLeft,
                backgroundColor: 'var(--background)',
                ...(zebraOverlay && { backgroundImage: zebraOverlay }),
              }
            : enableZebraStripes && {
                backgroundColor:
                  row.depth > 0
                    ? 'color-mix(in srgb, var(--muted) 10%, transparent)'
                    : 'var(--background)',
                ...(zebraOverlay && { backgroundImage: zebraOverlay }),
              }),
        }}
        className={cn(
          enableZebraStripes && 'border-r last:border-r-0',
          'px-3 text-sm overflow-hidden',
          isSticky && 'sticky z-10',
          isDateEditing ? 'p-0 border-0 border-r-0 last:border-r-0' : isEditing ? 'py-0' : 'py-2',
          isEditable && !isEditing && !inRange && 'group/cell',
          inRange && !isActiveCell && 'bg-primary/10',
          inRange && !isActiveCell && isTopEdge && 'border-t-2 border-t-primary',
          inRange && !isActiveCell && isBottomEdge && 'border-b-2 border-b-primary',
          inRange && !isActiveCell && isLeftEdge && 'border-l-2 border-l-primary',
          inRange && !isActiveCell && isRightEdge && 'border-r-2 border-r-primary',
          rangeProps && !isEditing && cell.column.id !== '__select__' && 'cursor-cell select-none',
          isActiveCell && 'outline-2 outline-cyan-500 -outline-offset-2 z-10',
          isActiveCell && 'bg-cyan-50/30',
          inCopiedRange &&
            !isActiveCell &&
            !isEditing &&
            'outline-[1.5px] outline-dashed outline-slate-700/80 outline-offset-[-1.5px] animate-marching-ants',
          resolvedCellClassName
        )}
        onMouseDown={
          rangeProps && !isEditing && cell.column.id !== '__select__'
            ? (e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                if (editingCell) setEditingCell?.(null);
                rangeProps.onMouseDown(visibleRowIndex, colIndex);
                onActivateCell?.(visibleRowIndex, colIndex);
              }
            : onActivateCell && cell.column.id !== '__select__'
              ? () => {
                  // When isEditing is true this cell IS the editing cell — don't cancel it.
                  // Portal mousedown events (e.g. from an open dropdown) bubble here via
                  // React's component tree; cancelling here would unmount the dropdown
                  // before the click+select fires, losing the selection.
                  if (editingCell && !isEditing) setEditingCell?.(null);
                  onActivateCell(visibleRowIndex, colIndex);
                }
              : undefined
        }
        onMouseEnter={
          rangeProps && !isEditing && cell.column.id !== '__select__'
            ? () => rangeProps.onMouseEnter(visibleRowIndex, colIndex)
            : undefined
        }
        onDoubleClick={
          isEditable && !isEditing
            ? (e) => {
                e.stopPropagation();
                onStartEdit?.(visibleRowIndex, cell.column.id);
              }
            : undefined
        }
        onContextMenu={
          onContextMenuCell
            ? () => {
                onContextMenuCell(visibleRowIndex, colIndex, cell.column.id, cell.getValue());
              }
            : onActivateCell
              ? () => {
                  onActivateCell(visibleRowIndex, colIndex);
                }
              : undefined
        }
      >
        {(() => {
          const cellContent = isEditing ? (
            <DataTableEditableCell
              value={cell.getValue()}
              editType={editType}
              inputType={inputType}
              selectOptions={selectOptions}
              selectHasNextPage={selectHasNextPage}
              selectOnLoadMore={selectOnLoadMore}
              selectOnSearch={selectOnSearch}
              comboboxOptions={comboboxOptions}
              comboboxOnLoadMore={comboboxOnLoadMore}
              comboboxHasNextPage={comboboxHasNextPage}
              comboboxOnSearch={comboboxOnSearch}
              onSave={(val) => onSave(visibleRowIndex, cell.column.id, val, row.original)}
              onCancel={onCancelEdit}
              onNavigate={onNavigateFromEdit}
              popoverContainer={popoverContainer}
            />
          ) : isEditable ? (
            <span className="flex items-center gap-1 w-full">
              <span className="flex-1 cursor-text truncate">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </span>
              {(editType === 'select' || editType === 'date' || editType === 'async-select') && (
                <ChevronDown className="h-3 w-3 text-cyan-600 shrink-0" />
              )}
            </span>
          ) : (
            (() => {
              const colMeta = cell.column.columnDef.meta as
                | {
                    nonEditableTooltip?:
                      | boolean
                      | string
                      | ((info: { columnId: string; header: string }) => string);
                  }
                | undefined;
              const colNonEditableTooltip = colMeta?.nonEditableTooltip;
              // false explicitly disables tooltip for this column
              if (colNonEditableTooltip === false) {
                return flexRender(cell.column.columnDef.cell, cell.getContext());
              }
              // column-level override (string or function)
              const effectiveTooltip = colNonEditableTooltip ?? nonEditableTooltip;
              if (effectiveTooltip && cell.column.id !== '__select__') {
                return (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block w-full truncate">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" sideOffset={4}>
                      {typeof effectiveTooltip === 'function'
                        ? effectiveTooltip({
                            columnId: cell.column.id,
                            header:
                              typeof cell.column.columnDef.header === 'string'
                                ? cell.column.columnDef.header
                                : cell.column.id,
                          })
                        : effectiveTooltip}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return flexRender(cell.column.columnDef.cell, cell.getContext());
            })()
          );

          if (treeColumnIndex !== undefined && colIndex === treeColumnIndex) {
            return (
              <div className="flex items-center gap-1" style={{ paddingLeft: row.depth * 10 }}>
                {row.getCanExpand() ? (
                  <button
                    type="button"
                    className="shrink-0 text-muted-foreground hover:text-foreground p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      row.toggleExpanded();
                    }}
                    aria-label={row.getIsExpanded() ? 'Collapse row' : 'Expand row'}
                  >
                    {row.getIsExpanded() ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                ) : (
                  <span className="h-4 w-4 shrink-0" aria-hidden="true" />
                )}
                <span className="flex-1 min-w-0">{cellContent}</span>
              </div>
            );
          }

          return cellContent;
        })()}
      </TableCell>
    );
  });
}

// ─── Sortable row (uses useSortable hook — must be a component) ───────────────

interface SortableDataRowProps<TData> {
  row: Row<TData>;
  rowIndex: number;
  enableZebraStripes: boolean;
  editingCell: EditingCell | null;
  onSave: (rowIndex: number, columnId: string, value: unknown, rowData: TData) => void;
  onCancelEdit: () => void;
  contextMenu?: (
    row: Row<TData>,
    options?: {
      activeCellInfo?: { rowIndex: number; colIndex: number; columnId: string; value: unknown };
      rangeBounds?: { minRow: number; maxRow: number; minCol: number; maxCol: number };
      rangeValues?: unknown[][];
      rangeRowIndices?: number[];
      triggerCopy?: () => void;
      triggerCut?: () => void;
      triggerPaste?: () => Promise<void>;
    }
  ) => ReactNode;
  rangeProps?: RangeProps;
  activeCell?: CellPos | null;
  onActivateCell?: (row: number, col: number) => void;
  onStartEdit?: (rowIndex: number, columnId: string) => void;
  onNavigateFromEdit?: (direction: 'down' | 'right' | 'left') => void;
  setEditingCell?: (cell: EditingCell | null) => void;
  enableRangeSelection?: boolean;
  rightClickedCellInfo?: { rowIndex: number; colIndex: number; columnId: string; value: unknown };
  onContextMenuCell?: (
    rowIndex: number,
    colIndex: number,
    columnId: string,
    value: unknown
  ) => void;
  rangeInfo?: {
    bounds: { minRow: number; maxRow: number; minCol: number; maxCol: number };
    values: unknown[][];
    rowIndices: number[];
  };
  copiedRange?: { anchor: CellPos; focus: CellPos } | null;
  triggerCopy?: () => void;
  triggerCut?: () => void;
  triggerPaste?: () => Promise<void>;
  stickyColumns?: number;
  stickyColumnOffsets?: number[];
  nonEditableTooltip?: string | ((info: { columnId: string; header: string }) => string);
  treeColumnIndex?: number;
  contextMenuContainer?: HTMLElement | null;
  popoverContainer?: HTMLElement | null;
}

function SortableDataRow<TData>({
  row,
  rowIndex,
  enableZebraStripes,
  editingCell,
  onSave,
  onCancelEdit,
  contextMenu,
  rangeProps,
  activeCell,
  onActivateCell,
  onStartEdit,
  onNavigateFromEdit,
  setEditingCell,
  enableRangeSelection,
  rightClickedCellInfo,
  onContextMenuCell,
  rangeInfo,
  copiedRange,
  triggerCopy,
  triggerCut,
  triggerPaste,
  stickyColumns,
  stickyColumnOffsets,
  nonEditableTooltip,
  treeColumnIndex,
  contextMenuContainer,
  popoverContainer,
}: SortableDataRowProps<TData>) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  });

  const rowElement = (
    <TableRow
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : undefined,
        position: isDragging ? 'relative' : undefined,
      }}
      {...attributes}
      data-state={row.getIsSelected() && 'selected'}
      className={cn(
        'border-b cursor-default',
        enableZebraStripes && (rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'),
        row.getCanExpand() && 'font-medium',
        row.depth > 0 && 'bg-muted/10',
        row.getIsSelected() && 'bg-primary/10 hover:bg-primary/15',
        isDragging && 'shadow-md ring-1 ring-primary/20'
      )}
    >
      <TableCell
        className={cn(
          'w-10 px-2 py-0',
          enableZebraStripes && 'border-r',
          stickyColumns && 'sticky left-0 z-10'
        )}
        style={
          stickyColumns
            ? {
                backgroundColor: 'var(--background)',
                ...(enableZebraStripes &&
                  rowIndex % 2 !== 0 && {
                    backgroundImage:
                      'linear-gradient(color-mix(in srgb, var(--muted) 20%, transparent), color-mix(in srgb, var(--muted) 20%, transparent))',
                  }),
              }
            : undefined
        }
      >
        <button
          type="button"
          {...listeners}
          className="flex h-full items-center py-2 cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
          aria-label="Drag to reorder row"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      {renderRowCells(
        row,
        rowIndex,
        editingCell,
        onSave,
        onCancelEdit,
        enableZebraStripes,
        rangeProps,
        activeCell,
        onActivateCell,
        onStartEdit,
        onNavigateFromEdit,
        setEditingCell,
        enableRangeSelection,
        onContextMenuCell,
        copiedRange,
        stickyColumns,
        stickyColumnOffsets,
        nonEditableTooltip,
        treeColumnIndex,
        popoverContainer
      )}
    </TableRow>
  );

  if (!contextMenu) return rowElement;

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild className="select-text">
        {rowElement}
      </ContextMenuTrigger>
      <ContextMenuContent container={contextMenuContainer}>
        {contextMenu(row, {
          activeCellInfo: rightClickedCellInfo,
          rangeBounds: rangeInfo?.bounds,
          rangeValues: rangeInfo?.values,
          rangeRowIndices: rangeInfo?.rowIndices,
          triggerCopy,
          triggerCut,
          triggerPaste,
        })}
      </ContextMenuContent>
    </ContextMenu>
  );
}

// ─── DataTable ────────────────────────────────────────────────────────────────

type ExclusiveTreeViewProps =
  | { enableTreeView?: false }
  | {
      enableTreeView: true;
      enableRowSelection?: never;
      // enableTreeView is allowed — range clears automatically on expand/collapse
    };

type DataTableScrollProps =
  | {
      enablePagination?: true;
      pageSizeOptions?: number[];
      enableInfiniteScroll?: never;
      onLoadMore?: never;
      hasNextPage?: never;
      isFetchingNextPage?: never;
    }
  | {
      enablePagination?: never;
      pageSizeOptions?: never;
      enableInfiniteScroll: true;
      onLoadMore?: () => void;
      hasNextPage?: boolean;
      isFetchingNextPage?: boolean;
    }
  | {
      enablePagination?: false;
      pageSizeOptions?: never;
      enableInfiniteScroll?: never;
      onLoadMore?: never;
      hasNextPage?: never;
      isFetchingNextPage?: never;
    };

interface DataTableBaseProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  headerColumnTree?: HeaderColumnNode[];
  enableRowSelection?: boolean;
  enableColumnDnd?: boolean;
  enableRowDnd?: boolean;
  enableColumnResize?: boolean;
  enableRangeSelection?: boolean;
  enableTreeView?: boolean;
  enableZebraStripes?: boolean;
  /** Render a footer row using each column's `columnDef.footer`. Default false. */
  enableFooter?: boolean;
  getSubRows?: (originalRow: TData) => TData[] | undefined;
  /** Stable row id (e.g. a domain uuid). Enables controlled expansion keyed by id. */
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  /** Controlled expanded state. When provided, the table no longer manages expansion internally. */
  expanded?: ExpandedState;
  /** Called whenever expansion changes (only meaningful with `expanded`). */
  onExpandedChange?: (expanded: ExpandedState) => void;
  className?: string;
  emptyMessage?: string;
  isLoading?: boolean;
  onCellEdit?: (rowIndex: number, columnId: string, value: unknown, row?: TData) => void;
  onRowSelectionChange?: (rows: TData[]) => void;
  onRowReorder?: (fromIndex: number, toIndex: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
  onPaginationChange?: (page: number, pageSize: number) => void;
  initialSorting?: SortingState;
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
  totalPages?: number;
  contextMenu?: (
    row: Row<TData>,
    options?: {
      activeCellInfo?: { rowIndex: number; colIndex: number; columnId: string; value: unknown };
      rangeBounds?: { minRow: number; maxRow: number; minCol: number; maxCol: number };
      rangeValues?: unknown[][];
      rangeRowIndices?: number[];
      triggerCopy?: () => void;
      triggerCut?: () => void;
      triggerPaste?: () => Promise<void>;
    }
  ) => ReactNode;
  contextMenuContainer?: HTMLElement | null;
  /** Portal container for async-select/combobox dropdowns. Pass fullscreen element to fix visibility in fullscreen mode. */
  popoverContainer?: HTMLElement | null;
  stickyHeader?: boolean;
  stickyColumns?: number;
  /** Tooltip shown on hover for non-editable cells. Pass a string or a function receiving column header and column id. */
  nonEditableTooltip?: string | ((info: { columnId: string; header: string }) => string);
}

export type DataTableProps<TData, TValue> = DataTableBaseProps<TData, TValue> &
  DataTableScrollProps &
  ExclusiveTreeViewProps;

export function DataTable<TData, TValue>({
  columns,
  data,
  headerColumnTree,
  enableRowSelection = false,
  enablePagination,
  enableInfiniteScroll,
  enableColumnDnd = true,
  enableRowDnd = false,
  enableColumnResize = true,
  enableRangeSelection = false,
  enableTreeView = false,
  enableZebraStripes = true,
  enableFooter = false,
  getSubRows,
  getRowId,
  expanded: controlledExpanded,
  onExpandedChange: onExpandedChangeProp,
  pageSizeOptions,
  className,
  emptyMessage = 'No results.',
  isLoading = false,
  onCellEdit,
  onRowSelectionChange,
  onRowReorder,
  onSortingChange,
  onPaginationChange,
  initialSorting,
  initialPage = 1,
  initialPageSize = 10,
  totalItems,
  totalPages,
  contextMenu,
  contextMenuContainer,
  popoverContainer,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage = false,
  stickyHeader = false,
  stickyColumns = 0,
  nonEditableTooltip,
}: DataTableProps<TData, TValue>) {
  const isPaginated = !enableInfiniteScroll && enablePagination !== false;
  const isInfiniteScroll = enableInfiniteScroll === true;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  // First <tr> inside the header — used to measure per-row sticky offsets so a
  // grouped header's parent row sticks above (not on top of) the leaf row.
  const headerFirstRowRef = useRef<HTMLTableRowElement>(null);
  const [headerFirstRowHeight, setHeaderFirstRowHeight] = useState(0);
  // ── Table state ────────────────────────────────────────────────────────────
  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({});
  const [rowSelection, setRowSelection] = useState({});
  // For server-side pagination: derive state directly from props (URL is the source of truth)
  const currentPage = initialPage ?? 1;
  const currentPageSize = initialPageSize ?? 10;
  const pagination = {
    pageIndex: currentPage - 1,
    pageSize: currentPageSize,
  };
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const editingCellRef = useRef(editingCell);
  editingCellRef.current = editingCell;
  const rightClickedCellRef = useRef<{
    rowIndex: number;
    colIndex: number;
    columnId: string;
    value: unknown;
  } | null>(null);
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    const prefixIds = [...(enableRowSelection ? ['__select__'] : [])];
    // `id` wins over `accessorKey` — the same precedence TanStack uses to derive a column's id.
    // Preferring accessorKey left order entries (e.g. a column with id 'jobItem' +
    // accessorKey 'name') that match no real column, and TanStack appends unmatched columns
    // after every matched one — the column jumped to the rightmost position.
    return [
      ...prefixIds,
      ...columns.map(
        (col) => (col as { id?: string }).id ?? (col as { accessorKey?: string }).accessorKey ?? ''
      ),
    ].filter(Boolean);
  });

  // ── Tree expanded state (controlled so we can react to changes) ──────────────
  // Supports an externally-controlled `expanded` prop; otherwise managed internally.
  const isExpandedControlled = controlledExpanded !== undefined;
  const [internalExpanded, setInternalExpanded] = useState<ExpandedState>({});
  const expanded = isExpandedControlled ? controlledExpanded : internalExpanded;

  const selectedDataRows = useMemo(() => {
    const sel = rowSelection as Record<string, boolean>;
    return Object.keys(sel)
      .filter((key) => sel[key])
      .map((key) => data[Number(key)])
      .filter((row): row is TData => row !== undefined);
  }, [rowSelection, data]);

  useEffect(() => {
    onRowSelectionChange?.(selectedDataRows);
  }, [selectedDataRows, onRowSelectionChange]);

  // ── Sticky header row offset (grouped headers) ──────────────────────────────
  // Leaf rows of a grouped header must stick below the parent row, not at top:0.
  // biome-ignore lint/correctness/useExhaustiveDependencies: headerColumnTree is a prop (outer scope) — changes trigger re-render, so effect must re-run to re-measure the first header row.
  useEffect(() => {
    const firstRow = headerFirstRowRef.current;
    if (!firstRow) return;
    const measure = () => setHeaderFirstRowHeight(firstRow.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(firstRow);
    return () => observer.disconnect();
  }, [headerColumnTree]);

  // ── Active cell state (spreadsheet-like focus, excel mode only) ──────────────
  const [activeCell, setActiveCell] = useState<CellPos | null>(null);
  const activeCellRef = useRef<CellPos | null>(null);
  activeCellRef.current = activeCell;

  // ── Range selection state ──────────────────────────────────────────────────
  const [rangeAnchor, setRangeAnchor] = useState<CellPos | null>(null);
  const [rangeFocus, setRangeFocus] = useState<CellPos | null>(null);
  const [isRangeSelecting, setIsRangeSelecting] = useState(false);
  const rangeAnchorRef = useRef<CellPos | null>(null);
  rangeAnchorRef.current = rangeAnchor;
  const rangeFocusRef = useRef<CellPos | null>(null);
  rangeFocusRef.current = rangeFocus;

  // ── Copied range state (excel "marching ants") ──────────────────────────────
  const [copiedRange, setCopiedRange] = useState<{ anchor: CellPos; focus: CellPos } | null>(null);
  const copiedRangeRef = useRef(copiedRange);
  copiedRangeRef.current = copiedRange;
  const [isCutMode, setIsCutMode] = useState(false);
  const isCutModeRef = useRef(false);
  isCutModeRef.current = isCutMode;

  const clearRange = useCallback(() => {
    setRangeAnchor(null);
    setRangeFocus(null);
    rangeAnchorRef.current = null;
    rangeFocusRef.current = null;
  }, []);

  useEffect(() => {
    if (!enableRangeSelection) return;
    const onMouseUp = () => setIsRangeSelecting(false);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearRange();
        setCopiedRange(null);
      }
    };
    const onMouseDown = (e: MouseEvent) => {
      if (!sectionRef.current?.contains(e.target as Node)) {
        setActiveCell(null);
        clearRange();
      }
    };
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
    };
  }, [enableRangeSelection, clearRange]);

  const handleRangeCellMouseDown = useCallback((row: number, col: number) => {
    rangeAnchorRef.current = { row, col };
    rangeFocusRef.current = { row, col };
    setRangeAnchor({ row, col });
    setRangeFocus({ row, col });
    setIsRangeSelecting(true);
  }, []);

  const handleRangeCellMouseEnter = useCallback(
    (row: number, col: number) => {
      if (!isRangeSelecting) return;
      rangeFocusRef.current = { row, col };
      setRangeFocus({ row, col });
    },
    [isRangeSelecting]
  );

  // ── Virtual columns ────────────────────────────────────────────────────────
  const selectionColumn: ColumnDef<TData, TValue> = {
    id: '__select__',
    header: ({ table }) => {
      if (enableTreeView) {
        const allLeafRows = table.getCoreRowModel().rows.flatMap((r) => getAllLeafRows(r));
        const selectedCount = allLeafRows.filter((r) => r.getIsSelected()).length;
        const allSelected = allLeafRows.length > 0 && selectedCount === allLeafRows.length;
        const someSelected = selectedCount > 0 && !allSelected;
        return (
          <Checkbox
            checked={allSelected || (someSelected && 'indeterminate')}
            onCheckedChange={(value) =>
              allLeafRows.forEach((r) => {
                r.toggleSelected(!!value);
              })
            }
            aria-label="Select all"
          />
        );
      }
      return (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      );
    },
    cell: ({ row }) => {
      if (enableTreeView && row.subRows.length > 0) {
        const leafRows = getAllLeafRows(row);
        const selectedCount = leafRows.filter((r) => r.getIsSelected()).length;
        const allSelected = selectedCount === leafRows.length;
        const someSelected = selectedCount > 0 && !allSelected;
        return (
          <Checkbox
            checked={allSelected || (someSelected && 'indeterminate')}
            onCheckedChange={(value) =>
              leafRows.forEach((r) => {
                r.toggleSelected(!!value);
              })
            }
            aria-label="Select row"
            onClick={(e) => e.stopPropagation()}
          />
        );
      }
      return (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          onClick={(e) => e.stopPropagation()}
        />
      );
    },
    enableSorting: false,
    enableHiding: false,
    enableResizing: false,
    size: 40,
    minSize: 40,
    maxSize: 40,
  };

  const allColumns = [...(enableRowSelection ? [selectionColumn] : []), ...columns];

  // When tree rows expand/collapse, flat row indices shift — clear range selection
  const handleExpandedChange = useCallback(
    (updaterOrValue: ExpandedState | ((old: ExpandedState) => ExpandedState)) => {
      const newExpanded =
        typeof updaterOrValue === 'function' ? updaterOrValue(expanded) : updaterOrValue;
      if (isExpandedControlled) {
        onExpandedChangeProp?.(newExpanded);
      } else {
        setInternalExpanded(newExpanded);
      }
      if (enableRangeSelection && enableTreeView) {
        setActiveCell(null);
        activeCellRef.current = null;
        setRangeAnchor(null);
        setRangeFocus(null);
        rangeAnchorRef.current = null;
        rangeFocusRef.current = null;
        setCopiedRange(null);
      }
    },
    [expanded, isExpandedControlled, onExpandedChangeProp, enableRangeSelection, enableTreeView]
  );

  // ── TanStack table instance ────────────────────────────────────────────────
  const table = useReactTable({
    data,
    columns: allColumns,
    ...(getRowId ? { getRowId } : {}),
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      columnOrder,
      columnSizing,
      pagination,
      expanded,
    },
    onSortingChange: (updater) => {
      setSorting(updater);
      const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
      onSortingChange?.(newSorting);
    },
    manualPagination: true,
    pageCount: totalPages ?? -1,
    onPaginationChange: undefined,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onExpandedChange: handleExpandedChange,
    getExpandedRowModel: enableTreeView ? getExpandedRowModel() : undefined,
    getPaginationRowModel: undefined,
    getSubRows: enableTreeView
      ? (getSubRows ?? ((row) => (row as { children?: TData[] }).children))
      : undefined,
    enableRowSelection,
    enableColumnResizing: enableColumnResize,
    columnResizeMode: 'onChange',
  });

  // ── Document-level keyboard navigation ───────────────────────────────────────
  useEffect(() => {
    if (!enableRangeSelection) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keys that originate from within this DataTable's section.
      // This prevents a parent DataTable (with a stale activeCell) from intercepting
      // keyboard events meant for a nested table inside a Dialog or Accordion.
      if (!sectionRef.current?.contains(e.target as Node)) return;

      // Skip if an input/textarea/select is focused (editing mode)
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      const currentEditingCell = editingCellRef.current;
      const currentActiveCell = activeCellRef.current;

      // When editing, let the editable cell handle its own keys
      if (currentEditingCell) return;
      if (!currentActiveCell) return;

      // Escape always deselects regardless of defaultPrevented — a wrapping Dialog
      // may set e.defaultPrevented via onEscapeKeyDown to block its own dismiss,
      // but we still need to clear the active cell.
      if (e.key === 'Escape') {
        e.preventDefault();
        if (enableRangeSelection) {
          clearRange();
          setCopiedRange(null);
        }
        setActiveCell(null);
        return;
      }

      // Skip other keys if already handled (e.g. by DataTableEditableCell)
      if (e.defaultPrevented) return;

      const rows = table.getRowModel().rows;
      if (rows.length === 0) return;
      const visibleCells = rows[0].getVisibleCells();
      const maxRow = rows.length - 1;
      const maxCol = visibleCells.length - 1;

      let newRow = currentActiveCell.row;
      let newCol = currentActiveCell.col;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (enableRangeSelection) clearRange();
          newRow = Math.max(0, currentActiveCell.row - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (enableRangeSelection) clearRange();
          newRow = Math.min(maxRow, currentActiveCell.row + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (enableRangeSelection) clearRange();
          newCol = Math.max(0, currentActiveCell.col - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (enableRangeSelection) clearRange();
          newCol = Math.min(maxCol, currentActiveCell.col + 1);
          break;
        case 'Enter':
        case 'F2': {
          e.preventDefault();
          const targetRow = rows[currentActiveCell.row];
          const targetCell = targetRow?.getVisibleCells()[currentActiveCell.col];
          if (targetCell?.column.columnDef.meta?.editable) {
            setEditingCell({
              rowIndex: currentActiveCell.row,
              columnId: targetCell.column.id,
            });
          }
          return;
        }
        case 'Tab': {
          e.preventDefault();
          if (enableRangeSelection) clearRange();
          newCol = e.shiftKey
            ? Math.max(0, currentActiveCell.col - 1)
            : Math.min(maxCol, currentActiveCell.col + 1);
          break;
        }
        default:
          return;
      }

      if (newRow !== currentActiveCell.row || newCol !== currentActiveCell.col) {
        setActiveCell({ row: newRow, col: newCol });
      }
    };

    // Capture phase so arrow-key events are handled before Accordion/Dialog
    // RovingFocusGroup can call stopPropagation in the bubble phase.
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [enableRangeSelection, table, clearRange]);

  const performCopy = useCallback(() => {
    const currentAnchor = rangeAnchorRef.current;
    const currentFocus = rangeFocusRef.current;
    if (!currentAnchor || !currentFocus) return;

    const bounds = getRangeBounds(currentAnchor, currentFocus);
    const rows = table.getRowModel().rows;
    const lines: string[] = [];
    for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
      const row = rows[r];
      if (!row) continue;
      const cells = row.getVisibleCells();
      const rowValues: string[] = [];
      for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
        const cell = cells[c];
        const colMeta = cell?.column.columnDef.meta as
          | { copyValue?: (row: TData) => unknown }
          | undefined;
        const value = colMeta?.copyValue ? colMeta.copyValue(row.original) : cell?.getValue();
        rowValues.push(String(value ?? ''));
      }
      lines.push(rowValues.join('\t'));
    }

    setCopiedRange({ anchor: currentAnchor, focus: currentFocus });
    setIsCutMode(false);
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
  }, [table]);

  const performCopyRef = useRef(performCopy);
  performCopyRef.current = performCopy;

  const performPaste = useCallback(async (): Promise<void> => {
    if (!onCellEdit) return;
    const currentActiveCell = activeCellRef.current;
    if (!currentActiveCell) return;

    try {
      const text = await navigator.clipboard.readText();
      const pasteRows = text.split('\n').filter((line) => line.length > 0);
      const values = pasteRows.map((row) => row.split('\t'));

      const startRow = currentActiveCell.row;
      const startCol = currentActiveCell.col;
      const rows = table.getRowModel().rows;

      for (let r = 0; r < values.length; r++) {
        const targetRow = rows[startRow + r];
        if (!targetRow) break;

        for (let c = 0; c < values[r].length; c++) {
          const targetCell = targetRow.getVisibleCells()[startCol + c];
          if (!targetCell) break;

          onCellEdit(startRow + r, targetCell.column.id, values[r][c], targetRow.original as TData);
        }
      }

      // If cut mode: clear source cells after paste
      if (isCutModeRef.current && copiedRangeRef.current) {
        const cutBounds = getRangeBounds(
          copiedRangeRef.current.anchor,
          copiedRangeRef.current.focus
        );
        for (let r = cutBounds.minRow; r <= cutBounds.maxRow; r++) {
          const row = rows[r];
          if (!row) continue;
          for (let c = cutBounds.minCol; c <= cutBounds.maxCol; c++) {
            const cell = row.getVisibleCells()[c];
            if (!cell) continue;
            const editable = (cell.column.columnDef.meta as { editable?: boolean } | undefined)
              ?.editable;
            if (!editable) continue;
            onCellEdit(r, cell.column.id, null, row.original as TData);
          }
        }
        setIsCutMode(false);
      }

      setCopiedRange(null);
    } catch {
      // Silently fail if clipboard access is denied
    }
  }, [onCellEdit, table]);

  const onCellEditRef = useRef(onCellEdit);
  onCellEditRef.current = onCellEdit;

  const performCut = useCallback(() => {
    const currentAnchor = rangeAnchorRef.current;
    const currentFocus = rangeFocusRef.current;
    if (!currentAnchor || !currentFocus) return;

    // Copy range to clipboard (same logic as performCopy)
    const bounds = getRangeBounds(currentAnchor, currentFocus);
    const rows = table.getRowModel().rows;
    const lines: string[] = [];
    for (let r = bounds.minRow; r <= bounds.maxRow; r++) {
      const row = rows[r];
      if (!row) continue;
      const cells = row.getVisibleCells();
      const rowValues: string[] = [];
      for (let c = bounds.minCol; c <= bounds.maxCol; c++) {
        const cell = cells[c];
        const colMeta = cell?.column.columnDef.meta as
          | { copyValue?: (row: TData) => unknown }
          | undefined;
        const value = colMeta?.copyValue ? colMeta.copyValue(row.original) : cell?.getValue();
        rowValues.push(String(value ?? ''));
      }
      lines.push(rowValues.join('\t'));
    }
    setCopiedRange({ anchor: currentAnchor, focus: currentFocus });
    setIsCutMode(true);
    navigator.clipboard.writeText(lines.join('\n')).catch(() => {});
    // Source cells are NOT cleared here — deferred to performPaste
  }, [table]);

  useEffect(() => {
    if (!enableRangeSelection) return;
    const onCopy = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'c') return;
      performCopyRef.current();
      e.preventDefault();
    };
    document.addEventListener('keydown', onCopy);
    return () => document.removeEventListener('keydown', onCopy);
  }, [enableRangeSelection]);

  useEffect(() => {
    if (!enableRangeSelection) return;
    const onCut = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'x') return;
      performCut();
      e.preventDefault();
    };
    document.addEventListener('keydown', onCut);
    return () => document.removeEventListener('keydown', onCut);
  }, [enableRangeSelection, performCut]);

  const performPasteRef = useRef(performPaste);
  performPasteRef.current = performPaste;

  useEffect(() => {
    if (!enableRangeSelection || !onCellEdit) return;

    const handlePaste = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key !== 'v') return;

      // Skip if an input/textarea/select is focused (editing mode)
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }

      e.preventDefault();
      void performPasteRef.current();
    };

    document.addEventListener('keydown', handlePaste);
    return () => document.removeEventListener('keydown', handlePaste);
  }, [enableRangeSelection, onCellEdit]);

  // ── Infinite scroll ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isInfiniteScroll) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage !== false && !isFetchingNextPage) {
          onLoadMore?.();
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isInfiniteScroll, hasNextPage, isFetchingNextPage, onLoadMore]);

  // ── DnD ───────────────────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const handleColumnDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((prev) => {
        const oldIndex = prev.indexOf(active.id as string);
        const newIndex = prev.indexOf(over.id as string);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleRowDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const rows = table.getRowModel().rows;
      const activeRow = rows.find((r) => r.id === active.id);
      const overRow = rows.find((r) => r.id === over.id);
      if (activeRow && overRow) onRowReorder?.(activeRow.index, overRow.index);
    },
    [table, onRowReorder]
  );

  // ── Cell edit handlers ─────────────────────────────────────────────────────
  const handleSave = useCallback(
    (rowIndex: number, columnId: string, value: unknown, rowData?: TData) => {
      onCellEdit?.(rowIndex, columnId, value, rowData);
      setEditingCell(null);
    },
    [onCellEdit]
  );
  const handleCancelEdit = useCallback(() => {
    editingCellRef.current = null;
    setEditingCell(null);
  }, []);
  const handleStartEdit = useCallback((rowIndex: number, columnId: string) => {
    setEditingCell({ rowIndex, columnId });
  }, []);

  // ── Active cell handlers (excel mode only) ─────────────────────────────────
  const handleActivateCell = useCallback((row: number, col: number) => {
    setActiveCell({ row, col });
  }, []);

  const handleCellContextMenu = useCallback(
    (rowIndex: number, colIndex: number, columnId: string, value: unknown) => {
      rightClickedCellRef.current = { rowIndex, colIndex, columnId, value };
      handleActivateCell(rowIndex, colIndex);
    },
    [handleActivateCell]
  );

  const handleNavigateFromEdit = useCallback(
    (direction: 'down' | 'right' | 'left') => {
      if (!enableRangeSelection) return;
      const rows = table.getRowModel().rows;
      if (rows.length === 0 || !activeCell) return;
      const visibleCells = rows[0].getVisibleCells();
      const maxRow = rows.length - 1;
      const maxCol = visibleCells.length - 1;

      let newRow = activeCell.row;
      let newCol = activeCell.col;

      switch (direction) {
        case 'down':
          newRow = Math.min(maxRow, activeCell.row + 1);
          break;
        case 'right':
          newCol = Math.min(maxCol, activeCell.col + 1);
          break;
        case 'left':
          newCol = Math.max(0, activeCell.col - 1);
          break;
      }

      setActiveCell({ row: newRow, col: newCol });
    },
    [enableRangeSelection, table, activeCell]
  );

  // ── Derived values ─────────────────────────────────────────────────────────
  const sortableColumnIds = table
    .getHeaderGroups()
    .flatMap((hg) => hg.headers.map((h) => h.column.id))
    .filter((id) => id !== '__select__');

  const rowIds = table.getRowModel().rows.map((r) => r.id);
  const totalColSpan = allColumns.length + (enableRowDnd ? 1 : 0);

  // ── Computed header rows from column tree ─────────────────────────────────
  const hasUserSelectColumn = columns.some((col) => (col as { id?: string })?.id === '__select__');
  const prefixCount = enableRowSelection || hasUserSelectColumn ? 1 : 0;
  // Column index (in getVisibleCells) where the tree chevron should be inlined
  const treeColumnIndex = enableTreeView ? prefixCount : undefined;
  const computedHeaderResult = useMemo(
    () => (headerColumnTree ? buildHeaderRows(headerColumnTree, prefixCount) : null),
    [headerColumnTree, prefixCount]
  );
  const computedHeaderRows = computedHeaderResult?.rows;
  const computedHeaderTotalRows = computedHeaderResult?.totalRows ?? 0;

  const stickyColumnOffsets: number[] = [];
  if (stickyColumns) {
    let left = enableRowDnd ? 40 : 0;
    for (const col of table.getVisibleLeafColumns()) {
      stickyColumnOffsets.push(left);
      left += col.getSize();
    }
  }

  // Build a columnId → Header map so the column-tree path can call header.getResizeHandler()
  // (getResizeHandler lives on Header, not Column, in TanStack Table)
  const columnIdToLeafHeader = useMemo(() => {
    const map = new Map<string, ReturnType<typeof table.getHeaderGroups>[0]['headers'][0]>();
    for (const hg of table.getHeaderGroups()) {
      for (const h of hg.headers) {
        if (!h.isPlaceholder) map.set(h.column.id, h);
      }
    }
    return map;
  }, [table]);

  const rangeProps: RangeProps | undefined =
    enableRangeSelection && rangeAnchor && rangeFocus
      ? {
          anchor: rangeAnchor,
          focus: rangeFocus,
          onMouseDown: handleRangeCellMouseDown,
          onMouseEnter: handleRangeCellMouseEnter,
        }
      : enableRangeSelection
        ? {
            anchor: { row: -1, col: -1 },
            focus: { row: -1, col: -1 },
            onMouseDown: handleRangeCellMouseDown,
            onMouseEnter: handleRangeCellMouseEnter,
          }
        : undefined;

  // ── Static row renderer (no row DnD) ──────────────────────────────────────
  const renderStaticRow = (row: Row<TData>, rowIndex: number) => {
    const isParent = row.getCanExpand();
    const rowNode = (
      <TableRow
        key={row.id}
        data-state={row.getIsSelected() && 'selected'}
        className={cn(
          'border-b cursor-default',
          enableZebraStripes && (rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/20'),
          isParent && 'font-medium',
          row.depth > 0 && 'bg-muted/10',
          row.getIsSelected() && 'bg-primary/10 hover:bg-primary/15'
        )}
      >
        {renderRowCells(
          row,
          rowIndex,
          editingCell,
          handleSave,
          handleCancelEdit,
          enableZebraStripes,
          rangeProps,
          activeCell,
          handleActivateCell,
          handleStartEdit,
          handleNavigateFromEdit,
          setEditingCell,
          enableRangeSelection,
          handleCellContextMenu,
          copiedRange,
          stickyColumns,
          stickyColumnOffsets,
          nonEditableTooltip,
          treeColumnIndex,
          popoverContainer
        )}
      </TableRow>
    );

    if (!contextMenu) return rowNode;

    const activeCellInfo = rightClickedCellRef.current ?? undefined;

    const rangeInfo =
      enableRangeSelection && rangeAnchor && rangeFocus
        ? (() => {
            const bounds = getRangeBounds(rangeAnchor, rangeFocus);
            const values = getRangeValues(table.getRowModel().rows, bounds);
            const rowIndices = getRangeRowIndices(table.getRowModel().rows, bounds);
            return { bounds, values, rowIndices };
          })()
        : undefined;

    return (
      <ContextMenu key={row.id}>
        <ContextMenuTrigger asChild className="select-text">
          {rowNode}
        </ContextMenuTrigger>
        <ContextMenuContent container={contextMenuContainer}>
          {contextMenu(row, {
            activeCellInfo,
            rangeBounds: rangeInfo?.bounds,
            rangeValues: rangeInfo?.values,
            rangeRowIndices: rangeInfo?.rowIndices,
            triggerCopy: performCopy,
            triggerCut: performCut,
            triggerPaste: performPaste,
          })}
        </ContextMenuContent>
      </ContextMenu>
    );
  };

  // ── Table body ────────────────────────────────────────────────────────────
  const activeCellInfo = rightClickedCellRef.current ?? undefined;

  const rangeInfo =
    enableRangeSelection && rangeAnchor && rangeFocus
      ? (() => {
          const bounds = getRangeBounds(rangeAnchor, rangeFocus);
          const values = getRangeValues(table.getRowModel().rows, bounds);
          const rowIndices = getRangeRowIndices(table.getRowModel().rows, bounds);
          return { bounds, values, rowIndices };
        })()
      : undefined;

  const tableBody = (
    <TableBody>
      {isLoading ? (
        <TableRow>
          <TableCell colSpan={totalColSpan} className="h-24 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </TableCell>
        </TableRow>
      ) : table.getRowModel().rows.length ? (
        enableRowDnd ? (
          table
            .getRowModel()
            .rows.map((row, rowIndex) => (
              <SortableDataRow
                key={row.id}
                row={row}
                rowIndex={rowIndex}
                enableZebraStripes={enableZebraStripes}
                editingCell={editingCell}
                onSave={handleSave}
                onCancelEdit={handleCancelEdit}
                contextMenu={contextMenu}
                rangeProps={rangeProps}
                activeCell={activeCell}
                onActivateCell={handleActivateCell}
                onStartEdit={handleStartEdit}
                onNavigateFromEdit={handleNavigateFromEdit}
                setEditingCell={setEditingCell}
                enableRangeSelection={enableRangeSelection}
                rightClickedCellInfo={activeCellInfo}
                onContextMenuCell={handleCellContextMenu}
                rangeInfo={rangeInfo}
                copiedRange={copiedRange}
                triggerCopy={performCopy}
                triggerCut={performCut}
                triggerPaste={performPaste}
                stickyColumns={stickyColumns}
                stickyColumnOffsets={stickyColumnOffsets}
                treeColumnIndex={treeColumnIndex}
                contextMenuContainer={contextMenuContainer}
                popoverContainer={popoverContainer}
              />
            ))
        ) : (
          table.getRowModel().rows.map((row, rowIndex) => renderStaticRow(row, rowIndex))
        )
      ) : (
        <TableRow>
          <TableCell colSpan={totalColSpan} className="h-24 text-center text-muted-foreground">
            {emptyMessage}
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  );

  return (
    <TooltipProvider>
      <section
        ref={sectionRef}
        tabIndex={enableRangeSelection ? 0 : undefined}
        aria-label="Data table"
        className={cn(
          'flex flex-col rounded-md border bg-background focus:outline-none',
          stickyHeader ? 'overflow-x-clip' : 'overflow-hidden',
          className
        )}
        onContextMenu={contextMenu ? (e) => e.preventDefault() : undefined}
        onMouseDown={(e) => {
          if (enableRangeSelection) {
            const target = e.target as HTMLElement;
            // Popover dropdowns (e.g. async-select / select cells) render in a portal
            // whose mousedown bubbles here via React's tree. Calling focus() on the
            // section would steal focus from the popover, causing Radix to close it
            // before the click+select event fires — the selection would be lost.
            const isInsidePopover =
              !!target.closest('[data-slot="popover-content"]') ||
              !!target.closest('[data-slot="combobox-content"]');
            if (
              !isInsidePopover &&
              target.tagName !== 'INPUT' &&
              target.tagName !== 'TEXTAREA' &&
              target.tagName !== 'SELECT' &&
              !target.isContentEditable
            ) {
              sectionRef.current?.focus({ preventScroll: true });
            }
            const clickedTd = target.closest('td');
            const clickedMenu = target.closest('[data-radix-menu-content]');
            if (clickedTd === null && clickedMenu === null && !isInsidePopover) {
              clearRange();
            }
          }
          if (enableRangeSelection) {
            const target = e.target as HTMLElement;
            const isInsidePopover =
              !!target.closest('[data-slot="popover-content"]') ||
              !!target.closest('[data-slot="combobox-content"]');
            const clickedTd = target.closest('td');
            const clickedMenu = target.closest('[data-radix-menu-content]');
            if (clickedTd === null && clickedMenu === null && !isInsidePopover) {
              setActiveCell(null);
            }
          }
        }}
      >
        <div
          className={cn(
            'overflow-x-auto',
            stickyHeader && '*:data-[slot=table-container]:overflow-y-auto',
            stickyHeader && '*:data-[slot=table-container]:max-h-100'
          )}
        >
          <DndContext
            sensors={enableColumnDnd ? sensors : []}
            collisionDetection={closestCenter}
            modifiers={[restrictToHorizontalAxis]}
            onDragEnd={handleColumnDragEnd}
          >
            <SortableContext items={sortableColumnIds} strategy={horizontalListSortingStrategy}>
              <Table
                style={{ minWidth: table.getTotalSize() + (enableRowDnd ? 40 : 0) }}
                className="border-separate border-spacing-0"
              >
                <TableHeader>
                  {computedHeaderRows?.map((groupRow, groupIdx) => {
                    // Rows after the first must stick below the rows above them,
                    // otherwise the leaf row (later in DOM) paints over the parent row.
                    const stickyTop = groupIdx === 0 ? 0 : headerFirstRowHeight;
                    const prefixHeaders =
                      headerColumnTree && groupIdx === 0
                        ? (table.getHeaderGroups()[0]?.headers.slice(0, prefixCount) ?? [])
                        : [];
                    return (
                      <TableRow
                        key={`header-group-${groupIdx}`}
                        ref={groupIdx === 0 ? headerFirstRowRef : undefined}
                        className="bg-muted/50 hover:bg-muted/50 border-b"
                      >
                        {enableRowDnd && groupIdx === 0 && (
                          <TableHead
                            rowSpan={computedHeaderTotalRows}
                            className={cn('w-10 px-2', enableZebraStripes && 'border-r')}
                            aria-label="Row order"
                          />
                        )}
                        {prefixHeaders.map((header, prefixIdx) => {
                          const isPrefixSticky = stickyColumns > 0 && prefixIdx < stickyColumns;
                          const prefixLeft = isPrefixSticky
                            ? (stickyColumnOffsets[prefixIdx] ?? 0)
                            : undefined;
                          const needsPrefixBg = stickyHeader || isPrefixSticky;
                          return (
                            <TableHead
                              key={header.id}
                              rowSpan={computedHeaderTotalRows}
                              style={{
                                ...(isPrefixSticky && { left: prefixLeft }),
                                ...(stickyHeader && { top: stickyTop }),
                                ...(needsPrefixBg && {
                                  backgroundColor: 'var(--background)',
                                  backgroundImage:
                                    'linear-gradient(color-mix(in srgb, var(--muted) 50%, transparent), color-mix(in srgb, var(--muted) 50%, transparent))',
                                }),
                              }}
                              className={cn(
                                'relative px-3 py-2 overflow-hidden',
                                stickyHeader && 'sticky',
                                isPrefixSticky && 'sticky z-20',
                                stickyHeader && !isPrefixSticky && 'z-10',
                                stickyHeader && isPrefixSticky && 'z-30'
                              )}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </TableHead>
                          );
                        })}
                        {groupRow.map((cell, cellIdx) => {
                          const isLeaf = cell.columnIndex !== undefined;
                          const column = isLeaf
                            ? table.getAllColumns()[cell.columnIndex!]
                            : undefined;
                          // Absolute column index of this cell's leftmost column
                          const absColStart = prefixCount + (cell.gridCol ?? 0);
                          const colSpanCount = cell.colspan ?? 1;
                          // Cell is fully within the sticky zone when its last column is still sticky
                          const isCellSticky =
                            stickyColumns > 0 && absColStart + colSpanCount <= stickyColumns;
                          const cellStickyLeft = isCellSticky
                            ? (stickyColumnOffsets[absColStart] ?? 0)
                            : undefined;
                          const needsCellBg = stickyHeader || isCellSticky;
                          return (
                            <TableHead
                              key={`header-group-${groupIdx}-${cellIdx}`}
                              colSpan={cell.colspan}
                              rowSpan={cell.rowspan}
                              style={{
                                ...(isLeaf && { width: column?.getSize() }),
                                ...(isCellSticky && { left: cellStickyLeft }),
                                ...(stickyHeader && { top: stickyTop }),
                                ...(needsCellBg && {
                                  backgroundColor: 'var(--background)',
                                  backgroundImage:
                                    'linear-gradient(color-mix(in srgb, var(--muted) 50%, transparent), color-mix(in srgb, var(--muted) 50%, transparent))',
                                }),
                              }}
                              className={cn(
                                'relative px-3 py-2 overflow-hidden',
                                isLeaf ? 'text-left' : 'text-center',
                                !isLeaf && 'border-b',
                                enableZebraStripes && 'border-r',
                                cell.className,
                                stickyHeader && 'sticky',
                                isCellSticky && 'sticky z-20',
                                stickyHeader && !isCellSticky && 'z-10',
                                stickyHeader && isCellSticky && 'z-30',
                                column?.columnDef.meta?.headerClassName
                              )}
                            >
                              {isLeaf && column ? (
                                <>
                                  {column.id === '__select__' ? (
                                    flexRender(column.columnDef.header, { table, column } as any)
                                  ) : (
                                    <DataTableColumnHeader
                                      column={column}
                                      title={cell.label}
                                      rowDnd={enableRowDnd}
                                    />
                                  )}
                                  {enableColumnResize &&
                                    column.getCanResize() &&
                                    (() => {
                                      const leafHeader = columnIdToLeafHeader.get(column.id);
                                      return (
                                        <div
                                          aria-hidden="true"
                                          onMouseDown={(e) => {
                                            e.stopPropagation();
                                            leafHeader?.getResizeHandler()(e);
                                          }}
                                          onTouchStart={(e) => {
                                            e.stopPropagation();
                                            leafHeader?.getResizeHandler()(e);
                                          }}
                                          className={cn(
                                            'absolute top-0 right-0 h-full w-1 cursor-col-resize select-none touch-none transition-colors',
                                            'hover:bg-primary/50',
                                            column.getIsResizing() && 'bg-primary'
                                          )}
                                        />
                                      );
                                    })()}
                                </>
                              ) : (
                                cell.label
                              )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  {!headerColumnTree &&
                    table.getHeaderGroups().map((headerGroup) => (
                      <TableRow
                        key={headerGroup.id}
                        className="bg-muted/50 hover:bg-muted/50 border-b"
                      >
                        {enableRowDnd && (
                          <TableHead
                            className={cn(
                              'w-10 px-2',
                              enableZebraStripes && 'border-r',
                              (stickyHeader || stickyColumns > 0) && 'sticky',
                              stickyHeader && 'top-0',
                              stickyColumns > 0 && 'left-0',
                              stickyHeader && !stickyColumns && 'z-10',
                              !stickyHeader && stickyColumns > 0 && 'z-20',
                              stickyHeader && stickyColumns > 0 && 'z-30'
                            )}
                            style={
                              stickyHeader || stickyColumns > 0
                                ? {
                                    backgroundColor: 'var(--background)',
                                    backgroundImage:
                                      'linear-gradient(color-mix(in srgb, var(--muted) 50%, transparent), color-mix(in srgb, var(--muted) 50%, transparent))',
                                  }
                                : undefined
                            }
                            aria-label="Row order"
                          />
                        )}
                        {headerGroup.headers.map((header, headerIdx) => {
                          const isHeaderSticky = stickyColumns > 0 && headerIdx < stickyColumns;
                          const headerStickyLeft = isHeaderSticky
                            ? (stickyColumnOffsets[headerIdx] ?? 0)
                            : undefined;
                          const needsStickyBg = stickyHeader || isHeaderSticky;
                          return (
                            <TableHead
                              key={header.id}
                              style={{
                                width: header.getSize(),
                                ...(isHeaderSticky && { left: headerStickyLeft }),
                                ...(needsStickyBg && {
                                  backgroundColor: 'var(--background)',
                                  backgroundImage:
                                    'linear-gradient(color-mix(in srgb, var(--muted) 50%, transparent), color-mix(in srgb, var(--muted) 50%, transparent))',
                                }),
                              }}
                              className={cn(
                                'relative px-3 py-2 overflow-hidden border-b',
                                stickyHeader && 'sticky top-0',
                                isHeaderSticky && 'sticky z-20',
                                stickyHeader && !isHeaderSticky && 'z-10',
                                stickyHeader && isHeaderSticky && 'z-30',
                                header.column.columnDef.meta?.headerClassName
                              )}
                            >
                              {header.isPlaceholder ? null : header.column.id === '__select__' ? (
                                flexRender(header.column.columnDef.header, header.getContext())
                              ) : (
                                <DataTableColumnHeader
                                  column={header.column}
                                  title={
                                    typeof header.column.columnDef.header === 'string'
                                      ? header.column.columnDef.header
                                      : header.column.id
                                  }
                                  rowDnd={enableRowDnd}
                                />
                              )}

                              {/* Column resize handle */}
                              {enableColumnResize && header.column.getCanResize() && (
                                <div
                                  aria-hidden="true"
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    header.getResizeHandler()(e);
                                  }}
                                  onTouchStart={(e) => {
                                    e.stopPropagation();
                                    header.getResizeHandler()(e);
                                  }}
                                  className={cn(
                                    'absolute top-0 right-0 h-full w-1 cursor-col-resize select-none touch-none transition-colors',
                                    'hover:bg-primary/50',
                                    header.column.getIsResizing() && 'bg-primary'
                                  )}
                                />
                              )}
                            </TableHead>
                          );
                        })}
                      </TableRow>
                    ))}
                </TableHeader>

                {enableRowDnd ? (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    modifiers={[restrictToVerticalAxis]}
                    onDragEnd={handleRowDragEnd}
                  >
                    <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
                      {tableBody}
                    </SortableContext>
                  </DndContext>
                ) : (
                  tableBody
                )}

                {enableFooter &&
                  table
                    .getFooterGroups()
                    .slice(-1)
                    .map((footerGroup) => (
                      <TableFooter key={footerGroup.id}>
                        <TableRow className="bg-muted/50 hover:bg-muted/50 font-medium">
                          {enableRowDnd && (
                            <TableCell
                              className={cn(
                                enableZebraStripes && 'border-r',
                                stickyHeader && 'sticky bottom-0 z-10 bg-muted/50'
                              )}
                            />
                          )}
                          {footerGroup.headers.map((header) => (
                            <TableCell
                              key={header.id}
                              style={{ width: header.column.getSize() }}
                              className={cn(
                                'px-3 py-2',
                                enableZebraStripes && 'border-r',
                                stickyHeader && 'sticky bottom-0 z-10 bg-muted/50',
                                header.column.columnDef.meta?.footerClassName
                              )}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.footer, header.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableFooter>
                    ))}
              </Table>
            </SortableContext>
          </DndContext>
        </div>

        {isPaginated && (
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages ?? 1}
            pageSize={currentPageSize}
            totalItems={totalItems}
            pageSizeOptions={pageSizeOptions}
            onPageChange={(page) => onPaginationChange?.(page, currentPageSize)}
            onPageSizeChange={(size) => onPaginationChange?.(1, size)}
          />
        )}
      </section>

      {isInfiniteScroll && (
        <>
          {isFetchingNextPage && (
            <div className="flex justify-center py-3">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}
          <div ref={sentinelRef} className="h-px" />
        </>
      )}
    </TooltipProvider>
  );
}
