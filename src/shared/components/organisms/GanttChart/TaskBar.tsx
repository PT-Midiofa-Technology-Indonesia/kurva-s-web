'use client';

import { addDays, addMonths, format, isSameDay, isSameMonth, isSameWeek } from 'date-fns';
import { Flag } from 'lucide-react';
import { useRef, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { GanttViewMode } from './gantt-utils';
import type { GanttBar } from './types';

type DragMode = 'move' | 'resize';

interface TaskBarProps {
  bar: GanttBar;
  rowId: string;
  /** Shown in the bar's tooltip and the milestone's aria-label. */
  label?: string;
  cols: Date[];
  colWidth: number;
  rowHeight: number;
  showProgress: boolean;
  viewMode: GanttViewMode;
  onClick?: (rowId: string) => void;
  onDragEnd?: (rowId: string, startDate: Date, endDate: Date) => void;
  /** When false, hides the resize handle. Default: true. */
  resizable?: boolean;
  /** When false, hides the progress % from the tooltip. Default: true. */
  showTooltipProgress?: boolean;
}

function findColIdx(cols: Date[], date: Date, viewMode: GanttViewMode): number {
  if (viewMode === 'week') return cols.findIndex((c) => isSameWeek(c, date, { weekStartsOn: 1 }));
  if (viewMode === 'month') return cols.findIndex((c) => isSameMonth(c, date));
  return cols.findIndex((c) => isSameDay(c, date));
}

function offsetDate(base: Date, delta: number, viewMode: GanttViewMode): Date {
  if (viewMode === 'month') return addMonths(base, delta);
  const unitDays = viewMode === 'week' ? 7 : 1;
  return addDays(base, delta * unitDays);
}

export function TaskBar({
  bar,
  rowId,
  label,
  cols,
  colWidth,
  rowHeight,
  showProgress,
  viewMode,
  onClick,
  onDragEnd,
  resizable = true,
  showTooltipProgress = true,
}: TaskBarProps) {
  const dragState = useRef<{ mode: DragMode; startX: number } | null>(null);
  const [dragMode, setDragMode] = useState<DragMode | null>(null);
  const [moveDelta, setMoveDelta] = useState(0);
  const [resizeDelta, setResizeDelta] = useState(0);

  const startIdx = findColIdx(cols, bar.start, viewMode);
  const endIdx = findColIdx(cols, bar.end, viewMode);

  if (startIdx < 0 || endIdx < 0) return null;

  const duration = endIdx - startIdx + 1;
  const visualStartIdx = startIdx + (dragMode === 'move' ? moveDelta : 0);
  const visualDuration = Math.max(duration + (dragMode === 'resize' ? resizeDelta : 0), 1);

  const left = visualStartIdx * colWidth;
  const width = visualDuration * colWidth - 4;
  const barHeight = Math.round(rowHeight * 0.55);
  const topOffset = Math.round((rowHeight - barHeight) / 2);
  const barColor = bar.color ?? '#6366f1';

  const isDragging = dragMode !== null;

  const liveStart = dragMode === 'move' ? offsetDate(bar.start, moveDelta, viewMode) : bar.start;
  const liveEnd =
    dragMode === 'move'
      ? offsetDate(bar.end, moveDelta, viewMode)
      : dragMode === 'resize'
        ? offsetDate(bar.start, visualDuration - 1, viewMode)
        : bar.end;

  const startDrag = (e: React.MouseEvent, mode: DragMode) => {
    e.preventDefault();
    e.stopPropagation();
    dragState.current = { mode, startX: e.clientX };
    setDragMode(mode);
    setMoveDelta(0);
    setResizeDelta(0);

    const onMove = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const delta = Math.round((ev.clientX - dragState.current.startX) / colWidth);
      if (dragState.current.mode === 'move') setMoveDelta(delta);
      else setResizeDelta(delta);
    };

    const onUp = (ev: MouseEvent) => {
      if (!dragState.current) return;
      const delta = Math.round((ev.clientX - dragState.current.startX) / colWidth);
      const { mode: endMode } = dragState.current;
      dragState.current = null;
      setDragMode(null);
      setMoveDelta(0);
      setResizeDelta(0);

      if (delta !== 0) {
        if (endMode === 'move') {
          onDragEnd?.(
            rowId,
            offsetDate(bar.start, delta, viewMode),
            offsetDate(bar.end, delta, viewMode)
          );
        } else {
          const newDuration = Math.max(duration + delta, 1);
          onDragEnd?.(rowId, bar.start, offsetDate(bar.start, newDuration - 1, viewMode));
        }
      }
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  if (bar.type === 'milestone') {
    const size = barHeight;
    return (
      <TooltipProvider>
        <Tooltip open={isDragging ? false : undefined}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="absolute flex items-center justify-center cursor-pointer bg-transparent border-0 p-0"
              style={{
                left: left + colWidth / 2 - size / 2,
                top: topOffset,
                width: size,
                height: size,
              }}
              onClick={() => onClick?.(rowId)}
              aria-label={`Milestone: ${label ?? ''}`}
            >
              <Flag className="w-full h-full" style={{ color: barColor }} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="font-medium">{label}</p>
            <p className="text-xs opacity-75">{format(bar.start, 'MMM d, yyyy')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip open={isDragging ? false : undefined}>
        <TooltipTrigger asChild>
          {/* Bar body — drag to move */}
          <div
            className={cn(
              'absolute rounded-md select-none transition-shadow border-0 p-0 group/bar',
              isDragging ? 'shadow-lg opacity-90 z-30' : 'hover:shadow-md z-10',
              bar.type === 'group' && 'rounded-none'
            )}
            style={{
              left,
              top: topOffset,
              width: Math.max(width, colWidth - 4),
              height: barHeight,
              backgroundColor: barColor,
            }}
          >
            {/* Grab zone (whole bar minus resize handle) */}
            <div
              className={cn(
                'absolute inset-0 rounded-md',
                dragMode === 'move' ? 'cursor-grabbing' : 'cursor-grab',
                bar.type === 'group' && 'rounded-none'
              )}
              style={{ right: 8 }}
              onMouseDown={(e) => startDrag(e, 'move')}
              onClick={() => !isDragging && onClick?.(rowId)}
              aria-hidden="true"
            />

            {/* Progress overlay */}
            {showProgress && bar.progress !== undefined && bar.progress > 0 && (
              <div
                className="absolute inset-0 rounded-md opacity-25 bg-black pointer-events-none"
                style={{ width: `${100 - bar.progress}%`, left: `${bar.progress}%` }}
                aria-hidden="true"
              />
            )}

            {/* Live drag label */}
            {isDragging && (
              <div
                className="absolute inset-0 flex items-center justify-center text-white text-[10px] font-semibold pointer-events-none whitespace-nowrap px-1"
                aria-hidden="true"
              >
                {format(liveStart, 'MMM d')} – {format(liveEnd, 'MMM d')}
              </div>
            )}

            {/* Progress % label (only when not dragging) */}
            {!isDragging && showProgress && bar.progress !== undefined && bar.progress > 0 && (
              <div
                className="absolute top-1/2 -translate-y-1/2 left-2 text-white text-[10px] font-semibold leading-none pointer-events-none"
                aria-hidden="true"
              >
                {bar.progress}%
              </div>
            )}

            {/* Resize handle — right edge (leaf only) */}
            {resizable && (
              <div
                className={cn(
                  'absolute top-0 right-0 h-full w-2 flex items-center justify-center rounded-r-md opacity-0 group-hover/bar:opacity-100 transition-opacity',
                  dragMode === 'resize' ? 'opacity-100 cursor-ew-resize' : 'cursor-ew-resize'
                )}
                style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
                onMouseDown={(e) => startDrag(e, 'resize')}
                aria-hidden="true"
              >
                <div className="flex flex-col gap-px">
                  <span className="w-px h-2 bg-white/80 rounded-full" />
                  <span className="w-px h-2 bg-white/80 rounded-full" />
                </div>
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top">
          <p className="font-medium">{label}</p>
          <p className="text-xs opacity-75">
            {format(bar.start, 'MMM d')} – {format(bar.end, 'MMM d, yyyy')}
          </p>
          {showTooltipProgress && bar.progress !== undefined && (
            <p className="text-xs opacity-75">{bar.progress}% complete</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
