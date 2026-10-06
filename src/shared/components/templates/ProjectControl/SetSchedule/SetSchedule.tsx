'use client';

import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { Expand, Minimize2, Plus, Save, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, SegmentedControl } from '@/components/atoms';
import { type GanttBar, GanttChart, type GanttViewMode } from '@/components/organisms/GanttChart';
import { cn } from '@/lib/utils';
import { createScheduleColumns } from './schedule-columns';
import {
  addChild,
  addSibling,
  buildLeafDependencies,
  clearDraftFlags,
  computeCodes,
  constrainParentDates,
  createEmptyScheduleNode,
  findNode,
  isLastLeaf,
  recalcDays,
  recalcParentDates,
  shiftNodeById,
  updateNode,
} from './schedule-utils';
import type { ScheduleNode, SetScheduleProps } from './types';

const VIEW_MODE_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const GROUP_BAR_COLOR = '#F59E0B';
const LEAF_BAR_COLOR = '#94A3B8';

const toGanttBar = (node: ScheduleNode): GanttBar => ({
  start: new Date(node.startDate),
  end: new Date(node.endDate),
  progress: node.percent,
  color: node.color ?? (node.children.length > 0 ? GROUP_BAR_COLOR : LEAF_BAR_COLOR),
  type: node.children.length > 0 ? 'group' : 'task',
});

function filterTree(nodes: ScheduleNode[], query: string): ScheduleNode[] {
  const k = query.toLowerCase().trim();
  if (!k) return nodes;
  const walk = (list: ScheduleNode[]): ScheduleNode[] =>
    list.reduce<ScheduleNode[]>((acc, n) => {
      const selfMatches = n.taskName.toLowerCase().includes(k);
      const filteredChildren = walk(n.children);
      if (selfMatches || filteredChildren.length > 0)
        acc.push({ ...n, children: filteredChildren });
      return acc;
    }, []);
  return walk(nodes);
}

