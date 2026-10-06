'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/atoms/Button';
import { KanbanCard } from '@/components/atoms/KanbanCard';
import { KanbanColumn } from '@/components/molecules/KanbanColumn';
import { KanbanItem } from '@/components/molecules/KanbanItem';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface KanbanBoardItem {
  id: string;
  title: string;
  description?: string;
  dateRange?: string;
  company?: string;
  attachments?: { count: number; total: number };
}

export interface KanbanColumnConfig {
  id: string;
  name: string;
  action?: string;
  onActionClick?: () => void;
  items: KanbanBoardItem[];
}

export interface KanbanBoardProps {
  columns: KanbanColumnConfig[];
  onCardClick?: (item: KanbanBoardItem, columnId: string) => void;
  onCardMove?: (
    itemId: string,
    fromColumnId: string,
    toColumnId: string,
    revert: () => void
  ) => void;
  className?: string;
  isLoading?: boolean;
}

export function KanbanBoard({
  columns: initialColumns,
  onCardClick,
  onCardMove,
  className,
  isLoading = false,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const prevColumnsRef = useRef<KanbanColumnConfig[]>(initialColumns);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (!isDraggingRef.current) {
      setColumns(initialColumns);
    }
  }, [initialColumns]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const findItemLocation = (itemId: string) => {
    for (let colIdx = 0; colIdx < columns.length; colIdx++) {
      const itemIdx = columns[colIdx].items.findIndex((item) => item.id === itemId);
      if (itemIdx !== -1) return { colIdx, itemIdx };
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true;
    prevColumnsRef.current = columns;
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    isDraggingRef.current = false;
    setActiveId(null);
    if (!over || active.id === over.id) return;

    const activeLocation = findItemLocation(active.id as string);
    if (!activeLocation) return;

    const overId = over.id as string;
    const isOverColumn = overId.startsWith('column-');
    const overColId = isOverColumn ? overId.replace('column-', '') : null;

    let overColIdx: number;
    let overItemIdx: number;

    if (overColId) {
      overColIdx = columns.findIndex((col) => col.id === overColId);
      if (overColIdx === -1) return;
      overItemIdx = columns[overColIdx].items.length;
    } else {
      const overLocation = findItemLocation(overId);
      if (!overLocation) return;
      overColIdx = overLocation.colIdx;
      overItemIdx = overLocation.itemIdx;
    }

    const { colIdx: activeColIdx, itemIdx: activeItemIdx } = activeLocation;

    if (activeColIdx !== overColIdx) {
      const snapshot = prevColumnsRef.current;
      onCardMove?.(active.id as string, columns[activeColIdx].id, columns[overColIdx].id, () =>
        setColumns(snapshot)
      );
    }

    setColumns((prev) => {
      if (activeColIdx === overColIdx) {
        return prev.map((col, i) =>
          i === activeColIdx
            ? { ...col, items: arrayMove(col.items, activeItemIdx, overItemIdx) }
            : col
        );
      }
      const next = prev.map((col) => ({ ...col, items: [...col.items] }));
      const [movedItem] = next[activeColIdx].items.splice(activeItemIdx, 1);
      next[overColIdx].items.splice(overItemIdx, 0, movedItem);
      return next;
    });
  };

  const activeItem = activeId
    ? columns.flatMap((col) => col.items).find((item) => item.id === activeId)
    : null;

  if (isLoading) {
    return (
      <div className={cn('flex h-full gap-4 overflow-x-auto px-4 py-4', className)}>
        {[0, 1, 2, 3, 4, 5].map((colIdx) => (
          <div
            key={colIdx}
            className="flex w-66.5 shrink-0 flex-col gap-3 rounded-xl bg-slate-100 p-3"
          >
            <div className="flex h-8 items-center gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-5 w-5 rounded-md" />
            </div>
            <div className="flex flex-col gap-3">
              {[0, 1, 2, 3].map((cardIdx) => (
                <div
                  key={cardIdx}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-5 w-36 rounded-md" />
                    <Skeleton className="h-5 w-40 rounded-md" />
                  </div>
                  <div className="border-t border-slate-200" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        isDraggingRef.current = false;
        setActiveId(null);
      }}
    >
      <div className={cn('flex h-full gap-4 overflow-x-auto p-4', className)}>
        {columns.map((col) => (
          <KanbanColumn
            key={col.id}
            id={col.id}
            title={col.name}
            count={col.items.length}
            itemIds={col.items.map((item) => item.id)}
            header={
              col.action ? (
                <Button
                  variant="ghost"
                  size="xs"
                  leftIcon={<Plus size={14} />}
                  onClick={col.onActionClick}
                >
                  {col.action}
                </Button>
              ) : undefined
            }
          >
            {col.items.map((item) => (
              <KanbanItem
                key={item.id}
                id={item.id}
                onCardClick={onCardClick ? () => onCardClick(item, col.id) : undefined}
              >
                <KanbanCard
                  title={item.title}
                  description={item.description}
                  dateRange={item.dateRange}
                  company={item.company}
                  attachments={item.attachments}
                />
              </KanbanItem>
            ))}
          </KanbanColumn>
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <KanbanCard
            title={activeItem.title}
            description={activeItem.description}
            dateRange={activeItem.dateRange}
            company={activeItem.company}
            attachments={activeItem.attachments}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
