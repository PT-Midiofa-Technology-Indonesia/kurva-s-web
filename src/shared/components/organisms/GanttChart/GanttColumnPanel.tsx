'use client';

import { format, parseISO } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/atoms';
import { DatePicker } from '@/components/molecules';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import type { FlatGanttRow } from './gantt-utils';
import type { GanttColumn } from './types';

export const COLUMN_WIDTH_DEFAULT = 140;

interface GanttColumnPanelProps<TData> {
  columns: GanttColumn<TData>[];
  rows: FlatGanttRow<TData>[];
  rowHeight: number;
  collapsed: Set<string>;
  onToggleCollapse: (rowId: string) => void;
  onCellEdit?: (rowId: string, columnId: string, value: string) => void;
  contextMenu?: (row: TData, rowId: string) => import('react').ReactNode;
  contextMenuContainer?: HTMLElement | null;
  popoverContainer?: HTMLElement | null;
}

function GanttCell<TData>({
  column,
  flatRow,
  collapsed,
  onToggleCollapse,
  onCellEdit,
  popoverContainer,
}: {
  column: GanttColumn<TData>;
  flatRow: FlatGanttRow<TData>;
  collapsed: Set<string>;
  onToggleCollapse: (rowId: string) => void;
  onCellEdit?: (rowId: string, columnId: string, value: string) => void;
  popoverContainer?: HTMLElement | null;
}) {
  const { row, rowId, depth, hasChildren } = flatRow;
  const isCollapsed = collapsed.has(rowId);
  const rawValue = column.accessor(row);

  const content = column.render ? (
    column.render(row)
  ) : !column.editable ? (
    <span className={cn('text-sm', column.indent && hasChildren && 'font-semibold')}>
      {rawValue}
    </span>
  ) : column.type === 'date' ? (
    <DatePicker
      mode="single"
      value={rawValue ? parseISO(String(rawValue)) : null}
      onChange={(next) => {
        if (next instanceof Date) {
          onCellEdit?.(rowId, column.id, format(next, 'yyyy-MM-dd'));
        }
      }}
      clearable={false}
      popoverContainer={popoverContainer}
      className="h-8 text-xs px-2 border-0 shadow-none"
    />
  ) : (
    <Input
      key={`${rowId}-${column.id}`}
      defaultValue={String(rawValue)}
      showLabel={false}
      showHint={false}
      className="h-8 text-sm px-2 border-0 shadow-none focus-visible:ring-0 focus-visible:border-transparent"
      onBlur={(e) => onCellEdit?.(rowId, column.id, e.target.value)}
    />
  );

  return (
    <div
      className="flex items-center shrink-0 gap-1 px-2 overflow-hidden"
      style={{
        width: column.width ?? COLUMN_WIDTH_DEFAULT,
        paddingLeft: column.indent ? 8 + depth * 24 : undefined,
      }}
    >
      {column.showExpandToggle &&
        (hasChildren ? (
          <button
            type="button"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            onClick={() => onToggleCollapse(rowId)}
            aria-label={isCollapsed ? 'Expand row' : 'Collapse row'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        ) : (
          <span className="w-4 shrink-0" aria-hidden="true" />
        ))}
      <div className="flex-1 min-w-0">{content}</div>
    </div>
  );
}

export function GanttColumnPanel<TData>({
  columns,
  rows,
  rowHeight,
  collapsed,
  onToggleCollapse,
  onCellEdit,
  contextMenu,
  contextMenuContainer,
  popoverContainer,
}: GanttColumnPanelProps<TData>) {
  return (
    <div className="flex flex-col min-w-max">
      <div
        className="flex items-end border-b bg-muted shrink-0 sticky top-0 z-10"
        style={{ height: rowHeight * 2 }}
      >
        {columns.map((column) => (
          <div
            key={column.id}
            className="px-3 pb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0 truncate h-full flex items-center"
            style={{ width: column.width ?? COLUMN_WIDTH_DEFAULT }}
          >
            {column.header}
          </div>
        ))}
      </div>

      {rows.map((flatRow) => {
        const rowDiv = (
          <div
            key={flatRow.rowId}
            className="flex items-center border-b hover:bg-muted/30 transition-colors"
            style={{ height: rowHeight }}
          >
            {columns.map((column) => (
              <GanttCell
                key={column.id}
                column={column}
                flatRow={flatRow}
                collapsed={collapsed}
                onToggleCollapse={onToggleCollapse}
                onCellEdit={onCellEdit}
                popoverContainer={popoverContainer}
              />
            ))}
          </div>
        );

        if (!contextMenu) return rowDiv;

        return (
          <ContextMenu key={flatRow.rowId}>
            <ContextMenuTrigger asChild>{rowDiv}</ContextMenuTrigger>
            <ContextMenuContent container={contextMenuContainer}>
              {contextMenu(flatRow.row, flatRow.rowId)}
            </ContextMenuContent>
          </ContextMenu>
        );
      })}
    </div>
  );
}