export function SetSchedule({
  value,
  onChange,
  onSave,
  isSaving = false,
  readOnly = false,
  hideAddButton = false,
  defaultViewMode = 'day',
  rowHeight = 40,
  columnWidth,
  className,
}: SetScheduleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<GanttViewMode>(defaultViewMode);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const onChangeFs = () => setIsFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener('fullscreenchange', onChangeFs);
    return () => document.removeEventListener('fullscreenchange', onChangeFs);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) document.exitFullscreen();
    else containerRef.current.requestFullscreen();
  }, []);

  const codes = useMemo(() => computeCodes(value), [value]);
  const filteredValue = useMemo(() => filterTree(value, search), [value, search]);
  const dependencies = useMemo(() => buildLeafDependencies(filteredValue), [filteredValue]);

  const handleTambahOrSimpan = useCallback(async () => {
    if (hasDraft) {
      try {
        await onSave?.();
        onChange(clearDraftFlags(value));
        setHasDraft(false);
      } catch {
        // keep hasDraft true and isDraft flags intact — allow retry
      }
    } else {
      onChange([...value, createEmptyScheduleNode({ isDraft: true })]);
      setHasDraft(true);
    }
  }, [hasDraft, value, onChange, onSave]);

  const addChildTo = useCallback(
    (node: ScheduleNode) => {
      onChange(addChild(value, node.id, createEmptyScheduleNode({ isDraft: true })));
      setHasDraft(true);
    },
    [value, onChange]
  );

  const insertBelow = useCallback(
    (node: ScheduleNode) => {
      onChange(addSibling(value, node.id, 'below', createEmptyScheduleNode({ isDraft: true })));
      setHasDraft(true);
    },
    [value, onChange]
  );

  const columns = useMemo(
    () =>
      createScheduleColumns({
        codes,
        onAddSibling: insertBelow,
        onAddChild: addChildTo,
        hideAddColumn: hideAddButton || readOnly,
      }),
    [codes, insertBelow, addChildTo, hideAddButton, readOnly]
  );

  const handleCellEdit = useCallback(
    (rowId: string, columnId: string, val: string) => {
      let next = value;
      const node = findNode(value, rowId);
      if (!node) return;

      if (columnId === 'taskName') {
        next = updateNode(next, rowId, { taskName: val });
      } else if (columnId === 'start' || columnId === 'end') {
        const dates = constrainParentDates(node, {
          startDate: columnId === 'start' ? val : node.startDate,
          endDate: columnId === 'end' ? val : node.endDate,
        });
        next = updateNode(next, rowId, dates);
        next = recalcParentDates(next);
        next = recalcDays(next);
      } else {
        return;
      }
      onChange(next);
      setHasDraft(true);
    },
    [value, onChange]
  );

  const handleTaskDateChange = useCallback(
    (rowId: string, startDate: Date, endDate: Date) => {
      const node = findNode(value, rowId);
      if (!node) return;

      const iso = (d: Date) => format(d, 'yyyy-MM-dd');
      const newStart = iso(startDate);
      const newEnd = iso(endDate);

      const oldDuration = differenceInCalendarDays(
        parseISO(node.endDate),
        parseISO(node.startDate)
      );
      const newDuration = differenceInCalendarDays(parseISO(newEnd), parseISO(newStart));
      const isResize = newDuration !== oldDuration;

      // Rule 1: non-leaf (parent/group) cannot be resized
      if (!isLastLeaf(node) && isResize) return;

      let next: ScheduleNode[];

      if (!isLastLeaf(node) && !isResize) {
        // Rule 2: parent move → shift entire subtree by same delta
        const deltaDays = differenceInCalendarDays(parseISO(newStart), parseISO(node.startDate));
        next = shiftNodeById(value, rowId, deltaDays);
      } else {
        // Leaf: resize or move normally
        const dates = constrainParentDates(node, { startDate: newStart, endDate: newEnd });
        next = updateNode(value, rowId, dates);
      }

      next = recalcParentDates(next);
      next = recalcDays(next);
      onChange(next);
      setHasDraft(true);
    },
    [value, onChange]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        'rounded-xl border bg-card shadow-sm overflow-hidden',
        isFullscreen && 'flex flex-col h-full',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b shrink-0">
        <h2 className="text-lg font-semibold">Set Schedule</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pencarian"
              showLabel={false}
              showHint={false}
              className="w-56 pl-8 h-9"
            />
          </div>

          <SegmentedControl
            options={VIEW_MODE_OPTIONS}
            value={viewMode}
            onChange={(v) => setViewMode(v as GanttViewMode)}
          />

          <Button
            type="button"
            variant="outline"
            size="sm"
            aria-label={isFullscreen ? 'Keluar layar penuh' : 'Layar penuh'}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Expand className="h-4 w-4" />}
          </Button>

          {!readOnly &&
            !hideAddButton &&
            (!hasDraft ? (
              <Button type="button" leftIcon={<Plus />} onClick={handleTambahOrSimpan}>
                Tambah
              </Button>
            ) : (
              <Button
                type="button"
                leftIcon={<Save />}
                variant="outline"
                onClick={handleTambahOrSimpan}
                disabled={isSaving}
              >
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            ))}
        </div>
      </div>

      {/* Legend: bar interaction rules */}
      <div className="flex items-center gap-x-6 gap-y-1 flex-wrap px-4 py-2 border-b bg-muted/30 text-xs text-muted-foreground shrink-0">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: GROUP_BAR_COLOR }}
          />
          <span>
            <span className="font-medium text-foreground">Bar Grup</span> — hanya bisa digeser
            (pindah posisi), tidak bisa diperpanjang/diperpendek
          </span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm flex-shrink-0"
            style={{ backgroundColor: LEAF_BAR_COLOR }}
          />
          <span>
            <span className="font-medium text-foreground">Bar Task</span> — bisa digeser dan
            diperpanjang/diperpendek (seret ujung kanan)
          </span>
        </span>
      </div>

      <div className={cn('overflow-hidden', isFullscreen ? 'flex-1' : 'h-150')}>
        <GanttChart<ScheduleNode>
          data={filteredValue}
          columns={columns}
          getRowId={(n) => n.id}
          getSubRows={(n) => n.children}
          toGanttBar={toGanttBar}
          viewMode={viewMode}
          rowHeight={rowHeight}
          columnWidth={columnWidth}
          showTooltipProgress={false}
          onCellEdit={readOnly ? undefined : handleCellEdit}
          onTaskDateChange={readOnly ? undefined : handleTaskDateChange}
          dependencies={dependencies}
          contextMenuContainer={isFullscreen ? containerRef.current : undefined}
          popoverContainer={isFullscreen ? containerRef.current : undefined}
          className="h-full rounded-none border-0"
        />
      </div>
    </div>
  );
}
