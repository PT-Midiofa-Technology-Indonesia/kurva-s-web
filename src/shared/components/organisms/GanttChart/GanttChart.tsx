'use client';

import { addDays, isSameDay, isSameMonth } from 'date-fns';
import { useCallback, useMemo, useRef, useState } from 'react';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { cn } from '@/lib/utils';
import { DependencyArrows } from './DependencyArrows';
import { COLUMN_WIDTH_DEFAULT, GanttColumnPanel } from './GanttColumnPanel';
import {
  flattenVisibleRows,
  getChartRange,
  getColumnLabel,
  getHeaderGroups,
  getTimeColumns,
  isColumnToday,
  isColumnWeekend,
} from './gantt-utils';
import { TaskBar } from './TaskBar';
import type { GanttChartProps } from './types';

const ROW_HEIGHT_DEFAULT = 40;
const COL_WIDTH_DEFAULT = 32;
const COL_WIDTH_WEEK = 160;
const COL_WIDTH_MONTH = 180;

function defaultGetSubRows<TData>(row: TData): TData[] | undefined {
  return (row as { children?: TData[] }).children;
}

export function GanttChart<TData>({
  data,
  columns,
  getSubRows = defaultGetSubRows,
  getRowId,
  toGanttBar,
  viewMode = 'day',
  rowHeight = ROW_HEIGHT_DEFAULT,
  columnWidth,
  showProgress = true,
  showTooltipProgress = true,
  className,
  onTaskDateChange,
  onTaskClick,
  onCellEdit,
  contextMenu,
  contextMenuContainer,
  popoverContainer,
  dependencies,
}: GanttChartProps<TData>) {
  const effectiveColWidth: number =
    columnWidth ??
    (viewMode === 'week'
      ? COL_WIDTH_WEEK
      : viewMode === 'month'
        ? COL_WIDTH_MONTH
        : COL_WIDTH_DEFAULT);

  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLDivElement>(null);

  const visibleRows = useMemo(
    () => flattenVisibleRows(data, getSubRows, getRowId, collapsed),
    [data, getSubRows, getRowId, collapsed]
  );

  const bars = useMemo(
    () => visibleRows.map(({ row }) => toGanttBar(row)),
    [visibleRows, toGanttBar]
  );

  const labelColumn = useMemo(() => columns.find((c) => c.indent), [columns]);

  const columnsWidth = useMemo(
    () => columns.reduce((sum, c) => sum + (c.width ?? COLUMN_WIDTH_DEFAULT), 0),
    [columns]
  );

  const { start, end } = useMemo(() => getChartRange(bars, viewMode), [bars, viewMode]);
  const cols = useMemo(() => getTimeColumns(start, end, viewMode), [start, end, viewMode]);
  const headerGroups = useMemo(() => getHeaderGroups(cols, viewMode), [cols, viewMode]);
  const todayIdx = useMemo(
    () => cols.findIndex((c) => isColumnToday(c, viewMode)),
    [cols, viewMode]
  );

  const barPositions = useMemo(
    () =>
      visibleRows.map(({ row, rowId }, i) => {
        const bar = toGanttBar(row);
        let startIdx: number;
        let endIdx: number;
        if (viewMode === 'week') {
          startIdx = cols.findIndex((c) => {
            const weekEnd = addDays(c, 7);
            return bar.start >= c && bar.start < weekEnd;
          });
          endIdx = cols.findIndex((c) => {
            const weekEnd = addDays(c, 7);
            return bar.end >= c && bar.end < weekEnd;
          });
        } else if (viewMode === 'month') {
          startIdx = cols.findIndex((c) => isSameMonth(c, bar.start));
          endIdx = cols.findIndex((c) => isSameMonth(c, bar.end));
        } else {
          startIdx = cols.findIndex((c) => isSameDay(c, bar.start));
          endIdx = cols.findIndex((c) => isSameDay(c, bar.end));
        }
        const startCol = startIdx >= 0 ? startIdx : 0;
        const endCol = endIdx >= 0 ? endIdx : cols.length - 1;
        return {
          rowId,
          startX: startCol * effectiveColWidth,
          endX: (endCol + 1) * effectiveColWidth,
          centerY: i * rowHeight + rowHeight / 2,
        };
      }),
    [visibleRows, toGanttBar, cols, effectiveColWidth, rowHeight, viewMode]
  );

  const toggleCollapse = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const syncScroll = useCallback((source: 'table' | 'timeline', el: HTMLDivElement) => {
    if (source === 'timeline') {
      if (tableBodyRef.current) tableBodyRef.current.scrollTop = el.scrollTop;
      if (timelineHeaderRef.current) timelineHeaderRef.current.scrollLeft = el.scrollLeft;
    } else if (source === 'table' && timelineScrollRef.current) {
      timelineScrollRef.current.scrollTop = el.scrollTop;
    }
  }, []);

  const totalWidth = cols.length * effectiveColWidth;

  return (
    <div className={cn('flex flex-col rounded-lg border bg-background overflow-hidden', className)}>
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        {/* ── Left: multi-column task panel ──────────────────────────────── */}
        <ResizablePanel
          defaultSize={columnsWidth}
          minSize={Math.min(120, columnsWidth)}
          maxSize={columnsWidth * 3}
        >
          <div
            ref={tableBodyRef}
            className="h-full overflow-y-auto overflow-x-auto border-r"
            onScroll={(e) => syncScroll('table', e.target as HTMLDivElement)}
          >
            <GanttColumnPanel
              columns={columns}
              rows={visibleRows}
              rowHeight={rowHeight}
              collapsed={collapsed}
              onToggleCollapse={toggleCollapse}
              onCellEdit={onCellEdit}
              contextMenu={contextMenu}
              contextMenuContainer={contextMenuContainer}
              popoverContainer={popoverContainer}
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* ── Right: Timeline ────────────────────────────────────────────── */}
        <ResizablePanel defaultSize={400} minSize={200}>
          <div className="flex flex-col h-full overflow-hidden">
            {/* Timeline header */}
            <div
              ref={timelineHeaderRef}
              className="shrink-0 border-b overflow-hidden"
              style={{ height: rowHeight * 2 }}
            >
              <div style={{ width: totalWidth }}>
                {/* Top row: month/year groups */}
                <div className="flex border-b bg-muted/50" style={{ height: rowHeight }}>
                  {headerGroups.map((g, i) => (
                    <div
                      key={i}
                      className="border-r last:border-r-0 flex items-center px-2 text-xs font-semibold text-muted-foreground shrink-0 whitespace-nowrap overflow-hidden"
                      style={{ width: g.span * effectiveColWidth }}
                    >
                      {g.label}
                    </div>
                  ))}
                </div>

                {/* Sub-row: col labels */}
                <div className="flex bg-muted/30" style={{ height: rowHeight }}>
                  {cols.map((col, i) => (
                    <div
                      key={i}
                      className={cn(
                        'border-r last:border-r-0 flex items-center justify-center text-[10px] shrink-0 select-none whitespace-nowrap',
                        isColumnToday(col, viewMode) && 'bg-blue-50 text-blue-600 font-bold',
                        isColumnWeekend(col, viewMode) &&
                          !isColumnToday(col, viewMode) &&
                          'text-muted-foreground/60'
                      )}
                      style={{ width: effectiveColWidth, minWidth: effectiveColWidth }}
                      aria-hidden="true"
                    >
                      {getColumnLabel(col, viewMode)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline body */}
            <div
              ref={timelineScrollRef}
              className="overflow-auto flex-1"
              onScroll={(e) => syncScroll('timeline', e.target as HTMLDivElement)}
            >
              <div style={{ width: totalWidth, position: 'relative' }}>
                {/* Background stripes */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  aria-hidden="true"
                  style={{ zIndex: 0 }}
                >
                  {cols.map((col, i) => (
                    <div
                      key={i}
                      className={cn(
                        'absolute top-0 bottom-0 border-r',
                        isColumnToday(col, viewMode) && 'bg-blue-50/60',
                        isColumnWeekend(col, viewMode) &&
                          !isColumnToday(col, viewMode) &&
                          'bg-muted/20'
                      )}
                      style={{ left: i * effectiveColWidth, width: effectiveColWidth }}
                    />
                  ))}
                </div>

                {/* Today vertical line */}
                {todayIdx >= 0 && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20 pointer-events-none"
                    style={{ left: todayIdx * effectiveColWidth + effectiveColWidth / 2 }}
                    aria-hidden="true"
                  />
                )}

                {/* Dependency arrows */}
                {dependencies && dependencies.size > 0 && (
                  <DependencyArrows dependencies={dependencies} barPositions={barPositions} />
                )}

                {/* Task rows */}
                {visibleRows.map(({ row, rowId }) => (
                  <div
                    key={rowId}
                    className="relative border-b"
                    style={{ height: rowHeight, zIndex: 1 }}
                  >
                    <TaskBar
                      bar={toGanttBar(row)}
                      rowId={rowId}
                      label={labelColumn ? String(labelColumn.accessor(row)) : undefined}
                      cols={cols}
                      colWidth={effectiveColWidth}
                      rowHeight={rowHeight}
                      showProgress={showProgress}
                      viewMode={viewMode}
                      onClick={onTaskClick}
                      onDragEnd={onTaskDateChange}
                      resizable={toGanttBar(row).type !== 'group'}
                      showTooltipProgress={showTooltipProgress}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
